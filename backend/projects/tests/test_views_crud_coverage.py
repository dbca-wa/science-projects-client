"""
Integration tests for projects/views/crud.py — targeting 38 missed lines.
Covers project create/update/detail error paths.
"""

import pytest
from rest_framework.test import APIClient

from common.tests.factories import (
    BusinessAreaFactory,
    ProjectFactory,
    UserFactory,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return UserFactory(is_staff=True, is_superuser=True)


@pytest.fixture
def regular_user(db):
    return UserFactory(is_staff=True)


@pytest.fixture
def business_area(db):
    return BusinessAreaFactory()


@pytest.fixture
def project(db, business_area, admin_user):
    p = ProjectFactory(
        business_area=business_area,
        members=[admin_user],
        members__leader=admin_user,
    )
    # Ensure ProjectArea exists (required by ProjectSerializer.get_areas)
    from projects.models import ProjectArea

    ProjectArea.objects.get_or_create(project=p, defaults={"areas": []})
    return p


# ===========================================================================
# Projects POST (create) tests
# ===========================================================================


class TestProjectCreate:
    """Cover lines 104-105 (date parsing), 133-142 (serializer invalid),
    157 (image error), 170 (area invalid), 184 (member invalid),
    197 (detail invalid), 215 (student detail), 237-241 (external detail)."""

    @pytest.mark.integration
    def test_create_project_minimal(self, api_client, admin_user, business_area):
        """Create with minimal data — covers serializer valid path."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "kind": "external",
            "title": "Test Project Create",
            "description": "A test project",
            "businessArea": business_area.pk,
            "projectLead": str(admin_user.pk),
            "creator": str(admin_user.pk),
            "dataCustodian": str(admin_user.pk),
            "keywords": "",
            "year": "2024",
        }
        response = api_client.post("/api/v1/projects/list", data=data)
        assert (
            response.status_code == 201
        ), f"Got {response.status_code}: {response.data}"

    @pytest.mark.integration
    def test_create_project_with_dates(self, api_client, admin_user, business_area):
        """Cover lines 104-105: date parsing."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "kind": "external",
            "title": "Dated Project",
            "description": "desc",
            "businessArea": business_area.pk,
            "projectLead": str(admin_user.pk),
            "creator": str(admin_user.pk),
            "dataCustodian": str(admin_user.pk),
            "keywords": '["keyword1","keyword2"]',
            "startDate": "2024-01-01T00:00:00.000Z",
            "endDate": "2025-12-31T00:00:00.000Z",
            "year": "2024",
        }
        response = api_client.post("/api/v1/projects/list", data=data)
        assert response.status_code == 201

    @pytest.mark.integration
    def test_create_project_invalid_data(self, api_client, admin_user):
        """Cover lines 133-142: serializer invalid."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "kind": "",
            "title": "",
            "projectLead": str(admin_user.pk),
            "creator": str(admin_user.pk),
            "keywords": "",
        }
        response = api_client.post("/api/v1/projects/list", data=data)
        assert response.status_code == 400

    @pytest.mark.integration
    def test_create_student_project(self, api_client, admin_user, business_area):
        """Cover line 215: student project detail creation."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "kind": "student",
            "title": "Student Project Create",
            "description": "student desc",
            "businessArea": business_area.pk,
            "projectLead": str(admin_user.pk),
            "creator": str(admin_user.pk),
            "dataCustodian": str(admin_user.pk),
            "keywords": "",
            "organisation": "UWA",
            "level": "phd",
            "year": "2024",
        }
        response = api_client.post("/api/v1/projects/list", data=data)
        assert response.status_code == 201

    @pytest.mark.integration
    def test_create_external_project(self, api_client, admin_user, business_area):
        """Cover lines 237-241: external project detail creation."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "kind": "external",
            "title": "External Project Create",
            "description": "ext desc",
            "businessArea": business_area.pk,
            "projectLead": str(admin_user.pk),
            "creator": str(admin_user.pk),
            "dataCustodian": str(admin_user.pk),
            "keywords": "",
            "externalDescription": "External desc",
            "aims": "Some aims",
            "budget": "50000",
            "collaborationWith": "CSIRO",
            "year": "2024",
        }
        response = api_client.post("/api/v1/projects/list", data=data)
        assert response.status_code == 201

    @pytest.mark.integration
    def test_create_project_invalid_year(self, api_client, admin_user, business_area):
        """Cover year parsing error path — year becomes None, serializer rejects it."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "kind": "external",
            "title": "Bad Year Project",
            "description": "desc",
            "businessArea": business_area.pk,
            "projectLead": str(admin_user.pk),
            "creator": str(admin_user.pk),
            "dataCustodian": str(admin_user.pk),
            "keywords": "",
            "year": "notayear",
        }
        response = api_client.post("/api/v1/projects/list", data=data)
        # Year becomes None after parse error, which triggers serializer validation error
        assert response.status_code == 400


# ===========================================================================
# ProjectDetails GET tests
# ===========================================================================


class TestProjectDetailGet:
    """Cover lines 292, 299, 306, 339, 348, 377: detail retrieval paths."""

    @pytest.mark.integration
    def test_get_project_detail(self, api_client, admin_user, project):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(f"/api/v1/projects/{project.pk}")
        assert response.status_code == 200
        assert "project" in response.data
        assert "details" in response.data
        assert "documents" in response.data
        assert "members" in response.data

    @pytest.mark.integration
    def test_get_nonexistent_project(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/projects/99999")
        assert response.status_code == 404


# ===========================================================================
# ProjectDetails PATCH/PUT tests
# ===========================================================================


class TestProjectDetailUpdate:
    """Cover lines 407-439 (patch update), 449 (put full update)."""

    @pytest.mark.integration
    def test_patch_project(self, api_client, admin_user, project):
        api_client.force_authenticate(user=admin_user)
        data = {"title": "Updated Title Via Patch"}
        response = api_client.patch(
            f"/api/v1/projects/{project.pk}", data=data, format="json"
        )
        assert response.status_code == 202
        assert response.data["title"] == "Updated Title Via Patch"

    @pytest.mark.integration
    def test_patch_project_invalid_data(self, api_client, admin_user, project):
        """Cover serializer validation error on patch."""
        api_client.force_authenticate(user=admin_user)
        # status field has max_length=50, sending >50 chars triggers error
        data = {"status": "x" * 100}
        response = api_client.patch(
            f"/api/v1/projects/{project.pk}", data=data, format="json"
        )
        assert response.status_code == 400

    @pytest.mark.integration
    def test_put_project(self, api_client, admin_user, project):
        api_client.force_authenticate(user=admin_user)
        data = {
            "title": "Full Update Title",
            "description": "Updated desc",
            "status": "active",
            "kind": "science",
        }
        response = api_client.put(
            f"/api/v1/projects/{project.pk}", data=data, format="json"
        )
        assert response.status_code == 202

    @pytest.mark.integration
    def test_delete_project(self, api_client, admin_user, project):
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f"/api/v1/projects/{project.pk}")
        assert response.status_code == 204

    @pytest.mark.integration
    def test_patch_unauthenticated(self, api_client, project):
        response = api_client.patch(
            f"/api/v1/projects/{project.pk}",
            data={"title": "hack"},
            format="json",
        )
        assert response.status_code in (401, 403)
