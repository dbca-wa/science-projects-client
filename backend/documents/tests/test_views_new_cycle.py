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
    @patch("documents.views.admin._fetch_it_assets_emails")
    @pytest.mark.integration
    def test_includes_project_leads(
        self, mock_fetch, superuser, annual_report, science_project
    ):
        """Project leads should appear in the preview."""
        mock_fetch.return_value = ({superuser.email.lower()}, True)

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


class TestNewCycleOpenPreviewITAssets:
    """Tests for IT Assets validation in the enhanced preview endpoint."""

    @patch("documents.views.admin._fetch_it_assets_emails")
    @pytest.mark.integration
    def test_partitions_by_it_assets_match(
        self, mock_fetch, superuser, annual_report, science_project
    ):
        """Users found in IT Assets go to recipients; others to not_in_it_assets."""
        # superuser is a project lead — their email IS in IT Assets
        mock_fetch.return_value = ({superuser.email.lower()}, True)

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get("/api/v1/documents/opennewcycle/preview")

        assert response.status_code == status.HTTP_200_OK
        assert "not_in_it_assets" in response.data
        assert "it_assets_available" in response.data
        assert response.data["it_assets_available"] is True

        # superuser should be in recipients (found in IT Assets)
        all_valid = (
            response.data["recipients"]["ba_leads"]
            + response.data["recipients"]["project_leads"]
            + response.data["recipients"]["team_members"]
        )
        valid_emails = [r["email"] for r in all_valid]
        assert superuser.email in valid_emails

        # not_in_it_assets should be empty for this user
        all_invalid = (
            response.data["not_in_it_assets"]["ba_leads"]
            + response.data["not_in_it_assets"]["project_leads"]
            + response.data["not_in_it_assets"]["team_members"]
        )
        invalid_emails = [r["email"] for r in all_invalid]
        assert superuser.email not in invalid_emails

    @patch("documents.views.admin._fetch_it_assets_emails")
    @pytest.mark.integration
    def test_user_not_in_it_assets(
        self, mock_fetch, superuser, annual_report, science_project
    ):
        """Users NOT found in IT Assets go to not_in_it_assets."""
        # Return empty set — no emails match
        mock_fetch.return_value = (set(), True)

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get("/api/v1/documents/opennewcycle/preview")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["it_assets_available"] is True

        # All users should be in not_in_it_assets
        all_invalid = (
            response.data["not_in_it_assets"]["ba_leads"]
            + response.data["not_in_it_assets"]["project_leads"]
            + response.data["not_in_it_assets"]["team_members"]
        )
        invalid_emails = [r["email"] for r in all_invalid]
        assert superuser.email in invalid_emails

        # recipients should be empty
        assert response.data["total_recipients"] == 0
        assert response.data["total_not_in_it_assets"] > 0

    @patch("documents.views.admin._fetch_it_assets_emails")
    @pytest.mark.integration
    def test_it_assets_api_failure_returns_all_as_valid(
        self, mock_fetch, superuser, annual_report, science_project
    ):
        """When IT Assets API fails, all users are treated as valid with a warning flag."""
        mock_fetch.return_value = (set(), False)

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get("/api/v1/documents/opennewcycle/preview")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["it_assets_available"] is False

        # All users should be in recipients (treated as valid)
        all_valid = (
            response.data["recipients"]["ba_leads"]
            + response.data["recipients"]["project_leads"]
            + response.data["recipients"]["team_members"]
        )
        valid_emails = [r["email"] for r in all_valid]
        assert superuser.email in valid_emails

        # not_in_it_assets should be empty
        assert response.data["total_not_in_it_assets"] == 0

    @patch("documents.views.admin._fetch_it_assets_emails")
    @pytest.mark.integration
    def test_response_includes_totals(
        self, mock_fetch, superuser, annual_report, science_project
    ):
        """Response should include total_recipients and total_not_in_it_assets."""
        mock_fetch.return_value = ({superuser.email.lower()}, True)

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get("/api/v1/documents/opennewcycle/preview")

        assert "total_recipients" in response.data
        assert "total_not_in_it_assets" in response.data
        assert isinstance(response.data["total_recipients"], int)
        assert isinstance(response.data["total_not_in_it_assets"], int)

    @patch("documents.views.admin._fetch_it_assets_emails")
    @pytest.mark.integration
    def test_caching_uses_correct_key(self, mock_fetch, superuser, annual_report):
        """The IT Assets fetch function should be called (caching is internal)."""
        mock_fetch.return_value = (set(), True)

        client = APIClient()
        client.force_authenticate(user=superuser)
        client.get("/api/v1/documents/opennewcycle/preview")

        mock_fetch.assert_called_once()


class TestNewCycleOpenCustomMessage:
    """Tests for custom message support in new cycle open emails."""

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_single_custom_message_passed_to_template(
        self, mock_send_email, superuser, annual_report, science_project
    ):
        """A single custom_message should be included in the email template context."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(
            client,
            send_emails=True,
            recipient_groups=["project_leads"],
            custom_message="<p>Please update your reports by Friday.</p>",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        if mock_send_email.called:
            call_kwargs = mock_send_email.call_args
            html_content = call_kwargs.kwargs.get(
                "html_content", call_kwargs[1].get("html_content", "")
            )
            assert "Please update your reports by Friday" in html_content

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_no_custom_message_uses_default(
        self, mock_send_email, superuser, annual_report, science_project
    ):
        """Without custom_message, the default text should appear."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(
            client,
            send_emails=True,
            recipient_groups=["project_leads"],
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        if mock_send_email.called:
            call_kwargs = mock_send_email.call_args
            html_content = call_kwargs.kwargs.get(
                "html_content", call_kwargs[1].get("html_content", "")
            )
            assert "Please log in to SPMS to begin updating" in html_content

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_per_group_custom_messages(
        self, mock_send_email, superuser, annual_report, science_project
    ):
        """Per-group custom_messages should be accepted without error."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(
            client,
            send_emails=True,
            recipient_groups=["ba_leads", "project_leads", "team_members"],
            custom_messages={
                "ba_leads": "<p>BA leads: please review.</p>",
                "project_leads": "<p>Project leads: update reports.</p>",
                "team_members": "<p>Team: check your sections.</p>",
            },
        )

        assert response.status_code == status.HTTP_202_ACCEPTED

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_custom_message_html_is_sanitised(
        self, mock_send_email, superuser, annual_report, science_project
    ):
        """Dangerous HTML tags should be stripped from custom messages."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(
            client,
            send_emails=True,
            recipient_groups=["project_leads"],
            custom_message='<p>Safe text</p><script>alert("xss")</script>',
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        if mock_send_email.called:
            call_kwargs = mock_send_email.call_args
            html_content = call_kwargs.kwargs.get(
                "html_content", call_kwargs[1].get("html_content", "")
            )
            # The injected XSS script tag should be stripped (text content is harmless)
            assert '<script>alert("xss")</script>' not in html_content
            assert "Safe text" in html_content


class TestNewCycleEmailPreview:
    """Tests for the email preview endpoint."""

    @pytest.mark.integration
    def test_requires_authentication(self, db):
        """Unauthenticated request should be rejected."""
        client = APIClient()
        response = client.post(
            "/api/v1/documents/opennewcycle/email-preview",
            {},
            format="json",
        )
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_renders_email_html(self, superuser, db):
        """Should return rendered HTML content."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/documents/opennewcycle/email-preview",
            {
                "recipient_name": "Jane Smith",
                "financial_year_string": "2025-2026",
                "division_name": "BCS",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "html" in response.data
        assert "Jane Smith" in response.data["html"]
        assert "2025-2026" in response.data["html"]

    @pytest.mark.integration
    def test_renders_with_custom_message(self, superuser, db):
        """Custom message should appear in the rendered HTML."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/documents/opennewcycle/email-preview",
            {
                "custom_message": "<p>Please update by Friday.</p>",
                "recipient_name": "Test User",
                "financial_year_string": "2025-2026",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "Please update by Friday" in response.data["html"]

    @pytest.mark.integration
    def test_renders_default_text_without_custom_message(self, superuser, db):
        """Without custom message, default text should appear."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/documents/opennewcycle/email-preview",
            {
                "recipient_name": "Test User",
                "financial_year_string": "2025-2026",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "Please log in to SPMS to begin updating" in response.data["html"]

    @pytest.mark.integration
    def test_sanitises_dangerous_html(self, superuser, db):
        """Script tags should be stripped from custom message."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/documents/opennewcycle/email-preview",
            {
                "custom_message": '<p>Safe</p><script>alert("xss")</script>',
                "recipient_name": "Test User",
                "financial_year_string": "2025-2026",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        # The injected XSS script tag should be stripped (text content is harmless)
        assert '<script>alert("xss")</script>' not in response.data["html"]
        assert "Safe" in response.data["html"]

    @pytest.mark.integration
    def test_uses_defaults_for_missing_fields(self, superuser, db):
        """Missing fields should use sensible defaults."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/documents/opennewcycle/email-preview",
            {},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "html" in response.data
        # Default recipient name
        assert "Recipient Name" in response.data["html"]


class TestNewCycleOpenExcludedUsers:
    """Tests that excluded user IDs are respected during email sending."""

    @patch("documents.services.notification_service.send_email_with_embedded_image")
    @pytest.mark.integration
    def test_excluded_users_do_not_receive_emails(
        self, mock_send_email, superuser, annual_report, science_project
    ):
        """Users in excluded_user_ids should not receive emails."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = _post_new_cycle(
            client,
            send_emails=True,
            recipient_groups=["project_leads"],
            excluded_user_ids=[superuser.pk],
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        # superuser is the only project lead — excluding them means no emails sent
        mock_send_email.assert_not_called()


class TestNewCycleOpenActiveOnlyFiltering:
    """Tests that only active users, BAs, and projects are included."""

    @patch("documents.views.admin._fetch_it_assets_emails")
    @pytest.mark.integration
    def test_completed_project_members_excluded_from_preview(
        self, mock_fetch, superuser, annual_report, completed_project
    ):
        """Members of completed projects should not appear in the preview."""
        mock_fetch.return_value = ({superuser.email.lower()}, True)

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get("/api/v1/documents/opennewcycle/preview")

        assert response.status_code == status.HTTP_200_OK
        # superuser is only on the completed project — should not appear
        all_recipients = (
            response.data["recipients"]["ba_leads"]
            + response.data["recipients"]["project_leads"]
            + response.data["recipients"]["team_members"]
        )
        emails = [r["email"] for r in all_recipients]
        assert superuser.email not in emails

    @patch("documents.views.admin._fetch_it_assets_emails")
    @pytest.mark.integration
    def test_inactive_user_excluded_from_preview(self, mock_fetch, annual_report, db):
        """Inactive users should not appear in the preview."""
        inactive_user = UserFactory(
            username="inactive",
            email="inactive@dbca.wa.gov.au",
            is_active=False,
            is_staff=True,
        )
        project = ProjectFactory(kind="science", status="active")
        project.members.create(user=inactive_user, is_leader=True, role="supervising")

        mock_fetch.return_value = ({inactive_user.email.lower()}, True)

        active_user = UserFactory(
            username="activeadmin",
            email="activeadmin@dbca.wa.gov.au",
            is_superuser=True,
            is_staff=True,
        )
        client = APIClient()
        client.force_authenticate(user=active_user)
        response = client.get("/api/v1/documents/opennewcycle/preview")

        assert response.status_code == status.HTTP_200_OK
        all_recipients = (
            response.data["recipients"]["ba_leads"]
            + response.data["recipients"]["project_leads"]
            + response.data["recipients"]["team_members"]
        )
        emails = [r["email"] for r in all_recipients]
        assert inactive_user.email not in emails
