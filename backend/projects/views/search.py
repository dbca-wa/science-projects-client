"""
Project search views
"""

from django.conf import settings
from django.db.models import F
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from ..serializers import MyProjectSerializer, TinyProjectSerializer
from ..services.member_service import MemberService
from ..services.project_service import ProjectService


class SmallProjectSearch(APIView):
    """Small project search for autocomplete"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Search projects with minimal data"""
        projects = ProjectService.list_projects(
            user=request.user, filters=request.query_params
        )

        # Limit to 20 results for autocomplete
        projects = projects[:20]

        serializer = TinyProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class MyProjects(APIView):
    """Get projects for current user"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all projects where user is a member with role information"""
        settings.LOGGER.info(f"{request.user} is viewing their projects")

        # Get projects and annotate with user's role from ProjectMember
        projects = (
            MemberService.get_user_projects(request.user.pk)
            .annotate(role=F("members__role"))
            .filter(members__user_id=request.user.pk)
        )

        serializer = MyProjectSerializer(projects, many=True)
        return Response(serializer.data, status=HTTP_200_OK)
