"""
Invite user view — sends an invitation email to a DBCA staff member.
The user's account is created automatically when they first visit SPMS
via the DBCA SSO middleware.
"""

import requests as http_requests
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

from documents.services.notification_service import NotificationService
from users.models import User, UserInvite


class _InviteRecipient:
    """Lightweight stand-in for a User object, used by NotificationService."""

    def __init__(self, email, first_name, last_name):
        self.email = email
        self.first_name = first_name
        self.last_name = last_name

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class InviteUser(APIView):
    """
    Invite a DBCA staff member to SPMS.

    Validates the email exists in IT Assets (DBCA directory),
    creates an invite record, and sends an invitation email.
    The user's account is created when they first visit the site.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        first_name = request.data.get("first_name", "").strip()
        last_name = request.data.get("last_name", "").strip()

        # Validate required fields
        if not email or not first_name or not last_name:
            return Response(
                {"error": "email, first_name, and last_name are required"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Validate email domain
        if not email.endswith("@dbca.wa.gov.au"):
            return Response(
                {"error": "Email must be a @dbca.wa.gov.au address"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Check if user already exists in SPMS
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "A user with this email already exists in SPMS"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Validate email exists in IT Assets (DBCA directory)
        try:
            api_url = settings.IT_ASSETS_URL
            if api_url:
                response = http_requests.get(
                    api_url,
                    params={"email": email},
                    auth=(settings.IT_ASSETS_USER, settings.IT_ASSETS_ACCESS_TOKEN),
                    timeout=10,
                )
                if response.status_code != 200 or not response.json():
                    return Response(
                        {
                            "error": "Email not found in DBCA directory. Only existing DBCA staff can be invited."
                        },
                        status=HTTP_400_BAD_REQUEST,
                    )
            else:
                settings.LOGGER.warning(
                    "IT_ASSETS_URL not configured — skipping directory validation"
                )
        except http_requests.RequestException as e:
            settings.LOGGER.error(f"IT Assets lookup failed for {email}: {e}")
            settings.LOGGER.warning(
                "IT Assets unavailable — proceeding with invite without directory validation"
            )

        # Clean up old accepted invites (where user now has an active account)
        pending_invites = UserInvite.objects.filter(accepted=False)
        for invite in pending_invites:
            if User.objects.filter(email=invite.email, is_active=True).exists():
                invite.accepted = True
                invite.save(update_fields=["accepted"])

        # Check for existing pending invite
        if UserInvite.objects.filter(email=email, accepted=False).exists():
            return Response(
                {"error": "An invite has already been sent to this email"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Create invite record (no user account — that happens on first visit)
        UserInvite.objects.create(
            email=email,
            invited_by=request.user,
        )

        # Send invitation email
        recipient = _InviteRecipient(email, first_name, last_name)
        try:
            NotificationService.send_spms_invite(
                recipient, request.user, settings.SITE_URL
            )
        except Exception as e:
            settings.LOGGER.error(f"Failed to send invite email to {email}: {e}")

        settings.LOGGER.info(f"{request.user} invited {email} to SPMS")

        return Response(
            {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "invited": True,
            },
            status=HTTP_201_CREATED,
        )
