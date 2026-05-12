"""
Closure service - Project closure document operations
"""

from django.conf import settings
from django.db import transaction

from .document_service import DocumentService
from .notification_service import NotificationService


class ClosureService:
    """Business logic for project closure operations"""

    @staticmethod
    @transaction.atomic
    def create_closure(user, project, data):
        """
        Create project closure document.

        For science projects: creates closure doc, sets project to closure_requested.
        For all other kinds (student, external, core_function): creates closure doc,
        immediately approves it at all levels, and sets project to the intended outcome.

        Args:
            user: User creating the closure
            project: Project instance
            data: Closure data (reason, intended_outcome, etc.)

        Returns:
            ProjectDocument instance
        """
        from projects.models import Project

        from ..models import ProjectClosure, ProjectDocument

        settings.LOGGER.info(f"{user} is creating closure for project {project}")

        # Create base document
        document = DocumentService.create_document(
            user=user, project=project, kind="projectclosure", data=data
        )

        # Create closure details
        closure_data = {
            "document": document,
            "project": project,
        }

        # Add optional fields if provided
        intended_outcome = None
        if data:
            if "reason" in data:
                closure_data["reason"] = data["reason"]
            if "intended_outcome" in data or "outcome" in data:
                intended_outcome = data.get("intended_outcome", data.get("outcome"))
                closure_data["intended_outcome"] = intended_outcome

        ProjectClosure.objects.create(**closure_data)

        # Science projects require full approval workflow
        if project.kind == Project.CategoryKindChoices.SCIENCE:
            project.status = Project.StatusChoices.CLOSUREREQ
            project.save()
            settings.LOGGER.info(
                f"Science project {project} status changed to closure_requested"
            )
        else:
            # Non-science projects: immediate approval and closure
            document.project_lead_approval_granted = True
            document.business_area_lead_approval_granted = True
            document.directorate_approval_granted = True
            document.status = ProjectDocument.StatusChoices.APPROVED
            document.save()

            # Set project to the intended outcome status
            if intended_outcome == "terminated":
                project.status = Project.StatusChoices.TERMINATED
            else:
                project.status = Project.StatusChoices.COMPLETED
            project.save()

            settings.LOGGER.info(
                f"Non-science project {project} immediately closed "
                f"(status: {project.status})"
            )

            # Send closure notification
            try:
                NotificationService.notify_project_closed(project, user)
            except Exception as e:
                settings.LOGGER.error(
                    f"Failed to send closure notification: {e}", exc_info=True
                )

        return document

    @staticmethod
    @transaction.atomic
    def update_closure(pk, user, data):
        """
        Update project closure document

        Args:
            pk: ProjectClosure primary key
            user: User updating the closure
            data: Updated closure data

        Returns:
            Updated ProjectDocument instance
        """
        from rest_framework.exceptions import NotFound

        from ..models import ProjectClosure

        # Get ProjectClosure object directly
        try:
            project_closure = ProjectClosure.objects.get(pk=pk)
        except ProjectClosure.DoesNotExist:
            raise NotFound(f"ProjectClosure with pk {pk} not found")

        document = project_closure.document

        if document.kind != "projectclosure":
            from rest_framework.exceptions import ValidationError

            raise ValidationError("Document is not a project closure")

        settings.LOGGER.info(f"{user} is updating closure {document}")

        # Update ProjectClosure fields
        for field, value in data.items():
            if hasattr(project_closure, field):
                setattr(project_closure, field, value)

        project_closure.save()

        # Update modifier on ProjectDocument
        document.modifier = user
        document.save()

        return document

    @staticmethod
    @transaction.atomic
    def close_project(document, closer):
        """
        Close project using closure document

        Args:
            document: ProjectDocument instance (closure)
            closer: User closing the project
        """
        if document.kind != "projectclosure":
            from rest_framework.exceptions import ValidationError

            raise ValidationError("Document is not a project closure")

        if document.status != "approved":
            from rest_framework.exceptions import ValidationError

            raise ValidationError("Closure must be approved before closing project")

        settings.LOGGER.info(f"{closer} is closing project {document.project}")

        # Update project status
        project = document.project
        project.status = "completed"
        project.save()

        # Notify project closed
        NotificationService.notify_project_closed(project, closer)

    @staticmethod
    @transaction.atomic
    def reopen_project(project, reopener):
        """
        Reopen closed project

        Args:
            project: Project instance
            reopener: User reopening the project
        """
        settings.LOGGER.info(f"{reopener} is reopening project {project}")

        # Update project status
        project.status = "active"
        project.save()

        # Notify project reopened
        NotificationService.notify_project_reopened(project, reopener)

    @staticmethod
    def get_closure_data(document):
        """
        Get closure specific data

        Args:
            document: ProjectDocument instance

        Returns:
            dict: Closure data
        """
        data = {
            "document": document,
            "project": document.project,
        }

        # Add closure details
        if hasattr(document, "project_closure_details"):
            details = document.project_closure_details.first()
            if details:
                data["details"] = details

        return data
