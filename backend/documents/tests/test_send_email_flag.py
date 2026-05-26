"""
Tests for send_email flag in approval views.

Verifies that:
- When send_email=false is sent in the request, notifications are suppressed
- When send_email is absent or true, notifications are sent as normal (backwards compatible)
"""

from unittest.mock import patch

import pytest
from rest_framework.test import APIClient

from common.tests.factories import (
    BusinessAreaFactory,
    DivisionFactory,
    ProjectFactory,
    UserFactory,
)
from documents.models import ProjectDocument
from documents.tests.factories import ProjectDocumentFactory


@pytest.fixture
def send_email_setup(db):
    """Setup for send_email tests: superuser, project with document at various stages."""
    superuser = UserFactory(username="admin_user", is_superuser=True)
    ba_lead = UserFactory(username="ba_lead")
    project_lead = UserFactory(username="project_lead")
    division = DivisionFactory(director=superuser)
    business_area = BusinessAreaFactory(leader=ba_lead, division=division)
    project = ProjectFactory(business_area=business_area, kind="science")
    project.members.create(user=project_lead, is_leader=True, role="supervising")
    return {
        "superuser": superuser,
        "ba_lead": ba_lead,
        "project_lead": project_lead,
        "project": project,
    }


class TestDocApprovalSendEmail:
    """DocApproval view respects send_email flag."""

    @pytest.mark.integration
    @patch("documents.services.approval_service.NotificationService")
    def test_approve_with_send_email_false_suppresses_notifications(
        self, mock_notification_service, send_email_setup
    ):
        """When send_email=false, no notification emails should be sent."""
        setup = send_email_setup
        doc = ProjectDocumentFactory(
            project=setup["project"],
            kind="concept",
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=False,
        )

        client = APIClient()
        client.force_authenticate(user=setup["superuser"])

        response = client.post(
            "/api/v1/documents/actions/approve",
            data={
                "stage": 1,
                "documentPk": doc.pk,
                "send_email": False,
            },
            format="json",
        )

        assert response.status_code == 202
        # Notification should NOT have been called
        mock_notification_service.notify_document_approved.assert_not_called()

    @pytest.mark.integration
    @patch("documents.services.approval_service.NotificationService")
    def test_approve_with_send_email_true_sends_notifications(
        self, mock_notification_service, send_email_setup
    ):
        """When send_email=true (or absent), notifications should be sent as normal."""
        setup = send_email_setup
        doc = ProjectDocumentFactory(
            project=setup["project"],
            kind="concept",
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=False,
        )

        client = APIClient()
        client.force_authenticate(user=setup["superuser"])

        response = client.post(
            "/api/v1/documents/actions/approve",
            data={
                "stage": 1,
                "documentPk": doc.pk,
                "send_email": True,
            },
            format="json",
        )

        assert response.status_code == 202
        # Notification SHOULD have been called
        mock_notification_service.notify_document_approved.assert_called_once()

    @pytest.mark.integration
    @patch("documents.services.approval_service.NotificationService")
    def test_approve_without_send_email_field_sends_notifications(
        self, mock_notification_service, send_email_setup
    ):
        """When send_email is absent from request, default to sending notifications."""
        setup = send_email_setup
        doc = ProjectDocumentFactory(
            project=setup["project"],
            kind="concept",
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=False,
        )

        client = APIClient()
        client.force_authenticate(user=setup["superuser"])

        response = client.post(
            "/api/v1/documents/actions/approve",
            data={
                "stage": 1,
                "documentPk": doc.pk,
            },
            format="json",
        )

        assert response.status_code == 202
        # Notification SHOULD have been called (backwards compatible default)
        mock_notification_service.notify_document_approved.assert_called_once()


class TestDocRecallSendEmail:
    """DocRecall view respects send_email flag."""

    @pytest.mark.integration
    @patch("documents.services.approval_service.NotificationService")
    def test_recall_with_send_email_false_suppresses_notifications(
        self, mock_notification_service, send_email_setup
    ):
        """When send_email=false, recall should not send notification emails."""
        setup = send_email_setup
        doc = ProjectDocumentFactory(
            project=setup["project"],
            kind="concept",
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=False,
        )

        client = APIClient()
        client.force_authenticate(user=setup["superuser"])

        response = client.post(
            "/api/v1/documents/actions/recall",
            data={
                "stage": 1,
                "documentPk": doc.pk,
                "send_email": False,
            },
            format="json",
        )

        assert response.status_code == 202
        mock_notification_service.notify_document_recalled.assert_not_called()

    @pytest.mark.integration
    @patch("documents.services.approval_service.NotificationService")
    def test_recall_with_send_email_true_sends_notifications(
        self, mock_notification_service, send_email_setup
    ):
        """When send_email=true, recall should send notification emails."""
        setup = send_email_setup
        doc = ProjectDocumentFactory(
            project=setup["project"],
            kind="concept",
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=False,
        )

        client = APIClient()
        client.force_authenticate(user=setup["superuser"])

        response = client.post(
            "/api/v1/documents/actions/recall",
            data={
                "stage": 1,
                "documentPk": doc.pk,
                "send_email": True,
            },
            format="json",
        )

        assert response.status_code == 202
        mock_notification_service.notify_document_recalled.assert_called_once()


class TestDocSendBackSendEmail:
    """DocSendBack view respects send_email flag."""

    @pytest.mark.integration
    @patch("documents.services.approval_service.NotificationService")
    def test_send_back_with_send_email_false_suppresses_notifications(
        self, mock_notification_service, send_email_setup
    ):
        """When send_email=false, send_back should not send notification emails."""
        setup = send_email_setup
        doc = ProjectDocumentFactory(
            project=setup["project"],
            kind="concept",
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=False,
        )

        client = APIClient()
        client.force_authenticate(user=setup["superuser"])

        response = client.post(
            "/api/v1/documents/actions/send_back",
            data={
                "stage": 2,
                "documentPk": doc.pk,
                "send_email": False,
            },
            format="json",
        )

        assert response.status_code == 202
        mock_notification_service.notify_document_sent_back.assert_not_called()

    @pytest.mark.integration
    @patch("documents.services.approval_service.NotificationService")
    def test_send_back_with_send_email_true_sends_notifications(
        self, mock_notification_service, send_email_setup
    ):
        """When send_email=true, send_back should send notification emails."""
        setup = send_email_setup
        doc = ProjectDocumentFactory(
            project=setup["project"],
            kind="concept",
            status=ProjectDocument.StatusChoices.INAPPROVAL,
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=False,
        )

        client = APIClient()
        client.force_authenticate(user=setup["superuser"])

        response = client.post(
            "/api/v1/documents/actions/send_back",
            data={
                "stage": 2,
                "documentPk": doc.pk,
                "send_email": True,
            },
            format="json",
        )

        assert response.status_code == 202
        mock_notification_service.notify_document_sent_back.assert_called_once()
