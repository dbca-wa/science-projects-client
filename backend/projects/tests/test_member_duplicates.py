"""
Tests for duplicate member protection on ProjectMember.

Verifies the unique_together constraint at both the database and service levels,
and confirms that non-duplicate combinations are allowed.
"""

import pytest
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

from common.tests.factories import ProjectFactory, UserFactory
from projects.models import ProjectMember
from projects.services.member_service import MemberService


@pytest.fixture
def requesting_user(db):
    """User making the request (for audit logging)."""
    return UserFactory(username="dup_requester", email="dup_requester@example.com")


@pytest.fixture
def member_user(db):
    """User to be added as a project member."""
    return UserFactory(username="dup_member", email="dup_member@example.com")


@pytest.fixture
def empty_project(db):
    """A project with no members."""
    return ProjectFactory(
        title="Duplicate Test Project",
        kind="science",
        status="new",
        year=2024,
        members=[],
    )


@pytest.mark.django_db
@pytest.mark.integration
class TestUniqueTogetherConstraint:
    """Verify the unique_together constraint exists on ProjectMember."""

    def test_unique_together_constraint_exists(self):
        """ProjectMember model should have unique_together on (project, user)."""
        meta = ProjectMember._meta
        assert hasattr(
            meta, "unique_together"
        ), "ProjectMember.Meta should define unique_together"
        # unique_together is a tuple of tuples
        assert (
            "project",
            "user",
        ) in meta.unique_together, "unique_together should include ('project', 'user')"


@pytest.mark.django_db
@pytest.mark.integration
class TestServiceLevelDuplicatePrevention:
    """Verify MemberService.add_member prevents duplicates gracefully."""

    def test_add_duplicate_member_raises_validation_error(
        self, empty_project, member_user, requesting_user
    ):
        """Calling add_member twice with the same project+user should raise ValidationError."""
        data = {"role": "technical", "time_allocation": 0.5}

        # First call succeeds
        MemberService.add_member(
            project_id=empty_project.pk,
            user_id=member_user.pk,
            data=data,
            requesting_user=requesting_user,
        )

        # Second call with same project+user should raise ValidationError
        with pytest.raises(ValidationError, match="already a member"):
            MemberService.add_member(
                project_id=empty_project.pk,
                user_id=member_user.pk,
                data=data,
                requesting_user=requesting_user,
            )

    def test_add_same_user_to_different_projects_succeeds(
        self, member_user, requesting_user
    ):
        """The same user can be a member of multiple different projects."""
        project_a = ProjectFactory(
            title="Project Alpha",
            kind="science",
            status="new",
            year=2024,
            members=[],
        )
        project_b = ProjectFactory(
            title="Project Beta",
            kind="science",
            status="new",
            year=2024,
            members=[],
        )

        data = {"role": "technical", "time_allocation": 0.5}

        member_a = MemberService.add_member(
            project_id=project_a.pk,
            user_id=member_user.pk,
            data=data,
            requesting_user=requesting_user,
        )
        member_b = MemberService.add_member(
            project_id=project_b.pk,
            user_id=member_user.pk,
            data=data,
            requesting_user=requesting_user,
        )

        assert member_a.pk is not None
        assert member_b.pk is not None
        assert member_a.project_id != member_b.project_id
        assert ProjectMember.objects.filter(user=member_user).count() == 2

    def test_add_different_users_to_same_project_succeeds(
        self, empty_project, requesting_user
    ):
        """Multiple different users can be members of the same project."""
        user_one = UserFactory(username="user_one", email="one@example.com")
        user_two = UserFactory(username="user_two", email="two@example.com")

        data = {"role": "technical", "time_allocation": 0.5}

        member_one = MemberService.add_member(
            project_id=empty_project.pk,
            user_id=user_one.pk,
            data=data,
            requesting_user=requesting_user,
        )
        member_two = MemberService.add_member(
            project_id=empty_project.pk,
            user_id=user_two.pk,
            data=data,
            requesting_user=requesting_user,
        )

        assert member_one.pk is not None
        assert member_two.pk is not None
        assert member_one.user_id != member_two.user_id
        assert ProjectMember.objects.filter(project=empty_project).count() == 2


@pytest.mark.django_db
@pytest.mark.integration
class TestDatabaseLevelConstraint:
    """Verify the DB-level unique constraint independently of the service layer."""

    def test_db_level_duplicate_raises_integrity_error(
        self, empty_project, member_user
    ):
        """Direct ProjectMember.objects.create with a duplicate should raise IntegrityError."""
        ProjectMember.objects.create(
            project=empty_project,
            user=member_user,
            role="technical",
        )

        with pytest.raises(IntegrityError):
            ProjectMember.objects.create(
                project=empty_project,
                user=member_user,
                role="research",
            )
