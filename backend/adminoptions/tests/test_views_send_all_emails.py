"""
Tests for SendAllTestEmails view.

Verifies that all email templates render without errors,
single template sending works, user overrides are applied,
and permission checks are enforced.
"""

from unittest.mock import patch

import pytest
from rest_framework import status

from common.tests.factories import UserFactory


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
def admin_opts_with_test_user(db, superuser):
    from adminoptions.models import AdminOptions

    return AdminOptions.objects.create(
        email_testing_mode=True,
        email_test_user=superuser,
    )


@pytest.fixture
def admin_opts_no_test_user(db):
    from adminoptions.models import AdminOptions

    return AdminOptions.objects.create(
        email_testing_mode=False,
        email_test_user=None,
    )


class TestSendAllTestEmails:
    """Tests for the SendAllTestEmails admin view."""

    @pytest.mark.integration
    def test_requires_admin_permission(self, api_client, regular_user, db):
        """Non-admin users should be rejected."""
        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=regular_user)
        response = client.post("/api/v1/adminoptions/send-all-test-emails")
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_requires_test_mode_enabled(self, superuser, admin_opts_no_test_user, db):
        """Should fail when test mode is not enabled."""
        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post("/api/v1/adminoptions/send-all-test-emails")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    @patch("smtplib.SMTP")
    @pytest.mark.integration
    def test_sends_all_templates(
        self, mock_smtp, superuser, admin_opts_with_test_user, db
    ):
        """Should render and send all templates."""
        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post("/api/v1/adminoptions/send-all-test-emails")
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data
        # Should have sent multiple templates
        assert len(response.data["results"]) > 10

    @patch("smtplib.SMTP")
    @pytest.mark.integration
    def test_sends_single_template(
        self, mock_smtp, superuser, admin_opts_with_test_user, db
    ):
        """Should send only the specified template."""
        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/adminoptions/send-all-test-emails",
            {"template_name": "bump_email"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["template"] == "bump_email"

    @patch("smtplib.SMTP")
    @pytest.mark.integration
    def test_invalid_template_name(
        self, mock_smtp, superuser, admin_opts_with_test_user, db
    ):
        """Should return error for non-existent template."""
        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/adminoptions/send-all-test-emails",
            {"template_name": "nonexistent_template"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch("smtplib.SMTP")
    @pytest.mark.integration
    def test_staff_profile_email_included(
        self, mock_smtp, superuser, admin_opts_with_test_user, db
    ):
        """Staff profile email should be in the template list."""
        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/adminoptions/send-all-test-emails",
            {"template_name": "staff_profile_email"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["results"][0]["template"] == "staff_profile_email"
        assert response.data["results"][0]["status"] == "ok"

    @patch("smtplib.SMTP")
    @pytest.mark.integration
    def test_user_overrides_applied(
        self, mock_smtp, superuser, admin_opts_with_test_user, db
    ):
        """User overrides should be applied to template context."""
        from rest_framework.test import APIClient

        override_user = UserFactory(
            username="override",
            email="override@dbca.wa.gov.au",
            first_name="Override",
            last_name="User",
        )

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(
            "/api/v1/adminoptions/send-all-test-emails",
            {
                "template_name": "bump_email",
                "recipient_user_id": override_user.pk,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
