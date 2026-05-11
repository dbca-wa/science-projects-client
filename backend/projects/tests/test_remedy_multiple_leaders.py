"""
Tests for RemedyMultipleLeaderProjects endpoint.

Verifies that projects with multiple is_leader=True members get resolved
to exactly one valid leader.
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
class TestRemedyMultipleLeaders:
    """Test the remedy endpoint for multiple-leader projects."""

    def test_keeps_supervising_leader_with_lowest_position(self, admin_client):
        """Among two leaders with supervising role, lowest position wins."""
        staff1 = UserFactory(is_staff=True, is_active=True, email="s1@dbca.wa.gov.au")
        staff2 = UserFactory(is_staff=True, is_active=True, email="s2@dbca.wa.gov.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project, user=staff1, is_leader=True, role="supervising", position=0
        )
        ProjectMember.objects.create(
            project=project, user=staff2, is_leader=True, role="supervising", position=1
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/multiple_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.data["successful"] == 1

        winner = ProjectMember.objects.get(project=project, user=staff1)
        assert winner.is_leader is True
        assert winner.role == "supervising"
        assert winner.position == 0

        loser = ProjectMember.objects.get(project=project, user=staff2)
        assert loser.is_leader is False
        assert loser.role == "research"  # Demoted from supervising

    def test_prefers_supervising_role_over_lower_position(self, admin_client):
        """Leader with supervising role wins even if at higher position number."""
        staff_tech = UserFactory(
            is_staff=True, is_active=True, email="tech@dbca.wa.gov.au"
        )
        staff_sup = UserFactory(
            is_staff=True, is_active=True, email="sup@dbca.wa.gov.au"
        )

        project = ProjectFactory(members=[], status="active")
        # tech at position 0 but NOT supervising
        ProjectMember.objects.create(
            project=project,
            user=staff_tech,
            is_leader=True,
            role="technical",
            position=0,
        )
        # sup at position 1 WITH supervising
        ProjectMember.objects.create(
            project=project,
            user=staff_sup,
            is_leader=True,
            role="supervising",
            position=1,
        )

        admin_client.post(
            "/api/v1/projects/remedy/multiple_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        winner = ProjectMember.objects.get(project=project, user=staff_sup)
        assert winner.is_leader is True
        assert winner.role == "supervising"

        loser = ProjectMember.objects.get(project=project, user=staff_tech)
        assert loser.is_leader is False
        assert loser.role == "technical"  # Keeps their original role (valid staff role)

    def test_prefers_active_dbca_over_inactive(self, admin_client):
        """Active user with @dbca email wins over inactive user."""
        inactive = UserFactory(
            is_staff=True, is_active=False, email="old@dbca.wa.gov.au"
        )
        active = UserFactory(is_staff=True, is_active=True, email="new@dbca.wa.gov.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project,
            user=inactive,
            is_leader=True,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project, user=active, is_leader=True, role="supervising", position=1
        )

        admin_client.post(
            "/api/v1/projects/remedy/multiple_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        winner = ProjectMember.objects.get(project=project, user=active)
        assert winner.is_leader is True

        loser = ProjectMember.objects.get(project=project, user=inactive)
        assert loser.is_leader is False

    def test_prefers_dbca_email_over_non_dbca(self, admin_client):
        """User with @dbca email wins over user without."""
        non_dbca = UserFactory(is_staff=True, is_active=True, email="user@gmail.com")
        dbca = UserFactory(is_staff=True, is_active=True, email="user@dbca.wa.gov.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project,
            user=non_dbca,
            is_leader=True,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project, user=dbca, is_leader=True, role="supervising", position=1
        )

        admin_client.post(
            "/api/v1/projects/remedy/multiple_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        winner = ProjectMember.objects.get(project=project, user=dbca)
        assert winner.is_leader is True

        loser = ProjectMember.objects.get(project=project, user=non_dbca)
        assert loser.is_leader is False

    def test_external_leader_demoted_to_consulted(self, admin_client):
        """External user who was leader gets role=consulted (not supervising)."""
        external = UserFactory(is_staff=False, is_active=True, email="ext@uni.edu.au")
        staff = UserFactory(is_staff=True, is_active=True, email="staff@dbca.wa.gov.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project,
            user=external,
            is_leader=True,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project, user=staff, is_leader=True, role="supervising", position=1
        )

        admin_client.post(
            "/api/v1/projects/remedy/multiple_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        ext_mem = ProjectMember.objects.get(project=project, user=external)
        assert ext_mem.is_leader is False
        assert ext_mem.role == "consulted"  # External can't have supervising

    def test_only_one_leader_after_remedy(self, admin_client):
        """After remedy, exactly one member has is_leader=True."""
        users = [
            UserFactory(is_staff=True, is_active=True, email=f"u{i}@dbca.wa.gov.au")
            for i in range(3)
        ]

        project = ProjectFactory(members=[], status="active")
        for i, user in enumerate(users):
            ProjectMember.objects.create(
                project=project,
                user=user,
                is_leader=True,
                role="supervising",
                position=i,
            )

        admin_client.post(
            "/api/v1/projects/remedy/multiple_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        leaders = ProjectMember.objects.filter(project=project, is_leader=True)
        assert leaders.count() == 1

    def test_demoted_members_position_not_zero(self, admin_client):
        """Demoted members don't stay at position 0 (reserved for leader)."""
        staff1 = UserFactory(is_staff=True, is_active=True, email="s1@dbca.wa.gov.au")
        staff2 = UserFactory(is_staff=True, is_active=True, email="s2@dbca.wa.gov.au")

        project = ProjectFactory(members=[], status="active")
        # Both at position 0 (bad data)
        ProjectMember.objects.create(
            project=project, user=staff1, is_leader=True, role="supervising", position=0
        )
        ProjectMember.objects.create(
            project=project, user=staff2, is_leader=True, role="research", position=0
        )

        admin_client.post(
            "/api/v1/projects/remedy/multiple_leaders",
            {"projects": [project.pk]},
            format="json",
        )

        # The non-leader should have position > 0
        non_leaders = ProjectMember.objects.filter(project=project, is_leader=False)
        for mem in non_leaders:
            assert mem.position > 0

    def test_handles_multiple_projects(self, admin_client):
        """Can remedy multiple projects in one call."""
        staff1 = UserFactory(is_staff=True, is_active=True, email="s1@dbca.wa.gov.au")
        staff2 = UserFactory(is_staff=True, is_active=True, email="s2@dbca.wa.gov.au")
        staff3 = UserFactory(is_staff=True, is_active=True, email="s3@dbca.wa.gov.au")
        staff4 = UserFactory(is_staff=True, is_active=True, email="s4@dbca.wa.gov.au")

        p1 = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=p1, user=staff1, is_leader=True, role="supervising", position=0
        )
        ProjectMember.objects.create(
            project=p1, user=staff2, is_leader=True, role="research", position=1
        )

        p2 = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=p2, user=staff3, is_leader=True, role="supervising", position=0
        )
        ProjectMember.objects.create(
            project=p2, user=staff4, is_leader=True, role="supervising", position=1
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/multiple_leaders",
            {"projects": [p1.pk, p2.pk]},
            format="json",
        )

        assert response.data["successful"] == 2
        assert ProjectMember.objects.filter(project=p1, is_leader=True).count() == 1
        assert ProjectMember.objects.filter(project=p2, is_leader=True).count() == 1
