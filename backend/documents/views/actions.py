"""
Document action recipient views
"""

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

from ..models import ProjectDocument
from ..services.notification_service import NotificationService

VALID_ACTIONS = {"submit", "approve", "recall", "send_back"}
VALID_STAGES = {1, 2, 3}


class ActionRecipients(APIView):
    """
    Retrieve the email recipients for a given document action.

    Returns the actual people who will receive the notification email,
    reusing NotificationService helper methods to guarantee consistency
    with the email sending logic.

    GET /projectdocuments/<pk>/action-recipients?action=submit&stage=1
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Return recipients for the specified document action and stage."""
        document = get_object_or_404(ProjectDocument, pk=pk)

        action = request.query_params.get("action")
        stage_raw = request.query_params.get("stage")

        # Validate action
        if not action or action not in VALID_ACTIONS:
            return Response(
                {
                    "error": (
                        "Invalid action. Must be one of: "
                        "submit, approve, recall, send_back."
                    )
                },
                status=HTTP_400_BAD_REQUEST,
            )

        # Validate stage
        try:
            stage = int(stage_raw) if stage_raw else 0
        except (ValueError, TypeError):
            stage = 0

        if stage not in VALID_STAGES:
            return Response(
                {"error": "Invalid stage. Must be 1, 2, or 3."},
                status=HTTP_400_BAD_REQUEST,
            )

        # Resolve recipients using NotificationService helpers
        recipients, role_label, warning = self._resolve_recipients(
            document, action, stage
        )

        response_data = {
            "recipients": [
                {
                    "name": r["name"],
                    "email": r["email"],
                    "role": r.get("kind", ""),
                }
                for r in recipients
            ],
            "role_label": role_label,
        }

        if warning:
            response_data["warning"] = warning

        return Response(response_data)

    def _resolve_recipients(self, document, action, stage):
        """
        Resolve recipients for the given action and stage combination.

        For recall actions, the stage indicates the current pending stage
        (where the document is waiting). The recall notifies the person at
        that stage — e.g. if PL recalls at stage 2 (BA pending), the BA lead
        is notified.

        Returns:
            Tuple of (recipients_list, role_label, warning_or_None)
        """
        role_label = "Recipients"
        recipients = []
        warning = None

        if action == "submit" and stage == 1:
            # PL submitting → notify BA lead
            recipients = NotificationService._get_stage_approval_recipients(document, 1)
            if not recipients:
                warning = (
                    "No business area lead has been set for this project's "
                    "business area."
                )

        elif action == "approve" and stage == 1:
            # PL approving (same as submit) → notify BA lead
            recipients = NotificationService._get_stage_approval_recipients(document, 1)
            if not recipients:
                warning = (
                    "No business area lead has been set for this project's "
                    "business area."
                )

        elif action == "approve" and stage == 2:
            # BA lead approving → notify directorate
            recipients = NotificationService._get_stage_approval_recipients(document, 2)
            if not recipients:
                warning = (
                    "No directorate approvers have been configured for this "
                    "division."
                )

        elif action == "approve" and stage == 3:
            # Directorate approving → notify project lead AND business area lead
            recipients = NotificationService._get_stage_approval_recipients(document, 3)
            # Also include BA lead
            ba = document.project.business_area
            if ba and ba.leader and ba.leader.is_active:
                ba_recipient = {
                    "name": ba.leader.get_full_name(),
                    "email": ba.leader.email,
                    "kind": "Business Area Leader",
                }
                # Avoid duplicates
                existing_emails = {r["email"] for r in recipients}
                if ba_recipient["email"] not in existing_emails:
                    recipients.append(ba_recipient)
            if not recipients:
                warning = "No project lead has been set for this project."

        elif action == "send_back":
            # Send back → notify the person below the current stage
            recipient = NotificationService._get_sent_back_recipient(document)
            if recipient:
                recipients = [recipient]
            else:
                warning = "Unable to determine send-back recipient."

        elif action == "recall":
            # Recall → notify the person at the current pending stage
            # (the person who now needs to know the approval was withdrawn)
            # Stage param = current stage where document is waiting
            if stage == 1:
                # Document at stage 1 (PL pending) — unusual recall scenario
                # Notify BA lead that PL recalled
                recipients = NotificationService._get_stage_approval_recipients(
                    document, 1
                )
            elif stage == 2:
                # Document at stage 2 (BA pending) — PL is recalling
                # Notify BA lead that PL recalled their approval
                ba = document.project.business_area
                if ba and ba.leader and ba.leader.is_active:
                    recipients = [
                        {
                            "name": ba.leader.get_full_name(),
                            "email": ba.leader.email,
                            "kind": "Business Area Leader",
                        }
                    ]
                if not recipients:
                    warning = (
                        "No business area lead has been set for this project's "
                        "business area."
                    )
            elif stage == 3:
                # Document at stage 3 or fully approved — directorate recall
                # Notify project lead AND business area lead
                recipients = []
                # Project lead(s)
                for member in document.project.members.filter(is_leader=True):
                    if member.user.is_active:
                        recipients.append(
                            {
                                "name": member.user.get_full_name(),
                                "email": member.user.email,
                                "kind": "Project Lead",
                            }
                        )
                # Business area lead
                ba = document.project.business_area
                if ba and ba.leader and ba.leader.is_active:
                    existing_emails = {r["email"] for r in recipients}
                    if ba.leader.email not in existing_emails:
                        recipients.append(
                            {
                                "name": ba.leader.get_full_name(),
                                "email": ba.leader.email,
                                "kind": "Business Area Leader",
                            }
                        )
                if not recipients:
                    warning = (
                        "No project lead or business area lead found for this project."
                    )

        return recipients, role_label, warning
