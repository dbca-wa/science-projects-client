"""
Project member management views
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

from ..serializers import ProjectMemberSerializer, TinyProjectMemberSerializer
from ..services.member_service import MemberService


class ProjectMembers(APIView):
    """List and create project members"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all project members"""
        members = MemberService.list_members()
        serializer = TinyProjectMemberSerializer(members, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """Add member to project"""
        settings.LOGGER.info(f"Received POST data: {request.data}")

        serializer = ProjectMemberSerializer(data=request.data)
        if not serializer.is_valid():
            settings.LOGGER.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        member = MemberService.add_member(
            project_id=serializer.validated_data["project"].pk,
            user_id=serializer.validated_data["user"].pk,
            data=serializer.validated_data,
            requesting_user=request.user,
        )

        result_serializer = TinyProjectMemberSerializer(member)
        return Response(result_serializer.data, status=HTTP_201_CREATED)


class ProjectMemberDetail(APIView):
    """Get, update, delete project member"""

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id, user_id):
        """Get specific project member"""
        member = MemberService.get_member(project_id, user_id)
        serializer = TinyProjectMemberSerializer(member)
        return Response(serializer.data, status=HTTP_200_OK)

    def put(self, request, project_id, user_id):
        """Update project member"""
        # Get existing member first
        member = MemberService.get_member(project_id, user_id)

        # Pass instance to serializer for update
        serializer = ProjectMemberSerializer(member, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        # Update member
        updated_member = MemberService.update_member(
            project_id=project_id,
            user_id=user_id,
            data=serializer.validated_data,
            requesting_user=request.user,
        )

        result_serializer = TinyProjectMemberSerializer(updated_member)
        return Response(result_serializer.data, status=HTTP_202_ACCEPTED)

    def delete(self, request, project_id, user_id):
        """Remove member from project"""
        MemberService.remove_member(project_id, user_id, request.user)
        return Response(status=HTTP_204_NO_CONTENT)


class ProjectLeaderDetail(APIView):
    """Get project leader"""

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """Get project leader"""
        leader = MemberService.get_project_leader(project_id)
        serializer = TinyProjectMemberSerializer(leader)
        return Response(serializer.data, status=HTTP_200_OK)


class MembersForProject(APIView):
    """Get all members for a project"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Get members for specific project"""
        settings.LOGGER.info(f"{request.user} is viewing members for project {pk}")

        members = MemberService.get_members_for_project(pk)
        serializer = TinyProjectMemberSerializer(members, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def put(self, request, pk):
        """Reorder team members (drag and drop)"""
        settings.LOGGER.info(f"{request.user} is reordering members for project {pk}")

        members_data = request.data.get("members", [])
        if not members_data:
            return Response(
                {"error": "members array is required"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Update positions for all members
        # Leader always stays at position 1
        for item in members_data:
            member_id = item.get("id")
            new_position = item.get("position")

            if not member_id or new_position is None:
                continue

            try:
                member = MemberService.get_member_by_id(member_id)

                # Leader always gets position 1, regardless of drag position
                if member.is_leader:
                    member.position = 1
                else:
                    member.position = new_position

                member.save()
            except Exception as e:
                settings.LOGGER.error(f"Error updating member {member_id}: {e}")
                continue

        # Return updated team list
        members = MemberService.get_members_for_project(pk)
        serializer = TinyProjectMemberSerializer(members, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class PromoteToLeader(APIView):
    """Promote member to project leader"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Promote user to leader"""
        user_id = request.data.get("user_id")
        project_id = request.data.get("project_id")

        if not user_id or not project_id:
            return Response(
                {"error": "user_id and project_id are required"},
                status=HTTP_400_BAD_REQUEST,
            )

        member = MemberService.promote_to_leader(
            project_id=project_id, user_id=user_id, requesting_user=request.user
        )

        serializer = TinyProjectMemberSerializer(member)
        return Response(serializer.data, status=HTTP_202_ACCEPTED)


class MentionableUsersForProject(APIView):
    """Get all users who can be mentioned in project comments"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        Get all mentionable users for a project.

        Returns all users who have permission to comment on the project:
        - Project team members
        - Business area leads (users in same BA as project)
        - Directorate users (users in "Directorate" BA, case-sensitive)
        - Superusers
        - Caretakers of all above users
        """
        from django.contrib.auth import get_user_model

        from caretakers.models import Caretaker
        from projects.models import Project
        from users.serializers import TinyUserSerializer

        User = get_user_model()

        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response(
                {"error": f"Project {pk} not found"},
                status=HTTP_400_BAD_REQUEST,
            )

        mentionable_users = set()

        # 1. Project team members
        team_member_ids = project.members.values_list("pk", flat=True)
        mentionable_users.update(team_member_ids)

        # 2. Business area leads (users in same BA as project)
        if project.business_area:
            ba_user_ids = User.objects.filter(
                work__business_area=project.business_area
            ).values_list("pk", flat=True)
            mentionable_users.update(ba_user_ids)

        # 3. Directorate users (case-sensitive "Directorate")
        directorate_user_ids = User.objects.filter(
            work__business_area__name="Directorate"
        ).values_list("pk", flat=True)
        mentionable_users.update(directorate_user_ids)

        # 4. Superusers
        superuser_ids = User.objects.filter(is_superuser=True).values_list(
            "pk", flat=True
        )
        mentionable_users.update(superuser_ids)

        # 5. Caretakers of all above users
        caretaker_ids = Caretaker.objects.filter(
            user__pk__in=mentionable_users
        ).values_list("caretaker_id", flat=True)
        mentionable_users.update(caretaker_ids)

        # Get user objects and serialise
        users = User.objects.filter(pk__in=mentionable_users).select_related(
            "work", "work__business_area", "work__branch", "avatar"
        )

        serializer = TinyUserSerializer(users, many=True)
        return Response(serializer.data, status=HTTP_200_OK)
