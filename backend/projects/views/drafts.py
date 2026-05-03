from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project
from projects.services.draft_service import DraftService


class ProjectDraftDetail(APIView):
    """
    GET    /projects/drafts/<kind> — Retrieve draft for the authenticated user
    PUT    /projects/drafts/<kind> — Create or update draft (upsert)
    DELETE /projects/drafts/<kind> — Delete draft
    """

    permission_classes = [IsAuthenticated]

    def _validate_kind(self, kind):
        """Validate that the kind is a valid project category."""
        valid_kinds = [choice[0] for choice in Project.CategoryKindChoices.choices]
        if kind not in valid_kinds:
            return False
        return True

    def get(self, request, kind):
        if not self._validate_kind(kind):
            return Response(
                {"detail": f"Invalid project kind: {kind}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        draft = DraftService.get_draft(request.user, kind)
        if not draft:
            return Response(
                {"detail": "No draft found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "id": draft.pk,
                "project_kind": draft.project_kind,
                "data": draft.data,
                "current_step": draft.current_step,
                "created_at": draft.created_at,
                "updated_at": draft.updated_at,
            }
        )

    def put(self, request, kind):
        if not self._validate_kind(kind):
            return Response(
                {"detail": f"Invalid project kind: {kind}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.get("data", {})
        current_step = request.data.get("current_step", 0)

        draft = DraftService.save_draft(
            user=request.user,
            project_kind=kind,
            data=data,
            current_step=current_step,
        )

        return Response(
            {
                "id": draft.pk,
                "project_kind": draft.project_kind,
                "data": draft.data,
                "current_step": draft.current_step,
                "created_at": draft.created_at,
                "updated_at": draft.updated_at,
            }
        )

    def delete(self, request, kind):
        if not self._validate_kind(kind):
            return Response(
                {"detail": f"Invalid project kind: {kind}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deleted = DraftService.delete_draft(request.user, kind)
        if not deleted:
            return Response(
                {"detail": "No draft found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)
