"""
Tests for the NewCycleDraft API endpoint.

Covers:
- GET: Load draft (empty, with data)
- POST: Save draft (superuser, non-superuser, missing data)
- DELETE: Clear draft (superuser, non-superuser)
- Persistence: saved data is retrievable
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from adminoptions.models import AdminOptions
from common.tests.factories import UserFactory


@pytest.fixture
def superuser(db):
    return UserFactory(
        username="superadmin",
        email="superadmin@dbca.wa.gov.au",
        is_superuser=True,
        is_staff=True,
    )


@pytest.fixture
def regular_user(db):
    return UserFactory(
        username="regular",
        email="regular@dbca.wa.gov.au",
        is_superuser=False,
        is_staff=True,
    )


@pytest.fixture
def admin_options(db):
    return AdminOptions.objects.create()


DRAFT_URL = "/api/v1/adminoptions/new-cycle-draft"

SAMPLE_DRAFT = {
    "prepopulateMode": "all",
    "inclusionMode": "include",
    "sendBaLeads": True,
    "sendProjectLeads": True,
    "sendTeamMembers": False,
    "customMessageEnabled": True,
    "perGroupEnabled": False,
    "customMessage": "<p>Please update your reports.</p>",
}


class TestNewCycleDraftGet:
    """Tests for GET /api/v1/adminoptions/new-cycle-draft"""

    @pytest.mark.integration
    def test_requires_authentication(self, db, admin_options):
        """Unauthenticated request should be rejected."""
        client = APIClient()
        response = client.get(DRAFT_URL)
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    @pytest.mark.integration
    def test_returns_null_when_no_draft(self, superuser, admin_options):
        """Should return null draft when nothing has been saved."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get(DRAFT_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["draft"] is None

    @pytest.mark.integration
    def test_returns_saved_draft(self, superuser, admin_options):
        """Should return the saved draft data."""
        admin_options.new_cycle_draft = SAMPLE_DRAFT
        admin_options.save()

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.get(DRAFT_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["draft"]["prepopulateMode"] == "all"
        assert response.data["draft"]["sendBaLeads"] is True
        assert (
            response.data["draft"]["customMessage"]
            == "<p>Please update your reports.</p>"
        )

    @pytest.mark.integration
    def test_regular_user_can_read(self, regular_user, admin_options):
        """Non-superusers should be able to read the draft."""
        admin_options.new_cycle_draft = SAMPLE_DRAFT
        admin_options.save()

        client = APIClient()
        client.force_authenticate(user=regular_user)
        response = client.get(DRAFT_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["draft"] is not None


class TestNewCycleDraftPost:
    """Tests for POST /api/v1/adminoptions/new-cycle-draft"""

    @pytest.mark.integration
    def test_superuser_can_save(self, superuser, admin_options):
        """Superuser should be able to save a draft."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(DRAFT_URL, {"draft": SAMPLE_DRAFT}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "draft saved"

        # Verify it was persisted
        admin_options.refresh_from_db()
        assert admin_options.new_cycle_draft["sendBaLeads"] is True

    @pytest.mark.integration
    def test_non_superuser_cannot_save(self, regular_user, admin_options):
        """Non-superusers should not be able to save."""
        client = APIClient()
        client.force_authenticate(user=regular_user)
        response = client.post(DRAFT_URL, {"draft": SAMPLE_DRAFT}, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.integration
    def test_missing_draft_field(self, superuser, admin_options):
        """Should return 400 when draft field is missing."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.post(DRAFT_URL, {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.integration
    def test_overwrites_existing_draft(self, superuser, admin_options):
        """Saving a new draft should overwrite the previous one."""
        admin_options.new_cycle_draft = {"old": "data"}
        admin_options.save()

        client = APIClient()
        client.force_authenticate(user=superuser)
        client.post(DRAFT_URL, {"draft": SAMPLE_DRAFT}, format="json")

        admin_options.refresh_from_db()
        assert "old" not in admin_options.new_cycle_draft
        assert admin_options.new_cycle_draft["prepopulateMode"] == "all"

    @pytest.mark.integration
    def test_requires_authentication(self, db, admin_options):
        """Unauthenticated request should be rejected."""
        client = APIClient()
        response = client.post(DRAFT_URL, {"draft": SAMPLE_DRAFT}, format="json")
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]


class TestNewCycleDraftDelete:
    """Tests for DELETE /api/v1/adminoptions/new-cycle-draft"""

    @pytest.mark.integration
    def test_superuser_can_clear(self, superuser, admin_options):
        """Superuser should be able to clear the draft."""
        admin_options.new_cycle_draft = SAMPLE_DRAFT
        admin_options.save()

        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.delete(DRAFT_URL)

        assert response.status_code == status.HTTP_200_OK

        admin_options.refresh_from_db()
        assert admin_options.new_cycle_draft == {}

    @pytest.mark.integration
    def test_non_superuser_cannot_clear(self, regular_user, admin_options):
        """Non-superusers should not be able to clear."""
        client = APIClient()
        client.force_authenticate(user=regular_user)
        response = client.delete(DRAFT_URL)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.integration
    def test_clear_when_already_empty(self, superuser, admin_options):
        """Clearing an already empty draft should succeed."""
        client = APIClient()
        client.force_authenticate(user=superuser)
        response = client.delete(DRAFT_URL)

        assert response.status_code == status.HTTP_200_OK
