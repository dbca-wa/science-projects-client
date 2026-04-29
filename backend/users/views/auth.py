"""
Authentication views
"""

from django.conf import settings
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.exceptions import ParseError, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from users.services import UserService


@method_decorator(csrf_exempt, name="dispatch")
class Login(APIView):
    """User login — CSRF exempt since users may not have a token before authenticating"""

    permission_classes = [AllowAny]

    def get(self, request):
        """Return a fresh CSRF token cookie for the login form"""
        get_token(request)
        return Response({"ok": "CSRF cookie set"})

    def post(self, request):
        settings.LOGGER.info(
            f"Login attempt for username: {request.data.get('username')}"
        )
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            raise ParseError("Username and password are required")

        user = UserService.authenticate_user(username, password)
        if user:
            UserService.login_user(request, user)
            return Response({"ok": "Welcome"})
        else:
            return Response({"error": "Incorrect password"})


class Logout(APIView):
    """User logout"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        settings.LOGGER.info(f"{request.user} is logging out")
        if settings.DEBUG:
            UserService.logout_user(request)
            return Response({"ok": "True"})
        else:
            logout_data = UserService.logout_user(request)
            return Response(data=logout_data, status=HTTP_200_OK)


class ChangePassword(APIView):
    """Change user password"""

    permission_classes = [IsAuthenticated]

    def put(self, request):
        settings.LOGGER.info(f"{request.user} is changing password")
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            raise ParseError("Old and new passwords are required")

        try:
            UserService.change_password(request.user, old_password, new_password)
            return Response({"ok": "Password changed successfully"})
        except ValidationError as e:
            settings.LOGGER.error(
                f"Password change failed for user {request.user.pk}: {e}"
            )
            return Response(
                {
                    "error": "Password change failed. Please check your input and try again."
                },
                status=400,
            )
