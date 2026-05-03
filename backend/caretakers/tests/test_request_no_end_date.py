"""
Tests verifying end_date has been removed from the caretaker request flow.

The end_date field was removed from AdminTask (migration 0013) and Caretaker
(migration 0003). These tests confirm the service and view layers no longer
reference end_date.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from adminoptions.models import AdminTask
from caretakers.services.request_service import CaretakerRequestService
from common.tests.factories import UserFactory
from common.tests.test_helpers import caretakers_urls


@pytest.fixture
def api_client():
    """Provide API client"""
    return APIClient()


class TestCreateRequestWithoutEndDate:
    """Verify caretaker requests work without end_date"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_request_succeeds_without_end_date(self, db):
        """Creating a caretaker request without end_date should succeed (no TypeError)"""
        # Arrange
        requester = UserFactory(username="requester", is_superuser=True)
        user = UserFactory(username="target_user")
        caretaker = UserFactory(username="caretaker_user")

        # Act
        task = CaretakerRequestService.create_request(
            requester=requester,
            user_id=user.pk,
            caretaker_id=caretaker.pk,
            reason="Test caretaker request",
            notes="No end_date needed",
        )

        # Assert
        assert task is not None
        assert task.pk is not None
        assert task.action == AdminTask.ActionTypes.SETCARETAKER
        assert task.status == AdminTask.TaskStatus.PENDING
        assert task.requester == requester
        assert task.primary_user == user
        assert task.secondary_users == [caretaker.pk]
        assert task.reason == "Test caretaker request"
        assert task.notes == "No end_date needed"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_request_rejects_end_date_kwarg(self, db):
        """create_request() should not accept end_date as a keyword argument"""
        # Arrange
        requester = UserFactory(username="requester2", is_superuser=True)
        user = UserFactory(username="target_user2")
        caretaker = UserFactory(username="caretaker_user2")

        # Act & Assert — passing end_date should raise TypeError
        with pytest.raises(TypeError):
            CaretakerRequestService.create_request(
                requester=requester,
                user_id=user.pk,
                caretaker_id=caretaker.pk,
                reason="Test",
                end_date="2026-12-31",
            )

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_request_via_api_without_end_date(self, api_client, db):
        """POST to caretaker request create endpoint succeeds without end_date"""
        # Arrange
        requester = UserFactory(username="api_requester", is_superuser=True)
        user = UserFactory(username="api_target")
        caretaker = UserFactory(username="api_caretaker")
        api_client.force_authenticate(user=requester)

        data = {
            "user_id": user.pk,
            "caretaker_id": caretaker.pk,
            "reason": "API test without end_date",
        }

        # Act
        response = api_client.post(
            caretakers_urls.path("requests", "create"),
            data,
            format="json",
        )

        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert "task_id" in response.data

        # Verify the AdminTask was created correctly
        task = AdminTask.objects.get(pk=response.data["task_id"])
        assert task.action == AdminTask.ActionTypes.SETCARETAKER
        assert task.status == AdminTask.TaskStatus.PENDING
