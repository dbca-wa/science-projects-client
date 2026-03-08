"""
Unit tests for comment permission utilities.

Tests cover all permission scenarios for commenting, editing, and deleting comments.
"""

from unittest.mock import Mock

import pytest
from django.contrib.auth import get_user_model

from common.tests.factories import (
    BusinessAreaFactory,
    ProjectFactory,
    ProjectMemberFactory,
    UserFactory,
    UserWorkFactory,
)
from communications.utils.comment_permissions import (
    can_user_comment,
    can_user_delete_comment,
    can_user_edit_comment,
)
from projects.models import ProjectMember

User = get_user_model()


@pytest.mark.django_db
class TestCanUserComment:
    """Test can_user_comment permission function"""

    def test_superuser_can_comment_on_all_projects(self):
        """Superuser can comment on any project"""
        superuser = UserFactory(is_superuser=True)
        project = ProjectFactory()

        assert can_user_comment(superuser, project) is True

    def test_directorate_user_can_comment_on_all_projects(self):
        """User with 'Directorate' business area can comment on any project"""
        directorate_ba = BusinessAreaFactory(name="Directorate")
        user = UserFactory()
        UserWorkFactory(user=user, business_area=directorate_ba)
        project = ProjectFactory()

        assert can_user_comment(user, project) is True

    def test_directorate_is_case_sensitive(self):
        """Business area check is case-sensitive - 'directorate' != 'Directorate'"""
        lowercase_ba = BusinessAreaFactory(name="directorate")
        user = UserFactory()
        UserWorkFactory(user=user, business_area=lowercase_ba)
        project = ProjectFactory()

        assert can_user_comment(user, project) is False

    def test_project_team_member_can_comment(self):
        """Project team member can comment on their project"""
        user = UserFactory()
        project = ProjectFactory()
        ProjectMemberFactory(project=project, user=user)

        assert can_user_comment(user, project) is True

    def test_business_area_lead_can_comment_on_ba_projects(self):
        """User whose business area matches project's business area can comment"""
        business_area = BusinessAreaFactory(
            name="Biodiversity and Conservation Science"
        )
        user = UserFactory()
        UserWorkFactory(user=user, business_area=business_area)
        project = ProjectFactory(business_area=business_area)

        assert can_user_comment(user, project) is True

    def test_unauthorized_user_cannot_comment(self):
        """User with no relationship to project cannot comment"""
        user_ba = BusinessAreaFactory(name="Other Area")
        user = UserFactory()
        UserWorkFactory(user=user, business_area=user_ba)

        project_ba = BusinessAreaFactory(name="Different Area")
        project = ProjectFactory(business_area=project_ba)

        assert can_user_comment(user, project) is False

    def test_unauthenticated_user_cannot_comment(self):
        """Unauthenticated user cannot comment"""
        project = ProjectFactory()

        # Create a mock unauthenticated user
        user = Mock()
        user.is_authenticated = False

        assert can_user_comment(user, project) is False

    def test_none_user_cannot_comment(self):
        """None user cannot comment"""
        project = ProjectFactory()

        assert can_user_comment(None, project) is False

    def test_user_without_business_area_cannot_comment_as_ba_lead(self):
        """User with no business area cannot comment as BA lead"""
        user = UserFactory()
        # No UserWork created, so no business_area
        business_area = BusinessAreaFactory(name="Some Area")
        project = ProjectFactory(business_area=business_area)

        assert can_user_comment(user, project) is False

    def test_project_without_business_area_ba_lead_check_fails(self):
        """BA lead check fails if project has no business area"""
        business_area = BusinessAreaFactory(name="Some Area")
        user = UserFactory()
        UserWorkFactory(user=user, business_area=business_area)
        project = ProjectFactory(business_area=None)

        # User is not a team member or superuser
        assert can_user_comment(user, project) is False


@pytest.mark.django_db
class TestCanUserEditComment:
    """Test can_user_edit_comment permission function"""

    def test_author_with_permission_can_edit(self, comment):
        """Comment author with current comment permission can edit"""
        # Make author a superuser (has permission)
        comment.user.is_superuser = True
        comment.user.save()

        assert can_user_edit_comment(comment.user, comment) is True

    def test_author_without_permission_cannot_edit(self, comment):
        """Comment author without current comment permission cannot edit"""
        # Author has no UserWork, so no business_area
        # Author is not superuser, not team member, not BA lead
        # So they don't have current comment permission
        assert can_user_edit_comment(comment.user, comment) is False

    def test_author_team_member_can_edit(self, comment):
        """Comment author who is team member can edit"""
        # Add author as team member
        ProjectMemberFactory(project=comment.document.project, user=comment.user)

        assert can_user_edit_comment(comment.user, comment) is True

    def test_author_ba_lead_can_edit(self, comment):
        """Comment author who is BA lead can edit"""
        # Set author's business area to match project's
        business_area = BusinessAreaFactory(name="Test Area")
        comment.document.project.business_area = business_area
        comment.document.project.save()
        UserWorkFactory(user=comment.user, business_area=business_area)

        assert can_user_edit_comment(comment.user, comment) is True

    def test_non_author_cannot_edit(self, comment):
        """Non-author cannot edit even with permission"""
        other_user = UserFactory(is_superuser=True)

        assert can_user_edit_comment(other_user, comment) is False

    def test_unauthenticated_user_cannot_edit(self, comment):
        """Unauthenticated user cannot edit"""
        user = Mock()
        user.is_authenticated = False

        assert can_user_edit_comment(user, comment) is False

    def test_none_user_cannot_edit(self, comment):
        """None user cannot edit"""
        assert can_user_edit_comment(None, comment) is False

    def test_comment_without_user_cannot_be_edited(self, comment):
        """Comment without user cannot be edited"""
        comment.user = None
        comment.save()

        user = UserFactory(is_superuser=True)
        assert can_user_edit_comment(user, comment) is False


@pytest.mark.django_db
class TestCanUserDeleteComment:
    """Test can_user_delete_comment permission function"""

    def test_author_can_always_delete(self, comment):
        """Comment author can delete regardless of current project access"""
        # Author has no special permissions
        assert can_user_delete_comment(comment.user, comment) is True

    def test_author_without_project_access_can_delete(self, comment):
        """Author who lost project access can still delete"""
        # Explicitly verify author is not a team member
        assert not ProjectMember.objects.filter(
            project=comment.document.project, user=comment.user
        ).exists()

        # Author can still delete
        assert can_user_delete_comment(comment.user, comment) is True

    def test_non_author_cannot_delete(self, comment):
        """Non-author cannot delete even with permission"""
        other_user = UserFactory(is_superuser=True)

        assert can_user_delete_comment(other_user, comment) is False

    def test_superuser_non_author_cannot_delete(self, comment):
        """Superuser who is not author cannot delete"""
        superuser = UserFactory(is_superuser=True)

        assert can_user_delete_comment(superuser, comment) is False

    def test_unauthenticated_user_cannot_delete(self, comment):
        """Unauthenticated user cannot delete"""
        user = Mock()
        user.is_authenticated = False

        assert can_user_delete_comment(user, comment) is False

    def test_none_user_cannot_delete(self, comment):
        """None user cannot delete"""
        assert can_user_delete_comment(None, comment) is False

    def test_comment_without_user_cannot_be_deleted(self, comment):
        """Comment without user cannot be deleted"""
        comment.user = None
        comment.save()

        user = UserFactory(is_superuser=True)
        assert can_user_delete_comment(user, comment) is False


@pytest.mark.django_db
class TestPermissionEdgeCases:
    """Test edge cases and complex scenarios"""

    def test_multiple_permission_sources(self):
        """User with multiple permission sources (superuser + team member)"""
        superuser = UserFactory(is_superuser=True)
        project = ProjectFactory()
        ProjectMemberFactory(project=project, user=superuser)

        # Should still return True (superuser check comes first)
        assert can_user_comment(superuser, project) is True

    def test_directorate_user_also_team_member(self):
        """Directorate user who is also a team member"""
        directorate_ba = BusinessAreaFactory(name="Directorate")
        user = UserFactory()
        UserWorkFactory(user=user, business_area=directorate_ba)
        project = ProjectFactory()
        ProjectMemberFactory(project=project, user=user)

        # Should return True (Directorate check comes before team member)
        assert can_user_comment(user, project) is True

    def test_ba_lead_also_team_member(self):
        """BA lead who is also a team member"""
        business_area = BusinessAreaFactory(name="Test Area")
        user = UserFactory()
        UserWorkFactory(user=user, business_area=business_area)
        project = ProjectFactory(business_area=business_area)
        ProjectMemberFactory(project=project, user=user)

        # Should return True (team member check comes before BA lead)
        assert can_user_comment(user, project) is True

    def test_author_loses_permission_after_comment_creation(self, comment):
        """Author who had permission when commenting but lost it later"""
        # Initially author is team member
        ProjectMemberFactory(project=comment.document.project, user=comment.user)
        assert can_user_edit_comment(comment.user, comment) is True

        # Remove from team
        ProjectMember.objects.filter(
            project=comment.document.project, user=comment.user
        ).delete()

        # Can no longer edit
        assert can_user_edit_comment(comment.user, comment) is False

        # But can still delete
        assert can_user_delete_comment(comment.user, comment) is True

    def test_business_area_name_exact_match(self):
        """Business area matching requires exact string match"""
        business_area = BusinessAreaFactory(
            name="Biodiversity and Conservation Science"
        )
        partial_ba = BusinessAreaFactory(name="Biodiversity")  # Different BA
        user = UserFactory()
        UserWorkFactory(user=user, business_area=partial_ba)
        project = ProjectFactory(business_area=business_area)

        assert can_user_comment(user, project) is False

    def test_whitespace_in_business_area_name(self):
        """Business area matching is sensitive to whitespace"""
        business_area = BusinessAreaFactory(name="Test Area")
        extra_space_ba = BusinessAreaFactory(name="Test  Area")  # Different BA
        user = UserFactory()
        UserWorkFactory(user=user, business_area=extra_space_ba)
        project = ProjectFactory(business_area=business_area)

        assert can_user_comment(user, project) is False
