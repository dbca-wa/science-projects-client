"""
Staff profile section views
"""

from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from users.serializers import (
    StaffProfileCVSerializer,
    StaffProfileHeroSerializer,
    StaffProfileOverviewSerializer,
)
from users.services import ProfileService


class StaffProfileHeroDetail(APIView):
    """Get staff profile hero section, enriched with IT Assets data"""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        import requests as http_requests
        from django.conf import settings

        profile = ProfileService.get_visible_staff_profile(pk, request.user)
        serializer = StaffProfileHeroSerializer(profile)
        data = serializer.data

        # Enrich with IT Assets data using stored email
        try:
            api_url = settings.IT_ASSETS_URL
            response = http_requests.get(
                api_url,
                auth=(settings.IT_ASSETS_USER, settings.IT_ASSETS_ACCESS_TOKEN),
                timeout=30,
            )
            if response.status_code == 200:
                it_assets = response.json()
                user_email = profile.user.email
                it_data = next(
                    (u for u in it_assets if u.get("email") == user_email), None
                )
                if it_data:
                    data["it_asset_data"] = {
                        "title": it_data.get("title"),
                        "unit": it_data.get("unit"),
                        "division": it_data.get("division"),
                        "location": it_data.get("location"),
                    }
                else:
                    data["it_asset_data"] = None
            else:
                data["it_asset_data"] = None
        except Exception as e:
            settings.LOGGER.error(f"IT Assets error in hero: {e}")
            data["it_asset_data"] = None

        return Response(data)


class StaffProfileOverviewDetail(APIView):
    """Get and update staff profile overview section"""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        profile = ProfileService.get_visible_staff_profile(pk, request.user)
        serializer = StaffProfileOverviewSerializer(profile)
        return Response(serializer.data)

    def put(self, request, pk):
        from rest_framework.exceptions import PermissionDenied

        profile = ProfileService.get_staff_profile(pk)

        # Ownership check: only the profile owner or a superuser can edit
        if request.user.id != profile.user_id and not request.user.is_superuser:
            raise PermissionDenied("You do not have permission to edit this profile.")

        # Update allowed fields
        if "about" in request.data:
            profile.about = request.data["about"]
        if "expertise" in request.data:
            profile.expertise = request.data["expertise"]
        if "keyword_tags" in request.data:
            from users.models import KeywordTag

            tag_ids = request.data["keyword_tags"]
            tags = KeywordTag.objects.filter(id__in=tag_ids)
            profile.keyword_tags.set(tags)

        profile.save()
        serializer = StaffProfileOverviewSerializer(profile)
        return Response(serializer.data)


class StaffProfileCVDetail(APIView):
    """Get staff profile CV section"""

    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        profile = ProfileService.get_visible_staff_profile(pk, request.user)
        serializer = StaffProfileCVSerializer(profile)
        return Response(serializer.data)
