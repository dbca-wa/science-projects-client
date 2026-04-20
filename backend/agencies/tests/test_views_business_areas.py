"""
Tests for business area views: MyBusinessAreas, BusinessAreasUnapprovedDocs,
BusinessAreasProblematicProjects.
"""

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import (
    BusinessAreaFactory,
    ProjectDocumentFactory,
    ProjectFactory,
    ProjectMemberFactory,
    UserFactory,
)
from common.tests.test_helpers import agencies_urls


@pytest.fixture
def api_client():
    """Provide API client for view tests"""
    return APIClient()


class TestMyBusinessAreas:
    """Tests for MyBusinessAreas view — returns BAs led by the current user"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_business_areas_led_by_user(self, api_client):
        """User sees only the BAs they lead"""
        leader = UserFactory()
        other_user = UserFactory()
        ba_mine = BusinessAreaFactory(leader=leader)
        BusinessAreaFactory(leader=other_user)  # should not appear

        api_client.force_authenticate(user=leader)
        response = api_client.get(agencies_urls.path("business_areas", "mine"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == ba_mine.name

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_empty_when_user_leads_none(self, api_client):
        """User who leads no BAs gets an empty list"""
        user = UserFactory()
        BusinessAreaFactory()  # led by someone else

        api_client.force_authenticate(user=user)
        response = api_client.get(agencies_urls.path("business_areas", "mine"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_multiple_business_areas(self, api_client):
        """User leading multiple BAs sees all of them"""
        leader = UserFactory()
        ba1 = BusinessAreaFactory(leader=leader)
        ba2 = BusinessAreaFactory(leader=leader)

        api_client.force_authenticate(user=leader)
        response = api_client.get(agencies_urls.path("business_areas", "mine"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        returned_names = {item["name"] for item in response.data}
        assert ba1.name in returned_names
        assert ba2.name in returned_names

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_returns_403(self, api_client):
        """Unauthenticated request is rejected"""
        response = api_client.get(agencies_urls.path("business_areas", "mine"))
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestBusinessAreasUnapprovedDocs:
    """Tests for BusinessAreasUnapprovedDocs view — POST with baArray"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_unapproved_docs_for_ba(self, api_client):
        """POST with baArray returns unapproved docs grouped by BA pk"""
        user = UserFactory()
        ba = BusinessAreaFactory(leader=user)
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)
        doc = ProjectDocumentFactory(
            project=project,
            kind="concept",
            status="new",
            directorate_approval_granted=False,
        )
        # Create the concept plan detail so has_project_document_data returns True
        from documents.models import ConceptPlan

        ConceptPlan.objects.create(
            document=doc,
            project=project,
            background="bg",
            aims="aims",
            outcome="outcome",
            collaborations="collab",
            strategic_context="ctx",
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas", "unapproved_docs"),
            {"baArray": [ba.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert ba.pk in response.data
        ba_data = response.data[ba.pk]
        assert "linked" in ba_data
        assert "unlinked" in ba_data

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_empty_when_all_approved(self, api_client):
        """BA with only approved docs returns empty linked/unlinked lists"""
        user = UserFactory()
        ba = BusinessAreaFactory(leader=user)
        project = ProjectFactory(business_area=ba, members=[])
        ProjectDocumentFactory(
            project=project,
            kind="concept",
            status="approved",
            directorate_approval_granted=True,
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas", "unapproved_docs"),
            {"baArray": [ba.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        ba_data = response.data[ba.pk]
        assert len(ba_data["linked"]) == 0
        assert len(ba_data["unlinked"]) == 0

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_handles_multiple_bas(self, api_client):
        """POST with multiple BA pks returns data for each"""
        user = UserFactory()
        ba1 = BusinessAreaFactory(leader=user)
        ba2 = BusinessAreaFactory(leader=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas", "unapproved_docs"),
            {"baArray": [ba1.pk, ba2.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert ba1.pk in response.data
        assert ba2.pk in response.data

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_bad_request_on_missing_data(self, api_client):
        """POST without baArray returns 400"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas", "unapproved_docs"),
            {},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestBusinessAreasProblematicProjects:
    """Tests for BusinessAreasProblematicProjects view — GET and POST"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_requires_business_area_id(self, api_client):
        """GET without business_area_id returns 400"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(
            agencies_urls.path("business_areas", "problematic_projects"),
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_returns_categorised_projects(self, api_client):
        """GET with business_area_id returns categorised problematic projects"""
        user = UserFactory()
        ba = BusinessAreaFactory(leader=user)
        # Create a project with no members (memberless)
        ProjectFactory(business_area=ba, members=[])

        api_client.force_authenticate(user=user)
        response = api_client.get(
            agencies_urls.path("business_areas", "problematic_projects"),
            {"business_area_id": ba.pk},
        )

        assert response.status_code == status.HTTP_200_OK
        assert "no_members" in response.data
        assert "no_leader" in response.data
        assert "external_leader" in response.data
        assert "multiple_leads" in response.data
        # The memberless project should appear in no_members
        assert len(response.data["no_members"]) == 1

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_detects_no_leader(self, api_client):
        """Project with members but no supervising role is flagged as no_leader"""
        user = UserFactory()
        ba = BusinessAreaFactory(leader=user)
        project = ProjectFactory(business_area=ba, members=[])
        # Add a member who is NOT supervising
        ProjectMemberFactory(project=project, user=user, is_leader=False, role="cited")

        api_client.force_authenticate(user=user)
        response = api_client.get(
            agencies_urls.path("business_areas", "problematic_projects"),
            {"business_area_id": ba.pk},
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["no_leader"]) == 1

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_detects_multiple_leaders(self, api_client):
        """Project with multiple supervising members is flagged"""
        user1 = UserFactory()
        user2 = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(
            project=project, user=user1, is_leader=True, role="supervising"
        )
        ProjectMemberFactory(
            project=project, user=user2, is_leader=True, role="supervising"
        )

        api_client.force_authenticate(user=user1)
        response = api_client.get(
            agencies_urls.path("business_areas", "problematic_projects"),
            {"business_area_id": ba.pk},
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["multiple_leads"]) == 1

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_detects_externally_led(self, api_client):
        """Project led by a non-staff user is flagged as externally led"""
        external_user = UserFactory(is_staff=False)
        staff_user = UserFactory(is_staff=True)
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(
            project=project,
            user=external_user,
            is_leader=True,
            role="supervising",
        )

        api_client.force_authenticate(user=staff_user)
        response = api_client.get(
            agencies_urls.path("business_areas", "problematic_projects"),
            {"business_area_id": ba.pk},
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["external_leader"]) == 1

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_post_returns_data_per_ba(self, api_client):
        """POST with baArray returns categorised data for each BA"""
        user = UserFactory()
        ba1 = BusinessAreaFactory(leader=user)
        ba2 = BusinessAreaFactory(leader=user)
        ProjectFactory(business_area=ba1, members=[])  # memberless

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas", "problematic_projects"),
            {"baArray": [ba1.pk, ba2.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert ba1.pk in response.data
        assert ba2.pk in response.data
        assert len(response.data[ba1.pk]["no_members"]) == 1
        assert len(response.data[ba2.pk]["no_members"]) == 0

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_healthy_project_not_flagged(self, api_client):
        """A project with exactly one staff supervising member is not flagged"""
        staff_user = UserFactory(is_staff=True)
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(
            project=project, user=staff_user, is_leader=True, role="supervising"
        )

        api_client.force_authenticate(user=staff_user)
        response = api_client.get(
            agencies_urls.path("business_areas", "problematic_projects"),
            {"business_area_id": ba.pk},
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["no_members"]) == 0
        assert len(response.data["no_leader"]) == 0
        assert len(response.data["external_leader"]) == 0
        assert len(response.data["multiple_leads"]) == 0


class TestCategoriseProjects:
    """Unit tests for BusinessAreasProblematicProjects._categorise_projects"""

    @pytest.mark.unit
    def test_empty_projects(self):
        """Empty queryset returns empty categories"""
        from agencies.views.business_areas import BusinessAreasProblematicProjects

        result = BusinessAreasProblematicProjects._categorise_projects([])
        assert result == {
            "no_members": [],
            "no_leader": [],
            "external_leader": [],
            "multiple_leads": [],
        }


class TestBusinessAreasUnapprovedDocsUnlinked:
    """Tests for unlinked document path in BusinessAreasUnapprovedDocs"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unlinked_docs_returned_separately(self, api_client):
        """Documents without detail data appear in the unlinked list"""
        user = UserFactory()
        ba = BusinessAreaFactory(leader=user)
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)
        # Create a concept doc WITHOUT a ConceptPlan detail record
        ProjectDocumentFactory(
            project=project,
            kind="concept",
            status="new",
            directorate_approval_granted=False,
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            agencies_urls.path("business_areas", "unapproved_docs"),
            {"baArray": [ba.pk]},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        ba_data = response.data[ba.pk]
        # Without a ConceptPlan detail, the doc should be unlinked
        assert len(ba_data["unlinked"]) == 1
        assert len(ba_data["linked"]) == 0
        # Unlinked docs should have waiting_on = None
        assert ba_data["unlinked"][0]["waiting_on"] is None
