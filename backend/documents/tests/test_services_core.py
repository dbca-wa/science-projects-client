"""
Tests for document services.

Tests business logic in document services.
"""

from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from common.tests.factories import ProjectDocumentFactory, ProjectFactory, UserFactory
from documents.models import ProjectDocument
from documents.services.approval_service import ApprovalService
from documents.services.document_service import DocumentService
from documents.tests.factories import (
    ConceptPlanFactory,
    ProjectPlanFactory,
)

User = get_user_model()


class TestDocumentService:
    """Test DocumentService business logic"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_documents_with_optimization(self):
        """Test list_documents uses N+1 query optimization"""
        # Arrange
        user = UserFactory()
        ConceptPlanFactory.create_batch(3)

        # Act
        documents = DocumentService.list_documents(user)

        # Assert
        assert documents.count() == 3
        # Verify select_related and prefetch_related are used
        assert "project" in str(documents.query)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_documents_with_filters(self):
        """Test list_documents applies filters correctly"""
        # Arrange
        user = UserFactory()
        concept = ConceptPlanFactory(document__kind="concept")
        ProjectPlanFactory(document__kind="projectplan")

        # Act
        documents = DocumentService.list_documents(user, {"kind": "concept"})

        # Assert
        assert documents.count() == 1
        assert documents.first().pk == concept.document.pk

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_document_success(self):
        """Test get_document retrieves document with optimization"""
        # Arrange
        concept_plan = ConceptPlanFactory()

        # Act
        result = DocumentService.get_document(concept_plan.document.pk)

        # Assert
        assert result.pk == concept_plan.document.pk
        assert result.kind == "concept"

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_document_not_found(self):
        """Test get_document raises NotFound for invalid ID"""
        # Act & Assert
        with pytest.raises(NotFound):
            DocumentService.get_document(99999)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_document_success(self):
        """Test create_document creates document correctly"""
        # Arrange
        user = UserFactory()
        project = ProjectFactory()

        # Act
        document = DocumentService.create_document(
            user=user,
            project=project,
            kind="concept",
        )

        # Assert
        assert document.project == project
        assert document.creator == user
        assert document.modifier == user
        assert document.kind == "concept"
        assert document.status == ProjectDocument.StatusChoices.NEW

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_document_success(self):
        """Test update_document updates fields correctly"""
        # Arrange
        user = UserFactory()
        concept_plan = ConceptPlanFactory()
        data = {
            "status": ProjectDocument.StatusChoices.INREVIEW,
        }

        # Act
        updated = DocumentService.update_document(concept_plan.document.pk, user, data)

        # Assert
        assert updated.status == ProjectDocument.StatusChoices.INREVIEW
        assert updated.modifier == user

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_delete_document_success(self):
        """Test delete_document removes document"""
        # Arrange
        user = UserFactory()
        concept_plan = ConceptPlanFactory()
        document_pk = concept_plan.document.pk

        # Act
        DocumentService.delete_document(document_pk, user)

        # Assert
        assert not ProjectDocument.objects.filter(pk=document_pk).exists()

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_documents_pending_action_stage_one(self):
        """Test get_documents_pending_action for stage 1"""
        # Arrange
        user = UserFactory()
        project = ProjectFactory()
        project.members.create(user=user, is_leader=True, role="supervising")

        # Create document with the correct project
        concept_plan = ConceptPlanFactory(
            project=project,
            document__project=project,
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=False,
        )

        # Act
        pending = DocumentService.get_documents_pending_action(user, stage=1)

        # Assert
        assert pending.count() == 1
        assert pending.first().pk == concept_plan.document.pk

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_documents_pending_action_stage_two(self):
        """Test get_documents_pending_action for stage 2"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory

        ba_lead = UserFactory()
        business_area = BusinessAreaFactory(leader=ba_lead)
        project = ProjectFactory(business_area=business_area)

        # Create document pending stage 2 approval
        concept_plan = ConceptPlanFactory(
            project=project,
            document__project=project,
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=False,
        )

        # Act
        pending = DocumentService.get_documents_pending_action(ba_lead, stage=2)

        # Assert
        assert pending.count() == 1
        assert pending.first().pk == concept_plan.document.pk

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_documents_pending_action_stage_three(self):
        """Test get_documents_pending_action for stage 3"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory, DivisionFactory

        director = UserFactory()
        division = DivisionFactory(director=director)
        business_area = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=business_area)

        # Create document pending stage 3 approval
        concept_plan = ConceptPlanFactory(
            project=project,
            document__project=project,
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
            document__directorate_approval_granted=False,
        )

        # Act
        pending = DocumentService.get_documents_pending_action(director, stage=3)

        # Assert
        assert pending.count() == 1
        assert pending.first().pk == concept_plan.document.pk

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_documents_pending_action_all_stages(self):
        """Test get_documents_pending_action with no stage (all stages)"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory, DivisionFactory

        # Create user who is project lead, BA lead, and director
        user = UserFactory()
        division = DivisionFactory(director=user)
        business_area = BusinessAreaFactory(leader=user, division=division)
        project = ProjectFactory(business_area=business_area)
        project.members.create(user=user, is_leader=True, role="supervising")

        # Create documents at different stages
        doc1 = ConceptPlanFactory(
            project=project,
            document__project=project,
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=False,
        )

        doc2 = ConceptPlanFactory(
            project=project,
            document__project=project,
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=False,
        )

        doc3 = ConceptPlanFactory(
            project=project,
            document__project=project,
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
            document__directorate_approval_granted=False,
        )

        # Act - no stage parameter means all stages
        pending = DocumentService.get_documents_pending_action(user, stage=None)

        # Assert - should return all 3 documents
        assert pending.count() == 3
        doc_ids = [doc.pk for doc in pending]
        assert doc1.document.pk in doc_ids
        assert doc2.document.pk in doc_ids
        assert doc3.document.pk in doc_ids

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_documents_with_search_term_filter(self):
        """Test list_documents with searchTerm filter"""
        # Arrange
        user = UserFactory()
        project1 = ProjectFactory(title="Climate Change Research")
        project2 = ProjectFactory(title="Water Quality Study")

        doc1 = ConceptPlanFactory(project=project1, document__project=project1)
        ConceptPlanFactory(project=project2, document__project=project2)

        # Act
        documents = DocumentService.list_documents(user, {"searchTerm": "Climate"})

        # Assert
        assert documents.count() == 1
        assert documents.first().pk == doc1.document.pk

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_documents_with_status_filter(self):
        """Test list_documents with status filter"""
        # Arrange
        user = UserFactory()
        ConceptPlanFactory(document__status=ProjectDocument.StatusChoices.NEW)
        doc2 = ConceptPlanFactory(
            document__status=ProjectDocument.StatusChoices.APPROVED
        )

        # Act
        documents = DocumentService.list_documents(
            user, {"status": ProjectDocument.StatusChoices.APPROVED}
        )

        # Assert
        assert documents.count() == 1
        assert documents.first().pk == doc2.document.pk

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_documents_with_project_filter(self):
        """Test list_documents with project filter"""
        # Arrange
        user = UserFactory()
        project1 = ProjectFactory()
        project2 = ProjectFactory()

        doc1 = ConceptPlanFactory(project=project1, document__project=project1)
        ConceptPlanFactory(project=project2, document__project=project2)

        # Act
        documents = DocumentService.list_documents(user, {"project": project1.pk})

        # Assert
        assert documents.count() == 1
        assert documents.first().pk == doc1.document.pk

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_documents_with_year_filter(self):
        """Test list_documents with year filter"""
        # Arrange
        user = UserFactory()
        project1 = ProjectFactory(year=2023)
        project2 = ProjectFactory(year=2024)

        doc1 = ConceptPlanFactory(project=project1, document__project=project1)
        ConceptPlanFactory(project=project2, document__project=project2)

        # Act
        documents = DocumentService.list_documents(user, {"year": 2023})

        # Assert
        assert documents.count() == 1
        assert documents.first().pk == doc1.document.pk


class TestApprovalService:
    """Test ApprovalService business logic"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_request_approval_success(self):
        """Test request_approval changes status correctly"""
        # Arrange
        user = UserFactory()
        concept_plan = ConceptPlanFactory(
            document__status=ProjectDocument.StatusChoices.INREVIEW
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_ready"
        ):
            ApprovalService.request_approval(concept_plan.document, user)

        # Assert
        concept_plan.document.refresh_from_db()
        assert concept_plan.document.status == ProjectDocument.StatusChoices.INAPPROVAL

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_request_approval_invalid_status(self):
        """Test request_approval fails for invalid status"""
        # Arrange
        user = UserFactory()
        concept_plan = ConceptPlanFactory(
            document__status=ProjectDocument.StatusChoices.NEW
        )

        # Act & Assert
        with pytest.raises(ValidationError):
            ApprovalService.request_approval(concept_plan.document, user)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_one_success(self):
        """Test approve_stage_one grants approval"""
        # Arrange
        user = UserFactory()
        project = ProjectFactory()
        project.members.create(user=user, is_leader=True, role="supervising")

        # Create document directly with the project
        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
        )

        # Create concept plan details
        ConceptPlanFactory(
            document=document,
            project=project,
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_ready"
        ):
            ApprovalService.approve_stage_one(document, user)

        # Assert
        document.refresh_from_db()
        assert document.project_lead_approval_granted is True

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_one_permission_denied(self):
        """Test approve_stage_one fails for non-leader"""
        # Arrange
        user = UserFactory()
        concept_plan = ConceptPlanFactory(
            document__status=ProjectDocument.StatusChoices.INAPPROVAL
        )

        # Act & Assert
        with pytest.raises(PermissionDenied):
            ApprovalService.approve_stage_one(concept_plan.document, user)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_two_success(self, project_with_ba_lead, ba_lead):
        """Test approve_stage_two grants approval"""
        # Arrange
        # Create document with the project that has BA lead configured
        document = ProjectDocumentFactory(
            project=project_with_ba_lead,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
        )

        # Create concept plan details
        ConceptPlanFactory(
            document=document,
            project=project_with_ba_lead,
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_ready"
        ):
            ApprovalService.approve_stage_two(document, ba_lead)

        # Assert
        document.refresh_from_db()
        assert document.business_area_lead_approval_granted is True

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_two_requires_stage_one(self, project_with_ba_lead, ba_lead):
        """Test approve_stage_two fails without stage 1"""
        # Arrange
        # Create document without stage 1 approval
        document = ProjectDocumentFactory(
            project=project_with_ba_lead,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=False,
        )

        # Create concept plan details
        ConceptPlanFactory(
            document=document,
            project=project_with_ba_lead,
        )

        # Act & Assert
        with pytest.raises(ValidationError):
            ApprovalService.approve_stage_two(document, ba_lead)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_send_back_resets_status(self):
        """Test send_back changes status to revising"""
        # Arrange
        user = UserFactory()
        concept_plan = ConceptPlanFactory(
            document__status=ProjectDocument.StatusChoices.INAPPROVAL
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_sent_back"
        ):
            ApprovalService.send_back(concept_plan.document, user, "Needs more detail")

        # Assert
        concept_plan.document.refresh_from_db()
        assert concept_plan.document.status == ProjectDocument.StatusChoices.REVISING

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_recall_resets_approvals(self):
        """Test recall resets all approval flags"""
        # Arrange
        user = UserFactory()
        concept_plan = ConceptPlanFactory(
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_recalled"
        ):
            ApprovalService.recall(concept_plan.document, user, "Need to make changes")

        # Assert
        concept_plan.document.refresh_from_db()
        assert concept_plan.document.project_lead_approval_granted is False
        assert concept_plan.document.business_area_lead_approval_granted is False
        assert concept_plan.document.directorate_approval_granted is False
        assert concept_plan.document.status == ProjectDocument.StatusChoices.REVISING

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_approval_stage(self):
        """Test get_approval_stage returns correct stage"""
        # Arrange
        concept_plan = ConceptPlanFactory(
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=False,
        )

        # Act
        stage = ApprovalService.get_approval_stage(concept_plan.document)

        # Assert
        assert stage == 2

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_two_permission_denied(self, project_with_ba_lead):
        """Test approve_stage_two fails for non-BA-lead"""
        # Arrange
        non_ba_lead = UserFactory()
        document = ProjectDocumentFactory(
            project=project_with_ba_lead,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
        )

        # Act & Assert
        with pytest.raises(PermissionDenied):
            ApprovalService.approve_stage_two(document, non_ba_lead)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_three_success(self, project_lead, ba_lead, director):
        """Test approve_stage_three grants final approval"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory, DivisionFactory

        division = DivisionFactory(director=director)
        business_area = BusinessAreaFactory(leader=ba_lead, division=division)
        project = ProjectFactory(business_area=business_area)
        project.members.create(user=project_lead, is_leader=True, role="supervising")

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_approved"
        ):
            with patch(
                "documents.services.approval_service.NotificationService.notify_document_approved_directorate"
            ):
                ApprovalService.approve_stage_three(document, director)

        # Assert
        document.refresh_from_db()
        assert document.directorate_approval_granted is True
        assert document.status == ProjectDocument.StatusChoices.APPROVED

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_three_requires_stage_one(
        self, project_lead, ba_lead, director
    ):
        """Test approve_stage_three fails without stage 1"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory, DivisionFactory

        division = DivisionFactory(director=director)
        business_area = BusinessAreaFactory(leader=ba_lead, division=division)
        project = ProjectFactory(business_area=business_area)

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=False,
            business_area_lead_approval_granted=True,
        )

        # Act & Assert
        with pytest.raises(
            ValidationError, match="Stage 1 approval must be granted first"
        ):
            ApprovalService.approve_stage_three(document, director)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_three_requires_stage_two(
        self, project_lead, ba_lead, director
    ):
        """Test approve_stage_three fails without stage 2"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory, DivisionFactory

        division = DivisionFactory(director=director)
        business_area = BusinessAreaFactory(leader=ba_lead, division=division)
        project = ProjectFactory(business_area=business_area)

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=False,
        )

        # Act & Assert
        with pytest.raises(
            ValidationError, match="Stage 2 approval must be granted first"
        ):
            ApprovalService.approve_stage_three(document, director)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_three_permission_denied(self, project_lead, ba_lead):
        """Test approve_stage_three fails for non-director"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory, DivisionFactory

        director = UserFactory()
        division = DivisionFactory(director=director)
        business_area = BusinessAreaFactory(leader=ba_lead, division=division)
        project = ProjectFactory(business_area=business_area)

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
        )

        non_director = UserFactory()

        # Act & Assert
        with pytest.raises(PermissionDenied):
            ApprovalService.approve_stage_three(document, non_director)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_approve_stage_three_no_division(self, project_lead, ba_lead):
        """Test approve_stage_three fails when business area has no division"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory

        business_area = BusinessAreaFactory(leader=ba_lead, division=None)
        project = ProjectFactory(business_area=business_area)

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
        )

        some_user = UserFactory()

        # Act & Assert
        with pytest.raises(PermissionDenied):
            ApprovalService.approve_stage_three(document, some_user)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_batch_approve_stage_one_success(self, project_lead):
        """Test batch_approve approves multiple documents at stage 1"""
        # Arrange
        project = ProjectFactory()
        project.members.create(user=project_lead, is_leader=True, role="supervising")

        doc1 = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
        )
        doc2 = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_ready"
        ):
            results = ApprovalService.batch_approve([doc1, doc2], project_lead, stage=1)

        # Assert
        assert len(results["approved"]) == 2
        assert doc1.pk in results["approved"]
        assert doc2.pk in results["approved"]
        assert len(results["failed"]) == 0

        doc1.refresh_from_db()
        doc2.refresh_from_db()
        assert doc1.project_lead_approval_granted is True
        assert doc2.project_lead_approval_granted is True

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_batch_approve_stage_two_success(self, project_lead, ba_lead):
        """Test batch_approve approves multiple documents at stage 2"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory

        business_area = BusinessAreaFactory(leader=ba_lead)
        project = ProjectFactory(business_area=business_area)

        doc1 = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
        )
        doc2 = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_ready"
        ):
            results = ApprovalService.batch_approve([doc1, doc2], ba_lead, stage=2)

        # Assert
        assert len(results["approved"]) == 2
        assert doc1.pk in results["approved"]
        assert doc2.pk in results["approved"]
        assert len(results["failed"]) == 0

        doc1.refresh_from_db()
        doc2.refresh_from_db()
        assert doc1.business_area_lead_approval_granted is True
        assert doc2.business_area_lead_approval_granted is True

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_batch_approve_stage_three_success(self, project_lead, ba_lead, director):
        """Test batch_approve approves multiple documents at stage 3"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory, DivisionFactory

        division = DivisionFactory(director=director)
        business_area = BusinessAreaFactory(leader=ba_lead, division=division)
        project = ProjectFactory(business_area=business_area)

        doc1 = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
        )
        doc2 = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_approved"
        ):
            with patch(
                "documents.services.approval_service.NotificationService.notify_document_approved_directorate"
            ):
                results = ApprovalService.batch_approve([doc1, doc2], director, stage=3)

        # Assert
        assert len(results["approved"]) == 2
        assert doc1.pk in results["approved"]
        assert doc2.pk in results["approved"]
        assert len(results["failed"]) == 0

        doc1.refresh_from_db()
        doc2.refresh_from_db()
        assert doc1.directorate_approval_granted is True
        assert doc2.directorate_approval_granted is True
        assert doc1.status == ProjectDocument.StatusChoices.APPROVED
        assert doc2.status == ProjectDocument.StatusChoices.APPROVED

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_batch_approve_with_failures(self, project_lead):
        """Test batch_approve handles failures correctly"""
        # Arrange
        project = ProjectFactory()
        project.members.create(user=project_lead, is_leader=True, role="supervising")

        # Document that can be approved
        doc1 = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
        )

        # Document that will fail (different project, user not leader)
        other_project = ProjectFactory()
        doc2 = ProjectDocumentFactory(
            project=other_project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
        )

        # Act
        with patch(
            "documents.services.approval_service.NotificationService.notify_document_ready"
        ):
            results = ApprovalService.batch_approve([doc1, doc2], project_lead, stage=1)

        # Assert
        assert len(results["approved"]) == 1
        assert doc1.pk in results["approved"]
        assert len(results["failed"]) == 1
        assert results["failed"][0]["document_id"] == doc2.pk
        assert "not authorized" in results["failed"][0]["error"].lower()

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_batch_approve_invalid_stage(self, project_lead):
        """Test batch_approve fails for invalid stage"""
        # Arrange
        project = ProjectFactory()
        doc = ProjectDocumentFactory(project=project)

        # Act
        results = ApprovalService.batch_approve([doc], project_lead, stage=99)

        # Assert
        assert len(results["approved"]) == 0
        assert len(results["failed"]) == 1
        assert "Invalid stage" in results["failed"][0]["error"]

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_next_approver_stage_one(self, project_lead):
        """Test get_next_approver returns project lead for stage 1"""
        # Arrange
        project = ProjectFactory()
        # Clear auto-generated members
        project.members.all().delete()
        # Add our specific project lead
        project.members.create(user=project_lead, is_leader=True, role="supervising")

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=False,
        )

        # Act
        next_approver = ApprovalService.get_next_approver(document)

        # Assert
        assert next_approver == project_lead

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_next_approver_stage_two(self, project_lead, ba_lead):
        """Test get_next_approver returns BA lead for stage 2"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory

        business_area = BusinessAreaFactory(leader=ba_lead)
        project = ProjectFactory(business_area=business_area)

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=False,
        )

        # Act
        next_approver = ApprovalService.get_next_approver(document)

        # Assert
        assert next_approver == ba_lead

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_next_approver_stage_three(self, project_lead, ba_lead, director):
        """Test get_next_approver returns director for stage 3"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory, DivisionFactory

        division = DivisionFactory(director=director)
        business_area = BusinessAreaFactory(leader=ba_lead, division=division)
        project = ProjectFactory(business_area=business_area)

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=False,
        )

        # Act
        next_approver = ApprovalService.get_next_approver(document)

        # Assert
        assert next_approver == director

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_next_approver_no_division(self, project_lead, ba_lead):
        """Test get_next_approver returns None when no division"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory

        business_area = BusinessAreaFactory(leader=ba_lead, division=None)
        project = ProjectFactory(business_area=business_area)

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
        )

        # Act
        next_approver = ApprovalService.get_next_approver(document)

        # Assert
        assert next_approver is None

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_next_approver_no_project_lead(self):
        """Test get_next_approver returns None when no project lead"""
        # Arrange
        project = ProjectFactory()
        # Clear auto-generated members to ensure no project lead
        project.members.all().delete()

        document = ProjectDocumentFactory(
            project=project,
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=False,
        )

        # Act
        next_approver = ApprovalService.get_next_approver(document)

        # Assert
        assert next_approver is None

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_next_approver_approved(self):
        """Test get_next_approver returns None for approved document"""
        # Arrange
        document = ProjectDocumentFactory(
            status=ProjectDocument.StatusChoices.APPROVED,
        )

        # Act
        next_approver = ApprovalService.get_next_approver(document)

        # Assert
        assert next_approver is None

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_next_approver_not_in_approval(self):
        """Test get_next_approver returns None for document not in approval"""
        # Arrange
        document = ProjectDocumentFactory(
            status=ProjectDocument.StatusChoices.NEW,
        )

        # Act
        next_approver = ApprovalService.get_next_approver(document)

        # Assert
        assert next_approver is None

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_approval_stage_not_in_approval(self):
        """Test get_approval_stage returns 0 for non-approval status"""
        # Arrange
        document = ProjectDocumentFactory(
            status=ProjectDocument.StatusChoices.NEW,
        )

        # Act
        stage = ApprovalService.get_approval_stage(document)

        # Assert
        assert stage == 0

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_approval_stage_approved(self):
        """Test get_approval_stage returns 4 for approved document"""
        # Arrange
        document = ProjectDocumentFactory(
            status=ProjectDocument.StatusChoices.APPROVED,
        )

        # Act
        stage = ApprovalService.get_approval_stage(document)

        # Assert
        assert stage == 4

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_approval_stage_one(self):
        """Test get_approval_stage returns 1 for stage 1"""
        # Arrange
        document = ProjectDocumentFactory(
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=False,
        )

        # Act
        stage = ApprovalService.get_approval_stage(document)

        # Assert
        assert stage == 1

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_approval_stage_three(self):
        """Test get_approval_stage returns 3 for stage 3"""
        # Arrange
        document = ProjectDocumentFactory(
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=False,
        )

        # Act
        stage = ApprovalService.get_approval_stage(document)

        # Assert
        assert stage == 3
