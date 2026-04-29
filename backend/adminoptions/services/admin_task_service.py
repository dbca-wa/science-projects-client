"""
Admin task service — business logic for admin task operations.

Extracted from adminoptions/views.py to keep views thin.
All methods preserve the exact behaviour of the original view code.
"""

from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import NotFound

from adminoptions.models import AdminTask
from caretakers.models import Caretaker
from communications.models import Comment
from documents.models import ProjectDocument
from projects.models import ProjectMember
from users.models import User


class AdminTaskService:
    """Service layer for admin task operations."""

    @staticmethod
    def get_task(pk):
        """Get an admin task by pk, raising NotFound if missing."""
        try:
            return AdminTask.objects.get(pk=pk)
        except AdminTask.DoesNotExist:
            raise NotFound(f"Admin task with pk {pk} not found")

    @staticmethod
    def get_user(pk):
        """Get a user by pk, raising NotFound if missing."""
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise NotFound(f"User with pk {pk} not found")

    @staticmethod
    @transaction.atomic
    def merge_users(primary_user, secondary_users):
        """
        Merge secondary users into the primary user.

        Transfers project memberships (with role logic), document
        creators/modifiers, comments, and deletes secondary users.

        This is the SINGLE source of truth for user merging — used by
        both ApproveTask and MergeUsers views.

        Args:
            primary_user: User instance to merge into.
            secondary_users: Iterable of User instances to merge from.
        """
        primary_is_staff = primary_user.is_staff

        for merging_user in secondary_users:
            # ========= HANDLE THE PROJECT MEMBERSHIPS =========
            memberships = ProjectMember.objects.filter(user=merging_user)

            for membership in memberships:
                existing_membership = ProjectMember.objects.filter(
                    project=membership.project, user=primary_user
                ).first()

                if existing_membership:
                    # Primary user already has a membership in this project
                    if (
                        membership.role == ProjectMember.RoleChoices.SUPERVISING
                        or existing_membership.role
                        == ProjectMember.RoleChoices.SUPERVISING
                    ):
                        existing_membership.role = ProjectMember.RoleChoices.SUPERVISING
                    else:
                        if primary_is_staff:
                            if membership.role in [
                                ProjectMember.RoleChoices.RESEARCH,
                                ProjectMember.RoleChoices.TECHNICAL,
                            ]:
                                existing_membership.role = membership.role
                        else:
                            if membership.role in [
                                ProjectMember.RoleChoices.EXTERNALCOL,
                                ProjectMember.RoleChoices.EXTERNALPEER,
                                ProjectMember.RoleChoices.ACADEMICSUPER,
                                ProjectMember.RoleChoices.STUDENT,
                                ProjectMember.RoleChoices.CONSULTED,
                                ProjectMember.RoleChoices.GROUP,
                            ]:
                                existing_membership.role = membership.role

                    existing_membership.save()
                    membership.delete()
                else:
                    # No existing membership — transfer the secondary user's membership
                    membership.user = primary_user
                    if primary_is_staff:
                        if membership.role in [
                            ProjectMember.RoleChoices.RESEARCH,
                            ProjectMember.RoleChoices.TECHNICAL,
                        ]:
                            membership.role = membership.role
                    else:
                        if membership.role in [
                            ProjectMember.RoleChoices.EXTERNALCOL,
                            ProjectMember.RoleChoices.EXTERNALPEER,
                            ProjectMember.RoleChoices.ACADEMICSUPER,
                            ProjectMember.RoleChoices.STUDENT,
                            ProjectMember.RoleChoices.CONSULTED,
                            ProjectMember.RoleChoices.GROUP,
                        ]:
                            membership.role = membership.role
                    membership.save()

            # ========= HANDLE DOCUMENTS AND COMMENTS =========
            ProjectDocument.objects.filter(creator=merging_user).update(
                creator=primary_user
            )
            ProjectDocument.objects.filter(modifier=merging_user).update(
                modifier=primary_user
            )
            Comment.objects.filter(user=merging_user).update(user=primary_user)

            # ========= HANDLE DELETION =========
            merging_user.delete()

    @staticmethod
    @transaction.atomic
    def approve_task(task, request_user):
        """
        Approve an admin task — dispatches to delete project, merge users,
        or set caretaker based on task.action.

        Args:
            task: AdminTask instance.
            request_user: User performing the approval.
        """
        settings.LOGGER.info(msg=f"{request_user} is approving task {task}")

        task.status = AdminTask.TaskStatus.APPROVED
        task.save()

        if task.action == AdminTask.ActionTypes.DELETEPROJECT:
            if task.project is None:
                raise ValueError("Project must be set to delete")
            task.notes = f"Project deletion approved - {task.project.title}"
            task.project.delete()
            task.project = None

        elif task.action == AdminTask.ActionTypes.MERGEUSER:
            if (
                task.primary_user is None
                or task.secondary_users is None
                or len(task.secondary_users) < 1
            ):
                raise ValueError(
                    "Primary and single secondary users must be set to merge"
                )
            user_to_merge_into = AdminTaskService.get_user(task.primary_user.pk)
            users_to_merge = [
                AdminTaskService.get_user(u) for u in task.secondary_users
            ]
            AdminTaskService.merge_users(user_to_merge_into, users_to_merge)

        elif task.action == AdminTask.ActionTypes.SETCARETAKER:
            user_who_needs_caretaker = AdminTaskService.get_user(task.primary_user.pk)
            caretaker = AdminTaskService.get_user(task.secondary_users[0])
            Caretaker.objects.create(
                user=user_who_needs_caretaker,
                caretaker=caretaker,
                reason=task.reason,
                notes=task.notes,
            )

        else:
            raise ValueError("Task action not recognised")

        task.status = AdminTask.TaskStatus.FULFILLED
        task.save()

    @staticmethod
    def reject_task(task, request_user):
        """
        Reject an admin task.

        Args:
            task: AdminTask instance.
            request_user: User performing the rejection.
        """
        settings.LOGGER.info(msg=f"{request_user} is rejecting task {task}")

        task.status = AdminTask.TaskStatus.REJECTED
        task.save()

        if task.action == AdminTask.ActionTypes.DELETEPROJECT:
            # Reset the project's deletion_requested flag
            task.project.deletion_requested = False
            task.project.save()

        if task.action == AdminTask.ActionTypes.SETCARETAKER:
            # Caretaker request rejected — no additional action required
            pass

        if task.action == AdminTask.ActionTypes.MERGEUSER:
            # User merge rejected — no additional action required
            pass

    @staticmethod
    def cancel_task(task, request_user):
        """
        Cancel an admin task.

        Args:
            task: AdminTask instance.
            request_user: User performing the cancellation.
        """
        settings.LOGGER.info(
            msg=f"{request_user} is cancelling request for task {task}"
        )

        task.status = AdminTask.TaskStatus.CANCELLED
        task.save()

        if task.action == AdminTask.ActionTypes.DELETEPROJECT:
            task.project.deletion_requested = False
            task.project.save()

        if task.action == AdminTask.ActionTypes.MERGEUSER:
            # User merge cancelled — no additional action required
            pass

        if task.action == AdminTask.ActionTypes.SETCARETAKER:
            # Caretaker request cancelled — no additional action required
            pass

    @staticmethod
    @transaction.atomic
    def respond_to_caretaker_request(task, action, request_user):
        """
        Handle caretaker request approval or rejection by the requested caretaker.

        Args:
            task: AdminTask instance (must be a SETCARETAKER task).
            action: "approve" or "reject".
            request_user: User responding to the request.

        Raises:
            ValueError: If the task is not a caretaker request, already processed,
                        the user is not authorised, or the action is invalid.
        """
        if task.action != AdminTask.ActionTypes.SETCARETAKER:
            raise ValueError("This endpoint only handles caretaker requests")

        if task.status != AdminTask.TaskStatus.PENDING:
            raise ValueError("This request has already been processed")

        if request_user.pk not in task.secondary_users:
            raise PermissionError("You are not authorised to respond to this request")

        if action not in ["approve", "reject"]:
            raise ValueError("Action must be 'approve' or 'reject'")

        settings.LOGGER.info(
            msg=f"{request_user} is {action}ing caretaker request {task}"
        )

        if action == "approve":
            task.status = AdminTask.TaskStatus.APPROVED
            task.save()

            user_who_needs_caretaker = AdminTaskService.get_user(task.primary_user.pk)
            caretaker = AdminTaskService.get_user(task.secondary_users[0])

            Caretaker.objects.create(
                user=user_who_needs_caretaker,
                caretaker=caretaker,
                reason=task.reason,
                notes=task.notes,
            )

            task.status = AdminTask.TaskStatus.FULFILLED
            task.save()

            return {"message": "Caretaker request approved successfully"}

        else:  # action == "reject"
            task.status = AdminTask.TaskStatus.REJECTED
            task.save()

            return {"message": "Caretaker request rejected successfully"}
