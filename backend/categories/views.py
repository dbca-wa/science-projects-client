from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import ProjectCategory
from .serializers import ProjectCategorySerializer


class ProjectCategoryViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectCategorySerializer
    queryset = ProjectCategory.objects.filter(
        kind=ProjectCategory.CategoryKindChoices.SCIENCE,
    )

    def perform_create(self, serializer):
        settings.LOGGER.info(f"{self.request.user} is creating project category")
        serializer.save()

    def perform_update(self, serializer):
        settings.LOGGER.info(
            f"{self.request.user} is updating project category (pk={serializer.instance.pk})"
        )
        serializer.save()

    def perform_destroy(self, instance):
        settings.LOGGER.warning(
            f"{self.request.user} is deleting project category (pk={instance.pk})"
        )
        instance.delete()
