"""
Tests for DraftService and ProjectDraft model.
"""

from datetime import timedelta

import pytest
from django.db import IntegrityError
from django.utils import timezone

from common.tests.factories import UserFactory
from projects.models import ProjectDraft
from projects.services.draft_service import DraftService


@pytest.fixture
def draft_user(db):
    """Provide a user for draft tests."""
    return UserFactory(
        username="draftuser",
        email="draftuser@example.com",
        first_name="Draft",
        last_name="User",
    )


@pytest.fixture
def draft_user_b(db):
    """Provide a second user for draft tests."""
    return UserFactory(
        username="draftuser_b",
        email="draftuser_b@example.com",
        first_name="Other",
        last_name="User",
    )


class TestDraftServiceGetDraft:
    """Tests for DraftService.get_draft"""

    @pytest.mark.integration
    def test_get_draft_returns_none_when_no_draft_exists(self, draft_user):
        """get_draft returns None when no draft exists for the user and kind."""
        result = DraftService.get_draft(draft_user, "science")
        assert result is None

    @pytest.mark.integration
    def test_get_draft_returns_existing_draft(self, draft_user):
        """get_draft returns the draft when one exists."""
        DraftService.save_draft(
            draft_user, "science", {"title": "My Project"}, current_step=2
        )
        result = DraftService.get_draft(draft_user, "science")
        assert result is not None
        assert result.project_kind == "science"
        assert result.data == {"title": "My Project"}
        assert result.current_step == 2


class TestDraftServiceSaveDraft:
    """Tests for DraftService.save_draft"""

    @pytest.mark.integration
    def test_save_draft_creates_new_draft(self, draft_user):
        """save_draft creates a new draft when none exists."""
        draft = DraftService.save_draft(
            draft_user, "science", {"title": "New"}, current_step=1
        )
        assert draft.pk is not None
        assert draft.user == draft_user
        assert draft.project_kind == "science"
        assert draft.data == {"title": "New"}
        assert draft.current_step == 1

    @pytest.mark.integration
    def test_save_draft_updates_existing_draft(self, draft_user):
        """save_draft updates an existing draft (upsert behaviour)."""
        original = DraftService.save_draft(
            draft_user, "science", {"title": "Original"}, current_step=0
        )
        updated = DraftService.save_draft(
            draft_user, "science", {"title": "Updated"}, current_step=3
        )
        assert updated.pk == original.pk
        assert updated.data == {"title": "Updated"}
        assert updated.current_step == 3
        assert (
            ProjectDraft.objects.filter(user=draft_user, project_kind="science").count()
            == 1
        )


class TestDraftServiceDeleteDraft:
    """Tests for DraftService.delete_draft"""

    @pytest.mark.integration
    def test_delete_draft_removes_existing_draft(self, draft_user):
        """delete_draft removes the draft and returns True."""
        DraftService.save_draft(draft_user, "science", {"title": "To Delete"})
        result = DraftService.delete_draft(draft_user, "science")
        assert result is True
        assert DraftService.get_draft(draft_user, "science") is None

    @pytest.mark.integration
    def test_delete_draft_returns_false_when_no_draft_exists(self, draft_user):
        """delete_draft returns False when no draft exists."""
        result = DraftService.delete_draft(draft_user, "science")
        assert result is False


class TestDraftServiceCleanup:
    """Tests for DraftService.cleanup_old_drafts"""

    @pytest.mark.integration
    def test_cleanup_old_drafts_removes_stale_drafts(self, draft_user):
        """cleanup_old_drafts removes drafts older than the specified days."""
        draft = DraftService.save_draft(draft_user, "science", {"title": "Old"})
        # Manually set updated_at to 31 days ago
        cutoff = timezone.now() - timedelta(days=31)
        ProjectDraft.objects.filter(pk=draft.pk).update(updated_at=cutoff)

        deleted_count = DraftService.cleanup_old_drafts(days=30)
        assert deleted_count == 1
        assert DraftService.get_draft(draft_user, "science") is None

    @pytest.mark.integration
    def test_cleanup_old_drafts_keeps_recent_drafts(self, draft_user):
        """cleanup_old_drafts does not remove recent drafts."""
        DraftService.save_draft(draft_user, "science", {"title": "Recent"})

        deleted_count = DraftService.cleanup_old_drafts(days=30)
        assert deleted_count == 0
        assert DraftService.get_draft(draft_user, "science") is not None


class TestProjectDraftModel:
    """Tests for ProjectDraft model constraints."""

    @pytest.mark.integration
    def test_unique_together_prevents_duplicate_drafts(self, draft_user):
        """The unique_together constraint prevents two drafts for the same user and kind."""
        ProjectDraft.objects.create(
            user=draft_user, project_kind="science", data={}, current_step=0
        )
        with pytest.raises(IntegrityError):
            ProjectDraft.objects.create(
                user=draft_user, project_kind="science", data={}, current_step=1
            )

    @pytest.mark.integration
    def test_different_kinds_allowed_for_same_user(self, draft_user):
        """A user can have drafts for different project kinds."""
        DraftService.save_draft(draft_user, "science", {"title": "Science"})
        DraftService.save_draft(draft_user, "student", {"title": "Student"})
        assert ProjectDraft.objects.filter(user=draft_user).count() == 2

    @pytest.mark.integration
    def test_different_users_allowed_for_same_kind(self, draft_user, draft_user_b):
        """Different users can have drafts for the same project kind."""
        DraftService.save_draft(draft_user, "science", {"title": "User A"})
        DraftService.save_draft(draft_user_b, "science", {"title": "User B"})
        assert ProjectDraft.objects.filter(project_kind="science").count() == 2

    @pytest.mark.integration
    def test_str_representation(self, draft_user):
        """The __str__ method returns a readable representation."""
        draft = DraftService.save_draft(draft_user, "science", {})
        assert "science" in str(draft)
        assert str(draft_user) in str(draft)
