"""
Views for rich text editor image uploads.

Provides a simple upload endpoint that returns the file URL for embedding
in editor HTML content. Any authenticated user can upload; only the uploader
or a superuser can delete.
"""

from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
)
from rest_framework.views import APIView

from medias.models import EditorImage
from medias.serializers import EditorImageCreateSerializer, EditorImageSerializer


class EditorImages(APIView):
    """Upload an image for use in a rich text editor."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        settings.LOGGER.info(f"{request.user} is uploading an editor image")
        serializer = EditorImageCreateSerializer(data=request.data)

        if serializer.is_valid():
            image = serializer.save(uploader=request.user)
            return Response(
                EditorImageSerializer(image).data,
                status=HTTP_201_CREATED,
            )

        settings.LOGGER.error(f"Editor image upload failed: {serializer.errors}")
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class EditorImageDetail(APIView):
    """Retrieve or delete an editor image."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            image = EditorImage.objects.get(pk=pk)
        except EditorImage.DoesNotExist:
            return Response(status=HTTP_400_BAD_REQUEST)

        return Response(EditorImageSerializer(image).data, status=HTTP_200_OK)

    def delete(self, request, pk):
        try:
            image = EditorImage.objects.get(pk=pk)
        except EditorImage.DoesNotExist:
            return Response(status=HTTP_400_BAD_REQUEST)

        if image.uploader != request.user and not request.user.is_superuser:
            return Response(
                {"detail": "You do not have permission to delete this image."},
                status=HTTP_400_BAD_REQUEST,
            )

        settings.LOGGER.info(f"{request.user} deleted editor image {image.pk}")
        image.file.delete(save=False)
        image.delete()
        return Response(status=HTTP_204_NO_CONTENT)
