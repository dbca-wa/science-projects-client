"""
Document admin views
"""

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
)
from rest_framework.views import APIView

from projects.models import Project, ProjectMember
from users.models import User

from ..models import (
    AnnualReport,
    ProgressReport,
    ProjectDocument,
    StudentReport,
)
from ..serializers import (
    ProjectDocumentSerializer,
    TinyProjectDocumentSerializer,
)


class ProjectDocsPendingMyActionAllStages(APIView):
    """Get all documents pending user action across all approval stages"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get documents pending action for current user"""
        settings.LOGGER.info(
            msg=f"{request.user} is getting their documents pending action"
        )

        documents = []
        member_input_required = []
        pl_input_required = []
        ba_input_required = []
        directorate_input_required = []

        # Optimize query with select_related
        small_user_object = (
            User.objects.filter(pk=request.user.pk)
            .select_related("work", "work__business_area")
            .prefetch_related("business_areas_led")
            .first()
        )

        if small_user_object:
            # Handle users without work relationship
            ba = getattr(small_user_object, "work", None)
            ba = ba.business_area if ba else None
            is_directorate = (
                ba is not None and ba.name == "Directorate"
            ) or request.user.is_superuser

            active_projects = Project.objects.exclude(status__in=Project.CLOSED_ONLY)

            # Check if the user is a leader of any business area
            business_areas_led = list(
                small_user_object.business_areas_led.values_list("id", flat=True)
            )

            is_ba_leader = len(business_areas_led) >= 1

            if is_ba_leader:
                # Filter for projects which the user leads
                ba_project_ids = active_projects.filter(
                    business_area__pk__in=business_areas_led
                ).values_list("id", flat=True)

                # Fetch all documents requiring BA attention with optimised relationships
                docs_requiring_ba_attention = (
                    ProjectDocument.objects.exclude(
                        status=ProjectDocument.StatusChoices.APPROVED
                    )
                    .filter(
                        project__in=ba_project_ids,
                        project_lead_approval_granted=True,
                        business_area_lead_approval_granted=False,
                    )
                    .select_related(
                        "project",
                        "project__business_area",
                        "project__business_area__image",
                        "project__business_area__division",
                        "project__business_area__division__director",
                        "project__business_area__division__approver",
                        "project__business_area__leader",
                        "project__business_area__caretaker",
                        "project__business_area__finance_admin",
                        "project__business_area__data_custodian",
                        "project__image",
                        "project__image__uploader",
                        "pdf",
                        "pdf__document",
                        "pdf__project",
                        "creator",
                        "modifier",
                    )
                    .prefetch_related(
                        "project__business_area__division__directorate_email_list",
                    )
                )

                # Append the documents to the respective lists
                documents.extend(docs_requiring_ba_attention)
                ba_input_required.extend(docs_requiring_ba_attention)

            # Directorate Filtering
            if is_directorate:
                # Use subquery for active project IDs instead of loading all into memory
                directorate_project_ids = active_projects.values_list("id", flat=True)

                # Fetch all documents requiring Directorate attention with optimised relationships
                docs_requiring_directorate_attention = (
                    ProjectDocument.objects.exclude(
                        status=ProjectDocument.StatusChoices.APPROVED
                    )
                    .filter(
                        project__in=directorate_project_ids,
                        business_area_lead_approval_granted=True,
                        directorate_approval_granted=False,
                    )
                    .select_related(
                        "project",
                        "project__business_area",
                        "project__business_area__image",
                        "project__business_area__division",
                        "project__business_area__division__director",
                        "project__business_area__division__approver",
                        "project__business_area__leader",
                        "project__business_area__caretaker",
                        "project__business_area__finance_admin",
                        "project__business_area__data_custodian",
                        "project__image",
                        "project__image__uploader",
                        "pdf",
                        "pdf__document",
                        "pdf__project",
                        "creator",
                        "modifier",
                    )
                    .prefetch_related(
                        "project__business_area__division__directorate_email_list",
                    )
                )

                # Append the documents to the respective lists
                documents.extend(docs_requiring_directorate_attention)
                directorate_input_required.extend(docs_requiring_directorate_attention)

            # Lead Filtering — use subquery for lead project IDs
            lead_project_ids = list(
                ProjectMember.objects.filter(
                    project__in=active_projects,
                    user=small_user_object,
                    is_leader=True,
                ).values_list("project_id", flat=True)
            )

            # Fetch all documents requiring lead attention with optimised relationships
            docs_requiring_lead_attention = (
                ProjectDocument.objects.exclude(
                    status=ProjectDocument.StatusChoices.APPROVED
                )
                .filter(
                    project__in=lead_project_ids,
                    project_lead_approval_granted=False,
                )
                .select_related(
                    "project",
                    "project__business_area",
                    "project__business_area__image",
                    "project__business_area__division",
                    "project__business_area__division__director",
                    "project__business_area__division__approver",
                    "project__business_area__leader",
                    "project__business_area__caretaker",
                    "project__business_area__finance_admin",
                    "project__business_area__data_custodian",
                    "project__image",
                    "project__image__uploader",
                    "pdf",
                    "pdf__document",
                    "pdf__project",
                    "creator",
                    "modifier",
                )
                .prefetch_related(
                    "project__business_area__division__directorate_email_list",
                )
            )

            # Separate the documents based on lead and member input
            for doc in docs_requiring_lead_attention:
                documents.append(doc)
                if doc.project_id in lead_project_ids:
                    pl_input_required.append(doc)

            # Team member filtering — use subquery for non-leader project IDs
            my_non_leader_project_ids = list(
                ProjectMember.objects.filter(
                    user=request.user,
                    is_leader=False,
                    project__in=active_projects,
                ).values_list("project_id", flat=True)
            )

            docs_requiring_team_attention = (
                ProjectDocument.objects.exclude(
                    status=ProjectDocument.StatusChoices.APPROVED
                )
                .filter(
                    project_lead_approval_granted=False,
                    project__in=my_non_leader_project_ids,
                )
                .select_related(
                    "project",
                    "project__business_area",
                    "project__business_area__image",
                    "project__business_area__division",
                    "project__business_area__division__director",
                    "project__business_area__division__approver",
                    "project__business_area__leader",
                    "project__business_area__caretaker",
                    "project__business_area__finance_admin",
                    "project__business_area__data_custodian",
                    "project__image",
                    "project__image__uploader",
                    "pdf",
                    "pdf__document",
                    "pdf__project",
                    "creator",
                    "modifier",
                )
                .prefetch_related(
                    "project__business_area__division__directorate_email_list",
                )
            )

            for doc in docs_requiring_team_attention:
                documents.append(doc)
                member_input_required.append(doc)

            filtered_documents = list({doc.id: doc for doc in documents}.values())
            filtered_pm_input_required = list(
                {doc.id: doc for doc in member_input_required}.values()
            )
            filtered_pl_input_required = list(
                {doc.id: doc for doc in pl_input_required}.values()
            )
            filtered_ba_input_required = list(
                {doc.id: doc for doc in ba_input_required}.values()
            )
            filtered_directorate_input_required = list(
                {doc.id: doc for doc in directorate_input_required}.values()
            )

            ser = TinyProjectDocumentSerializer(
                filtered_documents,
                many=True,
                context={"request": request},
            )

            data = {
                "all": ser.data,
                "team": TinyProjectDocumentSerializer(
                    filtered_pm_input_required,
                    many=True,
                    context={"request": request},
                ).data,
                "lead": TinyProjectDocumentSerializer(
                    filtered_pl_input_required,
                    many=True,
                    context={"request": request},
                ).data,
                "ba": TinyProjectDocumentSerializer(
                    filtered_ba_input_required,
                    many=True,
                    context={"request": request},
                ).data,
                "directorate": TinyProjectDocumentSerializer(
                    filtered_directorate_input_required,
                    many=True,
                    context={"request": request},
                ).data,
            }

            return Response(
                data,
                status=HTTP_200_OK,
            )
        else:
            data = {"all": [], "team": [], "lead": [], "ba": [], "directorate": []}
            return Response(
                data,
                status=HTTP_200_OK,
            )


class DocumentSpawner(APIView):
    """Spawn a new document for a project"""

    def post(self, request):
        """Create a new document"""
        kind = request.kind
        ser = ProjectDocumentSerializer(
            data={"kind": kind, "status": "new", "project": request.project}
        )
        settings.LOGGER.info(msg=f"{request.user} is spawning document")
        if ser.is_valid():
            with transaction.atomic():
                try:
                    project_document = ser.save()
                except Exception as e:
                    settings.LOGGER.error(
                        msg=f"Failed to create document: {e}", exc_info=True
                    )
                    return Response(
                        {"error": "Failed to create document. Please try again."},
                        HTTP_400_BAD_REQUEST,
                    )
                else:
                    project_document.pk
                    if kind == "concept":
                        pass
                    elif kind == "projectplan":
                        pass
                    elif kind == "progressreport":
                        pass
                    elif kind == "studentreport":
                        pass
                    elif kind == "projectclosure":
                        pass
        else:
            settings.LOGGER.error(msg=f"{ser.errors}")
            return Response(
                ser.errors,
                HTTP_400_BAD_REQUEST,
            )


class GetPreviousReportsData(APIView):
    """Get data from previous reports for prepopulation"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Get previous report data for a specific section"""
        project_id = request.data["project_id"]
        doc_kind = request.data["writeable_document_kind"]
        section = request.data["section"]

        if doc_kind == "Progress Report":
            documents_of_type_from_project = ProgressReport.objects.filter(
                project=project_id
            ).order_by("-year")
        elif doc_kind == "Student Report":
            documents_of_type_from_project = StudentReport.objects.filter(
                project=project_id
            ).order_by("-year")
        else:
            return Response(status=HTTP_400_BAD_REQUEST)

        # Check if there are at least two documents (can actually prepopulate with prior data)
        if documents_of_type_from_project.count() < 2:
            return Response(status=HTTP_400_BAD_REQUEST)

        # Get the second-to-last document
        second_last_one = documents_of_type_from_project[1]

        # Get the specified section data
        try:
            section_data = getattr(second_last_one, section)
        except AttributeError:
            return Response(status=HTTP_400_BAD_REQUEST)

        return Response(data=section_data, status=HTTP_200_OK)


class ReopenProject(APIView):
    """Reopen a closed project (fixes typo from RepoenProject)"""

    permission_classes = [IsAuthenticated]

    def get_base_document(self, project_id):
        """Get the project closure document"""
        obj = ProjectDocument.objects.filter(
            project=project_id, kind="projectclosure"
        ).first()
        if obj is None:
            return None
        return obj

    def post(self, request, pk):
        """Reopen a project"""
        from ..services.notification_service import NotificationService
        from ..utils.helpers import get_current_maintainer_id

        settings.LOGGER.info(
            msg=f"{request.user} is reopening project belonging to doc ({pk})"
        )

        get_current_maintainer_id()

        with transaction.atomic():
            try:
                settings.LOGGER.info(msg=f"{request.user} is reopening project {pk}")
                project_document = self.get_base_document(pk)

                if project_document is None:
                    project = Project.objects.filter(pk=pk).first()
                    project.status = Project.StatusChoices.UPDATING
                    project.save()
                else:
                    project_document.project.status = "updating"
                    project_document.project.save()
                    project = Project.objects.filter(
                        pk=project_document.project.pk
                    ).first()
                    project_document.delete()

                settings.LOGGER.info(msg="Sending project reopened email")

                if project:
                    # Send notification via service
                    NotificationService.notify_project_reopened(
                        project=project, reopener=request.user
                    )

                    return Response(
                        "Emails Sent!",
                        status=HTTP_202_ACCEPTED,
                    )
                return Response(status=HTTP_204_NO_CONTENT)
            except Exception as e:
                settings.LOGGER.error(
                    msg=f"Error reopening project {pk}: {e}", exc_info=True
                )
                return Response(
                    {"error": "Operation failed. Please try again."},
                    status=HTTP_400_BAD_REQUEST,
                )


class BatchApproveOld(APIView):
    """Batch approve older reports (not from latest year)"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Batch approve older reports"""
        settings.LOGGER.warning(
            msg=f"{request.user} is attempting to batch approve older reports..."
        )
        if not request.user.is_superuser:
            return Response(
                {"error": "You don't have permission to do that!"},
                HTTP_403_FORBIDDEN,
            )

        # Get the last report with the highest year
        last_report = AnnualReport.objects.order_by("-year").first()

        # Handle the case where no report is found
        if not last_report:
            return Response(
                {"error": "No annual reports found!"},
                status=HTTP_404_NOT_FOUND,
            )

        # Optionally scope to a specific division
        division_slug = request.data.get("division")
        send_notifications = request.data.get("send_notifications", False)
        if division_slug:
            division_report = (
                AnnualReport.objects.filter(division__slug=division_slug)
                .order_by("-year")
                .first()
            )
            if division_report:
                last_report = division_report

        # Get relevant documents — progress/student reports with PL and BAL approval granted
        relevant_docs = (
            ProjectDocument.objects.filter(
                Q(kind="studentreport") | Q(kind="progressreport"),
                project_lead_approval_granted=True,
                business_area_lead_approval_granted=True,
            )
            .exclude(
                project__status__in=[
                    "suspended",
                    "terminated",
                    "completed",
                ]
            )
            .select_related("project")
            .prefetch_related(
                "student_report_details",
                "progress_report_details",
            )
        )

        # Filter by division if specified
        if division_slug and last_report.division:
            relevant_docs = relevant_docs.filter(
                project__business_area__division=last_report.division
            )

        # Pre-fetch project PKs that have an approved closure (for status logic)
        closure_project_pks = set(
            ProjectDocument.objects.filter(
                kind="projectclosure",
                status="approved",
            ).values_list("project_id", flat=True)
        )

        try:
            # Collect documents and projects that need updating
            docs_to_update = []
            projects_to_update = []

            for doc in relevant_docs:
                should_process = False

                if doc.kind == "studentreport":
                    sr_obj = (
                        doc.student_report_details.first()
                        if doc.student_report_details.exists()
                        else None
                    )
                    if sr_obj and sr_obj.report != last_report:
                        should_process = True

                elif doc.kind == "progressreport":
                    pr_obj = (
                        doc.progress_report_details.first()
                        if doc.progress_report_details.exists()
                        else None
                    )
                    if pr_obj and pr_obj.report != last_report:
                        should_process = True

                if should_process:
                    doc.project_lead_approval_granted = True
                    doc.business_area_lead_approval_granted = True
                    doc.directorate_approval_granted = True
                    doc.status = "approved"
                    docs_to_update.append(doc)

                    # Only update project status if no approved closure exists
                    project = doc.project
                    if (
                        project.pk not in closure_project_pks
                        and project not in projects_to_update
                    ):
                        project.status = Project.StatusChoices.ACTIVE
                        projects_to_update.append(project)

            # Bulk update documents
            if docs_to_update:
                ProjectDocument.objects.bulk_update(
                    docs_to_update,
                    [
                        "project_lead_approval_granted",
                        "business_area_lead_approval_granted",
                        "directorate_approval_granted",
                        "status",
                    ],
                )

            # Bulk update projects
            if projects_to_update:
                Project.objects.bulk_update(projects_to_update, ["status"])

        except Exception as e:
            settings.LOGGER.error(msg=f"Batch approval failed: {e}", exc_info=True)
            return Response(
                {"error": "Batch approval failed. Please try again."},
                HTTP_400_BAD_REQUEST,
            )
        else:
            settings.LOGGER.info(
                msg=f"Reports have been batch approved for annual report documents before year: {last_report.year}"
            )

            # Send notification emails if requested
            if send_notifications and docs_to_update:
                from ..services.notification_service import NotificationService

                try:
                    NotificationService.notify_batch_approved(
                        docs_to_update, request.user
                    )
                except Exception as e:
                    settings.LOGGER.error(
                        f"Failed to send batch approval notifications: {e}"
                    )

            return Response(
                "Success",
                HTTP_202_ACCEPTED,
            )


class BatchApproveCurrent(APIView):
    """Batch approve all stage-3 progress/student reports for the current annual report year."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Approve all stage-3 reports for the current year, optionally scoped by division."""
        settings.LOGGER.warning(
            msg=f"{request.user} is attempting to batch approve current year reports..."
        )
        if not request.user.is_superuser and not getattr(
            request.user, "is_key_stakeholder", False
        ):
            return Response(
                {"error": "You don't have permission to do that!"},
                HTTP_403_FORBIDDEN,
            )

        division_slug = request.data.get("division")
        send_notifications = request.data.get("send_notifications", False)

        # Get the latest annual report (optionally for a specific division)
        if division_slug:
            last_report = (
                AnnualReport.objects.filter(division__slug=division_slug)
                .order_by("-year")
                .first()
            )
        else:
            last_report = AnnualReport.objects.order_by("-year").first()

        if not last_report:
            return Response(
                {"error": "No annual reports found!"},
                status=HTTP_404_NOT_FOUND,
            )

        # Find all stage-3 progress/student reports for the current year
        relevant_docs = (
            ProjectDocument.objects.filter(
                Q(kind="studentreport") | Q(kind="progressreport"),
                project_lead_approval_granted=True,
                business_area_lead_approval_granted=True,
                directorate_approval_granted=False,
            )
            .exclude(status="approved")
            .exclude(
                project__status__in=[
                    "suspended",
                    "terminated",
                    "completed",
                    "closing",
                    "closure_requested",
                ]
            )
            .select_related("project")
            .prefetch_related(
                "student_report_details",
                "progress_report_details",
            )
        )

        # Filter by division if specified
        if division_slug and last_report.division:
            relevant_docs = relevant_docs.filter(
                project__business_area__division=last_report.division
            )

        # Pre-fetch project PKs with approved closures
        closure_project_pks = set(
            ProjectDocument.objects.filter(
                kind="projectclosure",
                status="approved",
            ).values_list("project_id", flat=True)
        )

        try:
            docs_to_update = []
            projects_to_update = []

            for doc in relevant_docs:
                # Check the report is linked to the current year
                is_current_year = False

                if doc.kind == "studentreport":
                    sr_obj = (
                        doc.student_report_details.first()
                        if doc.student_report_details.exists()
                        else None
                    )
                    if sr_obj and sr_obj.report == last_report:
                        is_current_year = True

                elif doc.kind == "progressreport":
                    pr_obj = (
                        doc.progress_report_details.first()
                        if doc.progress_report_details.exists()
                        else None
                    )
                    if pr_obj and pr_obj.report == last_report:
                        is_current_year = True

                if is_current_year:
                    doc.project_lead_approval_granted = True
                    doc.business_area_lead_approval_granted = True
                    doc.directorate_approval_granted = True
                    doc.status = "approved"
                    docs_to_update.append(doc)

                    project = doc.project
                    if (
                        project.pk not in closure_project_pks
                        and project not in projects_to_update
                    ):
                        project.status = Project.StatusChoices.ACTIVE
                        projects_to_update.append(project)

            if docs_to_update:
                ProjectDocument.objects.bulk_update(
                    docs_to_update,
                    [
                        "project_lead_approval_granted",
                        "business_area_lead_approval_granted",
                        "directorate_approval_granted",
                        "status",
                    ],
                )

            if projects_to_update:
                Project.objects.bulk_update(projects_to_update, ["status"])

        except Exception as e:
            settings.LOGGER.error(
                msg=f"Batch approval (current) failed: {e}", exc_info=True
            )
            return Response(
                {"error": "Batch approval failed. Please try again."},
                HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(
            msg=f"Batch approved {len(docs_to_update)} reports for year {last_report.year}"
        )

        # Send notification emails if requested
        if send_notifications and docs_to_update:
            from ..services.notification_service import NotificationService

            try:
                NotificationService.notify_batch_approved(docs_to_update, request.user)
            except Exception as e:
                settings.LOGGER.error(
                    f"Failed to send batch approval notifications: {e}"
                )

        return Response(
            {"approved": len(docs_to_update)},
            HTTP_202_ACCEPTED,
        )


def _deduplicate_by_highest_role(users_with_roles):
    """
    Given a list of (user, role_priority, role_label) tuples, return users
    grouped by their highest role. Higher priority number wins.

    Role priorities: BA Lead (3) > Project Lead (2) > Team Member (1)

    Returns:
        dict with keys 'ba_leads', 'project_leads', 'team_members',
        each containing a list of {pk, name, email}.
    """
    best_role = {}  # pk → (priority, label, name, email)
    for user, priority, label in users_with_roles:
        if user.pk not in best_role or priority > best_role[user.pk][0]:
            best_role[user.pk] = (
                priority,
                label,
                f"{user.display_first_name} {user.display_last_name}",
                user.email,
            )

    groups = {"ba_leads": [], "project_leads": [], "team_members": []}
    role_to_group = {
        "BA Lead": "ba_leads",
        "Project Lead": "project_leads",
        "Team Member": "team_members",
    }

    for pk, (priority, label, name, email) in best_role.items():
        group_key = role_to_group.get(label, "team_members")
        groups[group_key].append({"pk": pk, "name": name, "email": email})

    return groups


class BatchApproveCurrentPreview(APIView):
    """
    Preview recipients who would receive approval notification emails
    for the current year's batch approve action.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        division_slug = request.query_params.get("division")

        # Get the latest annual report
        if division_slug:
            last_report = (
                AnnualReport.objects.filter(division__slug=division_slug)
                .order_by("-year")
                .first()
            )
        else:
            last_report = AnnualReport.objects.order_by("-year").first()

        if not last_report:
            return Response(
                {
                    "recipients": {
                        "ba_leads": [],
                        "project_leads": [],
                        "team_members": [],
                    },
                    "total_recipients": 0,
                }
            )

        # Find stage-3 documents for the current year
        relevant_docs = (
            ProjectDocument.objects.filter(
                Q(kind="studentreport") | Q(kind="progressreport"),
                project_lead_approval_granted=True,
                business_area_lead_approval_granted=True,
                directorate_approval_granted=False,
            )
            .exclude(status="approved")
            .exclude(project__status="terminated")
            .select_related(
                "project",
                "project__business_area",
                "project__business_area__leader",
            )
            .prefetch_related(
                "student_report_details",
                "progress_report_details",
            )
        )

        if division_slug and last_report.division:
            relevant_docs = relevant_docs.filter(
                project__business_area__division=last_report.division
            )

        # Filter to current year only
        current_year_docs = []
        for doc in relevant_docs:
            if doc.kind == "studentreport":
                sr = doc.student_report_details.first()
                if sr and sr.report == last_report:
                    current_year_docs.append(doc)
            elif doc.kind == "progressreport":
                pr = doc.progress_report_details.first()
                if pr and pr.report == last_report:
                    current_year_docs.append(doc)

        # Collect users with roles
        users_with_roles = []
        for doc in current_year_docs:
            project = doc.project

            # BA lead
            ba = project.business_area
            if ba and ba.leader and ba.leader.is_active and ba.leader.is_staff:
                users_with_roles.append((ba.leader, 3, "BA Lead"))

            # Project leads
            for member in ProjectMember.objects.filter(
                project=project, is_leader=True
            ).select_related("user"):
                if member.user.is_active and member.user.is_staff:
                    users_with_roles.append((member.user, 2, "Project Lead"))

            # Team members
            for member in ProjectMember.objects.filter(
                project=project, is_leader=False
            ).select_related("user"):
                if member.user.is_active and member.user.is_staff:
                    users_with_roles.append((member.user, 1, "Team Member"))

        groups = _deduplicate_by_highest_role(users_with_roles)
        total = sum(len(v) for v in groups.values())

        return Response({"recipients": groups, "total_recipients": total})


class NewCycleOpenPreview(APIView):
    """
    Preview recipients who would receive new cycle open notification emails.
    Returns BA leads, project leads, and team members — deduplicated by highest role.
    All recipients must be active staff with @dbca.wa.gov.au emails.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from agencies.models import BusinessArea

        division_slug = request.query_params.get("division")

        if division_slug:
            last_report = (
                AnnualReport.objects.filter(division__slug=division_slug)
                .order_by("-year")
                .first()
            )
        else:
            last_report = AnnualReport.objects.order_by("-year").first()

        def _is_valid(user):
            return (
                user
                and user.is_active
                and user.is_staff
                and user.email
                and user.email.endswith("@dbca.wa.gov.au")
            )

        users_with_roles = []

        # BA leads
        bas = BusinessArea.objects.select_related("leader").all()
        if division_slug and last_report and last_report.division:
            bas = bas.filter(division=last_report.division)
        for ba in bas:
            if _is_valid(ba.leader):
                users_with_roles.append((ba.leader, 3, "BA Lead"))

        # All project leads and team members
        all_projects = Project.objects.all()
        if division_slug and last_report and last_report.division:
            all_projects = all_projects.filter(
                business_area__division=last_report.division
            )

        all_members = ProjectMember.objects.filter(
            project__in=all_projects,
        ).select_related("user")

        for member in all_members:
            if _is_valid(member.user):
                if member.is_leader:
                    users_with_roles.append((member.user, 2, "Project Lead"))
                else:
                    users_with_roles.append((member.user, 1, "Team Member"))

        groups = _deduplicate_by_highest_role(users_with_roles)
        total = sum(len(v) for v in groups.values())

        return Response({"recipients": groups, "total_recipients": total})


class FinalDocApproval(APIView):
    """Final document approval (no email sent)"""

    permission_classes = [IsAuthenticated]

    def get_document(self, pk):
        """Get document by ID"""
        try:
            obj = ProjectDocument.objects.get(pk=pk)
        except ProjectDocument.DoesNotExist:
            raise NotFound
        return obj

    def post(self, request):
        """Approve or recall final approval"""
        documentPk = request.data.get("documentPk")
        isActive = request.data.get("isActive")

        if isActive is False:
            settings.LOGGER.info(
                msg=f"{request.user} is providing final approval for {documentPk}"
            )
            document = self.get_document(pk=documentPk)

            data = {
                "project_lead_approval_granted": True,
                "business_area_lead_approval_granted": True,
                "directorate_approval_granted": True,
                "modifier": request.user.pk,
                "status": "approved",
            }
            ser = ProjectDocumentSerializer(
                document,
                data=data,
                partial=True,
            )
            if ser.is_valid():
                u_document = ser.save()
                u_document.project.status = Project.StatusChoices.ACTIVE
                u_document.project.save()
            else:
                settings.LOGGER.error(msg=f"{ser.errors}")
                return Response(
                    ser.errors,
                    status=HTTP_400_BAD_REQUEST,
                )
            return Response(
                TinyProjectDocumentSerializer(u_document).data,
                status=HTTP_202_ACCEPTED,
            )
        elif isActive is True:
            settings.LOGGER.info(
                msg=f"{request.user} is recalling final approval for docID: {documentPk}"
            )
            document = self.get_document(pk=documentPk)

            data = {
                "directorate_approval_granted": False,
                "modifier": request.user.pk,
                "status": "inapproval",
            }
            ser = ProjectDocumentSerializer(
                document,
                data=data,
                partial=True,
            )
            if ser.is_valid():
                u_document = ser.save()
                u_document.project.status = Project.StatusChoices.UPDATING
                u_document.project.save()
            else:
                settings.LOGGER.error(msg=f"{ser.errors}")
                return Response(
                    ser.errors,
                    status=HTTP_400_BAD_REQUEST,
                )
            return Response(
                TinyProjectDocumentSerializer(u_document).data,
                status=HTTP_202_ACCEPTED,
            )
        else:
            settings.LOGGER.error(msg="FinalDocApproval: isActive was None")
            return Response(
                {"error": "Something went wrong!"},
                status=HTTP_400_BAD_REQUEST,
            )
