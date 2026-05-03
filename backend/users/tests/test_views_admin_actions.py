"""
Tests for user admin action endpoints: toggle admin, toggle active
(deactivate/activate), and delete user.

Verifies correct responses and user state changes.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from common.tests.factories import UserFactory

User = get_user_model()


@pytest.fixture
def superuser(db):
    """Superuser who can perform admin actions."""
    return UserFactory(is_staff=True, is_superuser=True)


@pytest.fixture
def target_user(db):
    """Regular user to be acted upon."""
    return UserFactory(is_staff=False, is_superuser=False, is_active=True)


@pytest.fixture
def api_client():
    """DRF API client."""
    return APIClient()


@pytest.mark.django_db
class TestToggleAdminEndpoint:
    """Tests for the toggle-admin (SwitchAdmin) endpoint."""

    def test_promote_user_to_admin(self, api_client, superuser, target_user):
        """Toggling admin on a non-superuser promotes them to superuser."""
        assert target_user.is_superuser is False

        api_client.force_authenticate(user=superuser)
        response = api_client.post(f"/api/v1/users/{target_user.pk}/admin")

        assert response.status_code == 200
        target_user.refresh_from_db()
        assert target_user.is_superuser is True

    def test_demote_admin_user(self, api_client, superuser):
        """Toggling admin on a superuser demotes them."""
        admin_target = UserFactory(is_staff=True, is_superuser=True)

        api_client.force_authenticate(user=superuser)
        response = api_client.post(f"/api/v1/users/{admin_target.pk}/admin")

        assert response.status_code == 200
        admin_target.refresh_from_db()
        assert admin_target.is_superuser is False

    def test_toggle_admin_returns_updated_user_data(
        self, api_client, superuser, target_user
    ):
        """The response body contains the updated user serialisation."""
        api_client.force_authenticate(user=superuser)
        response = api_client.post(f"/api/v1/users/{target_user.pk}/admin")

        assert response.status_code == 200
        assert response.data["is_superuser"] is True

    def test_non_admin_cannot_toggle_admin(self, api_client, target_user):
        """A non-admin user receives 403 when trying to toggle admin."""
        regular_user = UserFactory()
        api_client.force_authenticate(user=regular_user)
        response = api_client.post(f"/api/v1/users/{target_user.pk}/admin")

        assert response.status_code == 403


@pytest.mark.django_db
class TestToggleActiveEndpoint:
    """Tests for the toggle-active (deactivate/activate) endpoint."""

    def test_deactivate_active_user(self, api_client, superuser, target_user):
        """Toggling active on an active user deactivates them."""
        assert target_user.is_active is True

        api_client.force_authenticate(user=superuser)
        response = api_client.post(f"/api/v1/users/{target_user.pk}/toggleactive")

        assert response.status_code == 200
        target_user.refresh_from_db()
        assert target_user.is_active is False

    def test_activate_inactive_user(self, api_client, superuser):
        """Toggling active on an inactive user activates them."""
        inactive_user = UserFactory(is_active=False)

        api_client.force_authenticate(user=superuser)
        response = api_client.post(f"/api/v1/users/{inactive_user.pk}/toggleactive")

        assert response.status_code == 200
        inactive_user.refresh_from_db()
        assert inactive_user.is_active is True

    def test_toggle_active_returns_updated_user_data(
        self, api_client, superuser, target_user
    ):
        """The response body contains the updated user serialisation."""
        api_client.force_authenticate(user=superuser)
        response = api_client.post(f"/api/v1/users/{target_user.pk}/toggleactive")

        assert response.status_code == 200
        assert response.data["is_active"] is False

    def test_non_admin_cannot_toggle_active(self, api_client, target_user):
        """A non-admin user receives 403 when trying to toggle active."""
        regular_user = UserFactory()
        api_client.force_authenticate(user=regular_user)
        response = api_client.post(f"/api/v1/users/{target_user.pk}/toggleactive")

        assert response.status_code == 403


@pytest.mark.django_db
class TestDeleteUserEndpoint:
    """Tests for the delete user endpoint."""

    def test_delete_user_returns_204(self, api_client, superuser, target_user):
        """Deleting a user returns 204 No Content."""
        api_client.force_authenticate(user=superuser)
        response = api_client.delete(f"/api/v1/users/{target_user.pk}")

        assert response.status_code == 204

    def test_delete_user_removes_from_database(
        self, api_client, superuser, target_user
    ):
        """The user no longer exists in the database after deletion."""
        target_pk = target_user.pk

        api_client.force_authenticate(user=superuser)
        api_client.delete(f"/api/v1/users/{target_pk}")

        assert not User.objects.filter(pk=target_pk).exists()

    def test_delete_nonexistent_user_returns_404(self, api_client, superuser):
        """Deleting a user that does not exist returns 404."""
        api_client.force_authenticate(user=superuser)
        response = api_client.delete("/api/v1/users/999999")

        assert response.status_code == 404
