"""
Project plan service - Project plan specific operations
"""

from django.conf import settings
from django.db import transaction

from .document_service import DocumentService


class ProjectPlanService:
    """Business logic for project plan operations"""

    @staticmethod
    @transaction.atomic
    def create_project_plan(user, project, data):
        """
        Create project plan document

        Args:
            user: User creating the project plan
            project: Project instance
            data: Project plan data

        Returns:
            ProjectDocument instance
        """
        settings.LOGGER.info(f"{user} is creating project plan for project {project}")

        # Create base document
        document = DocumentService.create_document(
            user=user, project=project, kind="projectplan", data=data
        )

        # Create project plan details and endorsements if provided
        if data:
            # Details creation logic here
            pass

        return document

    @staticmethod
    @transaction.atomic
    def update_project_plan(pk, user, data):
        """
        Update project plan document

        Args:
            pk: ProjectPlan primary key
            user: User updating the project plan
            data: Updated project plan data

        Returns:
            Updated ProjectDocument instance
        """
        from rest_framework.exceptions import NotFound

        from ..models import ProjectPlan

        # Get ProjectPlan object directly
        try:
            project_plan = ProjectPlan.objects.get(pk=pk)
        except ProjectPlan.DoesNotExist:
            raise NotFound(f"ProjectPlan with pk {pk} not found")

        document = project_plan.document

        if document.kind != "projectplan":
            from rest_framework.exceptions import ValidationError

            raise ValidationError("Document is not a project plan")

        settings.LOGGER.info(f"{user} is updating project plan {document}")

        # Update ProjectPlan fields
        for field, value in data.items():
            if hasattr(project_plan, field):
                setattr(project_plan, field, value)

        project_plan.save()

        # Update modifier on ProjectDocument
        document.modifier = user
        document.save()

        return document

    @staticmethod
    def get_project_plan_data(document):
        """
        Get project plan specific data

        Args:
            document: ProjectDocument instance

        Returns:
            dict: Project plan data
        """
        data = {
            "document": document,
            "project": document.project,
        }

        # Add project plan details
        if hasattr(document, "project_plan_details"):
            details = document.project_plan_details.first()
            if details:
                data["details"] = details

        # Add endorsements
        if hasattr(document, "endorsements"):
            data["endorsements"] = document.endorsements.all()

        return data
