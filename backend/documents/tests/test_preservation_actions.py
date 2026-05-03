"""
Preservation tests for other project actions.

These tests verify that SuspendProject, ToggleUserProfileVisibilityForProject,
and ProjectClosureDetail continue to function correctly. They must PASS on
unfixed code and STILL pass after the bugfix is applied, confirming no
regressions.

Validates: Requirements 3.7, 3.8, 3.9, 3.10
"""

import pytest
from rest_framework.test import APIClient

from common.tests.factories import ProjectFactory, UserFactory
from common.tests.test_helpers import documents_urls, projects_urls
from documents.models import ProjectClosure, ProjectDocument


@pytest.mark.django_db
class TestSuspendProjectPreservation:
    """SuspendProject.post() sets status correctly based on suspend parameter."""

    def test_suspend_sets_status_to_suspended(self):
        user = UserFactory()
        project = ProjectFactory(kind="science", status="active")
        project.members.create(user=user, is_leader=True, role="supervising")

        client = APIClient()
        client.force_authenticate(user=user)

        url = projects_urls.path(project.pk, "suspend")
        response = client.post(url, data={"suspend": True}, format="json")

        assert response.status_code == 202
        project.refresh_from_db()
        assert project.status == "suspended"

    def test_unsuspend_sets_status_to_active(self):
        user = UserFactory()
        project = ProjectFactory(kind="science", status="suspended")
        project.members.create(user=user, is_leader=True, role="supervising")

        client = APIClient()
        client.force_authenticate(user=user)

        url = projects_urls.path(project.pk, "suspend")
        response = client.post(url, data={"suspend": False}, format="json")

        assert response.status_code == 202
        project.refresh_from_db()
        assert project.status == "active"


@pytest.mark.django_db
class TestToggleUserProfileVisibilityPreservation:
    """ToggleUserProfileVisibilityForProject toggles for requesting user only."""

    def test_toggle_hides_project_for_requesting_user(self):
        user = UserFactory()
        other_user = UserFactory()
        project = ProjectFactory(kind="science", status="active")
        project.members.create(user=user, is_leader=True, role="supervising")
        project.members.create(user=other_user, is_leader=False, role="research")

        client = APIClient()
        client.force_authenticate(user=user)

        url = projects_urls.path(project.pk, "toggle_user_profile_visibility")
        response = client.post(url)

        assert response.status_code == 202
        project.refresh_from_db()
        assert user.pk in project.hidden_from_staff_profiles
        assert other_user.pk not in project.hidden_from_staff_profiles

    def test_toggle_shows_project_when_already_hidden(self):
        user = UserFactory()
        project = ProjectFactory(
            kind="science",
            status="active",
            hidden_from_staff_profiles=[],
        )
        project.members.create(user=user, is_leader=True, role="supervising")

        # First toggle hides
        client = APIClient()
        client.force_authenticate(user=user)

        url = projects_urls.path(project.pk, "toggle_user_profile_visibility")
        client.post(url)
        project.refresh_from_db()
        assert user.pk in project.hidden_from_staff_profiles

        # Second toggle shows
        client.post(url)
        project.refresh_from_db()
        assert user.pk not in project.hidden_from_staff_profiles


@pytest.mark.django_db
class TestProjectClosureDetailPreservation:
    """ProjectClosureDetail GET returns closure data correctly."""

    def test_get_closure_returns_data(self):
        user = UserFactory()
        project = ProjectFactory(kind="science", status="closure_requested")

        doc = ProjectDocument.objects.create(
            project=project,
            kind="projectclosure",
            status="new",
            creator=user,
            modifier=user,
        )
        closure = ProjectClosure.objects.create(
            document=doc,
            project=project,
            reason="<p>Test closure reason</p>",
            intended_outcome="completed",
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = documents_urls.path("projectclosures", closure.pk)
        response = client.get(url)

        assert response.status_code == 200
        assert response.data["id"] == closure.pk
        assert response.data["reason"] == "<p>Test closure reason</p>"
        assert response.data["intended_outcome"] == "completed"

    def test_patch_closure_updates_data(self):
        user = UserFactory()
        project = ProjectFactory(kind="science", status="closure_requested")

        doc = ProjectDocument.objects.create(
            project=project,
            kind="projectclosure",
            status="new",
            creator=user,
            modifier=user,
        )
        closure = ProjectClosure.objects.create(
            document=doc,
            project=project,
            reason="<p>Original reason</p>",
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = documents_urls.path("projectclosures", closure.pk)
        response = client.patch(
            url,
            data={"reason": "<p>Updated reason</p>"},
            format="json",
        )

        assert response.status_code == 200
        closure.refresh_from_db()
        assert closure.reason == "<p>Updated reason</p>"

    def test_delete_closure_removes_record(self):
        user = UserFactory()
        project = ProjectFactory(kind="science", status="closure_requested")

        doc = ProjectDocument.objects.create(
            project=project,
            kind="projectclosure",
            status="new",
            creator=user,
            modifier=user,
        )
        closure = ProjectClosure.objects.create(
            document=doc,
            project=project,
            reason="<p>To be deleted</p>",
        )
        closure_pk = closure.pk

        client = APIClient()
        client.force_authenticate(user=user)

        url = documents_urls.path("projectclosures", closure_pk)
        response = client.delete(url)

        assert response.status_code == 204
        assert not ProjectClosure.objects.filter(pk=closure_pk).exists()
