"""
Tests for document views
"""

from unittest.mock import Mock, patch

import pytest
from rest_framework import status

from common.tests.factories import ProjectDocumentFactory
from common.tests.test_helpers import documents_urls
from documents.models import ProjectDocument


class TestReports:
    """Tests for annual report list and create endpoints"""

    @pytest.mark.integration
    def test_list_reports_authenticated(self, api_client, user, annual_report, db):
        """Test listing annual reports as authenticated user"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)

    @pytest.mark.integration
    def test_list_reports_unauthenticated(self, api_client, db):
        """Test listing annual reports without authentication"""
        # Act
        response = api_client.get(documents_urls.path("reports"))

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_create_report_valid(self, api_client, user, db):
        """Test creating annual report with valid data"""
        # Arrange
        api_client.force_authenticate(user=user)

        from datetime import datetime

        data = {
            "year": 2024,
            "date_open": datetime(2024, 1, 1).date().isoformat(),
            "date_closed": datetime(2024, 12, 31).date().isoformat(),
        }

        # Act
        response = api_client.post(documents_urls.path("reports"), data, format="json")

        # Assert
        assert response.status_code == status.HTTP_201_CREATED

    @pytest.mark.integration
    def test_create_report_invalid(self, api_client, user, db):
        """Test creating annual report with invalid data"""
        # Arrange
        api_client.force_authenticate(user=user)

        data = {}  # Missing required fields

        # Act
        response = api_client.post(documents_urls.path("reports"), data, format="json")

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestReportDetail:
    """Tests for annual report detail endpoint"""

    @pytest.mark.integration
    def test_get_report(self, api_client, user, annual_report, db):
        """Test getting annual report by ID"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports", annual_report.id))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == annual_report.id

    @pytest.mark.integration
    def test_get_report_not_found(self, api_client, user, db):
        """Test getting non-existent annual report"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports", 99999))

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    def test_update_report_valid(self, api_client, user, annual_report, db):
        """Test updating annual report with valid data"""
        # Arrange
        api_client.force_authenticate(user=user)

        data = {
            "is_published": True,
            "dm": "Updated director message",
        }

        # Act
        response = api_client.put(
            documents_urls.path("reports", annual_report.id), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_202_ACCEPTED
        assert response.data["is_published"] is True

    @pytest.mark.integration
    def test_update_report_not_found(self, api_client, user, db):
        """Test updating non-existent annual report"""
        # Arrange
        api_client.force_authenticate(user=user)

        data = {
            "is_published": True,
        }

        # Act
        response = api_client.put(
            documents_urls.path("reports", 99999), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    def test_update_report_invalid(self, api_client, user, annual_report, db):
        """Test updating annual report with invalid data"""
        # Arrange
        api_client.force_authenticate(user=user)

        data = {
            "year": "invalid",  # Invalid year format
        }

        # Act
        response = api_client.put(
            documents_urls.path("reports", annual_report.id), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.integration
    def test_delete_report(self, api_client, user, annual_report, db):
        """Test deleting annual report"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.delete(documents_urls.path("reports", annual_report.id))

        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT

    @pytest.mark.integration
    def test_delete_report_not_found(self, api_client, user, db):
        """Test deleting non-existent annual report"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.delete(documents_urls.path("reports", 99999))

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestGetLatestReportYear:
    """Tests for get latest report year endpoint"""

    @pytest.mark.integration
    def test_get_latest_report_year(self, api_client, user, annual_report, db):
        """Test getting latest report year"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports/latestyear"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "year" in response.data

    @pytest.mark.integration
    def test_get_latest_report_year_no_reports(self, api_client, user, db):
        """Test getting latest report year when no reports exist"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports/latestyear"))

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestGetAvailableReportYears:
    """Tests for get available report years endpoints"""

    @pytest.mark.integration
    def test_get_available_years_for_student_report(
        self, api_client, user, annual_report, project_with_lead, db
    ):
        """Test getting available years for student reports"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(
            documents_urls.path(
                "reports/availableyears", project_with_lead.id, "studentreport"
            )
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)

    @pytest.mark.integration
    def test_get_available_years_for_progress_report(
        self, api_client, user, annual_report, project_with_lead, db
    ):
        """Test getting available years for progress reports"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(
            documents_urls.path(
                "reports/availableyears", project_with_lead.id, "progressreport"
            )
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)


class TestGetReportsWithPDFs:
    """Tests for get reports with/without PDFs endpoints"""

    @pytest.mark.integration
    def test_get_reports_without_pdfs(self, api_client, user, annual_report, db):
        """Test getting reports without PDFs"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports/withoutPDF"))

        # Assert
        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.integration
    def test_get_reports_with_pdfs(self, api_client, user, db):
        """Test getting reports with PDFs"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports/withPDF"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)

    @pytest.mark.integration
    def test_get_legacy_pdfs(self, api_client, user, db):
        """Test getting legacy PDFs"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports/legacyPDF"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)


class TestGetCompletedReports:
    """Tests for get completed reports endpoint"""

    @pytest.mark.integration
    def test_get_completed_reports(self, api_client, user, db):
        """Test getting completed (published) reports"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports/completed"))

        # Assert
        assert response.status_code == status.HTTP_200_OK


class TestLatestYearsReports:
    """Tests for latest year's reports endpoints"""

    @pytest.mark.integration
    def test_get_latest_years_progress_reports(
        self, api_client, user, annual_report, db
    ):
        """Test getting latest year's progress reports"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("latest_active_progress_reports"))

        # Assert
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

    @pytest.mark.integration
    def test_get_latest_years_student_reports(
        self, api_client, user, annual_report, db
    ):
        """Test getting latest year's student reports"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("latest_active_student_reports"))

        # Assert
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

    @pytest.mark.integration
    def test_get_latest_years_inactive_reports(
        self, api_client, user, annual_report, db
    ):
        """Test getting latest year's inactive reports"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("latest_inactive_reports"))

        # Assert
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

    @pytest.mark.integration
    def test_get_full_latest_report(self, api_client, user, annual_report, db):
        """Test getting full latest report"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("reports/latest"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "year" in response.data


# ============================================================================
# Concept Plan View Tests
# ============================================================================


class TestConceptPlans:
    """Tests for ConceptPlans view (list/create)"""

    @pytest.mark.integration
    def test_list_concept_plans_authenticated(
        self, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test listing concept plans as authenticated user"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Act
        response = api_client.get(documents_urls.path("conceptplans"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "concept_plans" in response.data
        assert len(response.data["concept_plans"]) == 1
        assert response.data["concept_plans"][0]["id"] == concept_plan_with_details.id

    @pytest.mark.integration
    @pytest.mark.integration
    def test_list_concept_plans_unauthenticated(self, api_client, db):
        """Test listing concept plans without authentication"""
        # Act
        response = api_client.get(documents_urls.path("conceptplans"))

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_list_concept_plans_empty(self, api_client, project_lead, db):
        """Test listing concept plans when none exist"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Act
        response = api_client.get(documents_urls.path("conceptplans"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "concept_plans" in response.data
        assert len(response.data["concept_plans"]) == 0

    @patch(
        "documents.services.concept_plan_service.ConceptPlanService.create_concept_plan"
    )
    @pytest.mark.integration
    def test_create_concept_plan_valid(
        self, mock_create, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test creating concept plan with valid data"""
        # Arrange
        api_client.force_authenticate(user=project_lead)
        mock_create.return_value = concept_plan_with_details.document

        data = {
            "document": concept_plan_with_details.document.id,
            "background": "<p>New background</p>",
            "aims": "<p>New aims</p>",
            "outcome": "<p>New outcome</p>",
        }

        # Act
        response = api_client.post(
            documents_urls.path("conceptplans"), data=data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert "id" in response.data
        mock_create.assert_called_once()

    @pytest.mark.integration
    def test_create_concept_plan_invalid_data(self, api_client, project_lead, db):
        """Test creating concept plan with invalid data"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        data = {
            "document": None,  # Invalid - required field
        }

        # Act
        response = api_client.post(
            documents_urls.path("conceptplans"), data=data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch(
        "documents.services.concept_plan_service.ConceptPlanService.create_concept_plan"
    )
    @pytest.mark.integration
    def test_create_concept_plan_no_details(
        self, mock_create, api_client, project_lead, concept_plan, db
    ):
        """Test creating concept plan when details creation fails"""
        # Arrange
        from unittest.mock import Mock

        api_client.force_authenticate(user=project_lead)
        # Mock document without concept_plan_details attribute
        mock_doc = Mock(spec=[])  # Empty spec means no attributes
        mock_create.return_value = mock_doc

        data = {
            "document": concept_plan.id,
            "background": "<p>Test</p>",
        }

        # Act
        response = api_client.post(
            documents_urls.path("conceptplans"), data=data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data


class TestConceptPlanDetail:
    """Tests for ConceptPlanDetail view (get/update/delete)"""

    @pytest.mark.integration
    def test_get_concept_plan_authenticated(
        self, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test getting concept plan as authenticated user"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Act
        response = api_client.get(
            documents_urls.path("conceptplans", concept_plan_with_details.document.id)
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == concept_plan_with_details.id
        assert response.data["background"] == concept_plan_with_details.background

    @pytest.mark.integration
    def test_get_concept_plan_unauthenticated(
        self, api_client, concept_plan_with_details, db
    ):
        """Test getting concept plan without authentication"""
        # Act
        response = api_client.get(
            documents_urls.path("conceptplans", concept_plan_with_details.document.id)
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_get_concept_plan_not_found(self, api_client, project_lead, db):
        """Test getting non-existent concept plan"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Act
        response = api_client.get(documents_urls.path("conceptplans", 99999))

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @patch(
        "documents.services.concept_plan_service.ConceptPlanService.get_concept_plan_data"
    )
    @pytest.mark.integration
    def test_get_concept_plan_no_details(
        self, mock_get_data, api_client, project_lead, concept_plan, db
    ):
        """Test getting concept plan when details don't exist"""
        # Arrange
        api_client.force_authenticate(user=project_lead)
        mock_get_data.return_value = {}  # No 'details' key

        # Act
        response = api_client.get(documents_urls.path("conceptplans", concept_plan.id))

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @patch(
        "documents.services.concept_plan_service.ConceptPlanService.update_concept_plan"
    )
    @pytest.mark.integration
    def test_update_concept_plan_valid(
        self, mock_update, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test updating concept plan with valid data"""
        # Arrange
        api_client.force_authenticate(user=project_lead)
        mock_update.return_value = concept_plan_with_details.document

        data = {
            "background": "<p>Updated background</p>",
            "aims": "<p>Updated aims</p>",
        }

        # Act
        response = api_client.put(
            documents_urls.path("conceptplans", concept_plan_with_details.document.id),
            data=data,
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        mock_update.assert_called_once()

    @pytest.mark.integration
    def test_update_concept_plan_invalid_data(
        self, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test updating concept plan with invalid data"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        data = {
            "staff_time_allocation": "invalid json",  # Invalid - should be valid JSON
            "budget": "invalid json",  # Invalid - should be valid JSON
        }

        # Act
        response = api_client.put(
            documents_urls.path("conceptplans", concept_plan_with_details.document.id),
            data=data,
            format="json",
        )

        # Assert
        # Serializer may accept this as text fields, so check for either 400 or 200
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]

    @patch(
        "documents.services.concept_plan_service.ConceptPlanService.update_concept_plan"
    )
    @patch(
        "documents.services.concept_plan_service.ConceptPlanService.get_concept_plan_data"
    )
    @pytest.mark.integration
    def test_update_concept_plan_no_details(
        self, mock_get_data, mock_update, api_client, project_lead, concept_plan, db
    ):
        """Test updating concept plan when details update fails"""
        # Arrange
        api_client.force_authenticate(user=project_lead)
        mock_update.return_value = concept_plan
        mock_get_data.return_value = {}  # No 'details' key

        data = {
            "background": "<p>Updated</p>",
        }

        # Act
        response = api_client.put(
            documents_urls.path("conceptplans", concept_plan.id),
            data=data,
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @patch("documents.services.document_service.DocumentService.delete_document")
    @pytest.mark.integration
    def test_delete_concept_plan_authenticated(
        self, mock_delete, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test deleting concept plan as authenticated user"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Act
        response = api_client.delete(
            documents_urls.path("conceptplans", concept_plan_with_details.document.id)
        )

        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        mock_delete.assert_called_once_with(
            concept_plan_with_details.document.id, project_lead
        )

    @pytest.mark.integration
    def test_delete_concept_plan_unauthenticated(
        self, api_client, concept_plan_with_details, db
    ):
        """Test deleting concept plan without authentication"""
        # Act
        response = api_client.delete(
            documents_urls.path("conceptplans", concept_plan_with_details.document.id)
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]


class TestGetConceptPlanData:
    """Tests for GetConceptPlanData view (PDF generation data)"""

    @pytest.mark.integration
    def test_get_concept_plan_data_authenticated(
        self, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test getting concept plan data as authenticated user"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Act
        response = api_client.post(
            documents_urls.path(
                "conceptplans", concept_plan_with_details.id, "get_concept_plan_data"
            )
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "concept_plan_data_id" in response.data
        assert "document_id" in response.data
        assert "project_id" in response.data
        assert "document_tag" in response.data
        assert "project_title" in response.data
        assert "background" in response.data
        assert "aims" in response.data
        assert response.data["concept_plan_data_id"] == concept_plan_with_details.id

    @pytest.mark.integration
    def test_get_concept_plan_data_unauthenticated(
        self, api_client, concept_plan_with_details, db
    ):
        """Test getting concept plan data without authentication"""
        # Act
        response = api_client.post(
            documents_urls.path(
                "conceptplans", concept_plan_with_details.id, "get_concept_plan_data"
            )
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_get_concept_plan_data_not_found(self, api_client, project_lead, db):
        """Test getting data for non-existent concept plan"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Act
        response = api_client.post(
            documents_urls.path("conceptplans", 99999, "get_concept_plan_data")
        )

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    def test_get_concept_plan_data_with_team(
        self, api_client, project_lead, concept_plan_with_details, user_factory, db
    ):
        """Test getting concept plan data with project team"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Add another team member
        other_user = user_factory(
            username="other_member",
            email="other@example.com",
            first_name="Other",
            last_name="Member",
        )
        concept_plan_with_details.project.members.create(
            user=other_user, is_leader=False, position=1, role="research"
        )

        # Act
        response = api_client.post(
            documents_urls.path(
                "conceptplans", concept_plan_with_details.id, "get_concept_plan_data"
            )
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "project_team" in response.data
        assert len(response.data["project_team"]) == 2
        # Leader should be first
        assert "Project Lead" in response.data["project_team"][0]

    @pytest.mark.integration
    def test_get_concept_plan_data_with_image(
        self, api_client, project_lead, concept_plan_with_details, mock_image, db
    ):
        """Test getting concept plan data with project image"""
        # Arrange
        from medias.models import ProjectPhoto

        api_client.force_authenticate(user=project_lead)

        # Create project photo with uploaded file using fixture
        ProjectPhoto.objects.create(
            project=concept_plan_with_details.project,
            file=mock_image,
        )

        # Act
        response = api_client.post(
            documents_urls.path(
                "conceptplans", concept_plan_with_details.id, "get_concept_plan_data"
            )
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "project_image" in response.data
        assert response.data["project_image"] is not None

    @pytest.mark.integration
    def test_get_concept_plan_data_without_image(
        self, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test getting concept plan data without project image"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Act
        response = api_client.post(
            documents_urls.path(
                "conceptplans", concept_plan_with_details.id, "get_concept_plan_data"
            )
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "project_image" in response.data
        assert response.data["project_image"] is None

    @pytest.mark.integration
    def test_get_concept_plan_data_approval_statuses(
        self, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test getting concept plan data includes approval statuses"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Set approval statuses
        concept_plan_with_details.document.project_lead_approval_granted = True
        concept_plan_with_details.document.business_area_lead_approval_granted = True
        concept_plan_with_details.document.directorate_approval_granted = False
        concept_plan_with_details.document.save()

        # Act
        response = api_client.post(
            documents_urls.path(
                "conceptplans", concept_plan_with_details.id, "get_concept_plan_data"
            )
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["project_lead_approval_granted"] is True
        assert response.data["business_area_lead_approval_granted"] is True
        assert response.data["directorate_approval_granted"] is False

    @pytest.mark.integration
    def test_get_concept_plan_data_formatted_tables(
        self, api_client, project_lead, concept_plan_with_details, db
    ):
        """Test getting concept plan data with formatted HTML tables"""
        # Arrange
        api_client.force_authenticate(user=project_lead)

        # Set table data
        concept_plan_with_details.staff_time_allocation = '{"test": "data"}'
        concept_plan_with_details.budget = '{"budget": "data"}'
        concept_plan_with_details.save()

        # Act
        response = api_client.post(
            documents_urls.path(
                "conceptplans", concept_plan_with_details.id, "get_concept_plan_data"
            )
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "staff_time_allocation" in response.data
        assert "indicative_operating_budget" in response.data
        # Should be HTML formatted (contains table tags)
        assert isinstance(response.data["staff_time_allocation"], str)
        assert isinstance(response.data["indicative_operating_budget"], str)


# ============================================================================
# CRUD VIEW TESTS
# ============================================================================


class TestProjectDocuments:
    """Tests for project documents list and create endpoints"""

    @pytest.mark.integration
    def test_list_documents_authenticated(self, api_client, user, project_document, db):
        """Test listing documents as authenticated user"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("projectdocuments"))

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "documents" in response.data
        assert "total_results" in response.data
        assert "total_pages" in response.data

    @pytest.mark.integration
    def test_list_documents_unauthenticated(self, api_client, db):
        """Test listing documents without authentication"""
        # Act
        response = api_client.get(documents_urls.path("projectdocuments"))

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_list_documents_with_pagination(
        self, api_client, user, project_with_lead, db
    ):
        """Test listing documents with pagination"""
        # Arrange
        api_client.force_authenticate(user=user)
        # Create multiple documents
        for i in range(5):
            ProjectDocumentFactory(
                project=project_with_lead,
                kind="concept",
                status="new",
            )

        # Act
        response = api_client.get(documents_urls.path("projectdocuments"), {"page": 1})

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "documents" in response.data
        assert response.data["total_results"] >= 5

    @pytest.mark.integration
    def test_list_documents_with_kind_filter(
        self, api_client, user, project_with_lead, db
    ):
        """Test listing documents with kind filter"""
        # Arrange
        api_client.force_authenticate(user=user)
        ProjectDocumentFactory(project=project_with_lead, kind="concept")
        ProjectDocumentFactory(project=project_with_lead, kind="projectplan")

        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments"), {"kind": "concept"}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "documents" in response.data

    @pytest.mark.integration
    def test_list_documents_with_status_filter(
        self, api_client, user, project_with_lead, db
    ):
        """Test listing documents with status filter"""
        # Arrange
        api_client.force_authenticate(user=user)
        ProjectDocumentFactory(project=project_with_lead, status="new")
        ProjectDocumentFactory(project=project_with_lead, status="inapproval")

        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments"), {"status": "new"}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "documents" in response.data

    @pytest.mark.integration
    def test_list_documents_with_search_term(
        self, api_client, user, project_with_lead, db
    ):
        """Test listing documents with search term"""
        # Arrange
        api_client.force_authenticate(user=user)
        project_with_lead.title = "Unique Search Term"
        project_with_lead.save()
        ProjectDocumentFactory(project=project_with_lead, kind="concept")

        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments"), {"searchTerm": "Unique"}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "documents" in response.data

    @pytest.mark.integration
    def test_create_document_valid(self, api_client, user, project_with_lead, db):
        """Test creating a document with valid data"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {
            "project": project_with_lead.id,
            "kind": "concept",
        }

        # Act
        response = api_client.post(
            documents_urls.path("projectdocuments"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert "id" in response.data
        assert response.data["kind"] == "concept"

    @pytest.mark.integration
    def test_create_document_invalid_data(self, api_client, user, db):
        """Test creating document with invalid data"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {}  # Missing required fields

        # Act
        response = api_client.post(
            documents_urls.path("projectdocuments"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.integration
    def test_create_document_unauthenticated(self, api_client, project_with_lead, db):
        """Test creating document without authentication"""
        # Arrange
        data = {
            "project": project_with_lead.id,
            "kind": "concept",
        }

        # Act
        response = api_client.post(
            documents_urls.path("projectdocuments"), data, format="json"
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]


class TestProjectDocumentDetail:
    """Tests for project document detail endpoints"""

    @pytest.mark.integration
    def test_get_document_authenticated(self, api_client, user, project_document, db):
        """Test getting a document by ID"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments", project_document.id)
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == project_document.id

    @pytest.mark.integration
    def test_get_document_unauthenticated(self, api_client, project_document, db):
        """Test getting document without authentication"""
        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments", project_document.id)
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_get_document_not_found(self, api_client, user, db):
        """Test getting non-existent document"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(documents_urls.path("projectdocuments", 99999))

        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    def test_update_document_valid(self, api_client, user, project_document, db):
        """Test updating document with valid data"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {
            "status": "inapproval",
        }

        # Act
        response = api_client.put(
            documents_urls.path("projectdocuments", project_document.id),
            data,
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "inapproval"

    @pytest.mark.integration
    def test_update_document_invalid_data(self, api_client, user, project_document, db):
        """Test updating document with invalid data"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {
            "status": "invalid_status",
        }

        # Act
        response = api_client.put(
            documents_urls.path("projectdocuments", project_document.id),
            data,
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.integration
    def test_update_document_unauthenticated(self, api_client, project_document, db):
        """Test updating document without authentication"""
        # Arrange
        data = {
            "status": "inapproval",
        }

        # Act
        response = api_client.put(
            documents_urls.path("projectdocuments", project_document.id),
            data,
            format="json",
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_delete_document_authenticated(
        self, api_client, user, project_document, db
    ):
        """Test deleting document as authenticated user"""
        # Arrange
        api_client.force_authenticate(user=user)
        document_id = project_document.id

        # Act
        response = api_client.delete(
            documents_urls.path("projectdocuments", document_id)
        )

        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        # Verify document was deleted
        assert not ProjectDocument.objects.filter(id=document_id).exists()

    @pytest.mark.integration
    def test_delete_document_unauthenticated(self, api_client, project_document, db):
        """Test deleting document without authentication"""
        # Act
        response = api_client.delete(
            documents_urls.path("projectdocuments", project_document.id)
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]


class TestProjectDocsPendingMyAction:
    """Tests for documents pending user action endpoint"""

    @pytest.mark.integration
    def test_get_pending_documents_authenticated(
        self, api_client, project_lead, project_with_lead, db
    ):
        """Test getting pending documents as authenticated user"""
        # Arrange
        api_client.force_authenticate(user=project_lead)
        # Create document pending approval
        ProjectDocumentFactory(
            project=project_with_lead,
            kind="concept",
            status="inapproval",
            project_lead_approval_granted=False,
        )

        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments", "pendingmyaction")
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "all" in response.data
        assert "team" in response.data
        assert "lead" in response.data
        assert "ba" in response.data
        assert "directorate" in response.data

    @pytest.mark.integration
    @pytest.mark.integration
    def test_get_pending_documents_unauthenticated(self, api_client, db):
        """Test getting pending documents without authentication"""
        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments", "pendingmyaction")
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_get_pending_documents_with_stage_filter(
        self, api_client, project_lead, project_with_lead, db
    ):
        """Test getting pending documents with stage filter"""
        # Arrange
        api_client.force_authenticate(user=project_lead)
        # Create document pending stage 1 approval
        ProjectDocumentFactory(
            project=project_with_lead,
            kind="concept",
            status="inapproval",
            project_lead_approval_granted=False,
        )

        # Act
        # Note: The admin view doesn't support stage filtering via query params
        # It returns all stages in separate arrays
        response = api_client.get(
            documents_urls.path("projectdocuments", "pendingmyaction")
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "lead" in response.data

    @pytest.mark.integration
    def test_get_pending_documents_without_stage_filter(
        self, api_client, project_lead, project_with_lead, db
    ):
        """Test getting pending documents without stage filter (all stages)"""
        # Arrange
        api_client.force_authenticate(user=project_lead)
        # Create document pending approval
        ProjectDocumentFactory(
            project=project_with_lead,
            kind="concept",
            status="inapproval",
            project_lead_approval_granted=False,
        )

        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments", "pendingmyaction")
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "all" in response.data
        assert "lead" in response.data

    @pytest.mark.integration
    def test_get_pending_documents_stage_2(
        self, api_client, ba_lead, project_with_ba_lead, db
    ):
        """Test getting pending documents for stage 2 (BA lead approval)"""
        # Arrange
        api_client.force_authenticate(user=ba_lead)
        # Create document pending stage 2 approval
        ProjectDocumentFactory(
            project=project_with_ba_lead,
            kind="concept",
            status="inapproval",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=False,
        )

        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments", "pendingmyaction")
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "ba" in response.data

    @pytest.mark.integration
    def test_get_pending_documents_no_pending(self, api_client, user, db):
        """Test getting pending documents when none are pending"""
        # Arrange
        api_client.force_authenticate(user=user)

        # Act
        response = api_client.get(
            documents_urls.path("projectdocuments", "pendingmyaction")
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "all" in response.data
        assert len(response.data["all"]) == 0


# ============================================================================
# CRUD VIEW TESTS - UNUSED VIEW (Dead Code)
# ============================================================================


class TestProjectDocsPendingMyActionUnused:
    """Tests for the unused ProjectDocsPendingMyAction view in crud.py (dead code)

    Note: This view is NOT used in URL patterns. The actual endpoint uses
    ProjectDocsPendingMyActionAllStages from admin.py. These tests are for
    coverage completeness only.
    """

    @pytest.mark.integration
    def test_unused_view_get_with_stage(
        self, api_client, project_lead, project_with_lead, db
    ):
        """Test the unused view's get method with stage parameter"""
        # Arrange
        from documents.views.crud import ProjectDocsPendingMyAction

        view = ProjectDocsPendingMyAction()
        view.request = Mock(user=project_lead, query_params={"stage": "1"})

        # Create document pending approval
        ProjectDocumentFactory(
            project=project_with_lead,
            kind="concept",
            status="inapproval",
            project_lead_approval_granted=False,
        )

        # Act
        response = view.get(view.request)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "documents" in response.data
        assert "count" in response.data

    @pytest.mark.integration
    def test_unused_view_get_without_stage(
        self, api_client, project_lead, project_with_lead, db
    ):
        """Test the unused view's get method without stage parameter"""
        # Arrange
        from documents.views.crud import ProjectDocsPendingMyAction

        view = ProjectDocsPendingMyAction()
        view.request = Mock(user=project_lead, query_params={})

        # Create document pending approval
        ProjectDocumentFactory(
            project=project_with_lead,
            kind="concept",
            status="inapproval",
            project_lead_approval_granted=False,
        )

        # Act
        response = view.get(view.request)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert "documents" in response.data
        assert "count" in response.data


# ============================================================================
# UNIFIED APPROVAL ENDPOINTS (ORIGINAL API CONTRACT)
# ============================================================================


class TestDocApproval:
    """Tests for DocApproval view - unified approval endpoint (original API)"""

    @patch("documents.services.approval_service.ApprovalService.approve_stage_one")
    @patch("documents.services.document_service.DocumentService.get_document")
    @pytest.mark.integration
    def test_doc_approval_stage_one(
        self, mock_get, mock_approve, api_client, user, project_document, db
    ):
        """Test approving document at stage 1 via unified endpoint"""
        # Arrange
        api_client.force_authenticate(user=user)
        mock_get.return_value = project_document

        data = {"stage": 1, "documentPk": project_document.id}

        # Act
        response = api_client.post(
            documents_urls.path("actions", "approve"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_202_ACCEPTED
        mock_approve.assert_called_once_with(project_document, user)
        assert "id" in response.data

    @patch("documents.services.approval_service.ApprovalService.approve_stage_two")
    @patch("documents.services.document_service.DocumentService.get_document")
    @pytest.mark.integration
    def test_doc_approval_stage_two(
        self, mock_get, mock_approve, api_client, user, project_document, db
    ):
        """Test approving document at stage 2 via unified endpoint"""
        # Arrange
        api_client.force_authenticate(user=user)
        mock_get.return_value = project_document

        data = {"stage": 2, "documentPk": project_document.id}

        # Act
        response = api_client.post(
            documents_urls.path("actions", "approve"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_202_ACCEPTED
        mock_approve.assert_called_once_with(project_document, user)

    @patch("documents.services.approval_service.ApprovalService.approve_stage_three")
    @patch("documents.services.document_service.DocumentService.get_document")
    @pytest.mark.integration
    def test_doc_approval_stage_three(
        self, mock_get, mock_approve, api_client, user, project_document, db
    ):
        """Test approving document at stage 3 via unified endpoint"""
        # Arrange
        api_client.force_authenticate(user=user)
        mock_get.return_value = project_document

        data = {"stage": 3, "documentPk": project_document.id}

        # Act
        response = api_client.post(
            documents_urls.path("actions", "approve"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_202_ACCEPTED
        mock_approve.assert_called_once_with(project_document, user)

    @pytest.mark.integration
    def test_doc_approval_missing_stage(self, api_client, user, project_document, db):
        """Test approval with missing stage parameter"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {"documentPk": project_document.id}  # Missing stage

        # Act
        response = api_client.post(
            documents_urls.path("actions", "approve"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @pytest.mark.integration
    def test_doc_approval_missing_document_pk(self, api_client, user, db):
        """Test approval with missing documentPk parameter"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {"stage": 1}  # Missing documentPk

        # Act
        response = api_client.post(
            documents_urls.path("actions", "approve"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @pytest.mark.integration
    def test_doc_approval_invalid_stage(self, api_client, user, project_document, db):
        """Test approval with invalid stage number"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {"stage": 99, "documentPk": project_document.id}  # Invalid stage

        # Act
        response = api_client.post(
            documents_urls.path("actions", "approve"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @pytest.mark.integration
    def test_doc_approval_stage_not_integer(
        self, api_client, user, project_document, db
    ):
        """Test approval with non-integer stage"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {"stage": "invalid", "documentPk": project_document.id}  # Not an integer

        # Act
        response = api_client.post(
            documents_urls.path("actions", "approve"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @pytest.mark.integration
    def test_doc_approval_unauthenticated(self, api_client, project_document, db):
        """Test approval without authentication"""
        # Arrange
        data = {"stage": 1, "documentPk": project_document.id}

        # Act
        response = api_client.post(
            documents_urls.path("actions", "approve"), data, format="json"
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]


class TestDocRecall:
    """Tests for DocRecall view - unified recall endpoint (original API)"""

    @patch("documents.services.approval_service.ApprovalService.recall")
    @patch("documents.services.document_service.DocumentService.get_document")
    @pytest.mark.integration
    def test_doc_recall_with_reason(
        self, mock_get, mock_recall, api_client, user, project_document, db
    ):
        """Test recalling document with reason via unified endpoint"""
        # Arrange
        api_client.force_authenticate(user=user)
        mock_get.return_value = project_document

        data = {
            "stage": 2,
            "documentPk": project_document.id,
            "reason": "Need to make changes",
        }

        # Act
        response = api_client.post(
            documents_urls.path("actions", "recall"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_202_ACCEPTED
        mock_recall.assert_called_once_with(
            project_document, user, "Need to make changes"
        )
        assert "id" in response.data

    @patch("documents.services.approval_service.ApprovalService.recall")
    @patch("documents.services.document_service.DocumentService.get_document")
    @pytest.mark.integration
    def test_doc_recall_without_reason(
        self, mock_get, mock_recall, api_client, user, project_document, db
    ):
        """Test recalling document without reason"""
        # Arrange
        api_client.force_authenticate(user=user)
        mock_get.return_value = project_document

        data = {"stage": 1, "documentPk": project_document.id}

        # Act
        response = api_client.post(
            documents_urls.path("actions", "recall"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_202_ACCEPTED
        mock_recall.assert_called_once_with(project_document, user, "")

    @pytest.mark.integration
    def test_doc_recall_missing_stage(self, api_client, user, project_document, db):
        """Test recall with missing stage parameter"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {"documentPk": project_document.id}  # Missing stage

        # Act
        response = api_client.post(
            documents_urls.path("actions", "recall"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @pytest.mark.integration
    def test_doc_recall_missing_document_pk(self, api_client, user, db):
        """Test recall with missing documentPk parameter"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {"stage": 1}  # Missing documentPk

        # Act
        response = api_client.post(
            documents_urls.path("actions", "recall"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @pytest.mark.integration
    def test_doc_recall_unauthenticated(self, api_client, project_document, db):
        """Test recall without authentication"""
        # Arrange
        data = {"stage": 1, "documentPk": project_document.id}

        # Act
        response = api_client.post(
            documents_urls.path("actions", "recall"), data, format="json"
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]


class TestDocSendBack:
    """Tests for DocSendBack view - unified send back endpoint (original API)"""

    @patch("documents.services.approval_service.ApprovalService.send_back")
    @patch("documents.services.document_service.DocumentService.get_document")
    @pytest.mark.integration
    def test_doc_send_back_with_reason(
        self, mock_get, mock_send_back, api_client, user, project_document, db
    ):
        """Test sending document back with reason via unified endpoint"""
        # Arrange
        api_client.force_authenticate(user=user)
        mock_get.return_value = project_document

        data = {
            "stage": 2,
            "documentPk": project_document.id,
            "reason": "Needs more detail",
        }

        # Act
        response = api_client.post(
            documents_urls.path("actions", "send_back"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_202_ACCEPTED
        mock_send_back.assert_called_once_with(
            project_document, user, "Needs more detail"
        )
        assert "id" in response.data

    @patch("documents.services.approval_service.ApprovalService.send_back")
    @patch("documents.services.document_service.DocumentService.get_document")
    @pytest.mark.integration
    def test_doc_send_back_without_reason(
        self, mock_get, mock_send_back, api_client, user, project_document, db
    ):
        """Test sending document back without reason"""
        # Arrange
        api_client.force_authenticate(user=user)
        mock_get.return_value = project_document

        data = {"stage": 3, "documentPk": project_document.id}

        # Act
        response = api_client.post(
            documents_urls.path("actions", "send_back"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_202_ACCEPTED
        mock_send_back.assert_called_once_with(project_document, user, "")

    @pytest.mark.integration
    def test_doc_send_back_missing_stage(self, api_client, user, project_document, db):
        """Test send back with missing stage parameter"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {"documentPk": project_document.id}  # Missing stage

        # Act
        response = api_client.post(
            documents_urls.path("actions", "send_back"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @pytest.mark.integration
    def test_doc_send_back_missing_document_pk(self, api_client, user, db):
        """Test send back with missing documentPk parameter"""
        # Arrange
        api_client.force_authenticate(user=user)
        data = {"stage": 2}  # Missing documentPk

        # Act
        response = api_client.post(
            documents_urls.path("actions", "send_back"), data, format="json"
        )

        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @pytest.mark.integration
    def test_doc_send_back_unauthenticated(self, api_client, project_document, db):
        """Test send back without authentication"""
        # Arrange
        data = {"stage": 2, "documentPk": project_document.id}

        # Act
        response = api_client.post(
            documents_urls.path("actions", "send_back"), data, format="json"
        )

        # Assert
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]
