"""
End-to-end tests for the MERGEUSER admin task flow.

Covers creating a MERGEUSER AdminTask via the API, approving it,
and verifying all data was transferred correctly.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from adminoptions.models import AdminTask
from common.tests.factories import (
    BusinessAreaFactory,
    UserFactory,
)
from communications.models import Comment
from documents.models import ProjectDocument
from projects.models import Project, ProjectMember

User = get_user_model()


@pytest.fixture
def superuser(db):
    """Superuser who can create and approve admin tasks."""
    return UserFactory(is_staff=True, is_superuser=True)


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


@pytest.fixture
def api_client():
    """DRF API client."""
    return APIClient()


@pytest.mark.django_db
class TestMergeUserE2EFlow:
    """Create a MERGEUSER task via the API, approve it, and verify the merge."""

    def _create_merge_task(self, api_client, superuser, primary_user, secondary_user):
        """Helper: POST to create a MERGEUSER admin task."""
        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            "/api/v1/adminoptions/tasks",
            {
                "action": "mergeuser",
                "primary_user": primary_user.pk,
                "secondary_users": [secondary_user.pk],
                "requester": superuser.pk,
                "reason": "Duplicate account",
            },
            format="json",
        )
        return response

    def _approve_task(self, api_client, superuser, task_pk):
        """Helper: POST to approve an admin task."""
        api_client.force_authenticate(user=superuser)
        return api_client.post(f"/api/v1/adminoptions/tasks/{task_pk}/approve")

    def test_full_merge_flow_transfers_memberships(
        self, api_client, superuser, primary_user, secondary_user, business_area
    ):
        """Memberships are transferred from secondary to primary after approval."""
        project = Project.objects.create(
            title="E2E Project",
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

        # Create and approve the merge task
        resp = self._create_merge_task(
            api_client, superuser, primary_user, secondary_user
        )
        assert resp.status_code == 201
        task_pk = resp.data["id"]

        approve_resp = self._approve_task(api_client, superuser, task_pk)
        assert approve_resp.status_code == 202

        # Verify membership transferred
        membership = ProjectMember.objects.get(project=project)
        assert membership.user == primary_user

    def test_full_merge_flow_transfers_documents(
        self, api_client, superuser, primary_user, secondary_user, business_area
    ):
        """Documents created by the secondary user are reassigned after approval."""
        project = Project.objects.create(
            title="Doc E2E Project",
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

        resp = self._create_merge_task(
            api_client, superuser, primary_user, secondary_user
        )
        assert resp.status_code == 201
        task_pk = resp.data["id"]

        approve_resp = self._approve_task(api_client, superuser, task_pk)
        assert approve_resp.status_code == 202

        doc.refresh_from_db()
        assert doc.creator == primary_user
        assert doc.modifier == primary_user

    def test_full_merge_flow_transfers_comments(
        self, api_client, superuser, primary_user, secondary_user, business_area
    ):
        """Comments authored by the secondary user are reassigned after approval."""
        project = Project.objects.create(
            title="Comment E2E Project",
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
            text="E2E comment",
        )

        resp = self._create_merge_task(
            api_client, superuser, primary_user, secondary_user
        )
        assert resp.status_code == 201
        task_pk = resp.data["id"]

        approve_resp = self._approve_task(api_client, superuser, task_pk)
        assert approve_resp.status_code == 202

        comment.refresh_from_db()
        assert comment.user == primary_user

    def test_full_merge_flow_deletes_secondary_user(
        self, api_client, superuser, primary_user, secondary_user
    ):
        """The secondary user is deleted after the merge is approved."""
        secondary_pk = secondary_user.pk

        resp = self._create_merge_task(
            api_client, superuser, primary_user, secondary_user
        )
        assert resp.status_code == 201
        task_pk = resp.data["id"]

        approve_resp = self._approve_task(api_client, superuser, task_pk)
        assert approve_resp.status_code == 202

        assert not User.objects.filter(pk=secondary_pk).exists()

    def test_full_merge_flow_sets_task_fulfilled(
        self, api_client, superuser, primary_user, secondary_user
    ):
        """The admin task status is set to FULFILLED after successful approval."""
        resp = self._create_merge_task(
            api_client, superuser, primary_user, secondary_user
        )
        assert resp.status_code == 201
        task_pk = resp.data["id"]

        approve_resp = self._approve_task(api_client, superuser, task_pk)
        assert approve_resp.status_code == 202

        task = AdminTask.objects.get(pk=task_pk)
        assert task.status == AdminTask.TaskStatus.FULFILLED

    def test_duplicate_merge_request_rejected(
        self, api_client, superuser, primary_user, secondary_user
    ):
        """Creating a duplicate pending merge request returns 400."""
        resp1 = self._create_merge_task(
            api_client, superuser, primary_user, secondary_user
        )
        assert resp1.status_code == 201

        resp2 = self._create_merge_task(
            api_client, superuser, primary_user, secondary_user
        )
        assert resp2.status_code == 400
