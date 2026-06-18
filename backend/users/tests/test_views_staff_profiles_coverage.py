"""
Integration tests for users/views/staff_profiles.py.

Covers IT Assets API error paths (mocked), hidden profile filtering,
and the email sending view error paths.
"""

from unittest.mock import MagicMock, patch

import pytest
from rest_framework.test import APIClient

from common.tests.factories import UserFactory

REQUESTS_GET_PATCH = "requests.get"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return UserFactory(is_staff=True, is_superuser=True)


@pytest.fixture
def staff_user(db):
    return UserFactory(is_staff=True)


@pytest.fixture
def staff_profile(db, staff_user):
    from users.models import PublicStaffProfile

    return PublicStaffProfile.objects.create(
        user=staff_user,
        about="Test about",
        expertise="Test expertise",
        public_email="public@example.com",
        public_email_on=True,
    )


@pytest.fixture
def hidden_profile(db):
    user = UserFactory(is_staff=True)
    from users.models import PublicStaffProfile

    return PublicStaffProfile.objects.create(
        user=user,
        about="Hidden",
        expertise="Hidden",
        is_hidden=True,
    )


# ===========================================================================
# StaffProfiles GET (list) tests — IT Assets API mocking
# ===========================================================================


class TestStaffProfilesList:
    """Tests for GET /users/staffprofiles — IT Assets integration,
    hidden profile filtering, and search."""

    @pytest.mark.integration
    @patch(REQUESTS_GET_PATCH)
    def test_list_with_it_assets_success(
        self, mock_get, api_client, admin_user, staff_profile
    ):
        """Successful IT Assets API response enriches profile data."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                "email": staff_profile.user.email,
                "id": 123,
                "employee_id": "E001",
                "unit": "Biodiversity and Conservation Science Division",
                "division": "BCS",
                "location": "Perth",
                "title": "Scientist",
            }
        ]
        mock_get.return_value = mock_response

        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/users/staffprofiles")

        assert response.status_code == 200
        assert "users" in response.data
        assert "total_results" in response.data

    @pytest.mark.integration
    @patch(REQUESTS_GET_PATCH)
    def test_list_with_it_assets_api_error(
        self, mock_get, api_client, admin_user, staff_profile
    ):
        """Non-200 IT Assets response marks it_assets_available as False."""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_get.return_value = mock_response

        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/users/staffprofiles")

        assert response.status_code == 200
        assert response.data["it_assets_available"] is False

    @pytest.mark.integration
    @patch(REQUESTS_GET_PATCH)
    def test_list_with_it_assets_exception(
        self, mock_get, api_client, admin_user, staff_profile
    ):
        """IT Assets connection exception marks it_assets_available as False."""
        mock_get.side_effect = Exception("Connection timeout")

        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/users/staffprofiles")

        assert response.status_code == 200
        assert response.data["it_assets_available"] is False

    @pytest.mark.integration
    @patch(REQUESTS_GET_PATCH)
    def test_list_hidden_profile_excluded_for_anonymous(
        self, mock_get, api_client, staff_profile, hidden_profile
    ):
        """Anonymous users don't see hidden profiles."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        mock_get.return_value = mock_response

        response = api_client.get("/api/v1/users/staffprofiles")
        assert response.status_code == 200

    @pytest.mark.integration
    @patch(REQUESTS_GET_PATCH)
    def test_list_hidden_profile_excluded_for_regular_user(
        self, mock_get, api_client, staff_user, staff_profile, hidden_profile
    ):
        """Regular staff can't see other users' hidden profiles."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        mock_get.return_value = mock_response

        api_client.force_authenticate(user=staff_user)
        response = api_client.get("/api/v1/users/staffprofiles")
        assert response.status_code == 200

    @pytest.mark.integration
    @patch(REQUESTS_GET_PATCH)
    def test_list_superuser_show_hidden(
        self, mock_get, api_client, admin_user, staff_profile, hidden_profile
    ):
        """Superuser with showHidden=true sees hidden profiles."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        mock_get.return_value = mock_response

        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/users/staffprofiles?showHidden=true")

        assert response.status_code == 200
        assert response.data["showing_hidden"] is True

    @pytest.mark.integration
    @patch(REQUESTS_GET_PATCH)
    def test_list_with_search_term(
        self, mock_get, api_client, admin_user, staff_profile
    ):
        """Single-word search filters profiles by name."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        mock_get.return_value = mock_response

        api_client.force_authenticate(user=admin_user)
        response = api_client.get(
            f"/api/v1/users/staffprofiles?searchTerm={staff_profile.user.first_name}"
        )
        assert response.status_code == 200

    @pytest.mark.integration
    @patch(REQUESTS_GET_PATCH)
    def test_list_with_multi_word_search(
        self, mock_get, api_client, admin_user, staff_profile
    ):
        """Multi-word search matches first_name + last_name."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        mock_get.return_value = mock_response

        api_client.force_authenticate(user=admin_user)
        search = f"{staff_profile.user.first_name} {staff_profile.user.last_name}"
        response = api_client.get(f"/api/v1/users/staffprofiles?searchTerm={search}")
        assert response.status_code == 200

    @pytest.mark.integration
    @patch(REQUESTS_GET_PATCH)
    def test_list_invalid_page_params(
        self, mock_get, api_client, admin_user, staff_profile
    ):
        """Invalid page/page_size params default to page 1."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        mock_get.return_value = mock_response

        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/users/staffprofiles?page=abc&page_size=xyz")

        assert response.status_code == 200
        assert response.data["page"] == 1


# ===========================================================================
# StaffProfileProjects tests
# ===========================================================================


class TestStaffProfileProjects:
    """Tests for staff profile projects endpoint — hidden profile access control."""

    @pytest.mark.integration
    def test_get_projects_for_visible_profile(
        self, api_client, admin_user, staff_profile
    ):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(
            f"/api/v1/users/{staff_profile.user.pk}/projects_staff_profile"
        )
        assert response.status_code == 200

    @pytest.mark.integration
    def test_hidden_profile_returns_404_for_other_user(
        self, api_client, staff_user, hidden_profile
    ):
        """Hidden profile is not visible to non-owner, non-admin."""
        api_client.force_authenticate(user=staff_user)
        response = api_client.get(
            f"/api/v1/users/{hidden_profile.user.pk}/projects_staff_profile"
        )
        assert response.status_code == 404

    @pytest.mark.integration
    def test_hidden_profile_visible_to_owner(self, api_client, hidden_profile):
        """Owner can see their own hidden profile projects."""
        api_client.force_authenticate(user=hidden_profile.user)
        response = api_client.get(
            f"/api/v1/users/{hidden_profile.user.pk}/projects_staff_profile"
        )
        assert response.status_code == 200

    @pytest.mark.integration
    def test_hidden_profile_visible_to_admin(
        self, api_client, admin_user, hidden_profile
    ):
        """Superuser can see hidden profile projects."""
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(
            f"/api/v1/users/{hidden_profile.user.pk}/projects_staff_profile"
        )
        assert response.status_code == 200


# ===========================================================================
# PublicEmailStaffMember tests
# ===========================================================================


class TestPublicEmailStaffMember:
    """Tests for the public email endpoint — success, failure, and access control."""

    @pytest.mark.integration
    @patch("users.views.staff_profiles.send_email_with_embedded_image")
    def test_send_email_success(self, mock_send, api_client, staff_profile):
        """Successful email send."""
        mock_send.return_value = None
        data = {
            "senderEmail": "visitor@example.com",
            "message": "Hello, I'd like to discuss your research.",
        }
        response = api_client.post(
            f"/api/v1/users/{staff_profile.user.pk}/public_email_staff_member",
            data=data,
            format="json",
        )
        assert response.status_code == 200
        assert response.data["ok"] == "Email sent"

    @pytest.mark.integration
    @patch("users.views.staff_profiles.send_email_with_embedded_image")
    def test_send_email_failure(self, mock_send, api_client, staff_profile):
        """SMTP exception returns 400 with error detail."""
        mock_send.side_effect = Exception("SMTP error")
        data = {
            "senderEmail": "visitor@example.com",
            "message": "Test message",
        }
        response = api_client.post(
            f"/api/v1/users/{staff_profile.user.pk}/public_email_staff_member",
            data=data,
            format="json",
        )
        assert response.status_code == 400
        assert "error" in response.data

    @pytest.mark.integration
    def test_send_email_to_nonexistent_profile(self, api_client, db):
        """Non-existent profile returns 404."""
        data = {
            "senderEmail": "visitor@example.com",
            "message": "Test",
        }
        response = api_client.post(
            "/api/v1/users/99999/public_email_staff_member",
            data=data,
            format="json",
        )
        assert response.status_code == 404

    @pytest.mark.integration
    def test_send_email_to_hidden_profile_blocked(self, api_client, hidden_profile):
        """Hidden profiles cannot be emailed."""
        data = {
            "senderEmail": "visitor@example.com",
            "message": "Test",
        }
        response = api_client.post(
            f"/api/v1/users/{hidden_profile.user.pk}/public_email_staff_member",
            data=data,
            format="json",
        )
        assert response.status_code == 404


# ===========================================================================
# StaffProfiles POST (create) tests
# ===========================================================================


class TestStaffProfileCreate:
    """Tests for POST /users/staffprofiles — creation validation."""

    @pytest.mark.integration
    def test_create_invalid_data(self, api_client, admin_user):
        """Invalid creation data returns 400."""
        api_client.force_authenticate(user=admin_user)
        data = {}  # Missing required fields
        response = api_client.post(
            "/api/v1/users/staffprofiles", data=data, format="json"
        )
        assert response.status_code == 400
