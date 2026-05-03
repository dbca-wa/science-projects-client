"""
Tests for merge task cancellation via the API endpoint.

Verifies that cancelling a merge task sets status to "cancelled"
and the secondary user is NOT deleted.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from adminoptions.models import AdminTask
from common.tests.factories import UserFactory

User = get_user_model()


@pytest.fixture
def superuser(db):
    """Superuser who can create admin tasks."""
    return UserFactory(is_staff=True, is_superuser=True)


@pytest.fixture
def primary_user(db):
    """Staff user who would receive merged data."""
    return UserFactory(is_staff=True)


@pytest.fixture
def secondary_user(db):
    """User who would be merged (and deleted on approval)."""
    return UserFactory(is_staff=False)


@pytest.fixture
def api_client():
    """DRF API client."""
    return APIClient()


@pytest.fixture
def merge_task(db, superuser, primary_user, secondary_user):
    """A pending merge task ready to be cancelled."""
    return AdminTask.objects.create(
        action=AdminTask.ActionTypes.MERGEUSER,
        status=AdminTask.TaskStatus.PENDING,
        primary_user=primary_user,
        secondary_users=[secondary_user.pk],
        requester=superuser,
        reason="Duplicate account",
    )


@pytest.mark.django_db
class TestMergeTaskCancellation:
    """Cancelling a merge task via POST to tasks/<pk>/cancel."""

    def test_cancel_sets_status_to_cancelled(self, api_client, superuser, merge_task):
        """Cancelling a merge task sets its status to 'cancelled'."""
        api_client.force_authenticate(user=superuser)
        response = api_client.post(f"/api/v1/adminoptions/tasks/{merge_task.pk}/cancel")

        assert response.status_code == 202
        merge_task.refresh_from_db()
        assert merge_task.status == AdminTask.TaskStatus.CANCELLED

    def test_cancel_does_not_delete_secondary_user(
        self, api_client, superuser, merge_task, secondary_user
    ):
        """Cancelling a merge task does NOT delete the secondary user."""
        secondary_pk = secondary_user.pk
        api_client.force_authenticate(user=superuser)
        api_client.post(f"/api/v1/adminoptions/tasks/{merge_task.pk}/cancel")

        assert User.objects.filter(pk=secondary_pk).exists()

    def test_cancel_does_not_delete_primary_user(
        self, api_client, superuser, merge_task, primary_user
    ):
        """Cancelling a merge task does NOT delete the primary user."""
        primary_pk = primary_user.pk
        api_client.force_authenticate(user=superuser)
        api_client.post(f"/api/v1/adminoptions/tasks/{merge_task.pk}/cancel")

        assert User.objects.filter(pk=primary_pk).exists()

    def test_requester_can_cancel_own_task(self, api_client, superuser, merge_task):
        """The requester (authenticated user) can cancel their own merge task."""
        api_client.force_authenticate(user=superuser)
        response = api_client.post(f"/api/v1/adminoptions/tasks/{merge_task.pk}/cancel")

        assert response.status_code == 202
        merge_task.refresh_from_db()
        assert merge_task.status == AdminTask.TaskStatus.CANCELLED
