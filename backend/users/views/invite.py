"""
Invite user view — creates a new DBCA user and sends a welcome email
"""

import requests as http_requests
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

from documents.services.notification_service import NotificationService
from users.models import User, UserInvite
from users.serializers.base import UserSerializer


class InviteUser(APIView):
    """
    Invite a new DBCA staff member to SPMS.

    Validates the email exists in IT Assets (DBCA directory),
    creates a user account, tracks the invite, and sends a welcome email.
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
            # Allow invite to proceed if IT Assets is temporarily unavailable
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

        # Create user
        username = email.split("@")[0]
        # Handle duplicate usernames by appending a number
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create(
            email=email,
            username=username,
            display_first_name=first_name,
            display_last_name=last_name,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_active=True,
        )

        # Create invite record
        UserInvite.objects.create(
            email=email,
            invited_by=request.user,
        )

        # Send welcome email
        try:
            NotificationService.send_spms_invite(user, request.user, settings.SITE_URL)
        except Exception as e:
            settings.LOGGER.error(f"Failed to send invite email to {email}: {e}")

        settings.LOGGER.info(f"{request.user} invited {email} to SPMS")

        return Response(
            UserSerializer(user).data,
            status=HTTP_201_CREATED,
        )
