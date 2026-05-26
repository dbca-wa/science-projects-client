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
    HTTP_201_CREATED,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
)
from rest_framework.views import APIView

from common.query_helpers import optimise_document_qs
from projects.constants import ALLOWED_DOCUMENT_TYPES, AUTO_APPROVE_CLOSURE_KINDS
from projects.models import Project, ProjectMember
from projects.utils.protection import (
    is_project_protected,
    should_skip_status_transition,
)
from users.models import User

from ..models import (
    AnnualReport,
    ProgressReport,
    ProjectClosure,
    ProjectDocument,
    StudentReport,
)
from ..serializers import (
    ConceptPlanCreateSerializer,
    EndorsementCreateSerializer,
    ProjectDocumentCreateSerializer,
    ProjectDocumentSerializer,
    ProjectPlanCreateSerializer,
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
            # Determine directorate role — division-based, not business area name
            from agencies.models import Division

            if request.user.is_superuser:
                has_directorate_role = True
                user_division_ids = None  # Superuser sees all
            else:
                user_divisions = Division.objects.filter(
                    Q(director=request.user)
                    | Q(key_stakeholder=request.user)
                    | Q(approvers=request.user)
                ).distinct()
                user_division_ids = list(user_divisions.values_list("pk", flat=True))
                has_directorate_role = len(user_division_ids) > 0

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
                docs_requiring_ba_attention = optimise_document_qs(
                    ProjectDocument.objects.exclude(
                        status=ProjectDocument.StatusChoices.APPROVED
                    ).filter(
                        project__in=ba_project_ids,
                        project_lead_approval_granted=True,
                        business_area_lead_approval_granted=False,
                    )
                )

                # Append the documents to the respective lists
                documents.extend(docs_requiring_ba_attention)
                ba_input_required.extend(docs_requiring_ba_attention)

            # Directorate Filtering — scoped to user's division roles
            if has_directorate_role:
                # Base queryset: stage 3 documents from active projects
                directorate_base = ProjectDocument.objects.exclude(
                    status=ProjectDocument.StatusChoices.APPROVED
                ).filter(
                    project__in=active_projects.values_list("id", flat=True),
                    business_area_lead_approval_granted=True,
                    directorate_approval_granted=False,
                )

                # Superusers see all; others see only their divisions
                if user_division_ids is not None:
                    directorate_base = directorate_base.filter(
                        project__business_area__division__in=user_division_ids
                    )

                docs_requiring_directorate_attention = optimise_document_qs(
                    directorate_base
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
            docs_requiring_lead_attention = optimise_document_qs(
                ProjectDocument.objects.exclude(
                    status=ProjectDocument.StatusChoices.APPROVED
                ).filter(
                    project__in=lead_project_ids,
                    project_lead_approval_granted=False,
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

            docs_requiring_team_attention = optimise_document_qs(
                ProjectDocument.objects.exclude(
                    status=ProjectDocument.StatusChoices.APPROVED
                ).filter(
                    project_lead_approval_granted=False,
                    project__in=my_non_leader_project_ids,
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
        kind = request.data.get("kind")
        project = request.data.get("project")

        if not kind or not project:
            return Response(
                {"error": "Both 'kind' and 'project' are required."},
                HTTP_400_BAD_REQUEST,
            )

        # Progress reports and student reports have dedicated creation endpoints
        if kind in ("progressreport", "studentreport"):
            return Response(
                {
                    "error": (
                        f"'{kind}' documents cannot be created via this endpoint. "
                        "Please use the dedicated creation endpoint."
                    )
                },
                HTTP_400_BAD_REQUEST,
            )

        # Validate the document kind is permitted for this project's kind
        try:
            project_instance = Project.objects.get(pk=project)
        except Project.DoesNotExist:
            return Response(
                {"error": f"Project with pk {project} not found."},
                HTTP_404_NOT_FOUND,
            )

        if is_project_protected(project_instance):
            return Response(
                {
                    "error": "Cannot create documents for a closed project. Reopen the project first."
                },
                HTTP_400_BAD_REQUEST,
            )

        allowed_types = ALLOWED_DOCUMENT_TYPES.get(project_instance.kind, [])
        if kind not in allowed_types:
            return Response(
                {
                    "error": (
                        f"{kind} documents are not permitted "
                        f"for {project_instance.kind} projects."
                    )
                },
                HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(msg=f"{request.user} is spawning document")

        ser = ProjectDocumentCreateSerializer(
            data={
                "kind": kind,
                "status": "new",
                "project": project,
                "creator": request.user.pk,
                "modifier": request.user.pk,
            }
        )

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

                # Create the kind-specific detail record
                if kind == "concept":
                    concept_ser = ConceptPlanCreateSerializer(
                        data={
                            "document": project_document.pk,
                            "project": project,
                        }
                    )
                    if concept_ser.is_valid():
                        concept_ser.save()
                    else:
                        settings.LOGGER.error(
                            msg=f"Failed to create concept plan: {concept_ser.errors}"
                        )
                        raise Exception(
                            f"ConceptPlan creation failed: {concept_ser.errors}"
                        )

                elif kind == "projectplan":
                    plan_ser = ProjectPlanCreateSerializer(
                        data={
                            "document": project_document.pk,
                            "project": project,
                        }
                    )
                    if plan_ser.is_valid():
                        plan = plan_ser.save()
                    else:
                        settings.LOGGER.error(
                            msg=f"Failed to create project plan: {plan_ser.errors}"
                        )
                        raise Exception(
                            f"ProjectPlan creation failed: {plan_ser.errors}"
                        )

                    endorsement_ser = EndorsementCreateSerializer(
                        data={"project_plan": plan.pk}
                    )
                    if endorsement_ser.is_valid():
                        endorsement_ser.save()
                    else:
                        settings.LOGGER.error(
                            msg=f"Failed to create endorsement: {endorsement_ser.errors}"
                        )
                        raise Exception(
                            f"Endorsement creation failed: {endorsement_ser.errors}"
                        )

                elif kind == "projectclosure":
                    # ProjectClosureCreateSerializer doesn't include 'project' field,
                    # so create the closure directly via the model
                    ProjectClosure.objects.create(
                        document=project_document,
                        project_id=project,
                    )

                    # Auto-approve closures for non-science project kinds
                    if project_instance.kind in AUTO_APPROVE_CLOSURE_KINDS:
                        from ..services.approval_service import ApprovalService

                        ApprovalService.auto_approve_closure(
                            project_document, request.user
                        )

                return Response(
                    ProjectDocumentSerializer(project_document).data,
                    HTTP_201_CREATED,
                )
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
    """Reopen a closed project by removing the closure document and restoring status"""

    permission_classes = [IsAuthenticated]

    def get_base_document(self, project_id):
        """Get the project closure document"""
        obj = ProjectDocument.objects.filter(
            project=project_id, kind="projectclosure"
        ).first()
        if obj is None:
            return None
        return obj

    @staticmethod
    def _determine_reopened_status(project):
        """
        Determine the correct project status after removing the closure document.
        The status depends on the project kind and the state of its remaining documents.
        """
        kind = project.kind

        if kind == Project.CategoryKindChoices.EXTERNAL:
            # External projects have no workflow documents — always active
            return Project.StatusChoices.ACTIVE

        if kind == Project.CategoryKindChoices.STUDENT:
            # Check for student reports (excluding the closure we're about to delete)
            approved_report = ProjectDocument.objects.filter(
                project=project,
                kind=ProjectDocument.CategoryKindChoices.STUDENTREPORT,
                directorate_approval_granted=True,
            ).exists()
            if approved_report:
                return Project.StatusChoices.ACTIVE

            has_any_report = ProjectDocument.objects.filter(
                project=project,
                kind=ProjectDocument.CategoryKindChoices.STUDENTREPORT,
            ).exists()
            if has_any_report:
                return Project.StatusChoices.UPDATING

            # No student reports — student projects start active
            return Project.StatusChoices.ACTIVE

        # Science and core_function: check workflow documents
        has_approved_progress = ProjectDocument.objects.filter(
            project=project,
            kind=ProjectDocument.CategoryKindChoices.PROGRESSREPORT,
            directorate_approval_granted=True,
        ).exists()
        if has_approved_progress:
            return Project.StatusChoices.ACTIVE

        has_unapproved_progress = (
            ProjectDocument.objects.filter(
                project=project,
                kind=ProjectDocument.CategoryKindChoices.PROGRESSREPORT,
            )
            .exclude(directorate_approval_granted=True)
            .exists()
        )
        if has_unapproved_progress:
            return Project.StatusChoices.UPDATING

        has_approved_plan = ProjectDocument.objects.filter(
            project=project,
            kind=ProjectDocument.CategoryKindChoices.PROJECTPLAN,
            directorate_approval_granted=True,
        ).exists()
        if has_approved_plan:
            return Project.StatusChoices.ACTIVE

        has_plan = ProjectDocument.objects.filter(
            project=project,
            kind=ProjectDocument.CategoryKindChoices.PROJECTPLAN,
        ).exists()
        if has_plan:
            return Project.StatusChoices.PENDING

        has_approved_concept = ProjectDocument.objects.filter(
            project=project,
            kind=ProjectDocument.CategoryKindChoices.CONCEPTPLAN,
            directorate_approval_granted=True,
        ).exists()
        if has_approved_concept:
            return Project.StatusChoices.PENDING

        has_concept = ProjectDocument.objects.filter(
            project=project,
            kind=ProjectDocument.CategoryKindChoices.CONCEPTPLAN,
        ).exists()
        if has_concept:
            return Project.StatusChoices.NEW

        # No documents at all
        return Project.StatusChoices.NEW

    def post(self, request, pk):
        """Reopen a project by removing the closure and setting to updating status"""
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
                    if project:
                        project.status = Project.StatusChoices.UPDATING
                        project.status_before_suspend = None
                        project.save(skip_closure_validation=True)
                else:
                    project = project_document.project
                    project_document.delete()
                    # Refresh project from DB after deleting closure
                    project = Project.objects.filter(pk=project.pk).first()
                    if project:
                        project.status = Project.StatusChoices.UPDATING
                        project.status_before_suspend = None
                        project.save(skip_closure_validation=True)

                settings.LOGGER.info(msg="Sending project reopened email")

                if project:
                    # Extract reason from request data (rich text HTML)
                    reason_html = request.data.get("reason", "")

                    NotificationService.notify_project_reopened(
                        project=project, reopener=request.user, reason_html=reason_html
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

        # Pre-fetch project PKs that have any non-draft closure (for status logic)
        closure_project_pks = set(
            ProjectDocument.objects.filter(
                kind="projectclosure",
            )
            .exclude(status="new")
            .values_list("project_id", flat=True)
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
                    # and the project is not protected or superseded by a later document
                    project = doc.project
                    if (
                        project.pk not in closure_project_pks
                        and project not in projects_to_update
                        and not is_project_protected(project)
                        and not should_skip_status_transition(doc)
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

        # Pre-fetch project PKs with any non-draft closure
        closure_project_pks = set(
            ProjectDocument.objects.filter(
                kind="projectclosure",
            )
            .exclude(status="new")
            .values_list("project_id", flat=True)
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

                    # Only update project status if no approved closure exists
                    # and the project is not protected or superseded by a later document
                    project = doc.project
                    if (
                        project.pk not in closure_project_pks
                        and project not in projects_to_update
                        and not is_project_protected(project)
                        and not should_skip_status_transition(doc)
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
    from users.utils import get_user_display_name

    best_role = {}  # pk → (priority, label, name, email)
    for user, priority, label in users_with_roles:
        if user.pk not in best_role or priority > best_role[user.pk][0]:
            best_role[user.pk] = (
                priority,
                label,
                get_user_display_name(user),
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
    Cross-references recipient emails against the IT Assets API to identify users
    who won't receive emails because they don't exist in the DBCA directory.

    All recipients must be active staff with @dbca.wa.gov.au emails.
    Only active business areas and active projects (excluding terminated/completed/closed)
    are included.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        import requests as http_requests
        from django.core.cache import cache

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

        # BA leads — only from active (non-archived) business areas
        bas = BusinessArea.objects.select_related("leader").filter(is_active=True)
        if division_slug and last_report and last_report.division:
            bas = bas.filter(division=last_report.division)
        for ba in bas:
            if _is_valid(ba.leader):
                users_with_roles.append((ba.leader, 3, "BA Lead"))

        # Project leads and team members — exclude protected projects and inactive BAs
        all_projects = Project.objects.exclude(status__in=Project.CLOSED_ONLY).filter(
            business_area__is_active=True
        )
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

        # Batch-query IT Assets API to validate recipient emails
        all_emails = set()
        for group_users in groups.values():
            for u in group_users:
                all_emails.add(u["email"].lower())

        it_assets_emails, it_assets_available = _fetch_it_assets_emails(
            cache, http_requests
        )

        # Partition recipients into valid (in IT Assets) and not_in_it_assets
        if it_assets_available:
            valid_groups = {"ba_leads": [], "project_leads": [], "team_members": []}
            invalid_groups = {"ba_leads": [], "project_leads": [], "team_members": []}

            for group_key in ("ba_leads", "project_leads", "team_members"):
                for user_entry in groups[group_key]:
                    if user_entry["email"].lower() in it_assets_emails:
                        valid_groups[group_key].append(user_entry)
                    else:
                        invalid_groups[group_key].append(user_entry)
        else:
            # IT Assets unavailable — treat all users as valid, set warning flag
            valid_groups = groups
            invalid_groups = {
                "ba_leads": [],
                "project_leads": [],
                "team_members": [],
            }

        total_valid = sum(len(v) for v in valid_groups.values())
        total_invalid = sum(len(v) for v in invalid_groups.values())

        return Response(
            {
                "recipients": valid_groups,
                "not_in_it_assets": invalid_groups,
                "total_recipients": total_valid,
                "total_not_in_it_assets": total_invalid,
                "it_assets_available": it_assets_available,
            }
        )


def _fetch_it_assets_emails(cache, http_requests):
    """
    Fetch the set of known emails from IT Assets API.

    Reuses the same cache key and data as the staff profiles directory
    (``it_assets_data``) so a single API call serves both pages.
    Cache duration: 30 minutes on success, 1 minute on failure — matching
    the staff profiles caching strategy.

    Returns:
        tuple: (set of lowercase email strings, bool indicating API availability)
    """
    # First, try to use the shared staff profiles cache (full user data by email)
    shared_cache_key = "it_assets_data"
    shared_data = cache.get(shared_cache_key)

    if shared_data is not None:
        if shared_data:
            emails = {email.lower() for email in shared_data.keys() if email}
            return (emails, True)
        else:
            return (set(), False)

    # Shared cache miss — fetch from IT Assets API and populate the shared cache
    try:
        api_url = settings.IT_ASSETS_URL
        if not api_url:
            settings.LOGGER.warning("IT Assets URL not configured")
            cache.set(shared_cache_key, {}, 60)
            return (set(), False)

        response = http_requests.get(
            api_url,
            auth=(settings.IT_ASSETS_USER, settings.IT_ASSETS_ACCESS_TOKEN),
            timeout=6,
        )

        if response.status_code == 200:
            data = response.json()
            it_asset_data_by_email = {
                user_data["email"]: user_data
                for user_data in data
                if "email" in user_data
            }
            cache.set(shared_cache_key, it_asset_data_by_email, 1800)  # 30 minutes

            emails = {email.lower() for email in it_asset_data_by_email.keys() if email}
            return (emails, True)
        else:
            settings.LOGGER.error(
                f"IT Assets API returned {response.status_code}: {response.text[:200]}"
            )
            cache.set(shared_cache_key, {}, 60)  # Retry after 1 minute
            return (set(), False)

    except Exception as e:
        settings.LOGGER.error(f"IT Assets API error: {e}")
        cache.set(shared_cache_key, {}, 60)  # Retry after 1 minute
        return (set(), False)


class NewCycleEmailPreview(APIView):
    """
    Render the new cycle open email template with provided context and return HTML.
    Used by the frontend to show a live preview of the email before sending.
    The CID logo is inlined as a base64 data URL for browser rendering.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        import base64
        import os
        import re

        import bleach
        from django.template.loader import render_to_string

        custom_message = request.data.get("custom_message", "")
        recipient_name = request.data.get("recipient_name", "Recipient Name")
        division_name = request.data.get("division_name", "")
        financial_year_string = request.data.get("financial_year_string", "2025-2026")

        # Sanitise custom message HTML
        sanitised_message = None
        if custom_message:
            allowed_tags = [
                "p",
                "br",
                "strong",
                "em",
                "u",
                "s",
                "a",
                "ul",
                "ol",
                "li",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "blockquote",
                "span",
            ]
            allowed_attrs = {"a": ["href", "target"], "span": ["style"]}
            sanitised_message = bleach.clean(
                custom_message, tags=allowed_tags, attributes=allowed_attrs, strip=True
            )

        actioning_user = request.user
        actioning_user_name = (
            f"{actioning_user.display_first_name} {actioning_user.display_last_name}"
        )

        template_props = {
            "email_subject": "SPMS: New Reporting Cycle Open",
            "actioning_user_email": actioning_user.email,
            "actioning_user_name": actioning_user_name,
            "financial_year_string": financial_year_string,
            "recipient_name": recipient_name,
            "division_name": division_name,
            "site_url": settings.SITE_URL,
            "custom_message": sanitised_message,
            "logo_url": True,
        }

        template_path = "./email_templates/new_cycle_open_email.html"
        html_content = render_to_string(template_path, template_props)

        # Inline the CID logo as a base64 data URL for preview rendering
        logo_path = os.path.join(
            settings.BASE_DIR, "documents", "static", "images", "dbca_email.png"
        )
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                logo_b64 = base64.b64encode(f.read()).decode("utf-8")
            data_url = f"data:image/png;base64,{logo_b64}"
            html_content = re.sub(
                r'src=["\']cid:dbca-logo["\']',
                f'src="{data_url}"',
                html_content,
            )

        return Response({"html": html_content})


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
                if not is_project_protected(u_document.project):
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
                if not is_project_protected(u_document.project):
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
