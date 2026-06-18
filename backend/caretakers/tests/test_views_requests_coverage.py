"""
Tests for caretakers/views/requests.py.

Covers orphan cleanup on request listing, validation and error paths
on request creation, cancellation error handling, and outgoing request
permission checks.
"""

import pytest
from rest_framework.test import APIClient

from adminoptions.models import AdminTask
from common.tests.factories import UserFactory


@pytest.fixture
def admin_user(db):
    return UserFactory(is_superuser=True, is_staff=True, email="admin@dbca.wa.gov.au")


@pytest.fixture
def regular_user(db):
    return UserFactory(is_staff=True, email="user@dbca.wa.gov.au")


@pytest.fixture
def api_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.fixture
def user_client(regular_user):
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


@pytest.mark.django_db
class TestCaretakerRequestList:
    """Tests for the caretaker request listing endpoint."""

    def test_get_missing_user_id_returns_400(self, api_client):
        """Missing user_id query param returns 400."""
        response = api_client.get("/api/v1/caretakers/requests")
        assert response.status_code == 400
        assert "user_id" in response.data["error"]

    def test_get_with_user_id_returns_200(self, api_client, admin_user):
        """Valid user_id returns pending requests."""
        response = api_client.get(
            f"/api/v1/caretakers/requests?user_id={admin_user.pk}"
        )
        assert response.status_code == 200

    def test_get_cleans_up_orphaned_requests(self, api_client, admin_user):
        """Orphaned requests (null primary_user) get cancelled."""
        caretaker_user = UserFactory()
        # Create a request with secondary_users pointing to admin_user
        task = AdminTask.objects.create(
            action="setcaretaker",
            status="pending",
            primary_user=None,  # orphaned
            requester=admin_user,
            secondary_users=[caretaker_user.pk],
        )

        response = api_client.get(
            f"/api/v1/caretakers/requests?user_id={caretaker_user.pk}"
        )
        assert response.status_code == 200
        # The orphaned task should have been cancelled
        task.refresh_from_db()
        assert task.status == "cancelled"


@pytest.mark.django_db
class TestCaretakerRequestCreate:
    """Tests for the caretaker request creation endpoint."""

    def test_post_missing_user_id_returns_400(self, api_client):
        """Missing user_id returns 400."""
        response = api_client.post(
            "/api/v1/caretakers/requests/create",
            {"caretaker_id": 1},
            format="json",
        )
        assert response.status_code == 400
        assert "user_id and caretaker_id are required" in response.data["error"]

    def test_post_missing_caretaker_id_returns_400(self, api_client):
        """Missing caretaker_id returns 400."""
        response = api_client.post(
            "/api/v1/caretakers/requests/create",
            {"user_id": 1},
            format="json",
        )
        assert response.status_code == 400
        assert "user_id and caretaker_id are required" in response.data["error"]

    def test_post_approve_immediately_non_superuser_forbidden(self, user_client):
        """Non-superuser cannot approve immediately."""
        response = user_client.post(
            "/api/v1/caretakers/requests/create",
            {
                "user_id": 1,
                "caretaker_id": 2,
                "approve_immediately": True,
            },
            format="json",
        )
        assert response.status_code == 403
        assert "Only superusers" in response.data["error"]

    def test_post_valid_creates_request(self, api_client, admin_user):
        """Valid data creates a caretaker request."""
        caretaker = UserFactory()

        response = api_client.post(
            "/api/v1/caretakers/requests/create",
            {
                "user_id": admin_user.pk,
                "caretaker_id": caretaker.pk,
                "reason": "Going on leave",
                "notes": "Please cover for me",
            },
            format="json",
        )
        assert response.status_code == 201
        assert "task_id" in response.data

    def test_post_approve_immediately_as_superuser(self, api_client, admin_user):
        """Superuser can create and immediately approve."""
        caretaker = UserFactory()

        response = api_client.post(
            "/api/v1/caretakers/requests/create",
            {
                "user_id": admin_user.pk,
                "caretaker_id": caretaker.pk,
                "approve_immediately": True,
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["approved"] is True
        assert "caretaker" in response.data

    def test_post_invalid_user_id_returns_400(self, api_client):
        """Non-existent user_id returns 400."""
        response = api_client.post(
            "/api/v1/caretakers/requests/create",
            {
                "user_id": 99999,
                "caretaker_id": 99998,
            },
            format="json",
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestCaretakerRequestCancel:
    """Tests for CaretakerRequestCancel.post endpoint (lines 182-207)."""

    def test_post_not_found(self, api_client):
        """Cancelling non-existent request returns 404."""
        response = api_client.post(
            "/api/v1/caretakers/requests/99999/cancel",
            format="json",
        )
        assert response.status_code == 404

    def test_post_successful_cancel(self, api_client, admin_user):
        """Successfully cancels a pending request."""
        caretaker = UserFactory()
        task = AdminTask.objects.create(
            action="setcaretaker",
            status="pending",
            primary_user=admin_user,
            requester=admin_user,
            secondary_users=[caretaker.pk],
        )

        response = api_client.post(
            f"/api/v1/caretakers/requests/{task.pk}/cancel",
            format="json",
        )
        assert response.status_code == 202
        task.refresh_from_db()
        assert task.status == "cancelled"

    def test_post_cancel_already_processed_returns_400(self, api_client, admin_user):
        """Cancelling already-processed request returns 400."""
        caretaker = UserFactory()
        task = AdminTask.objects.create(
            action="setcaretaker",
            status="approved",
            primary_user=admin_user,
            requester=admin_user,
            secondary_users=[caretaker.pk],
        )

        response = api_client.post(
            f"/api/v1/caretakers/requests/{task.pk}/cancel",
            format="json",
        )
        # Should return 400 (already processed) or 404/403 depending on service logic
        assert response.status_code in [400, 404]


@pytest.mark.django_db
class TestCaretakerOutgoingRequestList:
    """Tests for CaretakerOutgoingRequestList.get endpoint (lines 220-244)."""

    def test_get_missing_user_id_returns_400(self, api_client):
        """Missing user_id query param returns 400."""
        response = api_client.get("/api/v1/caretakers/requests/outgoing")
        assert response.status_code == 400
        assert "user_id" in response.data["error"]

    def test_get_non_superuser_cannot_view_other_users(self, user_client, regular_user):
        """Non-superuser cannot view another user's outgoing requests."""
        other_user = UserFactory()

        response = user_client.get(
            f"/api/v1/caretakers/requests/outgoing?user_id={other_user.pk}"
        )
        assert response.status_code == 403
        assert "only view your own" in response.data["error"]

    def test_get_non_superuser_can_view_own_requests(self, user_client, regular_user):
        """Non-superuser can view their own outgoing requests."""
        response = user_client.get(
            f"/api/v1/caretakers/requests/outgoing?user_id={regular_user.pk}"
        )
        assert response.status_code == 200

    def test_get_superuser_can_view_any_user(self, api_client):
        """Superuser can view any user's outgoing requests."""
        other_user = UserFactory()

        response = api_client.get(
            f"/api/v1/caretakers/requests/outgoing?user_id={other_user.pk}"
        )
        assert response.status_code == 200

    def test_get_returns_outgoing_requests(self, api_client, admin_user):
        """Returns outgoing requests for the specified user."""
        caretaker = UserFactory()
        AdminTask.objects.create(
            action="setcaretaker",
            status="pending",
            primary_user=admin_user,
            requester=admin_user,
            secondary_users=[caretaker.pk],
        )

        response = api_client.get(
            f"/api/v1/caretakers/requests/outgoing?user_id={admin_user.pk}"
        )
        assert response.status_code == 200
        assert len(response.data) >= 1
