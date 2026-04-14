"""
Utility views for caretaker operations
"""

from django.conf import settings
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
)
from rest_framework.views import APIView

from adminoptions.serializers import AdminTaskSerializer

from ..serializers import CaretakerSerializer
from ..services import CaretakerService


class CheckCaretaker(APIView):
    """Check if user has caretaker or is caretaking"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Check caretaker status for current user"""
        settings.LOGGER.info(f"{request.user} is checking caretaker status")

        # Get status via service
        status = CaretakerService.get_caretaker_check(request.user)

        # Serialize objects
        response_data = {
            "caretaker_object": (
                CaretakerSerializer(status["caretaker_object"]).data
                if status["caretaker_object"]
                else None
            ),
            "caretaker_request_object": (
                AdminTaskSerializer(status["caretaker_request_object"]).data
                if status["caretaker_request_object"]
                else None
            ),
            "become_caretaker_request_object": (
                AdminTaskSerializer(status["become_caretaker_request_object"]).data
                if status["become_caretaker_request_object"]
                else None
            ),
        }

        return Response(response_data, status=HTTP_200_OK)


class AdminSetCaretaker(APIView):
    """Admin endpoint to directly set a caretaker"""

    permission_classes = [IsAdminUser]

    def post(self, request):
        """Admin creates caretaker relationship directly"""
        settings.LOGGER.info(f"{request.user} is setting a caretaker (admin)")

        if not request.user.is_superuser:
            return Response(
                {"detail": "You do not have permission to set a caretaker."},
                status=HTTP_401_UNAUTHORIZED,
            )

        primary_user_id = request.data.get("userPk")
        secondary_user_id = request.data.get("caretakerPk")
        reason = request.data.get("reason")
        notes = request.data.get("notes")

        if not primary_user_id or not secondary_user_id:
            return Response(
                {"detail": "Invalid data. Primary and secondary users are required."},
                status=HTTP_400_BAD_REQUEST,
            )

        if primary_user_id == secondary_user_id:
            return Response(
                {"detail": "Invalid data. Primary user cannot also be secondary user."},
                status=HTTP_400_BAD_REQUEST,
            )

        if not reason:
            return Response(
                {"detail": "Invalid data. Reason is required."},
                status=HTTP_400_BAD_REQUEST,
            )

        try:
            CaretakerService.create_caretaker(
                user=primary_user_id,
                caretaker=secondary_user_id,
                reason=reason,
                notes=notes if notes else None,
            )
            return Response(status=HTTP_200_OK)
        except Exception as e:
            settings.LOGGER.error(f"Failed to create caretaker: {e}")
            return Response(
                {
                    "detail": "Failed to create caretaker relationship. Please try again."
                },
                status=HTTP_400_BAD_REQUEST,
            )
