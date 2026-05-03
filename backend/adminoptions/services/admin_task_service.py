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

        Transfers project memberships (with role and leadership logic),
        document creators/modifiers, comments, and deletes secondary users.

        Privilege hierarchy (highest to lowest):
            Superuser > BA Lead (staff with business_areas_led) > Staff > External

        Merge direction rules:
            - Can only merge a lower-privilege user INTO a higher-privilege user
            - Cannot merge a superuser into anything
            - Cannot merge staff into an external user
            - Can merge external → staff/BA lead/admin
            - Can merge staff → staff/BA lead/admin
            - Can merge BA lead → admin

        Args:
            primary_user: User instance to merge into (must be equal or higher privilege).
            secondary_users: Iterable of User instances to merge from (deleted after merge).

        Raises:
            ValueError: If merge direction violates privilege hierarchy.
            NotFound: If any secondary user does not exist in the database.
        """

        def _get_privilege_level(user):
            """Return numeric privilege level for merge direction validation."""
            if user.is_superuser:
                return 4  # Superuser
            if user.is_staff and user.business_areas_led.exists():
                return 3  # BA Lead
            if user.is_staff:
                return 2  # Staff
            return 1  # External

        # Validate that primary user is not also a secondary user
        for secondary in secondary_users:
            if secondary.pk == primary_user.pk:
                raise ValueError("Primary user cannot also be a secondary user.")

        # Validate that all secondary users actually exist in the database
        for secondary in secondary_users:
            if not User.objects.filter(pk=secondary.pk).exists():
                raise NotFound(f"Secondary user with pk {secondary.pk} not found.")

        # Validate merge direction — secondary must be equal or lower privilege than primary
        primary_level = _get_privilege_level(primary_user)
        for secondary in secondary_users:
            secondary_level = _get_privilege_level(secondary)
            if secondary_level > primary_level:
                raise ValueError(
                    f"Cannot merge a higher-privilege user into a lower-privilege user. "
                    f"User {secondary.pk} (level {secondary_level}) cannot be merged "
                    f"into user {primary_user.pk} (level {primary_level})."
                )

        primary_is_staff = primary_user.is_staff

        for merging_user in secondary_users:
            # ========= HANDLE THE PROJECT MEMBERSHIPS =========
            memberships = list(ProjectMember.objects.filter(user=merging_user))

            for membership in memberships:
                existing_membership = ProjectMember.objects.filter(
                    project=membership.project, user=primary_user
                ).first()

                if existing_membership:
                    # Primary user already has a membership in this project
                    # Transfer leadership if the secondary user was the leader
                    if membership.is_leader and not existing_membership.is_leader:
                        existing_membership.is_leader = True

                    # Role resolution: supervising wins, then staff/non-staff rules
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

                    # Ensure role is appropriate for the primary user's staff status
                    if primary_is_staff:
                        if membership.role not in [
                            ProjectMember.RoleChoices.SUPERVISING,
                            ProjectMember.RoleChoices.RESEARCH,
                            ProjectMember.RoleChoices.TECHNICAL,
                        ]:
                            # Non-staff role on a staff user — default to research
                            membership.role = ProjectMember.RoleChoices.RESEARCH
                    else:
                        if membership.role not in [
                            ProjectMember.RoleChoices.EXTERNALCOL,
                            ProjectMember.RoleChoices.EXTERNALPEER,
                            ProjectMember.RoleChoices.ACADEMICSUPER,
                            ProjectMember.RoleChoices.STUDENT,
                            ProjectMember.RoleChoices.CONSULTED,
                            ProjectMember.RoleChoices.GROUP,
                        ]:
                            # Staff role on a non-staff user — default to external collaborator
                            membership.role = ProjectMember.RoleChoices.EXTERNALCOL

                    membership.save()

            # ========= HANDLE DOCUMENTS AND COMMENTS =========
            ProjectDocument.objects.filter(creator=merging_user).update(
                creator=primary_user
            )
            ProjectDocument.objects.filter(modifier=merging_user).update(
                modifier=primary_user
            )
            Comment.objects.filter(user=merging_user).update(user=primary_user)

            # ========= CLEAN UP ORPHANED ADMIN TASKS =========
            # Cancel any pending tasks where the merging user is referenced
            # (caretaker requests, merge requests, etc.)
            AdminTask.objects.filter(
                status=AdminTask.TaskStatus.PENDING,
                primary_user=merging_user,
            ).update(status=AdminTask.TaskStatus.CANCELLED)

            # Also cancel tasks where the merging user appears in secondary_users
            pending_tasks = AdminTask.objects.filter(
                status=AdminTask.TaskStatus.PENDING,
                secondary_users__contains=[merging_user.pk],
            )
            for task in pending_tasks:
                task.status = AdminTask.TaskStatus.CANCELLED
                task.save()

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
            settings.LOGGER.info(
                f"Merging users: primary={user_to_merge_into.pk}, "
                f"secondary_pks={task.secondary_users}"
            )
            users_to_merge = [
                AdminTaskService.get_user(u) for u in task.secondary_users
            ]
            AdminTaskService.merge_users(user_to_merge_into, users_to_merge)
            settings.LOGGER.info(
                f"Merge complete: secondary users deleted, data transferred to {user_to_merge_into.pk}"
            )

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
