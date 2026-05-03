"""
Edge case tests for AdminTaskService.merge_users().

Covers merging a user who leads projects, merging a user with caretaker
relationships, merging the only member of a project, and self-merge
prevention.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.exceptions import NotFound

from adminoptions.services.admin_task_service import AdminTaskService
from caretakers.models import Caretaker
from common.tests.factories import (
    BusinessAreaFactory,
    UserFactory,
)
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
class TestMergeUserLeadership:
    """Merging a user who is a project leader."""

    def test_leadership_transfers_to_primary_user(
        self, primary_user, secondary_user, business_area
    ):
        """When the secondary user is a project leader, the leadership
        membership is transferred to the primary user."""
        project = Project.objects.create(
            title="Leader Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=secondary_user,
            role=ProjectMember.RoleChoices.SUPERVISING,
            is_leader=True,
        )

        AdminTaskService.merge_users(primary_user, [secondary_user])

        membership = ProjectMember.objects.get(project=project)
        assert membership.user == primary_user
        assert membership.is_leader is True

    def test_leadership_preserved_when_primary_already_member(
        self, primary_user, secondary_user, business_area
    ):
        """When both users are members and the secondary is the leader,
        the primary user's membership gains the supervising role."""
        project = Project.objects.create(
            title="Shared Leader Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=primary_user,
            role=ProjectMember.RoleChoices.RESEARCH,
            is_leader=False,
        )
        ProjectMember.objects.create(
            project=project,
            user=secondary_user,
            role=ProjectMember.RoleChoices.SUPERVISING,
            is_leader=True,
        )

        AdminTaskService.merge_users(primary_user, [secondary_user])

        membership = ProjectMember.objects.get(project=project, user=primary_user)
        assert membership.role == ProjectMember.RoleChoices.SUPERVISING


@pytest.mark.django_db
class TestMergeUserCaretakerRelationships:
    """Merging a user who has caretaker relationships."""

    def test_caretaker_relationship_where_secondary_is_cared_for(
        self, primary_user, secondary_user
    ):
        """When the secondary user has a caretaker, the caretaker
        relationship is deleted along with the secondary user (cascade)."""
        caretaker_user = UserFactory()
        caretaker_obj = Caretaker.objects.create(
            user=secondary_user,
            caretaker=caretaker_user,
            reason="Test caretaker",
        )
        caretaker_pk = caretaker_obj.pk
        secondary_pk = secondary_user.pk

        AdminTaskService.merge_users(primary_user, [secondary_user])

        # Secondary user deleted, so the caretaker relationship is gone
        assert not Caretaker.objects.filter(pk=caretaker_pk).exists()
        assert not User.objects.filter(pk=secondary_pk).exists()

    def test_caretaker_relationship_where_secondary_is_caretaker(
        self, primary_user, secondary_user
    ):
        """When the secondary user is a caretaker for someone else,
        that relationship is deleted along with the secondary user."""
        cared_for_user = UserFactory()
        caretaker_obj = Caretaker.objects.create(
            user=cared_for_user,
            caretaker=secondary_user,
            reason="Secondary is caretaker",
        )
        caretaker_pk = caretaker_obj.pk
        secondary_pk = secondary_user.pk

        AdminTaskService.merge_users(primary_user, [secondary_user])

        assert not Caretaker.objects.filter(pk=caretaker_pk).exists()
        assert not User.objects.filter(pk=secondary_pk).exists()


@pytest.mark.django_db
class TestMergeOnlyMemberOfProject:
    """Merging a user who is the sole member of a project."""

    def test_sole_member_transferred_to_primary(
        self, primary_user, secondary_user, business_area
    ):
        """When the secondary user is the only member of a project,
        the membership is transferred to the primary user."""
        project = Project.objects.create(
            title="Solo Project",
            description="Test",
            business_area=business_area,
            status=Project.StatusChoices.NEW,
            kind=Project.CategoryKindChoices.SCIENCE,
        )
        ProjectMember.objects.create(
            project=project,
            user=secondary_user,
            role=ProjectMember.RoleChoices.RESEARCH,
            is_leader=True,
        )

        AdminTaskService.merge_users(primary_user, [secondary_user])

        assert ProjectMember.objects.filter(project=project, user=primary_user).exists()
        assert ProjectMember.objects.filter(project=project).count() == 1


@pytest.mark.django_db
class TestMergeSelfPrevention:
    """Attempting to merge a user with themselves should fail."""

    def test_merge_with_self_raises_value_error(self, primary_user):
        """Merging a user with themselves raises ValueError."""
        with pytest.raises(
            ValueError, match="Primary user cannot also be a secondary user"
        ):
            AdminTaskService.merge_users(primary_user, [primary_user])

    def test_merge_with_self_among_multiple_secondary_raises_value_error(
        self, primary_user
    ):
        """If the primary user appears anywhere in the secondary list,
        ValueError is raised."""
        other_user = UserFactory()
        with pytest.raises(
            ValueError, match="Primary user cannot also be a secondary user"
        ):
            AdminTaskService.merge_users(primary_user, [other_user, primary_user])


@pytest.mark.django_db
class TestMergeMissingSecondaryUser:
    """Attempting to merge a non-existent secondary user should fail."""

    def test_merge_with_deleted_secondary_raises_not_found(self, primary_user):
        """If a secondary user has been deleted before the merge runs,
        NotFound is raised."""
        ghost_user = UserFactory()
        ghost_pk = ghost_user.pk
        ghost_user.delete()

        # Create a fake user object with the deleted pk
        fake_user = User(pk=ghost_pk)
        with pytest.raises(NotFound):
            AdminTaskService.merge_users(primary_user, [fake_user])
