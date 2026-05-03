"""
User utility views
"""

from django.conf import settings
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.serializers import TinyUserSerializer, UserMeSerializer
from users.services import UserService


class CheckEmailExists(APIView):
    """Check if email already exists"""

    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response({"error": "Email parameter required"}, status=400)

        exists = UserService.check_email_exists(email)
        return Response({"exists": exists})


class CheckNameExists(APIView):
    """Check if a user with the given first and last name already exists"""

    permission_classes = [AllowAny]

    def get(self, request):
        first_name = request.query_params.get("first_name")
        last_name = request.query_params.get("last_name")
        # Legacy support: also accept "username" param
        username = request.query_params.get("username")

        if username:
            exists = UserService.check_username_exists(username)
            return Response({"exists": exists})

        if not first_name or not last_name:
            return Response(
                {"error": "first_name and last_name parameters required"},
                status=400,
            )

        from users.models import User

        exists = User.objects.filter(
            display_first_name__iexact=first_name.strip(),
            display_last_name__iexact=last_name.strip(),
        ).exists()
        return Response({"exists": exists})


class CheckUserIsStaff(APIView):
    """Check if user is staff"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            user = UserService.get_user(pk)
            return Response({"is_staff": user.is_staff})
        except Exception:
            settings.LOGGER.warning(
                f"Failed to check is_staff for user pk={pk}",
                exc_info=True,
            )
            return Response({"error": "User not found"}, status=400)


class Me(APIView):
    """Get current user info"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data)


class SmallInternalUserSearch(APIView):
    """Search users (internal)"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get("search", "")
        if len(search) < 2:
            return Response([])

        users = UserService.list_users(filters={"search": search})[:10]
        serializer = TinyUserSerializer(users, many=True)
        return Response(serializer.data)
