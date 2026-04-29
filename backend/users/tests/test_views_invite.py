"""
Tests for users/views/invite.py — InviteUser view

Covers lines 28-129: validation, IT Assets lookup, duplicate invite checks,
user creation with duplicate username handling, and email sending.
"""

from unittest.mock import MagicMock, patch

import pytest
from rest_framework import status

from common.tests.test_helpers import users_urls
from users.models import User, UserInvite


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestInviteUser:
    """Tests for InviteUser POST endpoint"""

    def test_invite_requires_authentication(self, api_client):
        """Unauthenticated requests are rejected"""
        data = {
            "email": "new.user@dbca.wa.gov.au",
            "first_name": "New",
            "last_name": "User",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_invite_missing_email(self, api_client, user):
        """Missing email returns 400"""
        api_client.force_authenticate(user=user)
        data = {"first_name": "New", "last_name": "User"}
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email, first_name, and last_name are required" in response.data["error"]

    def test_invite_missing_first_name(self, api_client, user):
        """Missing first_name returns 400"""
        api_client.force_authenticate(user=user)
        data = {"email": "new@dbca.wa.gov.au", "last_name": "User"}
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invite_missing_last_name(self, api_client, user):
        """Missing last_name returns 400"""
        api_client.force_authenticate(user=user)
        data = {"email": "new@dbca.wa.gov.au", "first_name": "New"}
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invite_wrong_email_domain(self, api_client, user):
        """Non-DBCA email domain returns 400"""
        api_client.force_authenticate(user=user)
        data = {
            "email": "new@gmail.com",
            "first_name": "New",
            "last_name": "User",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "dbca.wa.gov.au" in response.data["error"]

    def test_invite_existing_user(self, api_client, user):
        """Inviting an email that already exists in SPMS returns 400"""
        api_client.force_authenticate(user=user)
        # Create a user with the target email
        User.objects.create_user(
            username="existing",
            email="existing@dbca.wa.gov.au",
            password="pass123",
        )
        data = {
            "email": "existing@dbca.wa.gov.au",
            "first_name": "Existing",
            "last_name": "User",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already exists" in response.data["error"]

    @patch("users.views.invite.http_requests.get")
    def test_invite_email_not_in_it_assets(self, mock_get, api_client, user, settings):
        """Email not found in IT Assets directory returns 400"""
        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = "https://it-assets.example.com/api/"
        settings.IT_ASSETS_USER = "testuser"
        settings.IT_ASSETS_ACCESS_TOKEN = "testtoken"

        mock_get.return_value = MagicMock(status_code=200, json=lambda: [])

        data = {
            "email": "notfound@dbca.wa.gov.au",
            "first_name": "Not",
            "last_name": "Found",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "not found in DBCA directory" in response.data["error"]

    @patch("users.views.invite.http_requests.get")
    def test_invite_it_assets_api_failure(self, mock_get, api_client, user, settings):
        """IT Assets API returning non-200 rejects the invite"""
        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = "https://it-assets.example.com/api/"
        settings.IT_ASSETS_USER = "testuser"
        settings.IT_ASSETS_ACCESS_TOKEN = "testtoken"

        mock_get.return_value = MagicMock(status_code=404, json=lambda: [])

        data = {
            "email": "new.person@dbca.wa.gov.au",
            "first_name": "New",
            "last_name": "Person",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch("users.views.invite.http_requests.get")
    @patch("users.views.invite.NotificationService.send_spms_invite")
    def test_invite_it_assets_request_exception_proceeds(
        self, mock_send, mock_get, api_client, user, settings
    ):
        """IT Assets request exception allows invite to proceed"""
        import requests as http_requests

        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = "https://it-assets.example.com/api/"
        settings.IT_ASSETS_USER = "testuser"
        settings.IT_ASSETS_ACCESS_TOKEN = "testtoken"

        mock_get.side_effect = http_requests.RequestException("Connection timeout")
        mock_send.return_value = None

        data = {
            "email": "timeout.user@dbca.wa.gov.au",
            "first_name": "Timeout",
            "last_name": "User",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        # Should succeed despite IT Assets being unavailable
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="timeout.user@dbca.wa.gov.au").exists()

    @patch("users.views.invite.http_requests.get")
    @patch("users.views.invite.NotificationService.send_spms_invite")
    def test_invite_it_assets_url_not_configured(
        self, mock_send, mock_get, api_client, user, settings
    ):
        """When IT_ASSETS_URL is empty, skip directory validation"""
        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = ""
        mock_send.return_value = None

        data = {
            "email": "noconfig@dbca.wa.gov.au",
            "first_name": "No",
            "last_name": "Config",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        mock_get.assert_not_called()

    @patch("users.views.invite.http_requests.get")
    @patch("users.views.invite.NotificationService.send_spms_invite")
    def test_invite_duplicate_pending_invite(
        self, mock_send, mock_get, api_client, user, settings
    ):
        """Duplicate pending invite returns 400"""
        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = ""

        # Create a pending invite
        UserInvite.objects.create(
            email="pending@dbca.wa.gov.au",
            invited_by=user,
            accepted=False,
        )

        data = {
            "email": "pending@dbca.wa.gov.au",
            "first_name": "Pending",
            "last_name": "User",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already been sent" in response.data["error"]

    @patch("users.views.invite.http_requests.get")
    @patch("users.views.invite.NotificationService.send_spms_invite")
    def test_invite_cleans_up_accepted_invites(
        self, mock_send, mock_get, api_client, user, settings
    ):
        """Pending invites for users who now have active accounts are marked accepted"""
        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = ""
        mock_send.return_value = None

        # Create a pending invite for a user who now has an active account
        active_user = User.objects.create_user(  # noqa: F841
            username="active",
            email="active@dbca.wa.gov.au",
            password="pass123",
            is_active=True,
        )
        old_invite = UserInvite.objects.create(
            email="active@dbca.wa.gov.au",
            invited_by=user,
            accepted=False,
        )

        data = {
            "email": "brand.new@dbca.wa.gov.au",
            "first_name": "Brand",
            "last_name": "New",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # Old invite should now be marked as accepted
        old_invite.refresh_from_db()
        assert old_invite.accepted is True

    @patch("users.views.invite.http_requests.get")
    @patch("users.views.invite.NotificationService.send_spms_invite")
    def test_invite_success_creates_user_and_invite(
        self, mock_send, mock_get, api_client, user, settings
    ):
        """Successful invite creates user, invite record, and sends email"""
        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = ""
        mock_send.return_value = None

        data = {
            "email": "new.staff@dbca.wa.gov.au",
            "first_name": "New",
            "last_name": "Staff",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        # Verify user was created
        new_user = User.objects.get(email="new.staff@dbca.wa.gov.au")
        assert new_user.username == "new.staff"
        assert new_user.display_first_name == "New"
        assert new_user.display_last_name == "Staff"
        assert new_user.is_staff is True
        assert new_user.is_active is True

        # Verify invite record was created
        assert UserInvite.objects.filter(
            email="new.staff@dbca.wa.gov.au", invited_by=user
        ).exists()

        # Verify email was sent
        mock_send.assert_called_once()

    @patch("users.views.invite.http_requests.get")
    @patch("users.views.invite.NotificationService.send_spms_invite")
    def test_invite_duplicate_username_handling(
        self, mock_send, mock_get, api_client, user, settings
    ):
        """When username already exists, appends counter"""
        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = ""
        mock_send.return_value = None

        # Create a user with the username that would be generated
        User.objects.create_user(
            username="duplicate",
            email="other@example.com",
            password="pass123",
        )

        data = {
            "email": "duplicate@dbca.wa.gov.au",
            "first_name": "Dup",
            "last_name": "User",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        new_user = User.objects.get(email="duplicate@dbca.wa.gov.au")
        assert new_user.username == "duplicate1"

    @patch("users.views.invite.http_requests.get")
    @patch("users.views.invite.NotificationService.send_spms_invite")
    def test_invite_email_send_failure_still_creates_user(
        self, mock_send, mock_get, api_client, user, settings
    ):
        """If email sending fails, user is still created"""
        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = ""
        mock_send.side_effect = Exception("SMTP error")

        data = {
            "email": "email.fail@dbca.wa.gov.au",
            "first_name": "Email",
            "last_name": "Fail",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="email.fail@dbca.wa.gov.au").exists()

    @patch("users.views.invite.http_requests.get")
    @patch("users.views.invite.NotificationService.send_spms_invite")
    def test_invite_email_normalised_to_lowercase(
        self, mock_send, mock_get, api_client, user, settings
    ):
        """Email is normalised to lowercase"""
        api_client.force_authenticate(user=user)
        settings.IT_ASSETS_URL = ""
        mock_send.return_value = None

        data = {
            "email": "  UPPER.Case@DBCA.WA.GOV.AU  ",
            "first_name": "Upper",
            "last_name": "Case",
        }
        response = api_client.post(users_urls.path("invite"), data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="upper.case@dbca.wa.gov.au").exists()
