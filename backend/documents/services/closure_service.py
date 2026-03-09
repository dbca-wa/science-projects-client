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
        Create project closure document

        Args:
            user: User creating the closure
            project: Project instance
            data: Closure data (reason, intended_outcome, etc.)

        Returns:
            ProjectClosure instance
        """
        from ..models import ProjectClosure

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
        if data:
            if "reason" in data:
                closure_data["reason"] = data["reason"]
            if "intended_outcome" in data or "outcome" in data:
                # Support both 'intended_outcome' and 'outcome' field names
                closure_data["intended_outcome"] = data.get(
                    "intended_outcome", data.get("outcome")
                )

        ProjectClosure.objects.create(**closure_data)

        # Update project status to closure_requested
        project.status = "closure_requested"
        project.save()

        settings.LOGGER.info(f"Project {project} status changed to closure_requested")

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
