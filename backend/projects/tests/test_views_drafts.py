"""
Tests for the ProjectDraftDetail view.

Covers GET, PUT, DELETE operations for project drafts,
including validation, authentication, and edge cases.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import UserFactory
from projects.models import ProjectDraft


@pytest.fixture
def api_client():
    """Provide a DRF API client."""
    return APIClient()


@pytest.fixture
def user(db):
    """Provide an authenticated user."""
    return UserFactory(username="drafter", email="drafter@dbca.wa.gov.au")


def _url(kind):
    """Build the drafts URL for a given project kind."""
    return f"/api/v1/projects/drafts/{kind}"


# =============================================================================
# Authentication tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestProjectDraftAuth:
    """Tests for authentication requirements."""

    def test_unauthenticated_get_returns_403(self, api_client):
        """Unauthenticated GET request is rejected."""
        response = api_client.get(_url("science"))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_put_returns_403(self, api_client):
        """Unauthenticated PUT request is rejected."""
        response = api_client.put(_url("science"), {"data": {}}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_delete_returns_403(self, api_client):
        """Unauthenticated DELETE request is rejected."""
        response = api_client.delete(_url("science"))
        assert response.status_code == status.HTTP_403_FORBIDDEN


# =============================================================================
# Validation tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestProjectDraftValidation:
    """Tests for kind parameter validation."""

    def test_invalid_kind_get_returns_400(self, api_client, user):
        """GET with invalid project kind returns 400."""
        api_client.force_authenticate(user=user)
        response = api_client.get(_url("invalid_kind"))
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid project kind" in response.data["detail"]

    def test_invalid_kind_put_returns_400(self, api_client, user):
        """PUT with invalid project kind returns 400."""
        api_client.force_authenticate(user=user)
        response = api_client.put(_url("not_a_kind"), {"data": {}}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid project kind" in response.data["detail"]

    def test_invalid_kind_delete_returns_400(self, api_client, user):
        """DELETE with invalid project kind returns 400."""
        api_client.force_authenticate(user=user)
        response = api_client.delete(_url("bogus"))
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid project kind" in response.data["detail"]


# =============================================================================
# GET tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestProjectDraftGet:
    """Tests for retrieving drafts."""

    def test_get_no_draft_returns_404(self, api_client, user):
        """GET when no draft exists returns 404."""
        api_client.force_authenticate(user=user)
        response = api_client.get(_url("science"))
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "No draft found" in response.data["detail"]

    def test_get_existing_draft_returns_data(self, api_client, user):
        """GET when draft exists returns the draft data."""
        # Create a draft directly
        draft = ProjectDraft.objects.create(
            user=user,
            project_kind="science",
            data={"title": "My Project", "step": 2},
            current_step=2,
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(_url("science"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == draft.pk
        assert response.data["project_kind"] == "science"
        assert response.data["data"] == {"title": "My Project", "step": 2}
        assert response.data["current_step"] == 2

    def test_get_draft_for_different_kind_returns_404(self, api_client, user):
        """GET for a kind that has no draft returns 404 even if other kinds have drafts."""
        ProjectDraft.objects.create(
            user=user,
            project_kind="science",
            data={"title": "Science Draft"},
            current_step=1,
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(_url("student"))
        assert response.status_code == status.HTTP_404_NOT_FOUND


# =============================================================================
# PUT tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestProjectDraftPut:
    """Tests for creating and updating drafts."""

    def test_put_creates_new_draft(self, api_client, user):
        """PUT creates a new draft when none exists."""
        api_client.force_authenticate(user=user)
        response = api_client.put(
            _url("science"),
            {"data": {"title": "New Project"}, "current_step": 1},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["project_kind"] == "science"
        assert response.data["data"] == {"title": "New Project"}
        assert response.data["current_step"] == 1
        assert ProjectDraft.objects.filter(user=user, project_kind="science").exists()

    def test_put_updates_existing_draft(self, api_client, user):
        """PUT updates an existing draft (upsert)."""
        ProjectDraft.objects.create(
            user=user,
            project_kind="core_function",
            data={"title": "Old Title"},
            current_step=0,
        )

        api_client.force_authenticate(user=user)
        response = api_client.put(
            _url("core_function"),
            {
                "data": {"title": "Updated Title", "description": "New"},
                "current_step": 3,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"] == {"title": "Updated Title", "description": "New"}
        assert response.data["current_step"] == 3
        # Should still be only one draft
        assert (
            ProjectDraft.objects.filter(user=user, project_kind="core_function").count()
            == 1
        )

    def test_put_defaults_current_step_to_zero(self, api_client, user):
        """PUT without current_step defaults to 0."""
        api_client.force_authenticate(user=user)
        response = api_client.put(
            _url("external"),
            {"data": {"title": "External Project"}},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["current_step"] == 0


# =============================================================================
# DELETE tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestProjectDraftDelete:
    """Tests for deleting drafts."""

    def test_delete_existing_draft_returns_204(self, api_client, user):
        """DELETE removes the draft and returns 204."""
        ProjectDraft.objects.create(
            user=user,
            project_kind="student",
            data={"title": "Student Draft"},
            current_step=1,
        )

        api_client.force_authenticate(user=user)
        response = api_client.delete(_url("student"))

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not ProjectDraft.objects.filter(
            user=user, project_kind="student"
        ).exists()

    def test_delete_nonexistent_draft_returns_404(self, api_client, user):
        """DELETE when no draft exists returns 404."""
        api_client.force_authenticate(user=user)
        response = api_client.delete(_url("science"))
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "No draft found" in response.data["detail"]
