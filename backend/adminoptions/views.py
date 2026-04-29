# region IMPORTS ====================================================================================================


import os

from django.conf import settings
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from rest_framework.views import APIView

from adminoptions.models import AdminOptions, AdminTask, ContentField, GuideSection
from adminoptions.serializers import (
    AdminOptionsCreateSerializer,
    AdminOptionsMaintainerSerializer,
    AdminOptionsSerializer,
    AdminTaskRequestCreationSerializer,
    AdminTaskSerializer,
    ContentFieldSerializer,
    GuideSectionCreateUpdateSerializer,
    GuideSectionSerializer,
)
from adminoptions.services import AdminTaskService
from caretakers.models import Caretaker
from projects.models import Project
from users.models import User

# endregion  =================================================================================================

# region Views ====================================================================================================


class AdminControls(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, req):
        all = AdminOptions.objects.all()
        ser = AdminOptionsSerializer(
            all,
            many=True,
        )
        return Response(
            ser.data,
            status=HTTP_200_OK,
        )

    def post(self, req):
        settings.LOGGER.info(msg=f"{req.user} is posting an instance of admin controls")
        ser = AdminOptionsCreateSerializer(
            data=req.data,
        )
        if ser.is_valid():
            Controls = ser.save()
            return Response(
                AdminOptionsSerializer(Controls).data,
                status=HTTP_201_CREATED,
            )
        else:
            settings.LOGGER.error(msg=f"{ser.errors}")
            return Response(
                ser.errors,
                status=HTTP_400_BAD_REQUEST,
            )


class GetMaintainer(APIView):
    permission_classes = [IsAuthenticated]

    def go(self, pk):
        try:
            obj = AdminOptions.objects.get(pk=pk)
        except AdminOptions.DoesNotExist:
            raise NotFound
        return obj

    def get(self, req):
        settings.LOGGER.info(
            msg=f"{req.user} is using a rich text editor / getting maintainer"
        )
        AdminControl = self.go(1)
        ser = AdminOptionsMaintainerSerializer(AdminControl)
        return Response(
            ser.data,
            status=HTTP_200_OK,
        )


class AdminControlsDetail(APIView):
    permission_classes = [IsAuthenticated]

    def go(self, pk):
        try:
            obj = AdminOptions.objects.get(pk=pk)
        except AdminOptions.DoesNotExist:
            raise NotFound
        return obj

    def get(self, req, pk):
        AdminControl = self.go(pk)
        ser = AdminOptionsSerializer(AdminControl)
        return Response(
            ser.data,
            status=HTTP_200_OK,
        )

    def delete(self, req, pk):
        AdminControl = self.go(pk)
        settings.LOGGER.info(msg=f"{req.user} is deleting admincontrols {AdminControl}")
        AdminControl.delete()
        return Response(
            status=HTTP_204_NO_CONTENT,
        )

    def put(self, req, pk):
        AdminControl = self.go(pk)
        settings.LOGGER.info(msg=f"{req.user} is updating {AdminControl}")

        # Get the current guide_content
        current_guide_content = AdminControl.guide_content or {}

        # If guide_content is being updated, merge with existing content
        if "guide_content" in req.data:
            # Merge existing content with new content
            updated_guide_content = {
                **current_guide_content,
                **req.data["guide_content"],
            }
            req.data["guide_content"] = updated_guide_content

        ser = AdminOptionsCreateSerializer(
            AdminControl,
            data=req.data,
            partial=True,
        )

        if ser.is_valid():
            updated_admin_options = ser.save()
            settings.LOGGER.info(msg=f"Admin controls updated: {req.data}")
            settings.LOGGER.info(msg=f"Updated admin options: {updated_admin_options}")
            return Response(
                AdminOptionsSerializer(updated_admin_options).data,
                status=HTTP_202_ACCEPTED,
            )
        else:
            settings.LOGGER.error(msg=f"{ser.errors}")
            return Response(
                ser.errors,
                status=HTTP_400_BAD_REQUEST,
            )


class AdminControlsGuideContentUpdate(APIView):
    """Separate view for updating guide content"""

    permission_classes = [IsAdminUser]

    def go(self, pk):
        try:
            obj = AdminOptions.objects.get(pk=pk)
        except AdminOptions.DoesNotExist:
            raise NotFound
        return obj

    def post(self, req, pk):
        """Update a specific guide content field"""
        AdminControl = self.go(pk)
        field_key = req.data.get("field_key")
        content = req.data.get("content")

        settings.LOGGER.info(msg=f"Received update request for field_key: {field_key}")
        settings.LOGGER.info(
            msg=f"Content length: {len(content) if content else 'None'}"
        )

        if field_key and content is not None:
            # Initialise guide_content if it doesn't exist or is None
            if (
                not hasattr(AdminControl, "guide_content")
                or AdminControl.guide_content is None
            ):
                AdminControl.guide_content = {}

            # Make sure guide_content is a dict
            if not isinstance(AdminControl.guide_content, dict):
                AdminControl.guide_content = {}

            # Update the specific field
            AdminControl.guide_content[field_key] = content

            # Save with the full object, not just the field
            AdminControl.save()

            # Double-check the save worked
            refreshed = AdminOptions.objects.get(pk=AdminControl.pk)
            saved_content = (
                refreshed.guide_content.get(field_key)
                if refreshed.guide_content
                else None
            )
            settings.LOGGER.info(
                msg=f"Saved content length for {field_key}: {len(saved_content) if saved_content else 'None'}"
            )

            settings.LOGGER.info(
                msg=f"{req.user} updated guide content field {field_key}"
            )
            return Response({"status": "content updated"}, status=HTTP_200_OK)

        settings.LOGGER.info(
            msg=f"Missing data: field_key={field_key}, content={'Present' if content else 'Missing'}"
        )
        return Response(
            {"error": "field_key and content are required"}, status=HTTP_400_BAD_REQUEST
        )


# Add new viewsets for GuideSection and ContentField
class GuideSectionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing guide sections.

    Read access is available to all authenticated users, filtered by role.
    Write operations (create, update, delete) require admin privileges.
    """

    def get_queryset(self):
        """Filter sections based on the requesting user's role."""
        user = self.request.user
        qs = GuideSection.objects.all().order_by("order")

        # Superusers see everything
        if user.is_superuser:
            return qs

        allowed_roles = ["all"]

        # Business area leads can see BA lead content
        if hasattr(user, "business_areas_led") and user.business_areas_led.exists():
            allowed_roles.append("business_area_lead")

        # Key stakeholders can see KS content and BA lead content
        if (
            hasattr(user, "divisions_key_stakeholder")
            and user.divisions_key_stakeholder.exists()
        ):
            allowed_roles.append("key_stakeholder")
            if "business_area_lead" not in allowed_roles:
                allowed_roles.append("business_area_lead")

        return qs.filter(required_role__in=allowed_roles)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return GuideSectionCreateUpdateSerializer
        return GuideSectionSerializer

    def perform_create(self, serializer):
        section = serializer.save()
        settings.LOGGER.info(
            msg=f"{self.request.user} created guide section {section.id}"
        )

    def perform_update(self, serializer):
        section = serializer.save()
        settings.LOGGER.info(
            msg=f"{self.request.user} updated guide section {section.id}"
        )

    def perform_destroy(self, instance):
        settings.LOGGER.info(
            msg=f"{self.request.user} deleted guide section {instance.id}"
        )
        instance.delete()

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """Endpoint to reorder sections"""
        section_ids = request.data.get("section_ids", [])

        for index, section_id in enumerate(section_ids):
            try:
                section = GuideSection.objects.get(pk=section_id)
                section.order = index
                section.save(update_fields=["order"])
            except GuideSection.DoesNotExist:
                pass

        settings.LOGGER.info(msg=f"{request.user} reordered guide sections")
        return Response({"status": "sections reordered"}, status=HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def reorder_fields(self, request, pk=None):
        """Endpoint to reorder content fields within a section"""
        field_ids = request.data.get("field_ids", [])

        for index, field_id in enumerate(field_ids):
            try:
                field = ContentField.objects.get(pk=field_id, section_id=pk)
                field.order = index
                field.save(update_fields=["order"])
            except ContentField.DoesNotExist:
                pass

        settings.LOGGER.info(
            msg=f"{request.user} reordered content fields in section {pk}"
        )
        return Response({"status": "content fields reordered"}, status=HTTP_200_OK)


class ContentFieldViewSet(viewsets.ModelViewSet):
    """ViewSet for managing content fields within guide sections.

    Read access is available to all authenticated users.
    Write operations require admin privileges.
    """

    queryset = ContentField.objects.all()
    serializer_class = ContentFieldSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminUser()]

    def perform_create(self, serializer):
        field = serializer.save()
        settings.LOGGER.info(
            msg=f"{self.request.user} created content field {field.id}"
        )

    def perform_update(self, serializer):
        field = serializer.save()
        settings.LOGGER.info(
            msg=f"{self.request.user} updated content field {field.id}"
        )

    def perform_destroy(self, instance):
        settings.LOGGER.info(
            msg=f"{self.request.user} deleted content field {instance.id}"
        )
        instance.delete()


class AdminTasks(APIView):
    permission_classes = [IsAuthenticated]

    def check_existing_deletion_task(self, data):
        if AdminTask.objects.filter(
            action=data["action"],
            project=data["project"],
            status=AdminTask.TaskStatus.PENDING,
        ).exists():
            return True
        return False

    def check_existing_merge_user_task(self, data):
        if AdminTask.objects.filter(
            action=data["action"],
            primary_user=data["primary_user"],
            secondary_users=data["secondary_users"],
            status=AdminTask.TaskStatus.PENDING,
        ).exists():
            return True
        return False

    def check_existing_caretaker_task(self, data):
        if AdminTask.objects.filter(
            action=data["action"],
            primary_user=data["primary_user"],
            # secondary_users=data["secondary_users"],
            status=AdminTask.TaskStatus.PENDING,
        ).exists():
            return True
        return False

    def check_existing_caretaker_object(self, data):
        if Caretaker.objects.filter(
            user=data["primary_user"],
            caretaker=data["secondary_users"][0],
        ).exists():
            return True
        return False

    def set_project_deletion_requested(self, data):
        try:
            project = Project.objects.get(pk=data["project"])
            # Prevent duplicate requests
            if project.deletion_requested:
                return "Project already has a deletion request"

            project.deletion_requested = True
            project.save()
            return True
        except Exception as e:
            settings.LOGGER.error(
                msg=f"Error in setting project deletion requested: {e}",
                exc_info=True,
            )
            return False

    def get(self, req):
        settings.LOGGER.info(msg=f"{req.user} is getting all admin tasks")
        # Only return pending tasks (filter out cancelled, rejected, fulfilled)
        pending_tasks = AdminTask.objects.filter(status=AdminTask.TaskStatus.PENDING)
        ser = AdminTaskSerializer(
            pending_tasks,
            many=True,
        )
        return Response(
            ser.data,
            status=HTTP_200_OK,
        )

    def post(self, req):
        details_string = ""
        data = req.data
        if req.data["action"] == AdminTask.ActionTypes.MERGEUSER:
            details_string = f"{req.user} wishes to merge {req.data['secondary_users']} into {req.data['primary_user']}"
        elif req.data["action"] == AdminTask.ActionTypes.SETCARETAKER:
            details_string = f"{req.user} wishes to set {req.data['secondary_users'][0]} as caretaker for {req.data['primary_user']}"
        else:
            details_string = (
                f"{req.user} wishes to delete project {req.data['project']}"
            )

        settings.LOGGER.info(
            msg=f"{req.user} is posting an instance of admin tasks ({req.data['action']} - {details_string})"
        )
        try:
            # Caretaker/Merge user request validation
            if (
                data["action"] == AdminTask.ActionTypes.MERGEUSER
                or data["action"] == AdminTask.ActionTypes.SETCARETAKER
            ) and (
                data["primary_user"] is None
                or data["secondary_users"] is None
                or len(data["secondary_users"]) < 1
            ):
                raise ValueError(
                    "Primary and single secondary users must be set to merge"
                )

            # Delete project request validation
            if (data["action"] == AdminTask.ActionTypes.DELETEPROJECT) and (
                data["project"] is None
            ):
                raise ValueError("Project must be set to delete")
            if data["action"] == AdminTask.ActionTypes.DELETEPROJECT:
                if data["reason"] is None:
                    raise ValueError("Reason must be set to delete project")

        except Exception as e:
            settings.LOGGER.error(msg=f"Error in creating task: {e}", exc_info=True)
            return Response(
                {"error": "Failed to create task. Please try again."},
                status=HTTP_400_BAD_REQUEST,
            )

        requester = req.user
        data["requester"] = requester.pk
        data["status"] = AdminTask.TaskStatus.PENDING

        if data["action"] == AdminTask.ActionTypes.DELETEPROJECT:
            # First check if there is already a pending deletion request for this project
            if self.check_existing_deletion_task(data):
                settings.LOGGER.error(
                    msg="Error in setting project deletion requested: Project already has a pending deletion request"
                )
                return Response(
                    "Project already has a pending deletion request",
                    status=HTTP_400_BAD_REQUEST,
                )
            # Check the project specifically if the flag is set to true
            res = self.set_project_deletion_requested(data)
            if res is not True:
                settings.LOGGER.error(
                    msg=f"Error in setting project deletion requested: {res}"
                )
                return Response(
                    "Failed to process deletion request. Please try again.",
                    status=HTTP_400_BAD_REQUEST,
                )
        elif data["action"] == AdminTask.ActionTypes.MERGEUSER:
            # First check if there is already a pending merge user request for these users
            if self.check_existing_merge_user_task(data):
                settings.LOGGER.error(
                    msg="Error in setting merge user requested: Users already have a pending merge user request"
                )
                return Response(
                    "Users already have a pending merge user request",
                    status=HTTP_400_BAD_REQUEST,
                )

        elif data["action"] == AdminTask.ActionTypes.SETCARETAKER:
            # First check if there is already a pending caretaker request for this user
            if self.check_existing_caretaker_task(data):
                settings.LOGGER.error(
                    msg="Error in setting caretaker: User already has a pending caretaker request"
                )
                return Response(
                    "User already has a pending caretaker request",
                    status=HTTP_400_BAD_REQUEST,
                )
            if self.check_existing_caretaker_object(data):
                settings.LOGGER.error(
                    msg="Error in setting caretaker: User already has a caretaker"
                )
                return Response(
                    "User already has a caretaker",
                    status=HTTP_400_BAD_REQUEST,
                )

        # If all is good, and not admin create the task

        # if not req.user.is_superuser:
        ser = AdminTaskRequestCreationSerializer(
            data=req.data,
        )
        if ser.is_valid():
            task = ser.save()
            return Response(
                AdminTaskRequestCreationSerializer(task).data,
                status=HTTP_201_CREATED,
            )
        else:
            settings.LOGGER.error(msg=f"{ser.errors}")
            return Response(
                ser.errors,
                status=HTTP_400_BAD_REQUEST,
            )
        # else:
        #     # Create and fulfill the task


class PendingTasks(APIView):
    """Returns pending admin tasks — shares queryset with AdminTasks.get()."""

    permission_classes = [IsAuthenticated]

    def get(self, req):
        settings.LOGGER.info(msg=f"{req.user} is getting all pending admin tasks")
        pending_tasks = AdminTask.objects.filter(status=AdminTask.TaskStatus.PENDING)
        ser = AdminTaskSerializer(
            pending_tasks,
            many=True,
        )
        return Response(
            ser.data,
            status=HTTP_200_OK,
        )


class CheckPendingCaretakerRequestForUser(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, req, pk):
        settings.LOGGER.info(
            msg=f"{req.user} is checking if user with pk {pk} has an open caretaker request"
        )
        has_request = AdminTask.objects.filter(
            primary_user=pk,
            action=AdminTask.ActionTypes.SETCARETAKER,
            status=AdminTask.TaskStatus.PENDING,
        ).exists()
        return Response(
            {"has_request": has_request},
            status=HTTP_200_OK,
        )


class AdminTaskDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, req, pk):
        admin_task = AdminTaskService.get_task(pk)
        ser = AdminTaskSerializer(admin_task)
        return Response(
            ser.data,
            status=HTTP_200_OK,
        )

    def delete(self, req, pk):
        admin_task = AdminTaskService.get_task(pk)
        settings.LOGGER.info(msg=f"{req.user} is deleting admin_task {admin_task}")
        admin_task.delete()
        return Response(
            status=HTTP_204_NO_CONTENT,
        )

    def put(self, req, pk):
        admin_task = AdminTaskService.get_task(pk)
        settings.LOGGER.info(msg=f"{req.user} is updating {admin_task}")
        ser = AdminTaskSerializer(
            admin_task,
            data=req.data,
            partial=True,
        )
        if ser.is_valid():
            updated_admin_task = ser.save()
            return Response(
                AdminTaskSerializer(updated_admin_task).data,
                status=HTTP_202_ACCEPTED,
            )
        else:
            settings.LOGGER.error(msg=f"{ser.errors}")
            return Response(
                ser.errors,
                status=HTTP_400_BAD_REQUEST,
            )


# endregion  =================================================================================================

# region Functions on approval of tasks =================================================================================================


class ApproveTask(APIView):
    permission_classes = [IsAdminUser]

    def post(self, req, pk):
        settings.LOGGER.info(f"{req.user} is approving admin task (pk={pk})")
        task = AdminTaskService.get_task(pk)
        try:
            AdminTaskService.approve_task(task, req.user)
        except NotFound as e:
            return Response(
                {"error": str(e.detail)},
                status=HTTP_404_NOT_FOUND,
            )
        except ValueError:
            return Response(
                {"error": "Operation failed. Please check the request and try again."},
                status=HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            settings.LOGGER.error(
                msg=f"Unexpected error fulfilling task {pk}: {e}", exc_info=True
            )
            return Response(
                {"error": "An unexpected error occurred while fulfilling the task."},
                status=HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            status=HTTP_202_ACCEPTED,
        )


class RejectTask(APIView):

    permission_classes = [IsAdminUser]

    def post(self, req, pk):
        settings.LOGGER.info(f"{req.user} is rejecting admin task (pk={pk})")
        task = AdminTaskService.get_task(pk)
        AdminTaskService.reject_task(task, req.user)

        return Response(
            status=HTTP_202_ACCEPTED,
        )


class CancelTask(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, req, pk):
        settings.LOGGER.info(f"{req.user} is cancelling admin task (pk={pk})")
        task = AdminTaskService.get_task(pk)
        AdminTaskService.cancel_task(task, req.user)

        return Response(
            status=HTTP_202_ACCEPTED,
        )


# endregion  =================================================================================================

# region Merge Users / Set Caretaker =================================================================================================


class MergeUsers(APIView):
    """
    Merges a list of users into a primary user.
    For each user in the list, the project members, comments, documents are updated to the primary user.
    The primary user's data is not overwritten, higher privelleges take priority, and the secondary users are deleted.
    """

    permission_classes = [IsAdminUser]

    def post(self, req):
        settings.LOGGER.info(msg=f"{req.user} is merging users")
        if not req.user.is_superuser:
            return Response(
                {"detail": "You do not have permission to merge users."},
                status=HTTP_401_UNAUTHORIZED,
            )

        primary_user_id = req.data.get("primaryUser")
        secondary_user_ids = req.data.get("secondaryUsers")

        if not primary_user_id or not secondary_user_ids:
            return Response(
                {"detail": "Invalid data. Primary and secondary users are required."},
                status=HTTP_400_BAD_REQUEST,
            )

        if primary_user_id in secondary_user_ids:
            return Response(
                {
                    "detail": "Invalid data. Primary user cannot also be a secondary user."
                },
                status=HTTP_400_BAD_REQUEST,
            )

        primary_user = AdminTaskService.get_user(primary_user_id)
        secondary_users = list(User.objects.filter(pk__in=secondary_user_ids))
        settings.LOGGER.info(
            msg=f"Merging users: primaryUser={primary_user}, secondaryUsers={secondary_users}"
        )

        AdminTaskService.merge_users(primary_user, secondary_users)

        return Response(status=HTTP_200_OK)


# NOTE: AdminSetCaretaker and SetCaretaker views removed - duplicates of caretakers app functionality
# Use /api/v1/caretakers/admin-set/ instead


class SendAllTestEmails(APIView):
    """Render and send all email templates with sample data for visual review."""

    permission_classes = [IsAdminUser]

    # All production templates with sample context data
    TEMPLATES = [
        {
            "name": "document_approved_email",
            "subject": "Concept Plan Approved",
            "context": {
                "recipient_name": "Test User",
                "user_kind": "Team Member",
                "actioning_user_name": "Jane Approver",
                "actioning_user_email": "approver@dbca.wa.gov.au",
                "document_type_title": "Concept Plan",
                "document_type": "concept",
                "plain_project_name": "Fauna Survey 2026",
                "project_id": 42,
                "document_url": "/projects/42/concept",
                "stage": 2,
                "email_subject": "Concept Plan Approved",
            },
        },
        {
            "name": "document_approved_directorate_email",
            "subject": "Concept Plan Approved by Directorate",
            "context": {
                "recipient_name": "Test User",
                "user_kind": "Director",
                "actioning_user_name": "Director Smith",
                "actioning_user_email": "director@dbca.wa.gov.au",
                "document_type_title": "Concept Plan",
                "plain_project_name": "Fauna Survey 2026",
                "document_url": "/projects/42/concept",
                "email_subject": "Concept Plan Approved by Directorate",
            },
        },
        {
            "name": "document_recalled_email",
            "subject": "Progress Report Recalled",
            "context": {
                "recipient_name": "Test User",
                "user_kind": "Business Area Leader",
                "actioning_user_name": "John Recaller",
                "actioning_user_email": "recaller@dbca.wa.gov.au",
                "document_type_title": "Progress Report",
                "plain_project_name": "Fauna Survey 2026",
                "document_url": "/projects/42/progress",
                "feedback_html": "<p>Needs additional data before resubmission. Will update the methodology section and resubmit.</p>",
                "email_subject": "Progress Report Recalled",
            },
        },
        {
            "name": "document_sent_back_email",
            "subject": "Project Plan Sent Back",
            "context": {
                "recipient_name": "Test User",
                "user_kind": "Project Lead",
                "actioning_user_name": "Sarah Reviewer",
                "actioning_user_email": "reviewer@dbca.wa.gov.au",
                "document_type_title": "Project Plan",
                "plain_project_name": "Fauna Survey 2026",
                "document_url": "/projects/42/project",
                "feedback_html": "<p>Please revise the budget section and add more detail to the timeline.</p>",
                "email_subject": "Project Plan Sent Back",
            },
        },
        {
            "name": "document_ready_email",
            "subject": "Student Report Ready for Review",
            "context": {
                "recipient_name": "Test User",
                "user_kind": "Business Area Leader",
                "actioning_user_name": "Alex Submitter",
                "actioning_user_email": "submitter@dbca.wa.gov.au",
                "document_type_title": "Student Report",
                "plain_project_name": "Fauna Survey 2026",
                "document_url": "/projects/42/student",
                "email_subject": "Student Report Ready for Review",
            },
        },
        {
            "name": "feedback_received_email",
            "subject": "Feedback on Concept Plan",
            "context": {
                "recipient_name": "Test User",
                "user_kind": "Team Member",
                "actioning_user_name": "Mike Feedback",
                "actioning_user_email": "feedback@dbca.wa.gov.au",
                "document_type_title": "Concept Plan",
                "plain_project_name": "Fauna Survey 2026",
                "document_url": "/projects/42/concept",
                "feedback_text": "The methodology section could use more detail on sampling approach.",
                "email_subject": "Feedback on Concept Plan",
            },
        },
        {
            "name": "review_document_email",
            "subject": "Review Requested: Project Plan",
            "context": {
                "recipient_name": "Test User",
                "user_kind": "Approver",
                "actioning_user_name": "Lisa Requester",
                "actioning_user_email": "requester@dbca.wa.gov.au",
                "document_type_title": "Project Plan",
                "plain_project_name": "Fauna Survey 2026",
                "document_url": "/projects/42/project",
                "email_subject": "Review Requested: Project Plan",
            },
        },
        {
            "name": "bump_email",
            "subject": "SPMS: Action Required - Fauna Survey 2026",
            "context": {
                "recipient_name": "Test User",
                "recipient_email": "test@dbca.wa.gov.au",
                "actioning_user_name": "Admin User",
                "actioning_user_email": "admin@dbca.wa.gov.au",
                "project_title": "Fauna Survey 2026",
                "project_id": 42,
                "document_kind": "Progress Report",
                "document_kind_raw": "progressreport",
                "action_capacity": "Approver",
                "document_url": "/projects/42/progress",
                "email_subject": "SPMS: Action Required - Fauna Survey 2026",
            },
        },
        {
            "name": "bump_consolidated_email",
            "subject": "SPMS: Action Required - 4 documents need your attention",
            "context": {
                "recipient_name": "Test User",
                "actioning_user_name": "Admin User",
                "actioning_user_email": "admin@dbca.wa.gov.au",
                "as_project_lead": [
                    {
                        "project_title": "Fauna Survey 2026",
                        "document_kind": "Progress Report",
                        "document_url": "/projects/42/progress",
                    },
                    {
                        "project_title": "Flora Mapping WA",
                        "document_kind": "Progress Report",
                        "document_url": "/projects/58/progress",
                    },
                ],
                "as_ba_lead": [
                    {
                        "project_title": "Marine Ecology Study",
                        "document_kind": "Student Report",
                        "document_url": "/projects/73/student",
                    },
                    {
                        "project_title": "Wetland Conservation",
                        "document_kind": "Progress Report",
                        "document_url": "/projects/91/progress",
                    },
                ],
                "total_documents": 4,
            },
        },
        {
            "name": "batch_approved_consolidated_email",
            "subject": "SPMS: 3 Reports Approved",
            "context": {
                "recipient_name": "Test User",
                "documents": [
                    {
                        "project_title": "Fauna Survey 2026",
                        "document_kind": "Progress Report",
                        "document_url": "/projects/42/progress",
                    },
                    {
                        "project_title": "Flora Mapping WA",
                        "document_kind": "Progress Report",
                        "document_url": "/projects/58/progress",
                    },
                    {
                        "project_title": "Marine Ecology Study",
                        "document_kind": "Student Report",
                        "document_url": "/projects/73/student",
                    },
                ],
                "total_documents": 3,
            },
        },
        {
            "name": "document_comment_mention",
            "subject": "SPMS: You were mentioned in a comment",
            "context": {
                "recipient_name": "Test User",
                "commenter_name": "Jane Smith",
                "document_type_title": "Concept Plan",
                "project_tag": "SP-042",
                "project_name": "Fauna Survey 2026",
                "document_url": "/projects/42/concept",
                "comment_content": "Hey, can you review the budget section?",
                "is_mention": True,
            },
        },
        {
            "name": "new_comment_email",
            "subject": "SPMS: New comment on Concept Plan (SP-042)",
            "context": {
                "recipient_name": "Test User",
                "commenter_name": "Jane Smith",
                "document_type_title": "Concept Plan",
                "project_tag": "SP-042",
                "project_name": "Fauna Survey 2026",
                "document_url": "/projects/42/concept",
                "comment_content": "I have updated the methodology section as discussed.",
            },
        },
        {
            "name": "new_cycle_open_email",
            "subject": "SPMS: New Reporting Cycle Open",
            "context": {
                "recipient_name": "Test User",
                "actioning_user_name": "Admin User",
                "actioning_user_email": "admin@dbca.wa.gov.au",
                "financial_year_string": "2025-2026",
                "division_name": "Biodiversity and Conservation Science",
                "email_subject": "SPMS: New Reporting Cycle Open",
            },
        },
        {
            "name": "project_closed_email",
            "subject": "Project Closed: Fauna Survey 2026",
            "context": {
                "recipient_name": "Test User",
                "user_kind": "Team Member",
                "actioning_user_name": "Admin Closer",
                "actioning_user_email": "closer@dbca.wa.gov.au",
                "project_url": "/projects/42",
                "email_subject": "Project Closed: Fauna Survey 2026",
            },
        },
        {
            "name": "project_reopened_email",
            "subject": "Project Reopened: Fauna Survey 2026",
            "context": {
                "recipient_name": "Test User",
                "user_kind": "Team Member",
                "actioning_user_name": "Admin Reopener",
                "actioning_user_email": "reopener@dbca.wa.gov.au",
                "project_url": "/projects/42",
                "email_subject": "Project Reopened: Fauna Survey 2026",
            },
        },
        {
            "name": "spms_link_email",
            "subject": "You have been invited to SPMS",
            "context": {
                "actioning_user_name": "Admin Inviter",
                "actioning_user_email": "inviter@dbca.wa.gov.au",
                "invite_link": "",
                "email_subject": "You have been invited to SPMS",
            },
        },
    ]

    def post(self, req):
        import base64 as b64mod
        from email.mime.image import MIMEImage

        from django.core.mail import EmailMultiAlternatives
        from django.template.loader import render_to_string

        admin_opts = AdminOptions.objects.first()
        if not admin_opts or not admin_opts.email_test_user:
            return Response(
                {"error": "Email testing mode must be enabled with a test user set"},
                status=HTTP_400_BAD_REQUEST,
            )

        test_user = admin_opts.email_test_user

        # Optional user overrides for realistic test emails
        recipient_user_id = req.data.get("recipient_user_id")
        actioner_user_id = req.data.get("actioner_user_id")

        recipient_override = None
        actioner_override = None

        if recipient_user_id:
            try:
                recipient_override = User.objects.get(pk=recipient_user_id)
            except User.DoesNotExist:
                pass

        if actioner_user_id:
            try:
                actioner_override = User.objects.get(pk=actioner_user_id)
            except User.DoesNotExist:
                pass

        # Optional: send only a specific template
        single_template = req.data.get("template_name")
        templates_to_send = self.TEMPLATES
        if single_template:
            templates_to_send = [
                t for t in self.TEMPLATES if t["name"] == single_template
            ]
            if not templates_to_send:
                return Response(
                    {"error": f"Template '{single_template}' not found"},
                    status=HTTP_400_BAD_REQUEST,
                )

        logo_path = os.path.join(
            settings.BASE_DIR, "documents", "static", "images", "dbca_email.png"
        )

        # Read logo once for all emails
        logo_data = None
        logo_b64 = None
        if os.path.exists(logo_path):
            with open(logo_path, "rb") as f:
                logo_data = f.read()
                logo_b64 = b64mod.b64encode(logo_data).decode("utf-8")

        # Create preview directory (skip on read-only filesystem)
        preview_dir = os.path.join(settings.BASE_DIR, "email_previews")
        save_previews = settings.DEBUG
        if save_previews:
            try:
                os.makedirs(preview_dir, exist_ok=True)
            except OSError:
                save_previews = False

        base_context = {
            "logo_url": True,
            "site_url": settings.SITE_URL,
            "site_name": "SPMS",
        }

        results = []
        for tmpl in templates_to_send:
            template_file = f"./email_templates/{tmpl['name']}.html"
            context = {**base_context, **tmpl["context"]}

            # Apply user overrides if provided
            if recipient_override:
                r_name = f"{recipient_override.display_first_name} {recipient_override.display_last_name}"
                context["recipient_name"] = r_name
                if "recipient_email" in context:
                    context["recipient_email"] = recipient_override.email

            if actioner_override:
                a_name = f"{actioner_override.display_first_name} {actioner_override.display_last_name}"
                a_email = actioner_override.email
                for key in ("actioning_user_name", "commenter_name"):
                    if key in context:
                        context[key] = a_name
                for key in ("actioning_user_email",):
                    if key in context:
                        context[key] = a_email

            # Fill in URLs: prepend site_url to relative paths, replace empty with site_url
            for url_key in ("document_url", "project_url", "invite_link"):
                if url_key in context:
                    if not context[url_key]:
                        context[url_key] = settings.SITE_URL
                    elif context[url_key].startswith("/"):
                        context[url_key] = f"{settings.SITE_URL}{context[url_key]}"

            # Fill in nested list URLs (consolidated templates)
            for list_key in ("as_project_lead", "as_ba_lead", "documents"):
                if list_key in context and isinstance(context[list_key], list):
                    for item in context[list_key]:
                        if isinstance(item, dict) and "document_url" in item:
                            if not item["document_url"]:
                                item["document_url"] = settings.SITE_URL
                            elif item["document_url"].startswith("/"):
                                item["document_url"] = (
                                    f"{settings.SITE_URL}{item['document_url']}"
                                )

            try:
                html_content = render_to_string(template_file, context)
            except Exception:
                results.append(
                    {"template": tmpl["name"], "error": "Failed to render template"}
                )
                continue

            subject = f"[TEST] {tmpl['subject']}"

            # Build email message with CID
            msg = EmailMultiAlternatives(
                subject,
                "Please view this email in an HTML-compatible email client.",
                settings.DEFAULT_FROM_EMAIL,
                [test_user.email],
            )
            msg.attach_alternative(html_content, "text/html")
            msg.mixed_subtype = "related"

            if logo_data:
                logo_img = MIMEImage(logo_data, _subtype="png")
                logo_img.add_header("Content-ID", "<dbca-logo>")
                logo_img.add_header(
                    "Content-Disposition", "inline", filename="dbca.png"
                )
                msg.attach(logo_img)

            # Send the email
            try:
                msg.send()
            except Exception as e:
                settings.LOGGER.warning(f"Failed to send {tmpl['name']}: {e}")

            # Save HTML preview (base64 inlined image) — only in dev
            if save_previews:
                if logo_b64:
                    preview_html = html_content.replace(
                        'src="cid:dbca-logo"',
                        f'src="data:image/png;base64,{logo_b64}"',
                    )
                else:
                    preview_html = html_content

                html_path = os.path.join(preview_dir, f"{tmpl['name']}.html")
                with open(html_path, "w") as f:
                    f.write(preview_html)

                # Save EML preview
                eml_path = os.path.join(preview_dir, f"{tmpl['name']}.eml")
                with open(eml_path, "wb") as f:
                    f.write(msg.message().as_bytes())

            results.append({"template": tmpl["name"], "status": "ok"})

        settings.LOGGER.info(
            f"{req.user} sent all test emails ({len(results)} templates)"
        )

        return Response(
            {
                "message": f"Rendered {len(results)} email templates",
                "preview_dir": "email_previews",
                "results": results,
            }
        )


class RespondToCaretakerRequest(APIView):
    """
    Allow a user to approve or reject a caretaker request where they are the requested caretaker.
    This reduces admin burden by allowing users to self-manage caretaker requests.
    """

    permission_classes = [IsAuthenticated]

    def post(self, req, pk):
        """
        Approve or reject a caretaker request.
        Body: { "action": "approve" | "reject" }
        """
        settings.LOGGER.info(f"{req.user} is responding to caretaker request (pk={pk})")
        task = AdminTaskService.get_task(pk)
        action = req.data.get("action")

        try:
            result = AdminTaskService.respond_to_caretaker_request(
                task, action, req.user
            )
        except PermissionError:
            return Response(
                {"error": "You are not authorized to respond to this request"},
                status=HTTP_401_UNAUTHORIZED,
            )
        except ValueError:
            return Response(
                {"error": "Invalid action. Please use 'approve' or 'reject'."},
                status=HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            settings.LOGGER.error(msg=f"Error in fulfilling task: {e}", exc_info=True)
            return Response(
                {"error": "Failed to create caretaker relationship"},
                status=HTTP_400_BAD_REQUEST,
            )

        return Response(
            result,
            status=HTTP_202_ACCEPTED,
        )


# endregion  =================================================================================================
