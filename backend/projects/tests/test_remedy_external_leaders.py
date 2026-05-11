"""
Comprehensive tests for the RemedyExternalLeaderProjects endpoint.

Tests the POST action that fixes externally-led projects by transferring
leadership from external users to staff members.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import ProjectFactory, UserFactory
from projects.models import ProjectMember


@pytest.fixture
def admin_client():
    """Authenticated admin API client."""
    user = UserFactory(is_superuser=True, is_staff=True)
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def staff_user():
    """Active staff user."""
    return UserFactory(is_staff=True, is_active=True, email="staff@dbca.wa.gov.au")


@pytest.fixture
def external_user():
    """External (non-staff) user."""
    return UserFactory(is_staff=False, is_active=True, email="external@uni.edu.au")


@pytest.mark.django_db
class TestRemedyExternalLeaders:
    """Test the remedy endpoint for externally-led projects."""

    def _create_externally_led_project(
        self, external_user, staff_user, staff_role="research"
    ):
        """Helper: create a project with external leader and staff member."""
        project = ProjectFactory()
        # Clear auto-created members
        ProjectMember.objects.filter(project=project).delete()

        # External user is leader with academicsuper role
        ProjectMember.objects.create(
            project=project,
            user=external_user,
            is_leader=True,
            role="academicsuper",
            position=0,
        )
        # Staff user is NOT leader
        ProjectMember.objects.create(
            project=project,
            user=staff_user,
            is_leader=False,
            role=staff_role,
            position=1,
        )
        return project

    def test_promotes_staff_with_supervising_role_first(
        self, admin_client, external_user
    ):
        """Staff member with role=supervising gets promoted (priority 1)."""
        staff_supervising = UserFactory(is_staff=True, email="sci@dbca.wa.gov.au")
        staff_other = UserFactory(is_staff=True, email="tech@dbca.wa.gov.au")

        project = ProjectFactory()
        ProjectMember.objects.filter(project=project).delete()

        ProjectMember.objects.create(
            project=project,
            user=external_user,
            is_leader=True,
            role="academicsuper",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=staff_other,
            is_leader=False,
            role="technical",
            position=1,
        )
        ProjectMember.objects.create(
            project=project,
            user=staff_supervising,
            is_leader=False,
            role="supervising",
            position=2,
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/external_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["successful"] == 1

        # Staff supervising should be the new leader
        new_leader = ProjectMember.objects.get(project=project, user=staff_supervising)
        assert new_leader.is_leader is True
        assert new_leader.role == "supervising"
        assert new_leader.position == 0

        # External user demoted but keeps their role
        ext = ProjectMember.objects.get(project=project, user=external_user)
        assert ext.is_leader is False
        assert ext.role == "academicsuper"  # Role preserved

        # Other staff member unchanged
        other = ProjectMember.objects.get(project=project, user=staff_other)
        assert other.is_leader is False
        assert other.role == "technical"

    def test_preserves_external_user_role(
        self, admin_client, external_user, staff_user
    ):
        """External user's role is preserved (not changed to consulted)."""
        project = self._create_externally_led_project(
            external_user, staff_user, staff_role="research"
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/external_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["successful"] == 1

        ext = ProjectMember.objects.get(project=project, user=external_user)
        assert ext.is_leader is False
        assert ext.role == "academicsuper"  # Preserved, not changed

    def test_changes_external_supervising_role_to_consulted(
        self, admin_client, staff_user
    ):
        """External user with role=supervising gets changed to consulted (invalid combo)."""
        external_with_supervising = UserFactory(is_staff=False, email="ext@uni.edu.au")

        project = ProjectFactory()
        ProjectMember.objects.filter(project=project).delete()

        ProjectMember.objects.create(
            project=project,
            user=external_with_supervising,
            is_leader=True,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=staff_user,
            is_leader=False,
            role="research",
            position=1,
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/external_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        ext = ProjectMember.objects.get(project=project, user=external_with_supervising)
        assert ext.is_leader is False
        assert ext.role == "consulted"  # Changed from supervising

    def test_new_leader_gets_supervising_role_and_position_zero(
        self, admin_client, external_user, staff_user
    ):
        """Promoted staff member gets role=supervising and position=0."""
        project = self._create_externally_led_project(
            external_user, staff_user, staff_role="research"
        )

        admin_client.post(
            "/api/v1/projects/remedy/external_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        leader = ProjectMember.objects.get(project=project, user=staff_user)
        assert leader.is_leader is True
        assert leader.role == "supervising"
        assert leader.position == 0

    def test_clears_duplicate_is_leader_flags(self, admin_client):
        """If multiple members have is_leader=True, only the new leader keeps it."""
        ext1 = UserFactory(is_staff=False, email="ext1@uni.edu.au")
        ext2 = UserFactory(is_staff=False, email="ext2@uni.edu.au")
        staff = UserFactory(is_staff=True, email="staff@dbca.wa.gov.au")

        project = ProjectFactory()
        ProjectMember.objects.filter(project=project).delete()

        # Two external leaders (bad data)
        ProjectMember.objects.create(
            project=project,
            user=ext1,
            is_leader=True,
            role="academicsuper",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=ext2,
            is_leader=True,
            role="student",
            position=1,
        )
        ProjectMember.objects.create(
            project=project,
            user=staff,
            is_leader=False,
            role="supervising",
            position=2,
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/external_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.data["successful"] == 1

        # Only the staff member should be leader
        leaders = ProjectMember.objects.filter(project=project, is_leader=True)
        assert leaders.count() == 1
        assert leaders.first().user == staff

    def test_skips_project_with_no_external_leader(self, admin_client, staff_user):
        """Projects without external leaders are skipped."""
        project = ProjectFactory()
        ProjectMember.objects.filter(project=project).delete()

        # Staff leader — not externally led
        ProjectMember.objects.create(
            project=project,
            user=staff_user,
            is_leader=True,
            role="supervising",
            position=0,
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/external_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.data["successful"] == 0
        assert response.data["skipped"] == 1

    def test_skips_project_with_no_staff_members(self, admin_client):
        """Projects with only external members are skipped (can't promote anyone)."""
        ext1 = UserFactory(is_staff=False, email="ext1@uni.edu.au")
        ext2 = UserFactory(is_staff=False, email="ext2@uni.edu.au")

        project = ProjectFactory()
        ProjectMember.objects.filter(project=project).delete()

        ProjectMember.objects.create(
            project=project,
            user=ext1,
            is_leader=True,
            role="academicsuper",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=ext2,
            is_leader=False,
            role="student",
            position=1,
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/external_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.data["successful"] == 0
        assert response.data["skipped"] == 1

    def test_handles_multiple_projects(self, admin_client):
        """Can remedy multiple projects in one call."""
        ext1 = UserFactory(is_staff=False, email="ext1@uni.edu.au")
        ext2 = UserFactory(is_staff=False, email="ext2@uni.edu.au")
        staff1 = UserFactory(is_staff=True, email="staff1@dbca.wa.gov.au")
        staff2 = UserFactory(is_staff=True, email="staff2@dbca.wa.gov.au")

        project1 = ProjectFactory()
        ProjectMember.objects.filter(project=project1).delete()
        ProjectMember.objects.create(
            project=project1,
            user=ext1,
            is_leader=True,
            role="academicsuper",
            position=0,
        )
        ProjectMember.objects.create(
            project=project1,
            user=staff1,
            is_leader=False,
            role="supervising",
            position=1,
        )

        project2 = ProjectFactory()
        ProjectMember.objects.filter(project=project2).delete()
        ProjectMember.objects.create(
            project=project2, user=ext2, is_leader=True, role="student", position=0
        )
        ProjectMember.objects.create(
            project=project2, user=staff2, is_leader=False, role="research", position=1
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/external_leaders",
            {"projects": [project1.pk, project2.pk]},
            format="json",
        )

        assert response.data["successful"] == 2

        # Project 1: staff1 (supervising) promoted
        assert (
            ProjectMember.objects.get(project=project1, user=staff1).is_leader is True
        )
        assert ProjectMember.objects.get(project=project1, user=ext1).is_leader is False

        # Project 2: staff2 promoted, gets supervising role
        leader2 = ProjectMember.objects.get(project=project2, user=staff2)
        assert leader2.is_leader is True
        assert leader2.role == "supervising"
        # ext2 keeps their student role
        assert ProjectMember.objects.get(project=project2, user=ext2).role == "student"

    def test_returns_400_with_no_projects(self, admin_client):
        """Returns 400 when no project IDs provided."""
        response = admin_client.post(
            "/api/v1/projects/remedy/external_leaders",
            {"projects": []},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
