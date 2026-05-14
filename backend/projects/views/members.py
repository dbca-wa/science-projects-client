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
        settings.LOGGER.info(f"{request.user} is adding project member")
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
        settings.LOGGER.info(
            f"{request.user} is updating project member (project={project_id}, user={user_id})"
        )
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

    def patch(self, request, project_id, user_id):
        """Partial update project member — delegates to put with partial=True"""
        return self.put(request, project_id, user_id)

    def delete(self, request, project_id, user_id):
        """Remove member from project"""
        settings.LOGGER.warning(
            f"{request.user} is removing project member (project={project_id}, user={user_id})"
        )
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
        settings.LOGGER.info(f"{request.user} is promoting member to leader")
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

        Returns all active staff users. Any staff member can be mentioned
        in any project's comments to support cross-team communication.
        """
        from django.contrib.auth import get_user_model

        from users.serializers import TinyUserSerializer

        User = get_user_model()

        # All active staff are mentionable — not scoped to project team.
        # Users frequently need to mention people outside their immediate
        # project team for cross-team communication.
        users = User.objects.filter(
            is_active=True,
            is_staff=True,
        ).select_related("work", "work__business_area", "work__branch", "avatar")

        serializer = TinyUserSerializer(users, many=True)
        return Response(serializer.data, status=HTTP_200_OK)
