"""
Bug condition exploration tests for ProjectClosures.post().

These tests encode the EXPECTED (correct) behaviour. They will FAIL on
unfixed code because the endpoint uses the wrong serialiser (read-only
document field) and does not create a parent ProjectDocument.

Validates: Requirements 1.6, 1.7
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import ProjectFactory, UserFactory
from common.tests.test_helpers import documents_urls
from documents.models import ProjectClosure, ProjectDocument


@pytest.fixture
def user(db):
    """Provide an authenticated user."""
    return UserFactory()


@pytest.fixture
def api_client():
    """Provide an API client."""
    return APIClient()


@pytest.fixture
def project(db):
    """Provide a project for closure creation."""
    return ProjectFactory(kind="science", status="closure_requested")


class TestProjectClosureCreation:
    """Test creating a project closure via ProjectClosures.post()."""

    @pytest.mark.django_db
    def test_create_closure_returns_201(self, api_client, user, project):
        """POST to projectclosures should return HTTP 201."""
        api_client.force_authenticate(user=user)
        response = api_client.post(
            documents_urls.path("projectclosures"),
            {
                "project": project.pk,
                "reason": "Project objectives achieved",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    @pytest.mark.django_db
    def test_create_closure_creates_project_document(self, api_client, user, project):
        """POST should create a ProjectDocument of kind projectclosure."""
        api_client.force_authenticate(user=user)
        api_client.post(
            documents_urls.path("projectclosures"),
            {
                "project": project.pk,
                "reason": "Project objectives achieved",
            },
            format="json",
        )
        assert ProjectDocument.objects.filter(
            project=project, kind="projectclosure"
        ).exists()

    @pytest.mark.django_db
    def test_create_closure_document_has_creator_modifier(
        self, api_client, user, project
    ):
        """The created ProjectDocument should have creator and modifier set."""
        api_client.force_authenticate(user=user)
        api_client.post(
            documents_urls.path("projectclosures"),
            {
                "project": project.pk,
                "reason": "Project objectives achieved",
            },
            format="json",
        )
        doc = ProjectDocument.objects.filter(
            project=project, kind="projectclosure"
        ).first()
        assert doc is not None
        assert doc.creator == user
        assert doc.modifier == user

    @pytest.mark.django_db
    def test_create_closure_linked_to_document(self, api_client, user, project):
        """The created ProjectClosure should be linked to the ProjectDocument."""
        api_client.force_authenticate(user=user)
        api_client.post(
            documents_urls.path("projectclosures"),
            {
                "project": project.pk,
                "reason": "Project objectives achieved",
            },
            format="json",
        )
        doc = ProjectDocument.objects.filter(
            project=project, kind="projectclosure"
        ).first()
        assert doc is not None
        closure = ProjectClosure.objects.filter(document=doc).first()
        assert closure is not None
        assert closure.reason == "Project objectives achieved"
