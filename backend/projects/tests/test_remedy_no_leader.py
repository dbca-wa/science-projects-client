"""
Tests for RemedyNoLeaderProjects endpoint.

Verifies that leaderless projects get a valid staff leader promoted.
"""

import pytest
from rest_framework.test import APIClient

from common.tests.factories import ProjectFactory, UserFactory
from projects.models import ProjectMember


@pytest.fixture
def admin_client():
    user = UserFactory(is_superuser=True, is_staff=True)
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
class TestRemedyNoLeader:
    """Test the remedy endpoint for leaderless projects."""

    def test_promotes_staff_with_supervising_role_first(self, admin_client):
        """Staff member with role=supervising gets promoted (priority 1)."""
        staff_sup = UserFactory(
            is_staff=True, is_active=True, email="sup@dbca.wa.gov.au"
        )
        staff_tech = UserFactory(
            is_staff=True, is_active=True, email="tech@dbca.wa.gov.au"
        )

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project,
            user=staff_tech,
            is_leader=False,
            role="technical",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=staff_sup,
            is_leader=False,
            role="supervising",
            position=1,
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/leaderless",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.data["successful"] == 1
        leader = ProjectMember.objects.get(project=project, user=staff_sup)
        assert leader.is_leader is True
        assert leader.role == "supervising"
        assert leader.position == 0

    def test_promotes_lowest_position_staff_when_no_supervising(self, admin_client):
        """Without a supervising member, lowest position valid staff wins."""
        staff_pos0 = UserFactory(
            is_staff=True, is_active=True, email="pos0@dbca.wa.gov.au"
        )
        staff_pos1 = UserFactory(
            is_staff=True, is_active=True, email="pos1@dbca.wa.gov.au"
        )

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project,
            user=staff_pos0,
            is_leader=False,
            role="research",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=staff_pos1,
            is_leader=False,
            role="technical",
            position=1,
        )

        admin_client.post(
            "/api/v1/projects/remedy/leaderless",
            {"projects": [project.pk]},
            format="json",
        )

        leader = ProjectMember.objects.get(project=project, user=staff_pos0)
        assert leader.is_leader is True
        assert leader.role == "supervising"

    def test_skips_inactive_staff(self, admin_client):
        """Inactive staff are not promoted even if they have lowest position."""
        inactive = UserFactory(
            is_staff=True, is_active=False, email="inactive@dbca.wa.gov.au"
        )
        active = UserFactory(
            is_staff=True, is_active=True, email="active@dbca.wa.gov.au"
        )

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project,
            user=inactive,
            is_leader=False,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project, user=active, is_leader=False, role="research", position=1
        )

        admin_client.post(
            "/api/v1/projects/remedy/leaderless",
            {"projects": [project.pk]},
            format="json",
        )

        # Active user should be promoted, not inactive
        leader = ProjectMember.objects.get(project=project, user=active)
        assert leader.is_leader is True

        non_leader = ProjectMember.objects.get(project=project, user=inactive)
        assert non_leader.is_leader is False

    def test_skips_non_dbca_email(self, admin_client):
        """Staff without @dbca.wa.gov.au email are not promoted."""
        non_dbca = UserFactory(is_staff=True, is_active=True, email="user@gmail.com")
        dbca = UserFactory(is_staff=True, is_active=True, email="user@dbca.wa.gov.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project,
            user=non_dbca,
            is_leader=False,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project, user=dbca, is_leader=False, role="research", position=1
        )

        admin_client.post(
            "/api/v1/projects/remedy/leaderless",
            {"projects": [project.pk]},
            format="json",
        )

        leader = ProjectMember.objects.get(project=project, user=dbca)
        assert leader.is_leader is True

    def test_fixes_staff_with_external_roles(self, admin_client):
        """Staff members with external roles get corrected to research."""
        staff = UserFactory(is_staff=True, is_active=True, email="staff@dbca.wa.gov.au")
        staff_wrong_role = UserFactory(
            is_staff=True, is_active=True, email="wrong@dbca.wa.gov.au"
        )

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project, user=staff, is_leader=False, role="research", position=0
        )
        # Staff member with external role (bad data)
        ProjectMember.objects.create(
            project=project,
            user=staff_wrong_role,
            is_leader=False,
            role="academicsuper",
            position=1,
        )

        admin_client.post(
            "/api/v1/projects/remedy/leaderless",
            {"projects": [project.pk]},
            format="json",
        )

        fixed = ProjectMember.objects.get(project=project, user=staff_wrong_role)
        assert fixed.role == "research"  # Corrected from academicsuper

    def test_fixes_external_with_staff_roles(self, admin_client):
        """External members with staff roles get corrected to consulted."""
        staff = UserFactory(is_staff=True, is_active=True, email="staff@dbca.wa.gov.au")
        external = UserFactory(is_staff=False, is_active=True, email="ext@uni.edu.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project, user=staff, is_leader=False, role="research", position=0
        )
        # External with staff role (bad data)
        ProjectMember.objects.create(
            project=project,
            user=external,
            is_leader=False,
            role="supervising",
            position=1,
        )

        admin_client.post(
            "/api/v1/projects/remedy/leaderless",
            {"projects": [project.pk]},
            format="json",
        )

        fixed = ProjectMember.objects.get(project=project, user=external)
        assert fixed.role == "consulted"  # Corrected from supervising

    def test_skips_project_with_no_valid_candidate(self, admin_client):
        """Projects with only external members are skipped."""
        ext = UserFactory(is_staff=False, is_active=True, email="ext@uni.edu.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project, user=ext, is_leader=False, role="academicsuper", position=0
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/leaderless",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.data["successful"] == 0
        assert response.data["skipped"] == 1
