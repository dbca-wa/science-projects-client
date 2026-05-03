"""
Tests for AdminTaskService.merge_users()

Covers basic merge operations, duplicate membership resolution,
staff vs non-staff role assignment, and atomic rollback on failure.
"""

from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError

from adminoptions.services.admin_task_service import AdminTaskService
from common.tests.factories import (
    BusinessAreaFactory,
    UserFactory,
)
from communications.models import Comment
from documents.models import ProjectDocument
from projects.models import Project, ProjectMember

User = get_user_model()


@pytest.fixture
def primary_user(db):
    """Staff user who receives merged data."""
    return UserFactory(is_staff=True)


@pytest.fixture
def secondary_user(db):
    """User to be merged (and deleted)."""
    return UserFactory(is_staff=False)


@pytest.fixture
def business_area(db):
    """Shared business area for projects."""
    return BusinessAreaFactory()


@pytest.mark.django_db
class TestMergeUsersBasic:
    """Basic merge: memberships, documents, and comments are transferred."""

    def test_memberships_transferred_to_primary_user(
        self, primary_user, secondary_user, business_area
    ):
        """Memberships on projects the primary user is not part of are transferred."""
        project = Project.objects.create(
            title="Transfer Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=secondary_user,
            role=ProjectMember.RoleChoices.RESEARCH,
        )

        AdminTaskService.merge_users(primary_user, [secondary_user])

        membership = ProjectMember.objects.get(project=project)
        assert membership.user == primary_user

    def test_documents_creator_transferred(
        self, primary_user, secondary_user, business_area
    ):
        """Documents created by the secondary user are reassigned to the primary user."""
        project = Project.objects.create(
            title="Doc Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        doc = ProjectDocument.objects.create(
            project=project,
            kind=ProjectDocument.CategoryKindChoices.CONCEPTPLAN,
            creator=secondary_user,
            modifier=secondary_user,
        )

        AdminTaskService.merge_users(primary_user, [secondary_user])

        doc.refresh_from_db()
        assert doc.creator == primary_user
        assert doc.modifier == primary_user

    def test_comments_transferred(self, primary_user, secondary_user, business_area):
        """Comments authored by the secondary user are reassigned."""
        project = Project.objects.create(
            title="Comment Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        doc = ProjectDocument.objects.create(
            project=project,
            kind=ProjectDocument.CategoryKindChoices.CONCEPTPLAN,
            creator=primary_user,
        )
        comment = Comment.objects.create(
            user=secondary_user,
            document=doc,
            text="Test comment",
        )

        AdminTaskService.merge_users(primary_user, [secondary_user])

        comment.refresh_from_db()
        assert comment.user == primary_user

    def test_secondary_user_deleted(self, primary_user, secondary_user):
        """The secondary user is deleted after the merge."""
        secondary_pk = secondary_user.pk

        AdminTaskService.merge_users(primary_user, [secondary_user])

        assert not User.objects.filter(pk=secondary_pk).exists()


@pytest.mark.django_db
class TestDuplicateMembershipResolution:
    """When both users are members of the same project, role resolution applies."""

    def test_supervising_role_wins_when_secondary_is_supervising(
        self, primary_user, secondary_user, business_area
    ):
        """If the secondary user has SUPERVISING role, the primary user gets it."""
        project = Project.objects.create(
            title="Shared Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=primary_user,
            role=ProjectMember.RoleChoices.RESEARCH,
        )
        ProjectMember.objects.create(
            project=project,
            user=secondary_user,
            role=ProjectMember.RoleChoices.SUPERVISING,
        )

        AdminTaskService.merge_users(primary_user, [secondary_user])

        membership = ProjectMember.objects.get(project=project, user=primary_user)
        assert membership.role == ProjectMember.RoleChoices.SUPERVISING

    def test_supervising_role_wins_when_primary_is_supervising(
        self, primary_user, secondary_user, business_area
    ):
        """If the primary user already has SUPERVISING, it is retained."""
        project = Project.objects.create(
            title="Shared Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=primary_user,
            role=ProjectMember.RoleChoices.SUPERVISING,
        )
        ProjectMember.objects.create(
            project=project,
            user=secondary_user,
            role=ProjectMember.RoleChoices.RESEARCH,
        )

        AdminTaskService.merge_users(primary_user, [secondary_user])

        membership = ProjectMember.objects.get(project=project, user=primary_user)
        assert membership.role == ProjectMember.RoleChoices.SUPERVISING

    def test_secondary_membership_deleted_on_duplicate(
        self, primary_user, secondary_user, business_area
    ):
        """The secondary user's duplicate membership is deleted, not transferred."""
        project = Project.objects.create(
            title="Shared Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=primary_user,
            role=ProjectMember.RoleChoices.RESEARCH,
        )
        ProjectMember.objects.create(
            project=project,
            user=secondary_user,
            role=ProjectMember.RoleChoices.TECHNICAL,
        )

        AdminTaskService.merge_users(primary_user, [secondary_user])

        # Only one membership should remain for this project
        assert ProjectMember.objects.filter(project=project).count() == 1


@pytest.mark.django_db
class TestStaffVsNonStaffRoleAssignment:
    """Role assignment differs based on whether the primary user is staff."""

    def test_staff_primary_keeps_staff_role_on_duplicate(self, business_area):
        """Staff primary user adopts research/technical roles from secondary."""
        staff_user = UserFactory(is_staff=True)
        non_staff_user = UserFactory(is_staff=False)

        project = Project.objects.create(
            title="Staff Role Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=staff_user,
            role=ProjectMember.RoleChoices.TECHNICAL,
        )
        ProjectMember.objects.create(
            project=project,
            user=non_staff_user,
            role=ProjectMember.RoleChoices.RESEARCH,
        )

        AdminTaskService.merge_users(staff_user, [non_staff_user])

        membership = ProjectMember.objects.get(project=project, user=staff_user)
        # Research role from secondary replaces technical for staff primary
        assert membership.role == ProjectMember.RoleChoices.RESEARCH

    def test_non_staff_primary_keeps_external_role_on_duplicate(self, business_area):
        """Non-staff primary user adopts external roles from secondary."""
        non_staff_primary = UserFactory(is_staff=False)
        non_staff_secondary = UserFactory(is_staff=False)

        project = Project.objects.create(
            title="External Role Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=non_staff_primary,
            role=ProjectMember.RoleChoices.STUDENT,
        )
        ProjectMember.objects.create(
            project=project,
            user=non_staff_secondary,
            role=ProjectMember.RoleChoices.EXTERNALCOL,
        )

        AdminTaskService.merge_users(non_staff_primary, [non_staff_secondary])

        membership = ProjectMember.objects.get(project=project, user=non_staff_primary)
        # External collaborator role from secondary replaces student for non-staff
        assert membership.role == ProjectMember.RoleChoices.EXTERNALCOL

    def test_staff_primary_transfers_membership_without_existing(self, business_area):
        """Staff primary user receives transferred membership when not already a member."""
        staff_user = UserFactory(is_staff=True)
        secondary = UserFactory(is_staff=False)

        project = Project.objects.create(
            title="Transfer Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=secondary,
            role=ProjectMember.RoleChoices.RESEARCH,
        )

        AdminTaskService.merge_users(staff_user, [secondary])

        membership = ProjectMember.objects.get(project=project, user=staff_user)
        assert membership.role == ProjectMember.RoleChoices.RESEARCH


@pytest.mark.django_db
class TestAtomicRollbackOnFailure:
    """The merge operation is atomic — partial changes are rolled back on error."""

    def test_rollback_on_delete_failure(
        self, primary_user, secondary_user, business_area
    ):
        """If deleting the secondary user fails, all changes are rolled back."""
        project = Project.objects.create(
            title="Rollback Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=secondary_user,
            role=ProjectMember.RoleChoices.RESEARCH,
        )
        doc = ProjectDocument.objects.create(
            project=project,
            kind=ProjectDocument.CategoryKindChoices.CONCEPTPLAN,
            creator=secondary_user,
        )

        # Patch the delete method to raise an error after transfers
        with patch.object(
            User, "delete", side_effect=IntegrityError("Simulated failure")
        ):
            with pytest.raises(IntegrityError):
                AdminTaskService.merge_users(primary_user, [secondary_user])

        # Verify rollback: secondary user still exists
        assert User.objects.filter(pk=secondary_user.pk).exists()

        # Verify rollback: document creator unchanged
        doc.refresh_from_db()
        assert doc.creator == secondary_user

        # Verify rollback: membership still belongs to secondary user
        membership = ProjectMember.objects.get(project=project)
        assert membership.user == secondary_user
