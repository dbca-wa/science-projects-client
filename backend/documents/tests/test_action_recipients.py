"""
Tests for the ActionRecipients view.

Covers recipient resolution for document workflow actions (submit, approve,
recall, send_back) across all approval stages.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import (
    BusinessAreaFactory,
    DivisionFactory,
    ProjectDocumentFactory,
    ProjectFactory,
    UserFactory,
)


@pytest.fixture
def api_client():
    """Provide a DRF API client."""
    return APIClient()


@pytest.fixture
def authenticated_user(db):
    """Provide an authenticated user (not necessarily a project member)."""
    return UserFactory(username="viewer", email="viewer@example.com")


@pytest.fixture
def ba_leader(db):
    """Provide a business area leader user."""
    return UserFactory(
        username="ba_leader",
        email="ba_leader@example.com",
        first_name="BA",
        last_name="Leader",
    )


@pytest.fixture
def project_leader(db):
    """Provide a project lead user."""
    return UserFactory(
        username="project_leader",
        email="project_leader@example.com",
        first_name="Project",
        last_name="Leader",
    )


@pytest.fixture
def key_stakeholder_user(db):
    """Provide a key stakeholder user for the division."""
    return UserFactory(
        username="key_stakeholder",
        email="key_stakeholder@example.com",
        first_name="Key",
        last_name="Stakeholder",
    )


@pytest.fixture
def approver_user(db):
    """Provide an approver user for the division."""
    return UserFactory(
        username="approver",
        email="approver@example.com",
        first_name="Division",
        last_name="Approver",
    )


@pytest.fixture
def division_with_directorate(db, key_stakeholder_user, approver_user):
    """Provide a division with key_stakeholder and approvers configured."""
    division = DivisionFactory(key_stakeholder=key_stakeholder_user)
    division.approvers.add(approver_user)
    return division


@pytest.fixture
def full_project_setup(db, ba_leader, project_leader, division_with_directorate):
    """
    Provide a complete project setup with:
    - Division with key_stakeholder and approvers
    - Business area linked to division with a leader
    - Project linked to business area with a project lead member
    - ProjectDocument linked to the project
    """
    business_area = BusinessAreaFactory(
        leader=ba_leader,
        division=division_with_directorate,
    )
    project = ProjectFactory(business_area=business_area, members=[])
    project.members.create(
        user=project_leader,
        is_leader=True,
        role="supervising",
    )
    document = ProjectDocumentFactory(
        project=project,
        kind="concept",
        status="new",
    )
    return document


def _url(pk):
    """Build the action-recipients URL for a given document PK."""
    return f"/api/v1/documents/projectdocuments/{pk}/action-recipients"


# =============================================================================
# Authentication and validation tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestActionRecipientsAuth:
    """Tests for authentication and parameter validation."""

    def test_unauthenticated_returns_403(self, api_client, full_project_setup):
        """Unauthenticated request is rejected (session auth returns 403)."""
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "submit", "stage": "1"})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_invalid_action_returns_400(
        self, api_client, authenticated_user, full_project_setup
    ):
        """An unrecognised action parameter returns 400 with error message."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "invalid_action", "stage": "1"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert "Invalid action" in response.data["error"]

    def test_invalid_stage_returns_400(
        self, api_client, authenticated_user, full_project_setup
    ):
        """A non-numeric or out-of-range stage returns 400 with error message."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "submit", "stage": "banana"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert "Invalid stage" in response.data["error"]

    def test_stage_out_of_range_returns_400(
        self, api_client, authenticated_user, full_project_setup
    ):
        """Stage value outside 1-3 returns 400."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "approve", "stage": "5"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid stage" in response.data["error"]

    def test_missing_action_returns_400(
        self, api_client, authenticated_user, full_project_setup
    ):
        """Missing action parameter returns 400."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"stage": "1"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid action" in response.data["error"]

    def test_missing_stage_returns_400(
        self, api_client, authenticated_user, full_project_setup
    ):
        """Missing stage parameter returns 400."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "submit"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid stage" in response.data["error"]

    def test_document_not_found_returns_404(self, api_client, authenticated_user):
        """Non-existent document PK returns 404."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(99999)
        response = api_client.get(url, {"action": "submit", "stage": "1"})
        assert response.status_code == status.HTTP_404_NOT_FOUND


# =============================================================================
# Submit action tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestActionRecipientsSubmit:
    """Tests for the submit action recipient resolution."""

    def test_submit_stage_1_returns_ba_lead(
        self, api_client, authenticated_user, full_project_setup, ba_leader
    ):
        """Submit at stage 1 returns the BA lead as recipient."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "submit", "stage": "1"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["recipients"]) == 1
        recipient = response.data["recipients"][0]
        assert recipient["email"] == ba_leader.email
        assert recipient["name"] == ba_leader.get_full_name()
        assert "warning" not in response.data


# =============================================================================
# Approve action tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestActionRecipientsApprove:
    """Tests for the approve action recipient resolution."""

    def test_approve_stage_1_returns_ba_lead(
        self, api_client, authenticated_user, full_project_setup, ba_leader
    ):
        """Approve at stage 1 returns the BA lead as recipient."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "approve", "stage": "1"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["recipients"]) == 1
        recipient = response.data["recipients"][0]
        assert recipient["email"] == ba_leader.email
        assert recipient["name"] == ba_leader.get_full_name()

    def test_approve_stage_2_returns_directorate_members(
        self,
        api_client,
        authenticated_user,
        full_project_setup,
        key_stakeholder_user,
        approver_user,
    ):
        """Approve at stage 2 returns key stakeholder and approvers."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "approve", "stage": "2"})

        assert response.status_code == status.HTTP_200_OK
        recipient_emails = {r["email"] for r in response.data["recipients"]}
        assert key_stakeholder_user.email in recipient_emails
        assert approver_user.email in recipient_emails
        assert "warning" not in response.data

    def test_approve_stage_3_returns_project_lead_and_ba_lead(
        self,
        api_client,
        authenticated_user,
        full_project_setup,
        project_leader,
        ba_leader,
    ):
        """Approve at stage 3 returns project lead AND BA lead."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "approve", "stage": "3"})

        assert response.status_code == status.HTTP_200_OK
        recipient_emails = {r["email"] for r in response.data["recipients"]}
        assert project_leader.email in recipient_emails
        assert ba_leader.email in recipient_emails


# =============================================================================
# Send back action tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestActionRecipientsSendBack:
    """Tests for the send_back action recipient resolution."""

    def test_send_back_stage_2_returns_project_lead(
        self, api_client, authenticated_user, full_project_setup, project_leader
    ):
        """
        Send back at stage 2 (BA sending back to PL) returns project lead.

        The send_back logic uses document approval flags to determine the
        recipient. Stage 2 pending means PL approved but BA hasn't yet.
        """
        # Set approval flags: PL approved, BA not yet
        full_project_setup.project_lead_approval_granted = True
        full_project_setup.business_area_lead_approval_granted = False
        full_project_setup.save()

        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "send_back", "stage": "2"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["recipients"]) == 1
        recipient = response.data["recipients"][0]
        assert recipient["email"] == project_leader.email

    def test_send_back_stage_3_returns_ba_lead(
        self, api_client, authenticated_user, full_project_setup, ba_leader
    ):
        """
        Send back at stage 3 (directorate sending back to BA) returns BA lead.

        Stage 3 pending means BA approved but directorate hasn't yet.
        """
        # Set approval flags: PL and BA approved, directorate not yet
        full_project_setup.project_lead_approval_granted = True
        full_project_setup.business_area_lead_approval_granted = True
        full_project_setup.directorate_approval_granted = False
        full_project_setup.save()

        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "send_back", "stage": "3"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["recipients"]) == 1
        recipient = response.data["recipients"][0]
        assert recipient["email"] == ba_leader.email


# =============================================================================
# Recall action tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestActionRecipientsRecall:
    """Tests for the recall action recipient resolution."""

    def test_recall_stage_2_returns_ba_lead(
        self, api_client, authenticated_user, full_project_setup, ba_leader
    ):
        """Recall at stage 2 (PL recalling) notifies BA lead."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "recall", "stage": "2"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["recipients"]) == 1
        recipient = response.data["recipients"][0]
        assert recipient["email"] == ba_leader.email

    def test_recall_stage_3_returns_project_lead_and_ba_lead(
        self,
        api_client,
        authenticated_user,
        full_project_setup,
        project_leader,
        ba_leader,
    ):
        """Recall at stage 3 (directorate recall) notifies PL and BA lead."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "recall", "stage": "3"})

        assert response.status_code == status.HTTP_200_OK
        recipient_emails = {r["email"] for r in response.data["recipients"]}
        assert project_leader.email in recipient_emails
        assert ba_leader.email in recipient_emails


# =============================================================================
# Warning / edge case tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestActionRecipientsWarnings:
    """Tests for warning messages when recipients cannot be resolved."""

    def test_no_ba_lead_returns_empty_with_warning(
        self, api_client, authenticated_user
    ):
        """
        When no BA lead is configured, returns empty recipients with a warning.
        """
        # Create a business area with no leader
        business_area = BusinessAreaFactory(leader=None)
        project = ProjectFactory(business_area=business_area, members=[])
        project.members.create(
            user=authenticated_user,
            is_leader=True,
            role="supervising",
        )
        document = ProjectDocumentFactory(project=project, kind="concept")

        api_client.force_authenticate(user=authenticated_user)
        url = _url(document.pk)
        response = api_client.get(url, {"action": "submit", "stage": "1"})

        assert response.status_code == status.HTTP_200_OK
        assert response.data["recipients"] == []
        assert "warning" in response.data
        assert "business area lead" in response.data["warning"].lower()

    def test_no_directorate_returns_empty_with_warning(
        self, api_client, authenticated_user
    ):
        """
        When no directorate approvers are configured, returns empty recipients
        with a warning.
        """
        # Create a division with no key_stakeholder, no approvers, no director
        division = DivisionFactory(key_stakeholder=None)
        business_area = BusinessAreaFactory(
            leader=authenticated_user,
            division=division,
        )
        project = ProjectFactory(business_area=business_area, members=[])
        project.members.create(
            user=authenticated_user,
            is_leader=True,
            role="supervising",
        )
        document = ProjectDocumentFactory(project=project, kind="concept")

        api_client.force_authenticate(user=authenticated_user)
        url = _url(document.pk)
        response = api_client.get(url, {"action": "approve", "stage": "2"})

        assert response.status_code == status.HTTP_200_OK
        assert response.data["recipients"] == []
        assert "warning" in response.data
        assert "directorate" in response.data["warning"].lower()

    def test_recall_stage_2_no_ba_lead_returns_warning(
        self, api_client, authenticated_user
    ):
        """Recall at stage 2 with no BA lead returns empty with warning."""
        business_area = BusinessAreaFactory(leader=None)
        project = ProjectFactory(business_area=business_area, members=[])
        project.members.create(
            user=authenticated_user,
            is_leader=True,
            role="supervising",
        )
        document = ProjectDocumentFactory(project=project, kind="concept")

        api_client.force_authenticate(user=authenticated_user)
        url = _url(document.pk)
        response = api_client.get(url, {"action": "recall", "stage": "2"})

        assert response.status_code == status.HTTP_200_OK
        assert response.data["recipients"] == []
        assert "warning" in response.data
        assert "business area lead" in response.data["warning"].lower()


# =============================================================================
# Response structure tests
# =============================================================================


@pytest.mark.django_db
@pytest.mark.integration
class TestActionRecipientsResponseStructure:
    """Tests for the response payload structure."""

    def test_response_contains_role_label(
        self, api_client, authenticated_user, full_project_setup
    ):
        """Response always includes a role_label field."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "submit", "stage": "1"})

        assert response.status_code == status.HTTP_200_OK
        assert "role_label" in response.data
        assert response.data["role_label"] == "Recipients"

    def test_recipient_has_name_email_role(
        self, api_client, authenticated_user, full_project_setup, ba_leader
    ):
        """Each recipient dict contains name, email, and role keys."""
        api_client.force_authenticate(user=authenticated_user)
        url = _url(full_project_setup.pk)
        response = api_client.get(url, {"action": "submit", "stage": "1"})

        assert response.status_code == status.HTTP_200_OK
        recipient = response.data["recipients"][0]
        assert "name" in recipient
        assert "email" in recipient
        assert "role" in recipient
