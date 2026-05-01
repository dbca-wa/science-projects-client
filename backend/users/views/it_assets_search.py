"""
IT Assets search proxy — searches the DBCA IT Assets directory
and returns results annotated with SPMS user/invite status.
"""

import requests as http_requests
from django.conf import settings
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_502_BAD_GATEWAY,
)
from rest_framework.views import APIView

from users.models import User, UserInvite


class ITAssetsSearch(APIView):
    """
    Search IT Assets (DBCA directory) for users matching a query term.

    Results are annotated with:
    - ``in_spms``: True if the user already exists in SPMS (by email match)
    - ``already_invited``: True if a pending invite exists for this email

    ``GET /users/it-assets-search?q=<term>``
    """

    permission_classes = [IsAdminUser]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query or len(query) < 2:
            return Response(
                {"error": "Search term must be at least 2 characters"},
                status=HTTP_400_BAD_REQUEST,
            )

        api_url = settings.IT_ASSETS_URL
        if not api_url:
            settings.LOGGER.warning(
                "IT_ASSETS_URL not configured — cannot search IT Assets"
            )
            return Response(
                {"error": "IT Assets integration is not configured"},
                status=HTTP_502_BAD_GATEWAY,
            )

        # Query IT Assets API
        try:
            response = http_requests.get(
                api_url,
                auth=(settings.IT_ASSETS_USER, settings.IT_ASSETS_ACCESS_TOKEN),
                timeout=15,
            )
        except http_requests.RequestException as e:
            settings.LOGGER.error(f"IT Assets search failed: {e}")
            return Response(
                {"error": "Failed to connect to IT Assets"},
                status=HTTP_502_BAD_GATEWAY,
            )

        if response.status_code != 200:
            settings.LOGGER.error(
                f"IT Assets returned {response.status_code}: {response.text}"
            )
            return Response(
                {"error": "IT Assets returned an error"},
                status=HTTP_502_BAD_GATEWAY,
            )

        # Filter results by search term (name or email)
        all_users = response.json()
        query_lower = query.lower()
        matches = [
            user
            for user in all_users
            if query_lower in (user.get("name", "") or "").lower()
            or query_lower in (user.get("email", "") or "").lower()
        ]

        # Limit results to prevent large payloads
        matches = matches[:20]

        # Collect emails for batch lookup
        match_emails = [u.get("email", "").lower() for u in matches if u.get("email")]

        # Batch lookup: which emails already exist in SPMS?
        existing_emails = set(
            User.objects.filter(email__in=match_emails).values_list("email", flat=True)
        )

        # Batch lookup: which emails have pending invites?
        invited_emails = set(
            UserInvite.objects.filter(
                email__in=match_emails, accepted=False
            ).values_list("email", flat=True)
        )

        # Build annotated results
        results = []
        for user in matches:
            email = (user.get("email") or "").lower()
            results.append(
                {
                    "employee_id": user.get("employee_id", ""),
                    "name": user.get("name", ""),
                    "email": email,
                    "title": user.get("title", ""),
                    "location": user.get("location", ""),
                    "in_spms": email in existing_emails,
                    "already_invited": email in invited_emails,
                }
            )

        return Response(results, status=HTTP_200_OK)
