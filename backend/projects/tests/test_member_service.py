"""
Tests for MemberService — project team management business logic.

Covers duplicate prevention, role validation, and member creation.
"""

import pytest
from rest_framework.exceptions import ValidationError

from common.tests.factories import ProjectFactory, UserFactory
from projects.models import ProjectMember
from projects.services.member_service import MemberService


@pytest.fixture
def requesting_user(db):
    """User making the request (for audit logging)."""
    return UserFactory(username="requester", email="requester@example.com")


@pytest.fixture
def target_user(db):
    """User to be added as a project member."""
    return UserFactory(username="target", email="target@example.com")


@pytest.fixture
def simple_project(db):
    """A project with no members."""
    return ProjectFactory(
        title="Service Test Project",
        kind="science",
        status="new",
        year=2024,
        members=[],
    )


class TestAddMember:
    """Tests for MemberService.add_member"""

    def test_add_member_with_valid_data_creates_member(
        self, simple_project, target_user, requesting_user, db
    ):
        """Valid data should create a ProjectMember successfully."""
        data = {
            "role": "technical",
            "time_allocation": 0.5,
            "position": 100,
            "is_leader": False,
        }

        member = MemberService.add_member(
            project_id=simple_project.pk,
            user_id=target_user.pk,
            data=data,
            requesting_user=requesting_user,
        )

        assert member.pk is not None
        assert member.project_id == simple_project.pk
        assert member.user_id == target_user.pk
        assert member.role == "technical"
        assert member.time_allocation == 0.5

    def test_add_member_with_missing_role_raises_validation_error(
        self, simple_project, target_user, requesting_user, db
    ):
        """Missing role should raise ValidationError."""
        data = {
            "role": "",
            "time_allocation": 0.5,
        }

        with pytest.raises(ValidationError, match="Role is required"):
            MemberService.add_member(
                project_id=simple_project.pk,
                user_id=target_user.pk,
                data=data,
                requesting_user=requesting_user,
            )

    def test_add_member_with_no_role_key_raises_validation_error(
        self, simple_project, target_user, requesting_user, db
    ):
        """Data without a role key should raise ValidationError."""
        data = {
            "time_allocation": 0.5,
        }

        with pytest.raises(ValidationError, match="Role is required"):
            MemberService.add_member(
                project_id=simple_project.pk,
                user_id=target_user.pk,
                data=data,
                requesting_user=requesting_user,
            )

    def test_add_duplicate_member_raises_validation_error(
        self, simple_project, target_user, requesting_user, db
    ):
        """Adding the same user to the same project twice should raise ValidationError."""
        data = {
            "role": "technical",
            "time_allocation": 0.5,
        }

        # First add should succeed
        MemberService.add_member(
            project_id=simple_project.pk,
            user_id=target_user.pk,
            data=data,
            requesting_user=requesting_user,
        )

        # Second add should fail with IntegrityError caught as ValidationError
        with pytest.raises(ValidationError, match="already a member of this project"):
            MemberService.add_member(
                project_id=simple_project.pk,
                user_id=target_user.pk,
                data=data,
                requesting_user=requesting_user,
            )

    def test_add_same_user_to_different_projects_succeeds(
        self, target_user, requesting_user, db
    ):
        """The same user can be a member of multiple projects."""
        project_a = ProjectFactory(
            title="Project A", kind="science", status="new", year=2024, members=[]
        )
        project_b = ProjectFactory(
            title="Project B", kind="science", status="new", year=2024, members=[]
        )

        data = {"role": "technical", "time_allocation": 0.5}

        member_a = MemberService.add_member(
            project_id=project_a.pk,
            user_id=target_user.pk,
            data=data,
            requesting_user=requesting_user,
        )
        member_b = MemberService.add_member(
            project_id=project_b.pk,
            user_id=target_user.pk,
            data=data,
            requesting_user=requesting_user,
        )

        assert member_a.pk is not None
        assert member_b.pk is not None
        assert member_a.project_id != member_b.project_id

    def test_add_member_defaults(
        self, simple_project, target_user, requesting_user, db
    ):
        """Default values should be applied when optional fields are omitted."""
        data = {"role": "research"}

        member = MemberService.add_member(
            project_id=simple_project.pk,
            user_id=target_user.pk,
            data=data,
            requesting_user=requesting_user,
        )

        assert member.is_leader is False
        assert member.time_allocation == 0
        assert member.position == 100

    def test_unique_constraint_at_database_level(self, simple_project, target_user, db):
        """The unique_together constraint should prevent duplicate rows at DB level."""
        ProjectMember.objects.create(
            project=simple_project,
            user=target_user,
            role="technical",
        )

        from django.db import IntegrityError

        with pytest.raises(IntegrityError):
            ProjectMember.objects.create(
                project=simple_project,
                user=target_user,
                role="research",
            )


class TestPromoteToLeader:
    """Tests for MemberService.promote_to_leader — role demotion on old leader"""

    def test_demoted_staff_leader_gets_research_role(self, db):
        """When a staff leader is demoted, their role should change to 'research' (Science Support)."""
        project = ProjectFactory(
            title="Promote Test", kind="science", status="new", year=2024, members=[]
        )
        old_leader_user = UserFactory(
            username="old_leader", email="old@example.com", is_staff=True
        )
        new_leader_user = UserFactory(
            username="new_leader", email="new@example.com", is_staff=True
        )
        requesting_user = UserFactory(
            username="requester_promote", email="req@example.com"
        )

        # Set up old leader
        ProjectMember.objects.create(
            project=project,
            user=old_leader_user,
            is_leader=True,
            role="supervising",
            position=0,
        )
        # Set up new leader candidate
        ProjectMember.objects.create(
            project=project,
            user=new_leader_user,
            is_leader=False,
            role="technical",
            position=1,
        )

        MemberService.promote_to_leader(
            project_id=project.pk,
            user_id=new_leader_user.pk,
            requesting_user=requesting_user,
        )

        old_leader = ProjectMember.objects.get(project=project, user=old_leader_user)
        new_leader = ProjectMember.objects.get(project=project, user=new_leader_user)

        assert old_leader.is_leader is False
        assert old_leader.role == "research"
        assert new_leader.is_leader is True

    def test_demoted_external_leader_gets_consulted_role(self, db):
        """When an external leader is demoted, their role should change to 'consulted' (Consulted Peer)."""
        project = ProjectFactory(
            title="Promote External Test",
            kind="science",
            status="new",
            year=2024,
            members=[],
        )
        old_leader_user = UserFactory(
            username="ext_leader",
            email="ext_leader@example.com",
            is_staff=False,
        )
        new_leader_user = UserFactory(
            username="new_leader_ext",
            email="new_ext@example.com",
            is_staff=True,
        )
        requesting_user = UserFactory(
            username="requester_ext", email="req_ext@example.com"
        )

        ProjectMember.objects.create(
            project=project,
            user=old_leader_user,
            is_leader=True,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=new_leader_user,
            is_leader=False,
            role="technical",
            position=1,
        )

        MemberService.promote_to_leader(
            project_id=project.pk,
            user_id=new_leader_user.pk,
            requesting_user=requesting_user,
        )

        old_leader = ProjectMember.objects.get(project=project, user=old_leader_user)

        assert old_leader.is_leader is False
        assert old_leader.role == "consulted"

    def test_new_leader_gets_supervising_role(self, db):
        """The newly promoted leader should keep their existing role (promotion only sets is_leader)."""
        project = ProjectFactory(
            title="New Leader Role Test",
            kind="science",
            status="new",
            year=2024,
            members=[],
        )
        old_leader_user = UserFactory(
            username="old_l", email="old_l@example.com", is_staff=True
        )
        new_leader_user = UserFactory(
            username="new_l", email="new_l@example.com", is_staff=True
        )
        requesting_user = UserFactory(username="req_l", email="req_l@example.com")

        ProjectMember.objects.create(
            project=project,
            user=old_leader_user,
            is_leader=True,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=new_leader_user,
            is_leader=False,
            role="technical",
            position=1,
        )

        result = MemberService.promote_to_leader(
            project_id=project.pk,
            user_id=new_leader_user.pk,
            requesting_user=requesting_user,
        )

        assert result.is_leader is True
        # Promoted leaders get the supervising role
        assert result.role == "supervising"
