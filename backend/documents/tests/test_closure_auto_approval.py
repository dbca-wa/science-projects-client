"""
Tests for closure auto-approval by project kind.

Science projects: closure_requested status, no auto-approval.
Student/External/Core Function: immediate full approval, project closed.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import ProjectFactory, UserFactory
from documents.models import ProjectClosure, ProjectDocument
from projects.models import ProjectMember


@pytest.fixture
def user():
    return UserFactory(is_staff=True, is_active=True, email="user@dbca.wa.gov.au")


@pytest.fixture
def api_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _create_project_with_leader(kind, user):
    """Helper to create a project of given kind with the user as leader."""
    project = ProjectFactory(members=[], status="active", kind=kind)
    ProjectMember.objects.create(
        project=project, user=user, is_leader=True, role="supervising", position=0
    )
    return project


@pytest.mark.django_db
class TestClosureAutoApproval:
    """Verify closure behaviour differs by project kind."""

    def test_science_project_gets_closure_requested(self, api_client, user):
        """Science project: closure doc created, project set to closure_requested."""
        project = _create_project_with_leader("science", user)

        response = api_client.post(
            "/api/v1/documents/projectdocuments",
            {
                "project": project.pk,
                "kind": "projectclosure",
                "outcome": "completed",
                "reason": "Done",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        project.refresh_from_db()
        assert project.status == "closure_requested"

        doc = ProjectDocument.objects.get(project=project, kind="projectclosure")
        assert doc.project_lead_approval_granted is False
        assert doc.business_area_lead_approval_granted is False
        assert doc.directorate_approval_granted is False
        assert doc.status == "new"

    def test_student_project_immediately_closed_completed(self, api_client, user):
        """Student project: closure doc fully approved, project set to completed."""
        project = _create_project_with_leader("student", user)

        response = api_client.post(
            "/api/v1/documents/projectdocuments",
            {
                "project": project.pk,
                "kind": "projectclosure",
                "outcome": "completed",
                "reason": "Graduated",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        project.refresh_from_db()
        assert project.status == "completed"

        doc = ProjectDocument.objects.get(project=project, kind="projectclosure")
        assert doc.project_lead_approval_granted is True
        assert doc.business_area_lead_approval_granted is True
        assert doc.directorate_approval_granted is True
        assert doc.status == "approved"

    def test_student_project_immediately_closed_terminated(self, api_client, user):
        """Student project with terminated outcome: project set to terminated."""
        project = _create_project_with_leader("student", user)

        response = api_client.post(
            "/api/v1/documents/projectdocuments",
            {
                "project": project.pk,
                "kind": "projectclosure",
                "outcome": "terminated",
                "reason": "Dropped out",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        project.refresh_from_db()
        assert project.status == "terminated"

    def test_external_project_immediately_closed(self, api_client, user):
        """External project: closure doc fully approved, project set to completed."""
        project = _create_project_with_leader("external", user)

        response = api_client.post(
            "/api/v1/documents/projectdocuments",
            {
                "project": project.pk,
                "kind": "projectclosure",
                "outcome": "completed",
                "reason": "Finished",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        project.refresh_from_db()
        assert project.status == "completed"

        doc = ProjectDocument.objects.get(project=project, kind="projectclosure")
        assert doc.project_lead_approval_granted is True
        assert doc.directorate_approval_granted is True
        assert doc.status == "approved"

    def test_core_function_project_immediately_closed(self, api_client, user):
        """Core function project: closure doc fully approved, project set to completed."""
        project = _create_project_with_leader("core_function", user)

        response = api_client.post(
            "/api/v1/documents/projectdocuments",
            {
                "project": project.pk,
                "kind": "projectclosure",
                "outcome": "completed",
                "reason": "No longer needed",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        project.refresh_from_db()
        assert project.status == "completed"

        doc = ProjectDocument.objects.get(project=project, kind="projectclosure")
        assert doc.project_lead_approval_granted is True
        assert doc.directorate_approval_granted is True
        assert doc.status == "approved"

    def test_closure_reason_is_stored(self, api_client, user):
        """Closure reason is stored in the ProjectClosure record."""
        project = _create_project_with_leader("student", user)

        api_client.post(
            "/api/v1/documents/projectdocuments",
            {
                "project": project.pk,
                "kind": "projectclosure",
                "outcome": "completed",
                "reason": "All objectives met",
            },
            format="json",
        )

        closure = ProjectClosure.objects.get(project=project)
        assert closure.reason == "All objectives met"
        assert closure.intended_outcome == "completed"

    def test_closure_intended_outcome_terminated(self, api_client, user):
        """Terminated outcome is stored correctly."""
        project = _create_project_with_leader("external", user)

        api_client.post(
            "/api/v1/documents/projectdocuments",
            {
                "project": project.pk,
                "kind": "projectclosure",
                "outcome": "terminated",
                "reason": "Funding cut",
            },
            format="json",
        )

        closure = ProjectClosure.objects.get(project=project)
        assert closure.intended_outcome == "terminated"

        project.refresh_from_db()
        assert project.status == "terminated"
