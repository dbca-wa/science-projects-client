"""
Tests for MentionableUsersForProject view — returns users who can be
mentioned in project comments.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import (
    BusinessAreaFactory,
    ProjectFactory,
    ProjectMemberFactory,
    UserFactory,
    UserWorkFactory,
)
from common.tests.test_helpers import projects_urls


@pytest.fixture
def api_client():
    """Provide API client for view tests"""
    return APIClient()


class TestMentionableUsersForProject:
    """Tests for MentionableUsersForProject view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_200_with_list(self, api_client):
        """Endpoint returns 200 and a list of users"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)

        api_client.force_authenticate(user=user)
        response = api_client.get(
            projects_urls.path(project.pk, "mentionable-users"),
        )

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_includes_ba_users(self, api_client):
        """Users in the same business area are included"""
        leader = UserFactory()
        ba_user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=leader, is_leader=True)
        UserWorkFactory(user=ba_user, business_area=ba)

        api_client.force_authenticate(user=leader)
        response = api_client.get(
            projects_urls.path(project.pk, "mentionable-users"),
        )

        assert response.status_code == status.HTTP_200_OK
        returned_ids = {u["id"] for u in response.data}
        assert ba_user.pk in returned_ids

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_includes_superusers(self, api_client):
        """Superusers are included in mentionable users"""
        user = UserFactory()
        superuser = UserFactory(is_superuser=True)
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)

        api_client.force_authenticate(user=user)
        response = api_client.get(
            projects_urls.path(project.pk, "mentionable-users"),
        )

        assert response.status_code == status.HTTP_200_OK
        returned_ids = {u["id"] for u in response.data}
        assert superuser.pk in returned_ids

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_includes_directorate_users(self, api_client):
        """Users in the 'Directorate' business area are included"""
        user = UserFactory()
        directorate_user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)

        # Create a BA named "Directorate" and assign a user to it
        directorate_ba = BusinessAreaFactory(name="Directorate")
        UserWorkFactory(user=directorate_user, business_area=directorate_ba)

        api_client.force_authenticate(user=user)
        response = api_client.get(
            projects_urls.path(project.pk, "mentionable-users"),
        )

        assert response.status_code == status.HTTP_200_OK
        returned_ids = {u["id"] for u in response.data}
        assert directorate_user.pk in returned_ids

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_includes_caretakers_of_superusers(self, api_client):
        """Caretakers of mentionable users (e.g. superusers) are included"""
        from caretakers.models import Caretaker

        user = UserFactory()
        superuser = UserFactory(is_superuser=True)
        caretaker_user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)
        # Caretaker of the superuser
        Caretaker.objects.create(
            user=superuser, caretaker=caretaker_user, reason="On leave"
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(
            projects_urls.path(project.pk, "mentionable-users"),
        )

        assert response.status_code == status.HTTP_200_OK
        returned_ids = {u["id"] for u in response.data}
        assert caretaker_user.pk in returned_ids

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_project_without_ba(self, api_client):
        """Project without a business area still returns 200"""
        user = UserFactory()
        project = ProjectFactory(business_area=None, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)

        api_client.force_authenticate(user=user)
        response = api_client.get(
            projects_urls.path(project.pk, "mentionable-users"),
        )

        assert response.status_code == status.HTTP_200_OK

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_nonexistent_project_returns_400(self, api_client):
        """Non-existent project returns 400"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(
            projects_urls.path(99999, "mentionable-users"),
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_returns_403(self, api_client):
        """Unauthenticated request is rejected"""
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        response = api_client.get(
            projects_urls.path(project.pk, "mentionable-users"),
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestMembersForProjectReorder:
    """Additional coverage for MembersForProject.put — reorder edge cases"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_reorder_empty_members_returns_400(self, api_client):
        """PUT with empty members array returns 400"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)

        api_client.force_authenticate(user=user)
        response = api_client.put(
            projects_urls.path(project.pk, "team"),
            {"members": []},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_reorder_missing_members_key_returns_400(self, api_client):
        """PUT without members key returns 400"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)

        api_client.force_authenticate(user=user)
        response = api_client.put(
            projects_urls.path(project.pk, "team"),
            {},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_reorder_with_missing_id_skips_item(self, api_client):
        """PUT with member item missing id skips that item"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        member = ProjectMemberFactory(project=project, user=user, is_leader=True)

        api_client.force_authenticate(user=user)
        response = api_client.put(
            projects_urls.path(project.pk, "team"),
            {"members": [{"position": 2}, {"id": member.pk, "position": 1}]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
