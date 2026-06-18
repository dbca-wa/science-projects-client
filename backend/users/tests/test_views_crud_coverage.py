"""
Coverage tests for users/views/crud.py — UserNameUpdate view.

Covers the name update endpoint used by staff to edit external users' names.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import UserFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return UserFactory(
        username="admin",
        email="admin@test.com",
        is_staff=True,
        is_superuser=True,
    )


@pytest.fixture
def staff_user(db):
    return UserFactory(
        username="staff",
        email="staff@test.com",
        is_staff=True,
    )


@pytest.fixture
def external_user(db):
    return UserFactory(
        username="external",
        email="external@test.com",
        is_staff=False,
        first_name="External",
        last_name="Person",
    )


class TestUserNameUpdate:
    """Tests for PUT /users/<pk>/name endpoint"""

    @pytest.mark.integration
    def test_staff_can_edit_external_user_name(
        self, api_client, staff_user, external_user, db
    ):
        """Staff users can edit external users' names"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.put(
            f"/api/v1/users/{external_user.pk}/name",
            {"first_name": "Updated", "last_name": "Name"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["first_name"] == "Updated"
        assert response.data["last_name"] == "Name"

    @pytest.mark.integration
    def test_staff_cannot_edit_staff_user_name(self, api_client, staff_user, db):
        """Non-superuser staff cannot edit other staff users' names"""
        other_staff = UserFactory(
            username="other_staff",
            email="other@test.com",
            is_staff=True,
        )
        api_client.force_authenticate(user=staff_user)
        response = api_client.put(
            f"/api/v1/users/{other_staff.pk}/name",
            {"first_name": "Hacked"},
            format="json",
        )
        assert response.status_code == 403

    @pytest.mark.integration
    def test_superuser_can_edit_staff_user_name(
        self, api_client, admin_user, staff_user, db
    ):
        """Superusers can edit staff users' names"""
        api_client.force_authenticate(user=admin_user)
        response = api_client.put(
            f"/api/v1/users/{staff_user.pk}/name",
            {"display_first_name": "New Display", "display_last_name": "Name"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.integration
    def test_non_staff_cannot_use_endpoint(self, api_client, external_user, db):
        """External users cannot use this endpoint"""
        api_client.force_authenticate(user=external_user)
        response = api_client.put(
            f"/api/v1/users/{external_user.pk}/name",
            {"first_name": "Self Edit"},
            format="json",
        )
        assert response.status_code == 403

    @pytest.mark.integration
    def test_name_too_long_returns_error(
        self, api_client, staff_user, external_user, db
    ):
        """Names exceeding max length return 400"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.put(
            f"/api/v1/users/{external_user.pk}/name",
            {"first_name": "x" * 101},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "first_name" in response.data

    @pytest.mark.integration
    def test_null_value_stored_as_empty_string(
        self, api_client, staff_user, external_user, db
    ):
        """Null name values are stored as empty strings"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.put(
            f"/api/v1/users/{external_user.pk}/name",
            {"first_name": None},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["first_name"] == ""

    @pytest.mark.integration
    def test_no_valid_fields_returns_error(
        self, api_client, staff_user, external_user, db
    ):
        """Request with no valid name fields returns 400"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.put(
            f"/api/v1/users/{external_user.pk}/name",
            {"invalid_field": "value"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.integration
    def test_user_not_found_returns_404(self, api_client, staff_user, db):
        """Editing non-existent user returns 404"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.put(
            "/api/v1/users/99999/name",
            {"first_name": "Ghost"},
            format="json",
        )
        assert response.status_code == 404

    @pytest.mark.integration
    def test_display_name_max_length(self, api_client, staff_user, external_user, db):
        """Display name fields allow up to 201 characters"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.put(
            f"/api/v1/users/{external_user.pk}/name",
            {"display_first_name": "x" * 201},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.integration
    def test_display_name_over_max_returns_error(
        self, api_client, staff_user, external_user, db
    ):
        """Display name over 201 chars returns error"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.put(
            f"/api/v1/users/{external_user.pk}/name",
            {"display_first_name": "x" * 202},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
