"""
Tests for MergeUserPreview endpoint.

Tests the GET adminoptions/mergeusers/preview/<pk> endpoint that returns
preview stats (project count, comment count, document count) and detailed
lists of comments and documents for a user being merged.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import (
    ProjectFactory,
    ProjectMemberFactory,
    UserFactory,
)


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
def target_user(db):
    return UserFactory(
        username="target",
        email="target@test.com",
        is_staff=True,
    )


class TestMergeUserPreview:
    """Tests for GET /adminoptions/mergeusers/preview/<pk>"""

    @pytest.mark.integration
    def test_returns_counts_for_user_with_projects(
        self, api_client, admin_user, target_user, db
    ):
        """Returns correct project count for a user with memberships"""
        project = ProjectFactory()
        ProjectMemberFactory(user=target_user, project=project)

        api_client.force_authenticate(user=admin_user)
        response = api_client.get(
            f"/api/v1/adminoptions/mergeusers/preview/{target_user.pk}"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["user_id"] == target_user.pk
        assert response.data["project_count"] == 1
        assert response.data["comment_count"] == 0
        assert response.data["document_count"] == 0
        assert response.data["comments"] == []
        assert response.data["documents"] == []

    @pytest.mark.integration
    def test_returns_zero_counts_for_user_with_no_data(
        self, api_client, admin_user, target_user, db
    ):
        """Returns zero counts when user has no projects/comments/documents"""
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(
            f"/api/v1/adminoptions/mergeusers/preview/{target_user.pk}"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["project_count"] == 0
        assert response.data["comment_count"] == 0
        assert response.data["document_count"] == 0

    @pytest.mark.integration
    def test_returns_404_for_nonexistent_user(self, api_client, admin_user, db):
        """Returns 404 for a user that doesn't exist"""
        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/adminoptions/mergeusers/preview/99999")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.integration
    def test_requires_admin_permission(self, api_client, target_user, db):
        """Non-admin users cannot access the preview endpoint"""
        regular_user = UserFactory(
            username="regular",
            email="regular@test.com",
            is_staff=False,
        )
        api_client.force_authenticate(user=regular_user)
        response = api_client.get(
            f"/api/v1/adminoptions/mergeusers/preview/{target_user.pk}"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.integration
    def test_unauthenticated_returns_403(self, api_client, target_user, db):
        """Unauthenticated requests are rejected"""
        response = api_client.get(
            f"/api/v1/adminoptions/mergeusers/preview/{target_user.pk}"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN
