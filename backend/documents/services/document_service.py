"""
Document service - Base document operations
"""

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import NotFound

from common.query_helpers import optimise_document_qs

from ..models import ProjectDocument


class DocumentService:
    """Business logic for base document operations"""

    @staticmethod
    def list_documents(user, filters=None):
        """
        List documents with optional filters and N+1 optimization

        Args:
            user: User requesting documents
            filters: Dict of filter parameters

        Returns:
            QuerySet of ProjectDocument objects
        """
        documents = ProjectDocument.objects.all()

        # Apply filters if provided
        if filters:
            documents = DocumentService._apply_filters(documents, filters)

        # N+1 query optimization
        documents = optimise_document_qs(documents)

        return documents.distinct()

    @staticmethod
    def get_document(pk):
        """
        Get document by ID with N+1 optimization

        Args:
            pk: Document primary key

        Returns:
            ProjectDocument instance

        Raises:
            NotFound: If document does not exist
        """
        try:
            return optimise_document_qs(ProjectDocument.objects.filter(pk=pk)).get(
                pk=pk
            )
        except ProjectDocument.DoesNotExist:
            raise NotFound(f"Document {pk} not found")

    @staticmethod
    @transaction.atomic
    def create_document(user, project, kind, data=None):
        """
        Create a new document

        Args:
            user: User creating the document
            project: Project instance
            kind: Document kind (concept, projectplan, etc.)
            data: Additional document data (optional)

        Returns:
            Created ProjectDocument instance
        """
        settings.LOGGER.info(
            f"{user} is creating {kind} document for project {project}"
        )

        document = ProjectDocument.objects.create(
            project=project,
            creator=user,
            modifier=user,
            kind=kind,
            status=ProjectDocument.StatusChoices.NEW,
        )

        return document

    @staticmethod
    @transaction.atomic
    def update_document(pk, user, data):
        """
        Update document

        Args:
            pk: Document primary key
            user: User updating the document
            data: Updated document data

        Returns:
            Updated ProjectDocument instance
        """
        document = DocumentService.get_document(pk)
        settings.LOGGER.info(f"{user} is updating document {document}")

        # Update fields
        for field, value in data.items():
            if hasattr(document, field):
                setattr(document, field, value)

        document.modifier = user
        document.save()

        return document

    @staticmethod
    @transaction.atomic
    def delete_document(pk, user):
        """
        Delete a document and revert the project status to the state it
        would have been in before this document existed.

        Status rollback map:
        - Concept plan deleted → project status = "new"
        - Project plan deleted → project status = "pending" (concept plan approved state)
        - Progress/student report deleted → project status = "active" (project plan approved state)
        - Project closure deleted → project status = "active"

        Args:
            pk: Document primary key
            user: User deleting the document
        """
        document = DocumentService.get_document(pk)
        settings.LOGGER.info(f"{user} is deleting document {document}")

        project = document.project
        kind = document.kind
        previous_status = project.status

        # Determine the correct rollback status
        rollback_status = DocumentService._get_rollback_status(kind, project)

        if rollback_status and rollback_status != previous_status:
            pass

            project.status = rollback_status
            project.save()
            settings.LOGGER.info(
                f"Reverted project {project.pk} status from '{previous_status}' "
                f"to '{rollback_status}' after deleting {kind} document"
            )

        document.delete()

    @staticmethod
    def _get_rollback_status(document_kind, project):
        """
        Determine the project status to revert to when a document is deleted.

        Rather than hardcoding a single rollback status per document kind,
        this method examines the remaining documents on the project to
        determine the correct state. It also respects suspension — if the
        project is currently suspended, the status is not changed (the
        status_before_suspend field is managed separately).

        Args:
            document_kind: The kind of document being deleted
            project: The Project instance

        Returns:
            str: The status to revert to, or None if no change needed
        """
        from projects.models import Project

        # Never change status of a suspended project — suspension is managed
        # separately via status_before_suspend
        if project.status == Project.StatusChoices.SUSPENDED:
            return None

        # For concept plan deletion: project goes back to "new"
        if document_kind == ProjectDocument.CategoryKindChoices.CONCEPTPLAN:
            return Project.StatusChoices.NEW

        # For project plan deletion: revert to the state after concept plan approval
        elif document_kind == ProjectDocument.CategoryKindChoices.PROJECTPLAN:
            has_approved_concept = ProjectDocument.objects.filter(
                project=project,
                kind=ProjectDocument.CategoryKindChoices.CONCEPTPLAN,
                status=ProjectDocument.StatusChoices.APPROVED,
            ).exists()
            return (
                Project.StatusChoices.PENDING
                if has_approved_concept
                else Project.StatusChoices.NEW
            )

        # For progress/student report deletion: if project is in a closure-related
        # or terminal state, don't touch it. Otherwise revert to "active".
        elif document_kind in [
            ProjectDocument.CategoryKindChoices.PROGRESSREPORT,
            ProjectDocument.CategoryKindChoices.STUDENTREPORT,
        ]:
            if project.status in (
                Project.StatusChoices.CLOSUREREQ,
                Project.StatusChoices.CLOSING,
                Project.StatusChoices.FINAL_UPDATE,
                Project.StatusChoices.COMPLETED,
                Project.StatusChoices.TERMINATED,
            ):
                return None
            return Project.StatusChoices.ACTIVE

        # For closure deletion: determine the correct pre-closure state by
        # checking what approved documents remain on the project
        elif document_kind == ProjectDocument.CategoryKindChoices.PROJECTCLOSURE:
            has_approved_project_plan = ProjectDocument.objects.filter(
                project=project,
                kind=ProjectDocument.CategoryKindChoices.PROJECTPLAN,
                status=ProjectDocument.StatusChoices.APPROVED,
            ).exists()
            if has_approved_project_plan:
                return Project.StatusChoices.ACTIVE

            has_approved_concept = ProjectDocument.objects.filter(
                project=project,
                kind=ProjectDocument.CategoryKindChoices.CONCEPTPLAN,
                status=ProjectDocument.StatusChoices.APPROVED,
            ).exists()
            if has_approved_concept:
                return Project.StatusChoices.PENDING

            return Project.StatusChoices.NEW

        return None

    @staticmethod
    def get_documents_pending_action(user, stage=None):
        """
        Get documents pending user's action

        Args:
            user: User to check pending actions for
            stage: Approval stage (1, 2, 3, or None for all)

        Returns:
            QuerySet of ProjectDocument objects
        """
        documents = ProjectDocument.objects.filter(
            status=ProjectDocument.StatusChoices.INAPPROVAL
        )

        # Filter by stage
        if stage == 1:
            # Stage 1: Project lead approval
            documents = documents.filter(
                project__members__user=user,
                project__members__is_leader=True,
                project_lead_approval_granted=False,
            )
        elif stage == 2:
            # Stage 2: Business area lead approval
            documents = documents.filter(
                project__business_area__leader=user,
                project_lead_approval_granted=True,
                business_area_lead_approval_granted=False,
            )
        elif stage == 3:
            # Stage 3: Directorate approval (director, key stakeholder, or approvers)
            documents = documents.filter(
                Q(project__business_area__division__director=user)
                | Q(project__business_area__division__key_stakeholder=user)
                | Q(project__business_area__division__approvers=user),
                project_lead_approval_granted=True,
                business_area_lead_approval_granted=True,
                directorate_approval_granted=False,
            )
        else:
            # All stages
            stage_3_role = (
                Q(project__business_area__division__director=user)
                | Q(project__business_area__division__key_stakeholder=user)
                | Q(project__business_area__division__approvers=user)
            )
            stage_3_flags = Q(
                project_lead_approval_granted=True,
                business_area_lead_approval_granted=True,
                directorate_approval_granted=False,
            )
            documents = documents.filter(
                Q(
                    project__members__user=user,
                    project__members__is_leader=True,
                    project_lead_approval_granted=False,
                )
                | Q(
                    project__business_area__leader=user,
                    project_lead_approval_granted=True,
                    business_area_lead_approval_granted=False,
                )
                | (stage_3_role & stage_3_flags)
            )

        # N+1 optimization
        documents = optimise_document_qs(documents)

        return documents.distinct()

    @staticmethod
    def _apply_filters(queryset, filters):
        """Apply filters to document queryset"""
        from django.db.models import Q

        # Search term
        search_term = filters.get("searchTerm")
        if search_term:
            queryset = queryset.filter(
                Q(project__title__icontains=search_term)
                | Q(project__description__icontains=search_term)
                | Q(kind__icontains=search_term)
            )

        # Kind filter
        kind = filters.get("kind")
        if kind and kind != "All":
            queryset = queryset.filter(kind=kind)

        # Status filter
        status = filters.get("status")
        if status and status != "All":
            queryset = queryset.filter(status=status)

        # Project filter
        project_id = filters.get("project")
        if project_id:
            queryset = queryset.filter(project__pk=project_id)

        # Year filter
        year = filters.get("year")
        if year and year != "All":
            queryset = queryset.filter(project__year=year)

        return queryset
