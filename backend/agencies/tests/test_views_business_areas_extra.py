"""
Integration tests for agencies/views/business_areas.py — targeting 67 missed lines.
Covers create, update, image upload, delete, problematic projects, and error paths.
"""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from common.tests.factories import (
    BusinessAreaFactory,
    DivisionFactory,
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
def agency(db):
    from agencies.models import Agency

    return Agency.objects.create(name="Test Agency")


@pytest.fixture
def division(db):
    return DivisionFactory()


@pytest.fixture
def business_area(db, agency, division, admin_user):
    return BusinessAreaFactory(
        agency=agency,
        division=division,
        leader=admin_user,
    )


# ===========================================================================
# BusinessAreas (list + create) tests
# ===========================================================================


class TestBusinessAreasCreate:
    """Cover lines 53-67 (handle_ba_image), 108-110 (image URL validation),
    119-124 (serializer invalid)."""

    @pytest.mark.integration
    def test_create_business_area_success(self, api_client, admin_user, agency):
        api_client.force_authenticate(user=admin_user)
        data = {
            "agency": agency.pk,
            "name": "New BA",
            "focus": "Testing",
            "introduction": "Test intro",
            "leader": admin_user.pk,
        }
        response = api_client.post(
            "/api/v1/agencies/business_areas", data=data, format="json"
        )
        assert response.status_code == 201
        assert response.data["name"] == "New BA"

    @pytest.mark.integration
    def test_create_with_invalid_image_url(self, api_client, admin_user, agency):
        """Cover line 108-110: URL not a valid photo file."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "agency": agency.pk,
            "name": "BA with bad URL",
            "focus": "Focus",
            "introduction": "Intro",
            "leader": admin_user.pk,
            "image": "https://example.com/notanimage.exe",
        }
        response = api_client.post(
            "/api/v1/agencies/business_areas", data=data, format="json"
        )
        assert response.status_code == 400

    @pytest.mark.integration
    def test_create_with_invalid_data(self, api_client, admin_user):
        """Cover line 119-124: serializer invalid (missing required fields)."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "name": "",  # Empty name should fail
        }
        response = api_client.post(
            "/api/v1/agencies/business_areas", data=data, format="json"
        )
        assert response.status_code == 400

    @pytest.mark.integration
    def test_create_with_file_image(self, api_client, admin_user, agency):
        """Cover lines 53-67: handle_ba_image with actual file upload."""
        api_client.force_authenticate(user=admin_user)
        image = SimpleUploadedFile(
            "test.jpg", b"\xff\xd8\xff\xe0" + b"\x00" * 100, content_type="image/jpeg"
        )
        data = {
            "agency": agency.pk,
            "name": "BA with image",
            "focus": "Focus",
            "introduction": "Intro",
            "leader": admin_user.pk,
            "image": image,
        }
        response = api_client.post(
            "/api/v1/agencies/business_areas", data=data, format="multipart"
        )
        assert response.status_code == 201

    @pytest.mark.integration
    def test_create_with_division(self, api_client, admin_user, agency, division):
        api_client.force_authenticate(user=admin_user)
        data = {
            "agency": agency.pk,
            "name": "BA with Division",
            "focus": "Focus",
            "introduction": "Intro",
            "leader": admin_user.pk,
            "division": division.pk,
        }
        response = api_client.post(
            "/api/v1/agencies/business_areas", data=data, format="json"
        )
        assert response.status_code == 201


# ===========================================================================
# BusinessAreaDetail (get, update, delete) tests
# ===========================================================================


class TestBusinessAreaDetail:
    """Cover lines 154-168 (handle_ba_image update), 222-223 (delete selected image),
    232-243 (update logic), 261 (serializer valid save), 271 (update image)."""

    @pytest.mark.integration
    def test_get_business_area(self, api_client, admin_user, business_area):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(f"/api/v1/agencies/business_areas/{business_area.pk}")
        assert response.status_code == 200

    @pytest.mark.integration
    def test_update_business_area(self, api_client, admin_user, business_area):
        """Cover lines 232-243: PUT update with partial data."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "name": "Updated Name",
            "focus": "Updated focus",
            "agency": business_area.agency.pk,
        }
        response = api_client.put(
            f"/api/v1/agencies/business_areas/{business_area.pk}",
            data=data,
            format="json",
        )
        assert response.status_code == 202
        assert response.data["name"] == "Updated Name"

    @pytest.mark.integration
    def test_update_with_leader_zero_clears_leader(
        self, api_client, admin_user, business_area
    ):
        """Cover leader = 0 path which sets leader to None."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "name": business_area.name,
            "agency": business_area.agency.pk,
            "leader": "0",
        }
        response = api_client.put(
            f"/api/v1/agencies/business_areas/{business_area.pk}",
            data=data,
            format="json",
        )
        assert response.status_code == 202

    @pytest.mark.integration
    def test_update_with_image_url_invalid(self, api_client, admin_user, business_area):
        """Cover image URL validation on update."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "name": business_area.name,
            "agency": business_area.agency.pk,
            "image": "https://example.com/bad.gif",
        }
        response = api_client.put(
            f"/api/v1/agencies/business_areas/{business_area.pk}",
            data=data,
            format="json",
        )
        assert response.status_code == 400

    @pytest.mark.integration
    def test_update_with_selected_image_url_delete(
        self, api_client, admin_user, business_area
    ):
        """Cover line 222-223: selectedImageUrl=delete removes photo."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "name": business_area.name,
            "agency": business_area.agency.pk,
            "selectedImageUrl": "delete",
        }
        response = api_client.put(
            f"/api/v1/agencies/business_areas/{business_area.pk}",
            data=data,
            format="json",
        )
        assert response.status_code == 202

    @pytest.mark.integration
    def test_delete_business_area(self, api_client, admin_user, business_area):
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(
            f"/api/v1/agencies/business_areas/{business_area.pk}"
        )
        assert response.status_code == 204

    @pytest.mark.integration
    def test_patch_delegates_to_put(self, api_client, admin_user, business_area):
        """PATCH should work same as PUT."""
        api_client.force_authenticate(user=admin_user)
        data = {
            "name": "Patched Name",
            "agency": business_area.agency.pk,
        }
        response = api_client.patch(
            f"/api/v1/agencies/business_areas/{business_area.pk}",
            data=data,
            format="json",
        )
        assert response.status_code == 202


# ===========================================================================
# MyBusinessAreas tests
# ===========================================================================


class TestMyBusinessAreas:
    """Cover lines 292-296: superuser gets all, regular user gets own."""

    @pytest.mark.integration
    def test_superuser_gets_all(self, api_client, admin_user, business_area):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/agencies/business_areas/mine")
        assert response.status_code == 200

    @pytest.mark.integration
    def test_regular_user_gets_own(self, api_client, regular_user, business_area):
        api_client.force_authenticate(user=regular_user)
        response = api_client.get("/api/v1/agencies/business_areas/mine")
        assert response.status_code == 200
        # Regular user isn't leader of the business_area, so empty
        assert len(response.data) == 0


# ===========================================================================
# BusinessAreasProblematicProjects tests
# ===========================================================================


class TestBusinessAreasProblematicProjects:
    """Cover lines 342, 390-397, 434-439, 482-484, 511-513, 530-532."""

    @pytest.mark.integration
    def test_get_problematic_projects_requires_param(self, api_client, admin_user):
        """Cover missing business_area_id error."""
        api_client.force_authenticate(user=admin_user)
        response = api_client.get(
            "/api/v1/agencies/business_areas/problematic_projects"
        )
        assert response.status_code == 400
        assert "business_area_id" in response.data.get("error", "")

    @pytest.mark.integration
    def test_get_problematic_projects_success(
        self, api_client, admin_user, business_area
    ):
        api_client.force_authenticate(user=admin_user)
        # Create a memberless project
        from projects.models import Project

        Project.objects.create(
            title="Memberless Project",
            status="active",
            business_area=business_area,
            kind="science",
        )

        response = api_client.get(
            f"/api/v1/agencies/business_areas/problematic_projects?business_area_id={business_area.pk}"
        )
        assert response.status_code == 200
        assert "no_members" in response.data

    @pytest.mark.integration
    def test_post_problematic_projects(self, api_client, admin_user, business_area):
        api_client.force_authenticate(user=admin_user)
        data = {"baArray": [business_area.pk]}
        response = api_client.post(
            "/api/v1/agencies/business_areas/problematic_projects",
            data=data,
            format="json",
        )
        assert response.status_code == 200


# ===========================================================================
# SetBusinessAreaActive tests
# ===========================================================================


class TestSetBusinessAreaActive:
    """Cover line 530-532: toggle active status."""

    @pytest.mark.integration
    def test_toggle_active_status(self, api_client, admin_user, business_area):
        api_client.force_authenticate(user=admin_user)
        response = api_client.post(
            f"/api/v1/agencies/business_areas/setactive/{business_area.pk}"
        )
        assert response.status_code == 202
