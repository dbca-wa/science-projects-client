"""
Additional coverage tests for business area views — targeting uncovered
image handling, division assignment, and edge case paths in
BusinessAreas.post and BusinessAreaDetail.put.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import (
    AgencyFactory,
    BusinessAreaFactory,
    DivisionFactory,
    UserFactory,
)
from common.tests.test_helpers import agencies_urls


@pytest.fixture
def api_client():
    """Provide API client for view tests"""
    return APIClient()


class TestBusinessAreasPostCoverage:
    """Additional coverage for BusinessAreas.post — division and image paths"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_with_division(self, api_client):
        """POST with division_id assigns the division"""
        user = UserFactory()
        agency = AgencyFactory()
        division = DivisionFactory()

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas"),
            {
                "name": "BA with Division",
                "agency": agency.pk,
                "division": division.pk,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_with_invalid_image_url(self, api_client):
        """POST with an image URL that doesn't end in a valid extension returns 400"""
        user = UserFactory()
        agency = AgencyFactory()

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas"),
            {
                "name": "BA with bad image",
                "agency": agency.pk,
                "image": "https://example.com/image.gif",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_with_all_user_fields(self, api_client):
        """POST with leader, finance_admin, data_custodian"""
        user = UserFactory()
        leader = UserFactory()
        finance = UserFactory()
        custodian = UserFactory()
        agency = AgencyFactory()

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas"),
            {
                "name": "Full BA",
                "agency": agency.pk,
                "leader": leader.pk,
                "finance_admin": finance.pk,
                "data_custodian": custodian.pk,
                "focus": "Test focus",
                "introduction": "Test intro",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_list_returns_403(self, api_client):
        """Unauthenticated GET on business areas returns 403"""
        response = api_client.get(agencies_urls.path("business_areas"))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_create_returns_403(self, api_client):
        """Unauthenticated POST on business areas returns 403"""
        response = api_client.post(
            agencies_urls.path("business_areas"),
            {"name": "Test"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestBusinessAreaDetailPutCoverage:
    """Additional coverage for BusinessAreaDetail.put — image deletion,
    leader=0, division update paths"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_with_division(self, api_client):
        """PUT with division_id updates the division"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        division = DivisionFactory()

        api_client.force_authenticate(user=user)
        response = api_client.put(
            agencies_urls.path("business_areas", ba.pk),
            {"name": ba.name, "division": division.pk},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_leader_to_zero_clears_leader(self, api_client):
        """PUT with leader=0 clears the leader"""
        user = UserFactory()
        leader = UserFactory()
        ba = BusinessAreaFactory(leader=leader)

        api_client.force_authenticate(user=user)
        response = api_client.put(
            agencies_urls.path("business_areas", ba.pk),
            {"name": ba.name, "leader": 0},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_with_image_delete(self, api_client):
        """PUT with selectedImageUrl='delete' removes the photo"""
        from medias.models import BusinessAreaPhoto

        user = UserFactory()
        ba = BusinessAreaFactory()

        # Insert photo record directly to avoid file validation
        BusinessAreaPhoto.objects.bulk_create(
            [BusinessAreaPhoto(business_area=ba, uploader=user)]
        )

        api_client.force_authenticate(user=user)
        response = api_client.put(
            agencies_urls.path("business_areas", ba.pk),
            {"name": ba.name, "selectedImageUrl": "delete"},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        assert not BusinessAreaPhoto.objects.filter(business_area=ba).exists()

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_with_invalid_image_url(self, api_client):
        """PUT with an image URL that doesn't end in a valid extension returns 400"""
        user = UserFactory()
        ba = BusinessAreaFactory()

        api_client.force_authenticate(user=user)
        response = api_client.put(
            agencies_urls.path("business_areas", ba.pk),
            {"name": ba.name, "image": "https://example.com/image.bmp"},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_with_slug(self, api_client):
        """PUT with slug updates the slug"""
        user = UserFactory()
        ba = BusinessAreaFactory()

        api_client.force_authenticate(user=user)
        response = api_client.put(
            agencies_urls.path("business_areas", ba.pk),
            {"name": ba.name, "slug": "new-slug"},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_get_returns_403(self, api_client):
        """Unauthenticated GET on business area detail returns 403"""
        ba = BusinessAreaFactory()
        response = api_client.get(agencies_urls.path("business_areas", ba.pk))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_delete_returns_403(self, api_client):
        """Unauthenticated DELETE on business area detail returns 403"""
        ba = BusinessAreaFactory()
        response = api_client.delete(agencies_urls.path("business_areas", ba.pk))
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestSetBusinessAreaActiveCoverage:
    """Additional coverage for SetBusinessAreaActive view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_toggle_active_status(self, api_client):
        """POST toggles the active status"""
        user = UserFactory()
        ba = BusinessAreaFactory(is_active=True)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas", "setactive", ba.pk),
        )

        assert response.status_code == status.HTTP_202_ACCEPTED

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_toggle_nonexistent_ba_returns_404(self, api_client):
        """POST on non-existent BA returns 404"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas", "setactive", 99999),
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
