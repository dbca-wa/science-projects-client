"""
Project map view
"""

from django.conf import settings
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.views import APIView

from ..models import Project
from ..serializers import ProjectSerializer
from ..services.project_service import ProjectService


class ProjectMap(APIView):
    """Project map with location filtering"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get projects for map display"""
        settings.LOGGER.info(f"{request.user} is viewing the map")

        # Grand total across all projects (unfiltered) — shown as denominator in stats
        grand_total_count = Project.objects.count()

        # Delegate filtering to service
        projects = ProjectService.list_projects(
            user=request.user, filters=request.query_params
        )

        filtered_count = projects.count()
        projects_without_location_count = (
            projects.filter(
                Q(area__isnull=True) | Q(area__areas__isnull=True) | Q(area__areas=[])
            )
            .distinct()
            .count()
        )

        # Serialize all projects (no pagination for map)
        serializer = ProjectSerializer(
            projects,
            many=True,
            context={"request": request, "projects": projects},
        )

        return Response(
            {
                "projects": serializer.data,
                "total_projects": grand_total_count,
                "filtered_projects": filtered_count,
                "projects_without_location": projects_without_location_count,
            },
            status=HTTP_200_OK,
        )
