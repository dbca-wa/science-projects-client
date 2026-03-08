"""
Concept plan service - Concept plan specific operations
"""

from django.conf import settings
from django.db import transaction

from .document_service import DocumentService


class ConceptPlanService:
    """Business logic for concept plan operations"""

    @staticmethod
    @transaction.atomic
    def create_concept_plan(user, project, data):
        """
        Create concept plan document

        Args:
            user: User creating the concept plan
            project: Project instance
            data: Concept plan data

        Returns:
            ProjectDocument instance
        """
        settings.LOGGER.info(f"{user} is creating concept plan for project {project}")

        # Create base document
        document = DocumentService.create_document(
            user=user, project=project, kind="concept", data=data
        )

        # Create concept plan details if provided
        if data and hasattr(document, "concept_plan_details"):
            # Details creation logic here
            pass

        return document

    @staticmethod
    @transaction.atomic
    def update_concept_plan(pk, user, data):
        """
        Update concept plan document

        Args:
            pk: ConceptPlan primary key
            user: User updating the concept plan
            data: Updated concept plan data

        Returns:
            Updated ProjectDocument instance
        """
        from rest_framework.exceptions import NotFound

        from ..models import ConceptPlan

        # Get ConceptPlan object directly
        try:
            concept_plan = ConceptPlan.objects.get(pk=pk)
        except ConceptPlan.DoesNotExist:
            raise NotFound(f"ConceptPlan with pk {pk} not found")

        document = concept_plan.document

        if document.kind != "concept":
            from rest_framework.exceptions import ValidationError

            raise ValidationError("Document is not a concept plan")

        settings.LOGGER.info(f"{user} is updating concept plan {document}")

        # Update ConceptPlan fields
        for field, value in data.items():
            if hasattr(concept_plan, field):
                setattr(concept_plan, field, value)

        concept_plan.save()

        # Update modifier on ProjectDocument
        document.modifier = user
        document.save()

        return document

    @staticmethod
    def get_concept_plan_data(document):
        """
        Get concept plan specific data

        Args:
            document: ProjectDocument instance

        Returns:
            dict: Concept plan data
        """
        data = {
            "document": document,
            "project": document.project,
        }

        # Add concept plan details
        if hasattr(document, "concept_plan_details"):
            details = document.concept_plan_details.first()
            if details:
                data["details"] = details

        return data
