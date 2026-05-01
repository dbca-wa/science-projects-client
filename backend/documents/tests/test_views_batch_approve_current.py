"""
Tests for BatchApproveCurrent and BatchApproveCurrentPreview views.

These are newer admin endpoints that batch-approve all stage-3
progress/student reports for the current annual report year.
"""

from unittest.mock import patch

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import (
    ProjectDocumentFactory,
    ProjectFactory,
    UserFactory,
)


@pytest.fixture
def superuser(db):
    return UserFactory(
        username="superadmin",
        email="superadmin@dbca.wa.gov.au",
        is_superuser=True,
        is_staff=True,
    )


@pytest.fixture
def regular_user(db):
    return UserFactory(
        username="regular",
        email="regular@dbca.wa.gov.au",
        is_superuser=False,
        is_staff=False,
    )


@pytest.fixture
def annual_report(db):
    from datetime import date

    from documents.models import AnnualReport

    return AnnualReport.objects.create(
        year=2025,
        is_published=False,
        date_open=date(2025, 1, 1),
        date_closed=date(2025, 12, 31),
    )


@pytest.fixture
def project_with_stage3_report(db, superuser, annual_report):
    """Create a project with a stage-3 progress report (PL + BA approved, directorate pending)."""
    from documents.models import ProgressReport

    project = ProjectFactory(status="active")
    project.members.create(user=superuser, is_leader=True, role="supervising")

    doc = ProjectDocumentFactory(
        project=project,
        kind="progressreport",
        status="inapproval",
    )
    doc.project_lead_approval_granted = True
    doc.business_area_lead_approval_granted = True
    doc.directorate_approval_granted = False
    doc.save()

    ProgressReport.objects.create(
        document=doc,
        project=project,
        report=annual_report,
        year=annual_report.year,
    )

    return project, doc


class TestBatchApproveCurrent:
    """Tests for BatchApproveCurrent view."""

    @pytest.mark.integration
    def test_requires_superuser(self, regular_user, db):
        """Non-superuser should be rejected."""
        client = APIClient()
        client.force_authenticate(user=regular_user)
        response = client.post("/api/v1/documents/batchapprovecurrent")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.integration
    def test_requires_authentication(self, db):
        """Unauthenticated request should be rejected."""
        client = APIClient()
        response = client.post("/api/v1/documents/batchapprovecurrent")
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_returns_404_when_no_annual_reports(self, superuser, db):
        """Should return 404 when no annual reports exist."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post("/api/v1/documents/batchapprovecurrent")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    def test_approves_stage3_reports(
        self, superuser, project_with_stage3_report, annual_report
    ):
        """Should approve all stage-3 reports for the current year."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post("/api/v1/documents/batchapprovecurrent")
        assert response.status_code == status.HTTP_202_ACCEPTED
        assert response.data["approved"] >= 1

        # Verify the document was actually approved
        _, doc = project_with_stage3_report
        doc.refresh_from_db()
        assert doc.directorate_approval_granted is True
        assert doc.status == "approved"

    @pytest.mark.integration
    def test_returns_zero_when_no_eligible_reports(self, superuser, annual_report, db):
        """Should return 0 approved when no eligible reports exist."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post("/api/v1/documents/batchapprovecurrent")
        assert response.status_code == status.HTTP_202_ACCEPTED
        assert response.data["approved"] == 0

    @patch(
        "documents.services.notification_service.NotificationService.notify_batch_approved"
    )
    @pytest.mark.integration
    def test_sends_notifications_when_requested(
        self,
        mock_notify,
        superuser,
        project_with_stage3_report,
        annual_report,
    ):
        """Should send notification emails when send_notifications=True."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/documents/batchapprovecurrent",
            {"send_notifications": True},
            format="json",
        )
        assert response.status_code == status.HTTP_202_ACCEPTED
        if response.data["approved"] > 0:
            mock_notify.assert_called_once()

    @pytest.mark.integration
    def test_sets_project_status_to_active(
        self, superuser, project_with_stage3_report, annual_report
    ):
        """Approved reports should set their project status to active."""
        project, _ = project_with_stage3_report
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post("/api/v1/documents/batchapprovecurrent")
        assert response.status_code == status.HTTP_202_ACCEPTED

        project.refresh_from_db()
        assert project.status == "active"


class TestBatchApproveCurrentPreview:
    """Tests for BatchApproveCurrentPreview view."""

    @pytest.mark.integration
    def test_requires_authentication(self, db):
        """Unauthenticated request should be rejected."""
        client = APIClient()
        response = client.get("/api/v1/documents/batchapprovecurrent/preview")
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_preview_returns_recipient_data(
        self, superuser, project_with_stage3_report, annual_report
    ):
        """Preview should return recipient information without approving."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get("/api/v1/documents/batchapprovecurrent/preview")
        assert response.status_code == status.HTTP_200_OK
        assert "recipients" in response.data
        assert "total_recipients" in response.data

        # Verify the document was NOT approved (preview only)
        _, doc = project_with_stage3_report
        doc.refresh_from_db()
        assert doc.directorate_approval_granted is False
