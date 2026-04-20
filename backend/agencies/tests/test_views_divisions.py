"""
Tests for division views: DivisionDetail (PUT, DELETE) and DivisionEmailList
(GET, POST) including key stakeholder and approvers management.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import DivisionFactory, UserFactory
from common.tests.test_helpers import agencies_urls


@pytest.fixture
def api_client():
    """Provide API client for view tests"""
    return APIClient()


class TestDivisionEmailList:
    """Tests for DivisionEmailList view — manage directorate email list,
    key stakeholder, and approvers."""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_returns_division_data(self, api_client):
        """GET returns the division serialised data"""
        user = UserFactory()
        division = DivisionFactory(director=user, approver=user)

        api_client.force_authenticate(user=user)
        response = api_client.get(
            agencies_urls.path("divisions", division.pk, "email_list"),
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == division.name

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_updates_users_list(self, api_client):
        """POST with usersList sets the directorate email list"""
        user = UserFactory()
        member1 = UserFactory()
        member2 = UserFactory()
        division = DivisionFactory(director=user, approver=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("divisions", division.pk, "email_list"),
            {"usersList": [member1.pk, member2.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        division.refresh_from_db()
        email_list_pks = set(
            division.directorate_email_list.values_list("pk", flat=True)
        )
        assert email_list_pks == {member1.pk, member2.pk}

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_users_list_with_invalid_user(self, api_client):
        """POST with a non-existent user pk returns 400"""
        user = UserFactory()
        division = DivisionFactory(director=user, approver=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("divisions", division.pk, "email_list"),
            {"usersList": [99999]},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_sets_key_stakeholder(self, api_client):
        """POST with keyStakeholder sets the key stakeholder"""
        user = UserFactory()
        staff_user = UserFactory(is_staff=True)
        division = DivisionFactory(director=user, approver=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("divisions", division.pk, "email_list"),
            {"keyStakeholder": staff_user.pk},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        division.refresh_from_db()
        assert division.key_stakeholder == staff_user

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_clears_key_stakeholder(self, api_client):
        """POST with keyStakeholder=None clears the key stakeholder"""
        user = UserFactory()
        staff_user = UserFactory(is_staff=True)
        division = DivisionFactory(
            director=user, approver=user, key_stakeholder=staff_user
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("divisions", division.pk, "email_list"),
            {"keyStakeholder": None},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        division.refresh_from_db()
        assert division.key_stakeholder is None

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_key_stakeholder_non_staff_rejected(self, api_client):
        """POST with a non-staff keyStakeholder returns 400"""
        user = UserFactory()
        non_staff = UserFactory(is_staff=False)
        division = DivisionFactory(director=user, approver=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("divisions", division.pk, "email_list"),
            {"keyStakeholder": non_staff.pk},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "staff" in response.data["error"].lower()

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_key_stakeholder_not_found(self, api_client):
        """POST with non-existent keyStakeholder pk returns 400"""
        user = UserFactory()
        division = DivisionFactory(director=user, approver=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("divisions", division.pk, "email_list"),
            {"keyStakeholder": 99999},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_sets_approvers(self, api_client):
        """POST with approversList sets the approvers"""
        user = UserFactory()
        approver1 = UserFactory(is_staff=True)
        approver2 = UserFactory(is_staff=True)
        division = DivisionFactory(director=user, approver=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("divisions", division.pk, "email_list"),
            {"approversList": [approver1.pk, approver2.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        division.refresh_from_db()
        approver_pks = set(division.approvers.values_list("pk", flat=True))
        assert approver_pks == {approver1.pk, approver2.pk}

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_approvers_non_staff_rejected(self, api_client):
        """POST with a non-staff approver returns 400"""
        user = UserFactory()
        non_staff = UserFactory(is_staff=False)
        division = DivisionFactory(director=user, approver=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("divisions", division.pk, "email_list"),
            {"approversList": [non_staff.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "staff" in response.data["error"].lower()

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_approvers_not_found(self, api_client):
        """POST with non-existent approver pk returns 400"""
        user = UserFactory()
        division = DivisionFactory(director=user, approver=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("divisions", division.pk, "email_list"),
            {"approversList": [99999]},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_not_found_division(self, api_client):
        """GET for non-existent division returns 404"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(
            agencies_urls.path("divisions", 99999, "email_list"),
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestDepartmentalServices:
    """Tests for DepartmentalServices view — list and create"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_services(self, api_client):
        """GET returns all departmental services"""
        from agencies.models import DepartmentalService

        user = UserFactory()
        DepartmentalService.objects.create(name="Test Service", director=user)

        api_client.force_authenticate(user=user)
        response = api_client.get(agencies_urls.path("services"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_service(self, api_client):
        """POST creates a new departmental service"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("services"),
            {"name": "New Service"},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "New Service"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_service_invalid(self, api_client):
        """POST with invalid data returns 400"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("services"),
            {},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestDepartmentalServiceDetail:
    """Tests for DepartmentalServiceDetail view — get, update, delete"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_service(self, api_client):
        """GET returns service detail"""
        from agencies.models import DepartmentalService

        user = UserFactory()
        service = DepartmentalService.objects.create(name="Test Service", director=user)

        api_client.force_authenticate(user=user)
        response = api_client.get(agencies_urls.path("services", service.pk))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Test Service"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_service(self, api_client):
        """PUT updates a departmental service"""
        from agencies.models import DepartmentalService

        user = UserFactory()
        service = DepartmentalService.objects.create(name="Old Name", director=user)

        api_client.force_authenticate(user=user)
        response = api_client.put(
            agencies_urls.path("services", service.pk),
            {"name": "Updated Name"},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        assert response.data["name"] == "Updated Name"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_delete_service(self, api_client):
        """DELETE removes a departmental service"""
        from agencies.models import DepartmentalService

        user = UserFactory()
        service = DepartmentalService.objects.create(name="To Delete", director=user)
        service_pk = service.pk

        api_client.force_authenticate(user=user)
        response = api_client.delete(agencies_urls.path("services", service_pk))

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not DepartmentalService.objects.filter(pk=service_pk).exists()

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_service_not_found(self, api_client):
        """GET for non-existent service returns 404"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(agencies_urls.path("services", 99999))

        assert response.status_code == status.HTTP_404_NOT_FOUND
