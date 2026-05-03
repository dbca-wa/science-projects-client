"""
Tests for project member API views.

Covers the POST /projects/project_members endpoint for creating members,
including duplicate prevention, validation, and authentication.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import ProjectFactory, UserFactory
from projects.models import ProjectMember


@pytest.fixture
def authenticated_client(db):
    """API client authenticated as a regular user."""
    user = UserFactory(username="api_user", email="api@example.com")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def unauthenticated_client():
    """API client with no authentication."""
    return APIClient()


@pytest.fixture
def test_project(db):
    """A project for view tests."""
    return ProjectFactory(
        title="View Test Project",
        kind="science",
        status="new",
        year=2024,
        members=[],
    )


@pytest.fixture
def test_user(db):
    """A user to be added as a member."""
    return UserFactory(username="view_target", email="view_target@example.com")


class TestProjectMembersPost:
    """Tests for POST /projects/project_members"""

    def test_create_member_with_valid_data_returns_201(
        self, authenticated_client, test_project, test_user, db
    ):
        """Valid data should create a member and return 201."""
        payload = {
            "project": test_project.pk,
            "user": test_user.pk,
            "role": "technical",
            "time_allocation": 0.5,
            "position": 100,
            "is_leader": False,
        }

        response = authenticated_client.post(
            "/api/v1/projects/project_members",
            data=payload,
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert ProjectMember.objects.filter(
            project=test_project, user=test_user
        ).exists()

    def test_create_member_with_missing_role_returns_400(
        self, authenticated_client, test_project, test_user, db
    ):
        """Missing role should return 400."""
        payload = {
            "project": test_project.pk,
            "user": test_user.pk,
            "role": "",
            "time_allocation": 0.5,
        }

        response = authenticated_client.post(
            "/api/v1/projects/project_members",
            data=payload,
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_duplicate_member_returns_400(
        self, authenticated_client, test_project, test_user, db
    ):
        """Adding the same user to the same project twice should return 400."""
        # Create the member first
        ProjectMember.objects.create(
            project=test_project,
            user=test_user,
            role="technical",
            time_allocation=0.5,
        )

        payload = {
            "project": test_project.pk,
            "user": test_user.pk,
            "role": "research",
            "time_allocation": 0.3,
        }

        response = authenticated_client.post(
            "/api/v1/projects/project_members",
            data=payload,
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unauthenticated_request_returns_403(
        self, unauthenticated_client, test_project, test_user, db
    ):
        """Unauthenticated requests should be rejected."""
        payload = {
            "project": test_project.pk,
            "user": test_user.pk,
            "role": "technical",
            "time_allocation": 0.5,
        }

        response = unauthenticated_client.post(
            "/api/v1/projects/project_members",
            data=payload,
            format="json",
        )

        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    def test_create_member_response_includes_user_data(
        self, authenticated_client, test_project, test_user, db
    ):
        """Response should include nested user data."""
        payload = {
            "project": test_project.pk,
            "user": test_user.pk,
            "role": "technical",
            "time_allocation": 0.5,
            "position": 100,
            "is_leader": False,
        }

        response = authenticated_client.post(
            "/api/v1/projects/project_members",
            data=payload,
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "user" in data
        assert data["user"]["id"] == test_user.pk
        assert data["role"] == "technical"
