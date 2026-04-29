"""
Area CRUD views
"""

from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
)
from rest_framework.views import APIView

from locations.serializers import AreaSerializer, TinyAreaSerializer
from locations.services import AreaService


class Areas(APIView):
    """List and create areas"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all areas"""
        areas = AreaService.list_areas()
        serializer = TinyAreaSerializer(areas, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """Create new area"""
        settings.LOGGER.info(f"{request.user} is creating area")
        serializer = AreaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        area = AreaService.create_area(request.user, serializer.validated_data)
        result = TinyAreaSerializer(area)
        return Response(result.data, status=HTTP_201_CREATED)


class AreaDetail(APIView):
    """Get, update, and delete area"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Get area detail"""
        area = AreaService.get_area(pk)
        serializer = AreaSerializer(area)
        return Response(serializer.data, status=HTTP_200_OK)

    def put(self, request, pk):
        """Update area"""
        settings.LOGGER.info(f"{request.user} is updating area (pk={pk})")
        area = AreaService.get_area(pk)
        serializer = AreaSerializer(area, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        updated_area = AreaService.update_area(
            pk, request.user, serializer.validated_data
        )
        result = TinyAreaSerializer(updated_area)
        return Response(result.data, status=HTTP_202_ACCEPTED)

    def delete(self, request, pk):
        """Delete area"""
        settings.LOGGER.warning(f"{request.user} is deleting area (pk={pk})")
        AreaService.delete_area(pk, request.user)
        return Response(status=HTTP_204_NO_CONTENT)
