"""
Tests for RemedyRoleMismatch endpoint.

Verifies that members with role=supervising but is_leader=False get corrected,
with student project awareness for external user demotion.
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
class TestRemedyRoleMismatch:
    """Test the remedy endpoint for role mismatch projects."""

    def test_demotes_staff_to_research_when_leader_exists(self, admin_client):
        """Staff with supervising but no is_leader gets research when leader exists."""
        leader = UserFactory(is_staff=True, is_active=True, email="lead@dbca.wa.gov.au")
        mismatch = UserFactory(
            is_staff=True, is_active=True, email="mis@dbca.wa.gov.au"
        )

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project, user=leader, is_leader=True, role="supervising", position=0
        )
        ProjectMember.objects.create(
            project=project,
            user=mismatch,
            is_leader=False,
            role="supervising",
            position=1,
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/role_mismatch",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.data["successful"] == 1
        mem = ProjectMember.objects.get(project=project, user=mismatch)
        assert mem.role == "research"
        assert mem.is_leader is False

    def test_demotes_external_to_consulted_on_science_project(self, admin_client):
        """External with supervising on science project gets consulted."""
        leader = UserFactory(is_staff=True, is_active=True, email="lead@dbca.wa.gov.au")
        external = UserFactory(is_staff=False, is_active=True, email="ext@uni.edu.au")

        project = ProjectFactory(members=[], status="active", kind="science")
        ProjectMember.objects.create(
            project=project, user=leader, is_leader=True, role="supervising", position=0
        )
        ProjectMember.objects.create(
            project=project,
            user=external,
            is_leader=False,
            role="supervising",
            position=1,
        )

        admin_client.post(
            "/api/v1/projects/remedy/role_mismatch",
            {"projects": [project.pk]},
            format="json",
        )

        mem = ProjectMember.objects.get(project=project, user=external)
        assert mem.role == "consulted"

    def test_demotes_external_to_student_on_student_project_no_existing_student(
        self, admin_client
    ):
        """External on student project with no existing student gets student role."""
        leader = UserFactory(is_staff=True, is_active=True, email="lead@dbca.wa.gov.au")
        external = UserFactory(is_staff=False, is_active=True, email="ext@uni.edu.au")

        project = ProjectFactory(members=[], status="active", kind="student")
        ProjectMember.objects.create(
            project=project, user=leader, is_leader=True, role="supervising", position=0
        )
        ProjectMember.objects.create(
            project=project,
            user=external,
            is_leader=False,
            role="supervising",
            position=1,
        )

        admin_client.post(
            "/api/v1/projects/remedy/role_mismatch",
            {"projects": [project.pk]},
            format="json",
        )

        mem = ProjectMember.objects.get(project=project, user=external)
        assert mem.role == "student"

    def test_demotes_external_to_academicsuper_on_student_project_with_existing_student(
        self, admin_client
    ):
        """External on student project with existing student gets academicsuper."""
        leader = UserFactory(is_staff=True, is_active=True, email="lead@dbca.wa.gov.au")
        external = UserFactory(is_staff=False, is_active=True, email="ext@uni.edu.au")
        student_user = UserFactory(
            is_staff=False, is_active=True, email="stu@uni.edu.au"
        )

        project = ProjectFactory(members=[], status="active", kind="student")
        ProjectMember.objects.create(
            project=project, user=leader, is_leader=True, role="supervising", position=0
        )
        ProjectMember.objects.create(
            project=project,
            user=student_user,
            is_leader=False,
            role="student",
            position=1,
        )
        ProjectMember.objects.create(
            project=project,
            user=external,
            is_leader=False,
            role="supervising",
            position=2,
        )

        admin_client.post(
            "/api/v1/projects/remedy/role_mismatch",
            {"projects": [project.pk]},
            format="json",
        )

        mem = ProjectMember.objects.get(project=project, user=external)
        assert mem.role == "academicsuper"

    def test_promotes_valid_staff_when_no_leader_exists(self, admin_client):
        """When no leader exists, promotes the best valid staff member."""
        staff = UserFactory(is_staff=True, is_active=True, email="staff@dbca.wa.gov.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project, user=staff, is_leader=False, role="supervising", position=1
        )

        admin_client.post(
            "/api/v1/projects/remedy/role_mismatch",
            {"projects": [project.pk]},
            format="json",
        )

        mem = ProjectMember.objects.get(project=project, user=staff)
        assert mem.is_leader is True
        assert mem.role == "supervising"
        assert mem.position == 0

    def test_promotes_lowest_position_when_multiple_mismatched(self, admin_client):
        """Among multiple mismatched, lowest position valid staff wins."""
        staff1 = UserFactory(is_staff=True, is_active=True, email="s1@dbca.wa.gov.au")
        staff2 = UserFactory(is_staff=True, is_active=True, email="s2@dbca.wa.gov.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project,
            user=staff1,
            is_leader=False,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=staff2,
            is_leader=False,
            role="supervising",
            position=1,
        )

        admin_client.post(
            "/api/v1/projects/remedy/role_mismatch",
            {"projects": [project.pk]},
            format="json",
        )

        leader = ProjectMember.objects.get(project=project, user=staff1)
        assert leader.is_leader is True

        demoted = ProjectMember.objects.get(project=project, user=staff2)
        assert demoted.is_leader is False
        assert demoted.role == "research"

    def test_skips_project_with_no_mismatch(self, admin_client):
        """Projects without the mismatch are skipped."""
        staff = UserFactory(is_staff=True, is_active=True, email="s@dbca.wa.gov.au")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project, user=staff, is_leader=True, role="supervising", position=0
        )

        response = admin_client.post(
            "/api/v1/projects/remedy/role_mismatch",
            {"projects": [project.pk]},
            format="json",
        )

        assert response.data["skipped"] == 1
        assert response.data["successful"] == 0

    def test_does_not_promote_inactive_or_non_dbca(self, admin_client):
        """Inactive or non-DBCA staff are not promoted even with supervising role."""
        inactive = UserFactory(
            is_staff=True, is_active=False, email="old@dbca.wa.gov.au"
        )
        non_dbca = UserFactory(is_staff=True, is_active=True, email="user@gmail.com")

        project = ProjectFactory(members=[], status="active")
        ProjectMember.objects.create(
            project=project,
            user=inactive,
            is_leader=False,
            role="supervising",
            position=0,
        )
        ProjectMember.objects.create(
            project=project,
            user=non_dbca,
            is_leader=False,
            role="supervising",
            position=1,
        )

        admin_client.post(
            "/api/v1/projects/remedy/role_mismatch",
            {"projects": [project.pk]},
            format="json",
        )

        # Neither should be promoted — both demoted
        mem1 = ProjectMember.objects.get(project=project, user=inactive)
        assert mem1.is_leader is False
        assert mem1.role == "research"

        mem2 = ProjectMember.objects.get(project=project, user=non_dbca)
        assert mem2.is_leader is False
        assert mem2.role == "research"
