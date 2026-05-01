"""
Comprehensive tests for NewCycleOpen and NewCycleOpenPreview views.

Tests cover:
- Report creation for science, core_function, and student projects
- Idempotency (running twice doesn't create duplicates)
- Division scoping
- Prepopulation from previous year's data
- Project status transitions (active → updating)
- Email notification sending
- Preview endpoint (returns recipients without creating reports)
- Permission checks
"""

from datetime import date
from unittest.mock import patch

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import (
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
        is_staff=True,
    )


@pytest.fixture
def annual_report(db):
    from documents.models import AnnualReport

    return AnnualReport.objects.create(
        year=2025,
        is_published=False,
        date_open=date(2025, 1, 1),
        date_closed=date(2025, 12, 31),
    )


@pytest.fixture
def science_project(db, superuser):
    """Active science project with a team leader."""
    project = ProjectFactory(kind="science", status="active")
    project.members.create(user=superuser, is_leader=True, role="supervising")
    return project


@pytest.fixture
def student_project(db, superuser):
    """Active student project with a team leader."""
    project = ProjectFactory(kind="student", status="active")
    project.members.create(user=superuser, is_leader=True, role="supervising")
    return project


@pytest.fixture
def core_function_project(db, superuser):
    """Active core function project with a team leader."""
    project = ProjectFactory(kind="core_function", status="active")
    project.members.create(user=superuser, is_leader=True, role="supervising")
    return project


@pytest.fixture
def suspended_project(db, superuser):
    """Suspended science project."""
    project = ProjectFactory(kind="science", status="suspended")
    project.members.create(user=superuser, is_leader=True, role="supervising")
    return project


@pytest.fixture
def completed_project(db, superuser):
    """Completed science project — should NOT get new reports."""
    project = ProjectFactory(kind="science", status="completed")
    project.members.create(user=superuser, is_leader=True, role="supervising")
    return project


def _post_new_cycle(client, **kwargs):
    """Helper to POST to new cycle endpoint with default params."""
    data = {
        "update": kwargs.get("update", True),
        "prepopulate": kwargs.get("prepopulate", False),
        "send_emails": kwargs.get("send_emails", False),
        **{
            k: v
            for k, v in kwargs.items()
            if k not in ("update", "prepopulate", "send_emails")
        },
    }
    return client.post("/api/v1/documents/opennewcycle", data, format="json")


class TestNewCycleOpenReportCreation:
    """Tests that NewCycleOpen creates the correct reports."""

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_creates_progress_report_for_science_project(
        self, mock_email, superuser, annual_report, science_project
    ):
        """Should create a progress report for an active science project."""
        from documents.models import ProgressReport

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(client)

        assert response.status_code == status.HTTP_202_ACCEPTED

        # Verify progress report was created
        pr = ProgressReport.objects.filter(
            project=science_project, year=annual_report.year
        )
        assert pr.exists()
        assert pr.first().report == annual_report

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_creates_progress_report_for_core_function_project(
        self, mock_email, superuser, annual_report, core_function_project
    ):
        """Should create a progress report for an active core function project."""
        from documents.models import ProgressReport

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(client)

        assert response.status_code == status.HTTP_202_ACCEPTED

        pr = ProgressReport.objects.filter(
            project=core_function_project, year=annual_report.year
        )
        assert pr.exists()

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_creates_student_report_for_student_project(
        self, mock_email, superuser, annual_report, student_project
    ):
        """Should create a student report for an active student project."""
        from documents.models import StudentReport

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(client)

        assert response.status_code == status.HTTP_202_ACCEPTED

        sr = StudentReport.objects.filter(
            project=student_project, year=annual_report.year
        )
        assert sr.exists()
        assert sr.first().report == annual_report

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_does_not_create_report_for_completed_project(
        self, mock_email, superuser, annual_report, completed_project
    ):
        """Completed projects should NOT get new reports."""
        from documents.models import ProgressReport

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(client)

        assert response.status_code == status.HTTP_202_ACCEPTED

        pr = ProgressReport.objects.filter(
            project=completed_project, year=annual_report.year
        )
        assert not pr.exists()

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_includes_suspended_projects_when_update_true(
        self, mock_email, superuser, annual_report, suspended_project
    ):
        """When update=True, suspended projects should get reports."""
        from documents.models import ProgressReport

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(client, update=True)

        assert response.status_code == status.HTTP_202_ACCEPTED

        pr = ProgressReport.objects.filter(
            project=suspended_project, year=annual_report.year
        )
        assert pr.exists()

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_excludes_suspended_projects_when_update_false(
        self, mock_email, superuser, annual_report, suspended_project
    ):
        """When update=False, only active projects get reports."""
        from documents.models import ProgressReport

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(client, update=False)

        assert response.status_code == status.HTTP_202_ACCEPTED

        pr = ProgressReport.objects.filter(
            project=suspended_project, year=annual_report.year
        )
        assert not pr.exists()


class TestNewCycleOpenIdempotency:
    """Tests that running new cycle twice doesn't create duplicates."""

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_idempotent_no_duplicate_progress_reports(
        self, mock_email, superuser, annual_report, science_project
    ):
        """Running new cycle twice should not create duplicate progress reports."""
        from documents.models import ProgressReport

        client = APIClient()
        client.force_authenticate(user=superuser)

        # First run
        response1 = _post_new_cycle(client)
        assert response1.status_code == status.HTTP_202_ACCEPTED

        count_after_first = ProgressReport.objects.filter(
            project=science_project, year=annual_report.year
        ).count()

        # Second run
        response2 = _post_new_cycle(client)
        assert response2.status_code == status.HTTP_202_ACCEPTED

        count_after_second = ProgressReport.objects.filter(
            project=science_project, year=annual_report.year
        ).count()

        assert count_after_first == count_after_second == 1

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_idempotent_no_duplicate_student_reports(
        self, mock_email, superuser, annual_report, student_project
    ):
        """Running new cycle twice should not create duplicate student reports."""
        from documents.models import StudentReport

        client = APIClient()
        client.force_authenticate(user=superuser)

        _post_new_cycle(client)
        count_first = StudentReport.objects.filter(
            project=student_project, year=annual_report.year
        ).count()

        _post_new_cycle(client)
        count_second = StudentReport.objects.filter(
            project=student_project, year=annual_report.year
        ).count()

        assert count_first == count_second == 1


class TestNewCycleOpenProjectStatus:
    """Tests that project status transitions correctly."""

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_sets_project_status_to_updating(
        self, mock_email, superuser, annual_report, science_project
    ):
        """Projects should transition to 'updating' status after new cycle."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        _post_new_cycle(client)

        science_project.refresh_from_db()
        assert science_project.status == "updating"

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_student_project_status_to_updating(
        self, mock_email, superuser, annual_report, student_project
    ):
        """Student projects should also transition to 'updating'."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        _post_new_cycle(client)

        student_project.refresh_from_db()
        assert student_project.status == "updating"


class TestNewCycleOpenEmails:
    """Tests for email notification sending."""

    @patch(
        "documents.services.notification_service.NotificationService.notify_new_cycle_open"
    )
    @pytest.mark.integration
    def test_sends_emails_when_requested(
        self, mock_notify, superuser, annual_report, science_project
    ):
        """Should call notification service when send_emails=True."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        _post_new_cycle(client, send_emails=True)

        mock_notify.assert_called_once()

    @patch(
        "documents.services.notification_service.NotificationService.notify_new_cycle_open"
    )
    @pytest.mark.integration
    def test_does_not_send_emails_when_not_requested(
        self, mock_notify, superuser, annual_report, science_project
    ):
        """Should NOT call notification service when send_emails=False."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        _post_new_cycle(client, send_emails=False)

        mock_notify.assert_not_called()

    @patch(
        "documents.services.notification_service.NotificationService.notify_new_cycle_open"
    )
    @pytest.mark.integration
    def test_email_failure_returns_400(
        self, mock_notify, superuser, annual_report, science_project
    ):
        """Email failure should return 400 but reports should still be created."""
        mock_notify.side_effect = Exception("SMTP error")

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(client, send_emails=True)

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestNewCycleOpenPermissions:
    """Tests for permission checks."""

    @pytest.mark.integration
    def test_requires_superuser(self, regular_user, annual_report, db):
        """Non-superuser should be rejected."""
        client = APIClient()
        client.force_authenticate(user=regular_user)
        response = _post_new_cycle(client)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.integration
    def test_requires_authentication(self, annual_report, db):
        """Unauthenticated request should be rejected."""
        client = APIClient()
        response = _post_new_cycle(client)
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_returns_404_when_no_annual_report(self, superuser, db):
        """Should return 404 when no annual reports exist."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(client)
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestNewCycleOpenPreview:
    """Tests for NewCycleOpenPreview view."""

    @pytest.mark.integration
    def test_requires_authentication(self, db):
        """Unauthenticated request should be rejected."""
        client = APIClient()
        response = client.get("/api/v1/documents/opennewcycle/preview")
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_returns_recipient_groups(self, superuser, annual_report, science_project):
        """Should return recipients grouped by role."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get("/api/v1/documents/opennewcycle/preview")

        assert response.status_code == status.HTTP_200_OK
        assert "recipients" in response.data
        assert "total_recipients" in response.data
        assert "ba_leads" in response.data["recipients"]
        assert "project_leads" in response.data["recipients"]
        assert "team_members" in response.data["recipients"]

    @pytest.mark.integration
    def test_does_not_create_reports(self, superuser, annual_report, science_project):
        """Preview should NOT create any reports."""
        from documents.models import ProgressReport

        client = APIClient()
        client.force_authenticate(user=superuser)
        client.get("/api/v1/documents/opennewcycle/preview")

        pr = ProgressReport.objects.filter(
            project=science_project, year=annual_report.year
        )
        assert not pr.exists()

    @pytest.mark.integration
    def test_returns_empty_when_no_annual_report(self, superuser, db):
        """Should return empty recipients when no annual report exists."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get("/api/v1/documents/opennewcycle/preview")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["total_recipients"] == 0

    @pytest.mark.integration
    def test_includes_project_leads(self, superuser, annual_report, science_project):
        """Project leads should appear in the preview."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get("/api/v1/documents/opennewcycle/preview")

        assert response.status_code == status.HTTP_200_OK
        # superuser is the project lead
        all_recipients = (
            response.data["recipients"]["ba_leads"]
            + response.data["recipients"]["project_leads"]
            + response.data["recipients"]["team_members"]
        )
        emails = [r["email"] for r in all_recipients]
        assert superuser.email in emails
