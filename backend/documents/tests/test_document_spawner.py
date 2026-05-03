"""
Tests for DocumentSpawner.post().

Verifies that the DocumentSpawner endpoint correctly creates ProjectDocuments
and their kind-specific detail records (ConceptPlan, ProjectPlan + Endorsement,
ProjectClosure), sets creator/modifier attribution, and rejects document kinds
that have dedicated creation endpoints.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import ProjectFactory, UserFactory
from common.tests.test_helpers import documents_urls
from documents.models import (
    ConceptPlan,
    ProjectClosure,
    ProjectDocument,
    ProjectPlan,
)


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
    """Provide a project for document creation."""
    return ProjectFactory(kind="science", status="new")


class TestDocumentSpawnerConceptPlan:
    """Test spawning a concept plan via DocumentSpawner."""

    @pytest.mark.django_db
    def test_spawn_concept_returns_201(self, api_client, user, project):
        """POST with kind=concept should return HTTP 201."""
        api_client.force_authenticate(user=user)
        response = api_client.post(
            documents_urls.path("spawn"),
            {"kind": "concept", "project": project.pk},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    @pytest.mark.django_db
    def test_spawn_concept_creates_project_document(self, api_client, user, project):
        """POST with kind=concept should create a ProjectDocument."""
        api_client.force_authenticate(user=user)
        api_client.post(
            documents_urls.path("spawn"),
            {"kind": "concept", "project": project.pk},
            format="json",
        )
        assert ProjectDocument.objects.filter(project=project, kind="concept").exists()

    @pytest.mark.django_db
    def test_spawn_concept_creates_concept_plan(self, api_client, user, project):
        """POST with kind=concept should create a ConceptPlan detail record."""
        api_client.force_authenticate(user=user)
        api_client.post(
            documents_urls.path("spawn"),
            {"kind": "concept", "project": project.pk},
            format="json",
        )
        doc = ProjectDocument.objects.filter(project=project, kind="concept").first()
        assert doc is not None
        assert ConceptPlan.objects.filter(document=doc).exists()

    @pytest.mark.django_db
    def test_spawn_concept_sets_creator_modifier(self, api_client, user, project):
        """POST with kind=concept should set creator and modifier to request user."""
        api_client.force_authenticate(user=user)
        api_client.post(
            documents_urls.path("spawn"),
            {"kind": "concept", "project": project.pk},
            format="json",
        )
        doc = ProjectDocument.objects.filter(project=project, kind="concept").first()
        assert doc is not None
        assert doc.creator == user
        assert doc.modifier == user


class TestDocumentSpawnerProjectPlan:
    """Test spawning a project plan via DocumentSpawner."""

    @pytest.mark.django_db
    def test_spawn_projectplan_returns_201(self, api_client, user, project):
        """POST with kind=projectplan should return HTTP 201."""
        api_client.force_authenticate(user=user)
        response = api_client.post(
            documents_urls.path("spawn"),
            {"kind": "projectplan", "project": project.pk},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    @pytest.mark.django_db
    def test_spawn_projectplan_creates_project_plan(self, api_client, user, project):
        """POST with kind=projectplan should create a ProjectPlan detail record."""
        api_client.force_authenticate(user=user)
        api_client.post(
            documents_urls.path("spawn"),
            {"kind": "projectplan", "project": project.pk},
            format="json",
        )
        doc = ProjectDocument.objects.filter(
            project=project, kind="projectplan"
        ).first()
        assert doc is not None
        assert ProjectPlan.objects.filter(document=doc).exists()

    @pytest.mark.django_db
    def test_spawn_projectplan_creates_endorsement(self, api_client, user, project):
        """POST with kind=projectplan should also create an Endorsement."""
        from documents.models import Endorsement

        api_client.force_authenticate(user=user)
        api_client.post(
            documents_urls.path("spawn"),
            {"kind": "projectplan", "project": project.pk},
            format="json",
        )
        doc = ProjectDocument.objects.filter(
            project=project, kind="projectplan"
        ).first()
        assert doc is not None
        plan = ProjectPlan.objects.filter(document=doc).first()
        assert plan is not None
        assert Endorsement.objects.filter(project_plan=plan).exists()


class TestDocumentSpawnerProjectClosure:
    """Test spawning a project closure via DocumentSpawner."""

    @pytest.mark.django_db
    def test_spawn_projectclosure_returns_201(self, api_client, user, project):
        """POST with kind=projectclosure should return HTTP 201."""
        api_client.force_authenticate(user=user)
        response = api_client.post(
            documents_urls.path("spawn"),
            {"kind": "projectclosure", "project": project.pk},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    @pytest.mark.django_db
    def test_spawn_projectclosure_creates_closure(self, api_client, user, project):
        """POST with kind=projectclosure should create a ProjectClosure detail record."""
        api_client.force_authenticate(user=user)
        api_client.post(
            documents_urls.path("spawn"),
            {"kind": "projectclosure", "project": project.pk},
            format="json",
        )
        doc = ProjectDocument.objects.filter(
            project=project, kind="projectclosure"
        ).first()
        assert doc is not None
        assert ProjectClosure.objects.filter(document=doc).exists()


class TestDocumentSpawnerRejectedKinds:
    """Test that progressreport and studentreport are rejected."""

    @pytest.mark.django_db
    def test_spawn_progressreport_returns_400(self, api_client, user, project):
        """POST with kind=progressreport should return HTTP 400."""
        api_client.force_authenticate(user=user)
        response = api_client.post(
            documents_urls.path("spawn"),
            {"kind": "progressreport", "project": project.pk},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    def test_spawn_studentreport_returns_400(self, api_client, user, project):
        """POST with kind=studentreport should return HTTP 400."""
        api_client.force_authenticate(user=user)
        response = api_client.post(
            documents_urls.path("spawn"),
            {"kind": "studentreport", "project": project.pk},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
