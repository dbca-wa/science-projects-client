"""
Tests for DBCA middleware SSO flow.

Verifies that the middleware correctly creates users from SSO headers,
logs in existing users, updates user details, fulfils pending invites,
and handles IT Assets API failures gracefully.
"""

from unittest.mock import Mock, patch

import pytest
from django.contrib.auth import get_user_model
from django.contrib.sessions.backends.db import SessionStore
from django.test import RequestFactory

from agencies.models import Agency
from config.dbca_middleware import DBCAMiddleware
from contacts.models import UserContact
from users.models import PublicStaffProfile, UserInvite, UserProfile, UserWork

User = get_user_model()


def _make_sso_request(
    username="johndoe",
    first_name="John",
    last_name="Doe",
    email="john.doe@dbca.wa.gov.au",
):
    """
    Build a GET request with SSO headers and an anonymous user session.

    Django's RequestFactory populates request.META with HTTP_ prefixed keys
    and request.headers reads from those, so we only need to set META.
    """
    factory = RequestFactory()
    request = factory.get("/")
    request.META["HTTP_REMOTE_USER"] = username
    request.META["HTTP_X_FIRST_NAME"] = first_name
    request.META["HTTP_X_LAST_NAME"] = last_name
    request.META["HTTP_X_EMAIL"] = email

    # Attach a session (required by django.contrib.auth.login)
    request.session = SessionStore()
    request.session.create()

    # Anonymous user stub
    anon = Mock()
    anon.is_authenticated = False
    request.user = anon

    return request


@pytest.mark.django_db(transaction=True)
class TestDBCAMiddlewareNewUser:
    """Tests for middleware creating a new user on first SSO visit."""

    @pytest.fixture(autouse=True)
    def _setup_agency(self, db):
        """Ensure the DBCA agency exists with pk=1 (middleware uses Agency.objects.get(pk=1))."""
        Agency.objects.create(pk=1, name="DBCA")

    @staticmethod
    def _get_response(request):
        """Dummy get_response callable for the middleware."""
        return Mock(status_code=200)

    @patch("config.dbca_middleware.requests.get")
    def test_middleware_creates_new_user_on_first_visit(self, mock_get):
        """First SSO visit creates a new user with correct fields."""
        mock_get.return_value = Mock(status_code=200, json=lambda: [])

        middleware = DBCAMiddleware(self._get_response)
        request = _make_sso_request()
        middleware(request)

        assert User.objects.filter(username="johndoe").exists()
        user = User.objects.get(username="johndoe")
        assert user.first_name == "John"
        assert user.last_name == "Doe"
        assert user.email == "john.doe@dbca.wa.gov.au"

    @patch("config.dbca_middleware.requests.get")
    def test_middleware_creates_associated_records(self, mock_get):
        """New SSO user gets UserWork, UserProfile, UserContact, and PublicStaffProfile."""
        mock_get.return_value = Mock(status_code=200, json=lambda: [])

        middleware = DBCAMiddleware(self._get_response)
        request = _make_sso_request(
            username="newstaff",
            first_name="New",
            last_name="Staff",
            email="new.staff@dbca.wa.gov.au",
        )
        middleware(request)

        user = User.objects.get(username="newstaff")
        assert UserWork.objects.filter(user=user).exists()
        assert UserProfile.objects.filter(user=user).exists()
        assert UserContact.objects.filter(user=user).exists()
        assert PublicStaffProfile.objects.filter(user=user).exists()

    @patch("config.dbca_middleware.requests.get")
    def test_middleware_sets_user_as_staff(self, mock_get):
        """New SSO user is marked as is_staff=True."""
        mock_get.return_value = Mock(status_code=200, json=lambda: [])

        middleware = DBCAMiddleware(self._get_response)
        request = _make_sso_request(
            username="staffcheck",
            first_name="Staff",
            last_name="Check",
            email="staff.check@dbca.wa.gov.au",
        )
        middleware(request)

        user = User.objects.get(username="staffcheck")
        assert user.is_staff is True

    @patch("config.dbca_middleware.requests.get")
    def test_middleware_sets_display_names(self, mock_get):
        """New SSO user has display_first_name and display_last_name matching SSO headers."""
        mock_get.return_value = Mock(status_code=200, json=lambda: [])

        middleware = DBCAMiddleware(self._get_response)
        request = _make_sso_request(
            username="displaytest",
            first_name="Display",
            last_name="Test",
            email="display.test@dbca.wa.gov.au",
        )
        middleware(request)

        user = User.objects.get(username="displaytest")
        assert user.display_first_name == "Display"
        assert user.display_last_name == "Test"


@pytest.mark.django_db(transaction=True)
class TestDBCAMiddlewareExistingUser:
    """Tests for middleware handling existing users."""

    @pytest.fixture(autouse=True)
    def _setup_agency(self, db):
        Agency.objects.create(pk=1, name="DBCA")

    @staticmethod
    def _get_response(request):
        return Mock(status_code=200)

    def test_middleware_existing_user_by_username_logs_in(self):
        """If a user already exists by username, middleware logs them in without creating a duplicate."""
        User.objects.create_user(
            username="existinguser",
            email="existing@dbca.wa.gov.au",
            first_name="Old",
            last_name="Name",
        )

        middleware = DBCAMiddleware(self._get_response)
        request = _make_sso_request(
            username="existinguser",
            first_name="New",
            last_name="Name",
            email="existing@dbca.wa.gov.au",
        )
        middleware(request)

        assert User.objects.filter(username="existinguser").count() == 1

    def test_middleware_existing_user_by_email_logs_in(self):
        """If a user already exists by email (different username), middleware logs them in."""
        User.objects.create_user(
            username="oldusername",
            email="shared@dbca.wa.gov.au",
            first_name="Old",
            last_name="User",
        )

        middleware = DBCAMiddleware(self._get_response)
        request = _make_sso_request(
            username="newusername",
            first_name="New",
            last_name="User",
            email="shared@dbca.wa.gov.au",
        )
        middleware(request)

        # Should still be one user, not two
        assert User.objects.filter(email__iexact="shared@dbca.wa.gov.au").count() == 1

    def test_middleware_updates_existing_user_details(self):
        """When create_user_and_associated_entries finds an existing user by username, it updates their details."""
        user = User.objects.create_user(
            username="updateme",
            email="updateme@dbca.wa.gov.au",
            first_name="Original",
            last_name="Name",
        )

        middleware = DBCAMiddleware(self._get_response)
        attributemap = {
            "username": "updateme",
            "first_name": "Updated",
            "last_name": "Surname",
            "email": "updateme@dbca.wa.gov.au",
        }

        # Call the inner method directly to test the update-on-existing-user path
        returned_user = middleware.create_user_and_associated_entries(
            None, attributemap
        )

        user.refresh_from_db()
        assert user.first_name == "Updated"
        assert user.last_name == "Surname"
        assert returned_user.pk == user.pk


@pytest.mark.django_db(transaction=True)
class TestDBCAMiddlewareEdgeCases:
    """Tests for middleware edge cases — no headers, invites, IT Assets failures."""

    @pytest.fixture(autouse=True)
    def _setup_agency(self, db):
        Agency.objects.create(pk=1, name="DBCA")

    @staticmethod
    def _get_response(request):
        return Mock(status_code=200)

    def test_middleware_no_remote_user_header_passes_through(self):
        """If no remote-user header is present, middleware does nothing."""
        factory = RequestFactory()
        request = factory.get("/")
        # No SSO headers at all
        request.session = SessionStore()
        request.session.create()
        anon = Mock()
        anon.is_authenticated = False
        request.user = anon

        middleware = DBCAMiddleware(self._get_response)
        middleware(request)

        # No users should have been created
        assert User.objects.count() == 0

    @patch("config.dbca_middleware.requests.get")
    def test_middleware_fulfils_pending_invite(self, mock_get):
        """If a UserInvite exists for the email, it is marked as accepted after login."""
        mock_get.return_value = Mock(status_code=200, json=lambda: [])

        inviter = User.objects.create_user(
            username="inviter",
            email="inviter@dbca.wa.gov.au",
        )
        invite = UserInvite.objects.create(
            email="invited@dbca.wa.gov.au",
            invited_by=inviter,
            accepted=False,
        )

        middleware = DBCAMiddleware(self._get_response)
        request = _make_sso_request(
            username="inviteduser",
            first_name="Invited",
            last_name="User",
            email="invited@dbca.wa.gov.au",
        )
        middleware(request)

        invite.refresh_from_db()
        assert invite.accepted is True

    @patch("config.dbca_middleware.requests.get")
    def test_middleware_handles_it_assets_failure_gracefully(self, mock_get):
        """If the IT Assets API call fails, the user is still created."""
        import requests as req_lib

        mock_get.side_effect = req_lib.exceptions.ConnectionError("Connection refused")

        middleware = DBCAMiddleware(self._get_response)
        request = _make_sso_request(
            username="itfailuser",
            first_name="IT",
            last_name="Fail",
            email="itfail@dbca.wa.gov.au",
        )
        middleware(request)

        assert User.objects.filter(username="itfailuser").exists()
        user = User.objects.get(username="itfailuser")
        assert user.is_staff is True
        # PublicStaffProfile should still be created (with null IT asset data)
        assert PublicStaffProfile.objects.filter(user=user).exists()
        psp = PublicStaffProfile.objects.get(user=user)
        assert psp.it_asset_id is None
        assert psp.employee_id is None
