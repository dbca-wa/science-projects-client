"""
Notification views - Admin notification operations
"""

from datetime import timedelta

import requests
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Q
from django.utils.html import strip_tags
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_202_ACCEPTED,
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from rest_framework.views import APIView

from projects.models import Project
from projects.utils.protection import is_project_protected
from users.models import PublicStaffProfile, User

from ..models import (
    AnnualReport,
    CustomPublication,
    ProgressReport,
    ProjectDocument,
    StudentReport,
)
from ..serializers import (
    CustomPublicationSerializer,
    LibraryPublicationResponseSerializer,
    ProgressReportCreateSerializer,
    ProjectDocumentCreateSerializer,
    PublicationResponseSerializer,
    StudentReportCreateSerializer,
)
from ..services.notification_service import NotificationService


class NewCycleOpen(APIView):
    """
    Open new reporting cycle and create progress/student reports for eligible projects
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        should_update = request.data["update"]
        should_prepopulate = request.data["prepopulate"]
        should_email = request.data["send_emails"]

        settings.LOGGER.warning(
            f"{request.user} is attempting to batch create new progress reports for latest year "
            f"{'(Including projects with status Update Requested)' if should_update else '(Active Projects Only)'}..."
        )

        if not request.user.is_superuser:
            return Response(
                {"error": "You don't have permission to do that!"},
                HTTP_403_FORBIDDEN,
            )

        last_report = AnnualReport.objects.order_by("-year").first()

        if not last_report:
            return Response(
                {"error": "No annual report found!"},
                status=HTTP_404_NOT_FOUND,
            )

        # Optionally scope to a specific division
        division_slug = request.data.get("division")
        if division_slug:
            division_report = (
                AnnualReport.objects.filter(division__slug=division_slug)
                .order_by("-year")
                .first()
            )
            if division_report:
                last_report = division_report

        # Get eligible science/core function projects
        if should_update:
            eligible_projects = Project.objects.filter(
                Q(
                    kind__in=[
                        Project.CategoryKindChoices.SCIENCE,
                        Project.CategoryKindChoices.COREFUNCTION,
                    ]
                )
                & Q(status__in=["active", "updating", "suspended"])
            )
        else:
            eligible_projects = Project.objects.filter(
                Q(
                    kind__in=[
                        Project.CategoryKindChoices.SCIENCE,
                        Project.CategoryKindChoices.COREFUNCTION,
                    ]
                )
                & Q(status="active")
            )

        # Explicit exclusion of protected projects as a safety net
        eligible_projects = eligible_projects.exclude(status__in=Project.CLOSED_ONLY)

        eligible_projects = eligible_projects.exclude(
            documents__progress_report_details__report__year=last_report.year
        )

        # Get eligible student projects
        if should_update:
            eligible_student_projects = Project.objects.filter(
                Q(status__in=["active", "updating", "suspended"])
                & Q(kind__in=[Project.CategoryKindChoices.STUDENT])
            )
        else:
            eligible_student_projects = Project.objects.filter(
                Q(status="active") & Q(kind__in=[Project.CategoryKindChoices.STUDENT])
            )

        # Explicit exclusion of protected projects as a safety net
        eligible_student_projects = eligible_student_projects.exclude(
            status__in=Project.CLOSED_ONLY
        )

        eligible_student_projects = eligible_student_projects.exclude(
            documents__student_report_details__report__year=last_report.year
        )

        # Filter by division if specified
        if division_slug and last_report.division:
            eligible_projects = eligible_projects.filter(
                business_area__division=last_report.division
            )
            eligible_student_projects = eligible_student_projects.filter(
                business_area__division=last_report.division
            )

        # ─── Handle suspended external projects ───────────────────────────────
        # External projects don't get documents spawned, but suspended ones
        # should be unsuspended and set to active on new cycle open.
        suspended_external_projects = Project.objects.filter(
            kind=Project.CategoryKindChoices.EXTERNAL,
            status=Project.StatusChoices.SUSPENDED,
        ).exclude(status__in=Project.CLOSED_ONLY)

        if division_slug and last_report.division:
            suspended_external_projects = suspended_external_projects.filter(
                business_area__division=last_report.division
            )

        # Bulk unsuspend external projects → set to active
        suspended_external_projects.update(status=Project.StatusChoices.ACTIVE)

        # Combine querysets
        all_eligible_projects = eligible_projects | eligible_student_projects

        # Prefetch existing report data to avoid N+1 queries inside the loop
        all_eligible_pks = list(all_eligible_projects.values_list("pk", flat=True))

        existing_pr_project_pks = set(
            ProgressReport.objects.filter(
                year=last_report.year, project__in=all_eligible_pks
            ).values_list("project_id", flat=True)
        )
        existing_sr_project_pks = set(
            StudentReport.objects.filter(
                year=last_report.year, project__in=all_eligible_pks
            ).values_list("project_id", flat=True)
        )

        # Prefetch latest previous reports per project for prepopulation
        from django.db.models import OuterRef, Subquery

        latest_pr_year_subquery = (
            ProgressReport.objects.filter(project=OuterRef("project"))
            .order_by("-year")
            .values("pk")[:1]
        )
        latest_pr_objects = ProgressReport.objects.filter(
            project__in=all_eligible_pks,
            pk__in=Subquery(latest_pr_year_subquery),
        ).select_related("document")
        previous_pr_by_project = {pr.project_id: pr for pr in latest_pr_objects}

        latest_sr_year_subquery = (
            StudentReport.objects.filter(project=OuterRef("project"))
            .order_by("-year")
            .values("pk")[:1]
        )
        latest_sr_objects = StudentReport.objects.filter(
            project__in=all_eligible_pks,
            pk__in=Subquery(latest_sr_year_subquery),
        ).select_related("document")
        previous_sr_by_project = {sr.project_id: sr for sr in latest_sr_objects}

        # Create documents for each eligible project
        for project in all_eligible_projects:
            if project.kind == Project.CategoryKindChoices.STUDENT:
                typeofdoc = ProjectDocument.CategoryKindChoices.STUDENTREPORT
                already_exists = project.pk in existing_sr_project_pks
            elif project.kind in [
                Project.CategoryKindChoices.SCIENCE,
                Project.CategoryKindChoices.COREFUNCTION,
            ]:
                typeofdoc = ProjectDocument.CategoryKindChoices.PROGRESSREPORT
                already_exists = project.pk in existing_pr_project_pks
            else:
                continue

            # Skip if a report already exists for this year — no document creation needed
            if already_exists:
                continue

            # Create the ProjectDocument
            new_doc_data = {
                "kind": typeofdoc,
                "status": "new",
                "modifier": request.user.pk,
                "creator": request.user.pk,
                "project": project.pk,
            }
            new_project_document = ProjectDocumentCreateSerializer(data=new_doc_data)
            if not new_project_document.is_valid():
                settings.LOGGER.error(
                    f"Error opening new cycle: {new_project_document.errors}"
                )
                return Response(new_project_document.errors, HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                doc = new_project_document.save()

                if project.kind != Project.CategoryKindChoices.STUDENT:
                    # Create progress report
                    last_one = previous_pr_by_project.get(project.pk)

                    if not should_prepopulate:
                        progress_report_data = {
                            "document": doc.pk,
                            "project": project.pk,
                            "report": last_report.pk,
                            "year": last_report.year,
                            "context": last_one.context if last_one else "<p></p>",
                            "implications": (
                                last_one.implications if last_one else "<p></p>"
                            ),
                            "future": "<p></p>",
                            "progress": "<p></p>",
                            "aims": last_one.aims if last_one else "<p></p>",
                        }
                    else:
                        if last_one:
                            progress_report_data = {
                                "document": doc.pk,
                                "project": project.pk,
                                "report": last_report.pk,
                                "year": last_report.year,
                                "context": last_one.context,
                                "implications": last_one.implications,
                                "future": last_one.future,
                                "progress": last_one.progress,
                                "aims": last_one.aims,
                            }
                        else:
                            progress_report_data = {
                                "document": doc.pk,
                                "project": project.pk,
                                "report": last_report.pk,
                                "year": last_report.year,
                                "context": "<p></p>",
                                "implications": "<p></p>",
                                "future": "<p></p>",
                                "progress": "<p></p>",
                                "aims": "<p></p>",
                            }

                    progress_report = ProgressReportCreateSerializer(
                        data=progress_report_data
                    )
                    if progress_report.is_valid():
                        progress_report.save()
                    else:
                        settings.LOGGER.error(
                            f"Error validating progress report: {progress_report.errors}"
                        )
                        return Response(progress_report.errors, HTTP_400_BAD_REQUEST)
                else:
                    # Create student report
                    last_one = previous_sr_by_project.get(project.pk)

                    if not should_prepopulate:
                        student_report_data = {
                            "document": doc.pk,
                            "project": project.pk,
                            "report": last_report.pk,
                            "year": last_report.year,
                            "progress_report": "<p></p>",
                        }
                    else:
                        if last_one:
                            student_report_data = {
                                "document": doc.pk,
                                "project": project.pk,
                                "report": last_report.pk,
                                "year": last_report.year,
                                "progress_report": last_one.progress_report,
                            }
                        else:
                            student_report_data = {
                                "document": doc.pk,
                                "project": project.pk,
                                "report": last_report.pk,
                                "year": last_report.year,
                                "progress_report": "<p></p>",
                            }

                    student_report = StudentReportCreateSerializer(
                        data=student_report_data
                    )
                    if student_report.is_valid():
                        student_report.save()
                    else:
                        settings.LOGGER.error(
                            f"Error validating student report {student_report.errors}"
                        )
                        return Response(student_report.errors, HTTP_400_BAD_REQUEST)

                # Set project status to updating after successful creation
                project.status = Project.StatusChoices.UPDATING
                project.save()

        # Send emails if requested
        if should_email:
            recipient_groups = request.data.get("recipient_groups")
            excluded_user_ids = request.data.get("excluded_user_ids", [])
            recipient_user_pks = request.data.get("recipient_user_pks")
            custom_message = request.data.get("custom_message")
            custom_messages = request.data.get("custom_messages")
            try:
                NotificationService.notify_new_cycle_open(
                    last_report=last_report,
                    actioning_user=User.objects.get(pk=request.user.pk),
                    division_slug=division_slug,
                    recipient_groups=recipient_groups,
                    excluded_user_ids=excluded_user_ids,
                    recipient_user_pks=recipient_user_pks,
                    custom_message=custom_message,
                    custom_messages=custom_messages,
                )
            except Exception as e:
                settings.LOGGER.error(f"Email Error: {e}", exc_info=True)
                return Response(
                    {"error": "Failed to send notification email. Please try again."},
                    status=HTTP_400_BAD_REQUEST,
                )

            return Response("Emails Sent!", status=HTTP_202_ACCEPTED)

        return Response(status=HTTP_202_ACCEPTED)


class SendBumpEmails(APIView):
    """
    Send reminder emails for documents requiring action
    """

    permission_classes = [IsAdminUser]

    def post(self, request):
        documents_requiring_action = request.data.get("documentsRequiringAction", [])

        if not documents_requiring_action:
            return Response(
                {"error": "No documents provided"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Single-document bump: check if the project is protected
        if len(documents_requiring_action) == 1:
            doc_data = documents_requiring_action[0]
            project_id = doc_data.get("projectId")
            if project_id:
                try:
                    project_instance = Project.objects.get(pk=project_id)
                    if is_project_protected(project_instance):
                        return Response(
                            {
                                "error": "Cannot send bump reminder \u2014 this project is closed."
                            },
                            status=HTTP_400_BAD_REQUEST,
                        )
                except Project.DoesNotExist:
                    pass

        settings.LOGGER.warning(
            f"{request.user} is sending bump emails for {len(documents_requiring_action)} documents..."
        )

        actioning_user = User.objects.get(pk=request.user.pk)
        send_aggressive = request.data.get("send_aggressive", False)
        result = NotificationService.send_bump_emails(
            documents_requiring_action=documents_requiring_action,
            actioning_user=actioning_user,
            send_aggressive=send_aggressive,
        )

        emails_sent = result["emails_sent"]
        errors = result["errors"]

        response_data = {
            "emails_sent": emails_sent,
            "total_documents": len(documents_requiring_action),
        }

        if errors:
            response_data["errors"] = errors
            settings.LOGGER.warning(
                f"Bump emails completed with {len(errors)} errors: {errors}"
            )

        if emails_sent > 0:
            settings.LOGGER.info(f"Successfully sent {emails_sent} bump emails")
            return Response(response_data, status=HTTP_200_OK)
        else:
            return Response(
                {"error": "No emails were sent", "details": errors},
                status=HTTP_400_BAD_REQUEST,
            )


class BumpPreview(APIView):
    """
    Preview who would be bumped — returns users with outstanding documents
    at stage 1 (project lead) and stage 2 (business area lead).
    Stage 3 (directorate) documents are excluded.

    Optional query params:
    - ?stage=1 — only show stage 1 (project lead) items
    - ?stage=2 — only show stage 2 (business area lead) items
    - ?report_id=N — scope to a specific annual report (year + division)
    """

    permission_classes = [IsAdminUser]

    def get(self, request):
        from collections import defaultdict

        from documents.models import AnnualReport, ProjectDocument
        from projects.models import ProjectMember

        stage_filter = request.query_params.get("stage") or request.data.get("stage")
        report_id = request.query_params.get("report_id") or request.data.get(
            "report_id"
        )

        doc_kind_labels = {
            "progressreport": "Progress Report",
            "studentreport": "Student Report",
        }

        url_kind_map = {
            "progressreport": "progress",
            "studentreport": "student",
        }

        # Only progress/student reports, non-approved, non-new
        pending_docs = (
            ProjectDocument.objects.filter(
                Q(kind="progressreport") | Q(kind="studentreport"),
            )
            .exclude(
                status__in=[
                    ProjectDocument.StatusChoices.APPROVED,
                    ProjectDocument.StatusChoices.NEW,
                ]
            )
            .exclude(
                project__status="terminated",
            )
            .exclude(
                project__status__in=Project.CLOSED_ONLY,
            )
            .select_related(
                "project", "project__business_area", "project__business_area__leader"
            )
        )

        # Scope to a specific annual report if provided
        if report_id:
            try:
                target_report = AnnualReport.objects.get(pk=report_id)
            except AnnualReport.DoesNotExist:
                target_report = None

            if target_report:
                # Filter to documents linked to this annual report
                from documents.models import ProgressReport, StudentReport

                pr_doc_pks = set(
                    ProgressReport.objects.filter(report=target_report).values_list(
                        "document_id", flat=True
                    )
                )
                sr_doc_pks = set(
                    StudentReport.objects.filter(report=target_report).values_list(
                        "document_id", flat=True
                    )
                )
                report_doc_pks = pr_doc_pks | sr_doc_pks
                pending_docs = pending_docs.filter(pk__in=report_doc_pks)

                # Also filter by division if the report has one
                if target_report.division:
                    pending_docs = pending_docs.filter(
                        project__business_area__division=target_report.division
                    )

        user_docs = defaultdict(
            lambda: {"as_project_lead": [], "as_ba_lead": [], "user": None}
        )

        for doc in pending_docs:
            kind_raw = doc.kind or ""
            kind_label = doc_kind_labels.get(kind_raw, kind_raw)
            url_kind = url_kind_map.get(kind_raw, kind_raw)
            doc_info = {
                "document_id": doc.pk,
                "project_title": strip_tags(doc.project.title),
                "project_id": doc.project.pk,
                "document_kind": kind_label,
                "document_url": f"{settings.SITE_URL}/projects/{doc.project.pk}/{url_kind}",
            }

            # Stage 1: project lead approval not granted
            if not doc.project_lead_approval_granted:
                if stage_filter and stage_filter != "1":
                    continue
                leader = (
                    ProjectMember.objects.filter(project=doc.project, is_leader=True)
                    .select_related("user")
                    .first()
                )
                if leader and leader.user.is_active and leader.user.is_staff:
                    uid = leader.user.pk
                    user_docs[uid]["user"] = leader.user
                    user_docs[uid]["as_project_lead"].append(doc_info)

            # Stage 2: project lead approved, BA lead not
            elif (
                doc.project_lead_approval_granted
                and not doc.business_area_lead_approval_granted
            ):
                if stage_filter and stage_filter != "2":
                    continue
                ba = doc.project.business_area
                if ba and ba.leader and ba.leader.is_active and ba.leader.is_staff:
                    uid = ba.leader.pk
                    user_docs[uid]["user"] = ba.leader
                    user_docs[uid]["as_ba_lead"].append(doc_info)

            # Stage 3 (directorate): excluded

        preview = []
        for uid, data in user_docs.items():
            u = data["user"]
            if not u:
                continue
            preview.append(
                {
                    "user_id": u.pk,
                    "name": f"{u.display_first_name} {u.display_last_name}",
                    "email": u.email,
                    "as_project_lead_count": len(data["as_project_lead"]),
                    "as_ba_lead_count": len(data["as_ba_lead"]),
                    "total": len(data["as_project_lead"]) + len(data["as_ba_lead"]),
                    "as_project_lead": data["as_project_lead"],
                    "as_ba_lead": data["as_ba_lead"],
                }
            )

        preview.sort(key=lambda x: x["total"], reverse=True)

        return Response(
            {
                "users": preview,
                "total_users": len(preview),
                "total_documents": sum(p["total"] for p in preview),
            }
        )


class SendBumpAll(APIView):
    """
    Send bump emails to all users with outstanding documents at stage 1 and stage 2.
    By default (send_aggressive=False), each user receives one consolidated email.
    When send_aggressive=True, one email is sent per document.
    """

    permission_classes = [IsAdminUser]

    def post(self, request):
        from django.template.loader import render_to_string

        from config.helpers import send_email_with_embedded_image

        send_aggressive = request.data.get("send_aggressive", False)

        # Reuse the preview logic to get the user/document grouping
        # BumpPreview reads stage from both query_params and request.data
        # Note: BumpPreview already excludes protected projects via CLOSED_ONLY filter
        preview_view = BumpPreview()
        preview_view.request = request
        preview_response = preview_view.get(request)
        users_data = preview_response.data.get("users", [])

        # Count documents excluded due to project protection
        # (documents on protected projects are already filtered out by BumpPreview)
        from documents.models import ProjectDocument as PD

        total_pending = (
            PD.objects.filter(
                Q(kind="progressreport") | Q(kind="studentreport"),
            )
            .exclude(
                status__in=[
                    PD.StatusChoices.APPROVED,
                    PD.StatusChoices.NEW,
                ]
            )
            .count()
        )
        included_count = sum(u["total"] for u in users_data)
        excluded_count = max(0, total_pending - included_count)

        if not users_data:
            return Response(
                {"error": "No users with outstanding documents found"},
                status=HTTP_400_BAD_REQUEST,
            )

        actioning_user = request.user
        actioning_name = (
            f"{actioning_user.display_first_name} {actioning_user.display_last_name}"
        )

        emails_sent = 0
        errors = []

        if send_aggressive:
            # Per-document mode: one email per document
            for user_data in users_data:
                recipient_name = user_data["name"]
                recipient_email = user_data["email"]

                all_docs = [
                    (doc, "Project Lead") for doc in user_data["as_project_lead"]
                ] + [(doc, "Business Area Lead") for doc in user_data["as_ba_lead"]]

                for doc, capacity in all_docs:
                    subject = f"SPMS: Action Required - {doc['project_title']}"
                    single_context = {
                        "recipient_name": recipient_name,
                        "actioning_user_name": actioning_name,
                        "actioning_user_email": actioning_user.email,
                        "project_title": doc["project_title"],
                        "project_id": doc["project_id"],
                        "document_kind": doc["document_kind"],
                        "action_capacity": capacity,
                        "document_url": doc["document_url"],
                        "email_subject": subject,
                        "site_url": settings.SITE_URL,
                    }
                    html = render_to_string(
                        "./email_templates/bump_email.html", single_context
                    )

                    try:
                        send_email_with_embedded_image(
                            recipient_email=[recipient_email],
                            subject=subject,
                            html_content=html,
                        )
                        emails_sent += 1
                    except Exception as e:
                        settings.LOGGER.error(
                            f"Failed to send bump to {recipient_email}: {e}"
                        )
                        errors.append(f"Failed: {recipient_name} ({recipient_email})")
        else:
            # Grouped mode (default): one consolidated email per user
            for user_data in users_data:
                total = user_data["total"]
                recipient_name = user_data["name"]
                recipient_email = user_data["email"]

                context = {
                    "recipient_name": recipient_name,
                    "actioning_user_name": actioning_name,
                    "actioning_user_email": actioning_user.email,
                    "as_project_lead": user_data["as_project_lead"],
                    "as_ba_lead": user_data["as_ba_lead"],
                    "total_documents": total,
                    "logo_url": True,
                    "site_url": settings.SITE_URL,
                    "site_name": "SPMS",
                }

                # Use consolidated template for multiple docs, single template for one
                if total == 1:
                    # Single document — use existing bump template
                    doc = (user_data["as_project_lead"] or user_data["as_ba_lead"])[0]
                    capacity = (
                        "Project Lead"
                        if user_data["as_project_lead"]
                        else "Business Area Lead"
                    )
                    single_context = {
                        **context,
                        "project_title": doc["project_title"],
                        "project_id": doc["project_id"],
                        "document_kind": doc["document_kind"],
                        "action_capacity": capacity,
                        "document_url": doc["document_url"],
                        "email_subject": f"SPMS: Action Required - {doc['project_title']}",
                    }
                    template = "./email_templates/bump_email.html"
                    subject = f"SPMS: Action Required - {doc['project_title']}"
                    html = render_to_string(template, single_context)
                else:
                    template = "./email_templates/bump_consolidated_email.html"
                    subject = (
                        f"SPMS: Action Required - {total} documents need your attention"
                    )
                    html = render_to_string(template, context)

                try:
                    send_email_with_embedded_image(
                        recipient_email=[recipient_email],
                        subject=subject,
                        html_content=html,
                    )
                    emails_sent += 1
                except Exception as e:
                    settings.LOGGER.error(
                        f"Failed to send bump to {recipient_email}: {e}"
                    )
                    errors.append(f"Failed: {recipient_name} ({recipient_email})")

        settings.LOGGER.info(
            f"{actioning_user} sent bulk bump emails: {emails_sent} users bumped"
        )

        return Response(
            {
                "emails_sent": emails_sent,
                "total_users": len(users_data),
                "excluded_count": excluded_count,
                "errors": errors,
            }
        )


class UserPublications(APIView):
    """
    Get user publications from library API and custom publications
    """

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def _error_response(self, message):
        return Response(
            {
                "staffProfilePk": 0,
                "libraryData": {
                    "numFound": 0,
                    "start": 0,
                    "numFoundExact": True,
                    "docs": [],
                    "isError": True,
                    "errorMessage": message,
                },
                "customPublications": [],
            },
            status=HTTP_200_OK,
        )

    def _get_library_publications(self, employee_id):
        api_url = f"{settings.LIBRARY_API_URL}{employee_id}&rows=1000"
        token = settings.LIBRARY_BEARER_TOKEN.replace("Bearer ", "")
        headers = {"Authorization": f"Bearer {token}"}

        try:
            response = requests.get(api_url, headers=headers, timeout=30)
        except requests.Timeout:
            settings.LOGGER.error(
                f"Request to library API timed out for employee {employee_id}"
            )
            raise Exception("Library API request timed out")

        if response.status_code != 200:
            settings.LOGGER.error(
                f"Failed to retrieve data from API:\n{response.status_code}: {response.text}"
            )
            raise Exception(f"API request failed with status {response.status_code}")

        return response.json()

    def get(self, request, employee_id):
        settings.LOGGER.info(
            f"{request.user} is getting UserPublications for {employee_id}"
        )

        if not employee_id or employee_id == "null":
            return self._error_response("No employee ID provided")

        if not settings.LIBRARY_API_URL:
            return self._error_response("Library API configuration missing")

        if not settings.LIBRARY_BEARER_TOKEN:
            return self._error_response("Library Token configuration missing")

        # Check cache
        cache_key = f"user_publications_{employee_id}"
        cached_data = cache.get(cache_key)

        # Get staff profile
        staff_profile = PublicStaffProfile.objects.filter(
            employee_id=employee_id
        ).first()

        # Get custom publications
        custom_publications = CustomPublication.objects.filter(
            public_profile__employee_id=employee_id
        ).all()

        if cached_data:
            settings.LOGGER.info(f"Returning cached publications for {employee_id}")
            response_data = {
                "staffProfilePk": staff_profile.pk if staff_profile else 0,
                "libraryData": cached_data,
                "customPublications": CustomPublicationSerializer(
                    custom_publications, many=True
                ).data,
            }
            return Response(response_data, status=HTTP_200_OK)

        try:
            # Get library publications
            library_data = self._get_library_publications(employee_id)

            library_response = {
                "numFound": library_data.get("response", {}).get("numFound", 0),
                "start": library_data.get("response", {}).get("start", 0),
                "numFoundExact": library_data.get("response", {}).get(
                    "numFoundExact", True
                ),
                "docs": library_data.get("response", {}).get("docs", []),
                "isError": False,
                "errorMessage": "",
            }

            # Serialize and cache
            library_serializer = LibraryPublicationResponseSerializer(
                data=library_response
            )
            if not library_serializer.is_valid():
                settings.LOGGER.error(
                    f"Library Serializer errors: {library_serializer.errors}"
                )
                return self._error_response("Invalid library data format")

            cache.set(
                cache_key,
                library_serializer.data,
                timeout=timedelta(hours=24).total_seconds(),
            )

            response_data = {
                "staffProfilePk": staff_profile.pk if staff_profile else 0,
                "libraryData": library_serializer.data,
                "customPublications": CustomPublicationSerializer(
                    custom_publications, many=True
                ).data,
            }

            final_serializer = PublicationResponseSerializer(data=response_data)
            if not final_serializer.is_valid():
                settings.LOGGER.error(
                    f"Final Serializer errors: {final_serializer.errors}"
                )
                return self._error_response("Invalid response format")

            return Response(final_serializer.data, status=HTTP_200_OK)

        except Exception as e:
            settings.LOGGER.error(f"Error processing request: {str(e)}", exc_info=True)
            return self._error_response("Failed to process request")


class SendMentionNotification(APIView):
    """
    Send email notifications to mentioned users in document comments
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            document_id = request.data.get("documentId")
            project_id = request.data.get("projectId")
            commenter = request.data.get("commenter")
            mentioned_users = request.data.get("mentionedUsers", [])
            comment_content = request.data.get("commentContent", "")

            try:
                result = NotificationService.notify_comment_mention(
                    document_id=document_id,
                    project_id=project_id,
                    commenter_data=commenter,
                    mentioned_users=mentioned_users,
                    comment_content=comment_content,
                )
            except (ProjectDocument.DoesNotExist, Project.DoesNotExist) as e:
                settings.LOGGER.error(f"Document or Project not found: {e}")
                return Response(
                    {"error": "Document or Project not found"},
                    status=HTTP_404_NOT_FOUND,
                )

            return Response(result, status=HTTP_200_OK)

        except Exception as e:
            settings.LOGGER.error(
                f"Error sending comment notifications: {str(e)}", exc_info=True
            )
            return Response(
                {"error": "Failed to send comment notifications. Please try again."},
                status=HTTP_500_INTERNAL_SERVER_ERROR,
            )
