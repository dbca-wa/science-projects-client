from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from projects.models import ProjectDraft


class DraftService:
    """Service layer for project draft CRUD operations."""

    @staticmethod
    def get_draft(user, project_kind):
        """Get a draft for the given user and project kind, or None."""
        try:
            return ProjectDraft.objects.get(user=user, project_kind=project_kind)
        except ProjectDraft.DoesNotExist:
            return None

    @staticmethod
    def save_draft(user, project_kind, data, current_step=0):
        """Create or update a draft (upsert)."""
        draft, _created = ProjectDraft.objects.update_or_create(
            user=user,
            project_kind=project_kind,
            defaults={
                "data": data,
                "current_step": current_step,
            },
        )
        return draft

    @staticmethod
    def delete_draft(user, project_kind):
        """Delete a draft for the given user and project kind."""
        deleted_count, _ = ProjectDraft.objects.filter(
            user=user, project_kind=project_kind
        ).delete()
        return deleted_count > 0

    @staticmethod
    def cleanup_old_drafts(days=30):
        """Delete drafts older than the specified number of days."""
        cutoff = timezone.now() - timedelta(days=days)
        deleted_count, _ = ProjectDraft.objects.filter(updated_at__lt=cutoff).delete()
        if deleted_count > 0:
            settings.LOGGER.info(f"Cleaned up {deleted_count} old project draft(s)")
        return deleted_count
