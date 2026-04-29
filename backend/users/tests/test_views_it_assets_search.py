"""
Tests for the IT Assets search proxy endpoint.
"""

from unittest.mock import MagicMock, patch

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username="admin",
        email="admin@dbca.wa.gov.au",
        password="testpass123",
    )


@pytest.fixture
def regular_user(db):
    return User.objects.create_user(
        username="regular",
        email="regular@dbca.wa.gov.au",
        password="testpass123",
    )


@pytest.fixture
def it_assets_response():
    """Sample IT Assets API response"""
    return [
        {
            "employee_id": "E001",
            "name": "Jane Smith",
            "email": "jane.smith@dbca.wa.gov.au",
            "title": "Senior Scientist",
            "location": "Kensington",
        },
        {
            "employee_id": "E002",
            "name": "John Doe",
            "email": "john.doe@dbca.wa.gov.au",
            "title": "Project Officer",
            "location": "Woodvale",
        },
        {
            "employee_id": "E003",
            "name": "Alice Johnson",
            "email": "alice.johnson@dbca.wa.gov.au",
            "title": "Data Analyst",
            "location": "Kensington",
        },
    ]


class TestITAssetsSearch:
    """Tests for GET /users/it-assets-search"""

    url = "/api/v1/users/it-assets-search"

    def test_unauthenticated_returns_403(self, api_client):
        """Unauthenticated requests are rejected"""
        response = api_client.get(self.url, {"q": "jane"})
        assert response.status_code == 403

    def test_non_admin_returns_403(self, api_client, regular_user):
        """Non-admin users are rejected"""
        api_client.force_authenticate(user=regular_user)
        response = api_client.get(self.url, {"q": "jane"})
        assert response.status_code == 403

    def test_missing_query_returns_400(self, api_client, admin_user):
        """Missing search term returns 400"""
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(self.url)
        assert response.status_code == 400
        assert "at least 2 characters" in response.data["error"]

    def test_short_query_returns_400(self, api_client, admin_user):
        """Single character search term returns 400"""
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(self.url, {"q": "j"})
        assert response.status_code == 400

    @patch("users.views.it_assets_search.http_requests.get")
    def test_successful_search(
        self, mock_get, api_client, admin_user, it_assets_response, settings
    ):
        """Successful search returns filtered and annotated results"""
        api_client.force_authenticate(user=admin_user)
        settings.IT_ASSETS_URL = "https://it-assets.example.com/api/"
        settings.IT_ASSETS_USER = "testuser"
        settings.IT_ASSETS_ACCESS_TOKEN = "testtoken"

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = it_assets_response
        mock_get.return_value = mock_response

        response = api_client.get(self.url, {"q": "jane"})
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Jane Smith"
        assert response.data[0]["in_spms"] is False
        assert response.data[0]["already_invited"] is False

    @patch("users.views.it_assets_search.http_requests.get")
    def test_existing_spms_user_marked(
        self, mock_get, api_client, admin_user, it_assets_response, settings, db
    ):
        """Users already in SPMS are marked with in_spms=True"""
        api_client.force_authenticate(user=admin_user)
        settings.IT_ASSETS_URL = "https://it-assets.example.com/api/"
        settings.IT_ASSETS_USER = "testuser"
        settings.IT_ASSETS_ACCESS_TOKEN = "testtoken"

        # Create a user that matches one of the IT Assets results
        User.objects.create_user(
            username="janesmith",
            email="jane.smith@dbca.wa.gov.au",
            password="testpass",
        )

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = it_assets_response
        mock_get.return_value = mock_response

        response = api_client.get(self.url, {"q": "jane"})
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["in_spms"] is True

    @patch("users.views.it_assets_search.http_requests.get")
    def test_invited_user_marked(
        self, mock_get, api_client, admin_user, it_assets_response, settings, db
    ):
        """Users with pending invites are marked with already_invited=True"""
        from users.models import UserInvite

        api_client.force_authenticate(user=admin_user)
        settings.IT_ASSETS_URL = "https://it-assets.example.com/api/"
        settings.IT_ASSETS_USER = "testuser"
        settings.IT_ASSETS_ACCESS_TOKEN = "testtoken"

        # Create a pending invite
        UserInvite.objects.create(
            email="jane.smith@dbca.wa.gov.au",
            invited_by=admin_user,
            accepted=False,
        )

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = it_assets_response
        mock_get.return_value = mock_response

        response = api_client.get(self.url, {"q": "jane"})
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["already_invited"] is True

    @patch("users.views.it_assets_search.http_requests.get")
    def test_it_assets_url_not_configured(
        self, mock_get, api_client, admin_user, settings
    ):
        """Returns 502 when IT_ASSETS_URL is not configured"""
        api_client.force_authenticate(user=admin_user)
        settings.IT_ASSETS_URL = ""

        response = api_client.get(self.url, {"q": "jane"})
        assert response.status_code == 502
        mock_get.assert_not_called()

    @patch("users.views.it_assets_search.http_requests.get")
    def test_it_assets_api_failure(self, mock_get, api_client, admin_user, settings):
        """Returns 502 when IT Assets API fails"""
        api_client.force_authenticate(user=admin_user)
        settings.IT_ASSETS_URL = "https://it-assets.example.com/api/"
        settings.IT_ASSETS_USER = "testuser"
        settings.IT_ASSETS_ACCESS_TOKEN = "testtoken"

        import requests

        mock_get.side_effect = requests.ConnectionError("Connection refused")

        response = api_client.get(self.url, {"q": "jane"})
        assert response.status_code == 502

    @patch("users.views.it_assets_search.http_requests.get")
    def test_search_by_email(
        self, mock_get, api_client, admin_user, it_assets_response, settings
    ):
        """Search matches on email as well as name"""
        api_client.force_authenticate(user=admin_user)
        settings.IT_ASSETS_URL = "https://it-assets.example.com/api/"
        settings.IT_ASSETS_USER = "testuser"
        settings.IT_ASSETS_ACCESS_TOKEN = "testtoken"

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = it_assets_response
        mock_get.return_value = mock_response

        response = api_client.get(self.url, {"q": "alice.johnson"})
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Alice Johnson"
