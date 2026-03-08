"""
Integration tests for comment view permissions.

Tests verify that API endpoints properly enforce permission checks for commenting,
editing, deleting, and reacting to comments.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from common.tests.factories import (
    BusinessAreaFactory,
    ProjectDocumentFactory,
    ProjectFactory,
    ProjectMemberFactory,
    UserFactory,
    UserWorkFactory,
)
from communications.models import Comment, Reaction

User = get_user_model()


@pytest.fixture
def api_client():
    """Provide an API client"""
    return APIClient()


@pytest.fixture
def project_with_document(db):
    """Provide a project with a document"""
    project = ProjectFactory()
    document = ProjectDocumentFactory(project=project)
    return project, document


@pytest.mark.django_db
class TestCommentCreationPermissions:
    """Test comment creation permission checks"""

    def test_unauthorized_user_gets_403_on_comment_creation(
        self, api_client, project_with_document
    ):
        """Unauthorized user cannot create comments"""
        project, document = project_with_document
        user = UserFactory()
        # User has no UserWork, not a team member, not superuser

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/comments",
            {
                "document": document.pk,
                "text": "Test comment",
            },
        )

        assert response.status_code == 403
        assert "permission" in response.data["error"].lower()
        assert Comment.objects.count() == 0

    def test_team_member_gets_201_on_comment_creation(
        self, api_client, project_with_document
    ):
        """Project team member can create comments"""
        project, document = project_with_document
        user = UserFactory()
        ProjectMemberFactory(project=project, user=user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/comments",
            {
                "document": document.pk,
                "text": "Test comment from team member",
            },
        )

        assert response.status_code == 201
        assert Comment.objects.count() == 1
        comment = Comment.objects.first()
        assert comment.user == user
        assert comment.text == "Test comment from team member"

    def test_directorate_user_gets_201_on_comment_creation(
        self, api_client, project_with_document
    ):
        """Directorate user can create comments on any project"""
        project, document = project_with_document
        directorate_ba = BusinessAreaFactory(name="Directorate")
        user = UserFactory()
        UserWorkFactory(user=user, business_area=directorate_ba)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/comments",
            {
                "document": document.pk,
                "text": "Test comment from Directorate",
            },
        )

        assert response.status_code == 201
        assert Comment.objects.count() == 1

    def test_lowercase_directorate_user_gets_403(
        self, api_client, project_with_document
    ):
        """User with lowercase 'directorate' cannot create comments (case-sensitive)"""
        project, document = project_with_document
        lowercase_ba = BusinessAreaFactory(name="directorate")
        user = UserFactory()
        UserWorkFactory(user=user, business_area=lowercase_ba)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/comments",
            {
                "document": document.pk,
                "text": "Test comment",
            },
        )

        assert response.status_code == 403
        assert Comment.objects.count() == 0

    def test_superuser_gets_201_on_comment_creation(
        self, api_client, project_with_document
    ):
        """Superuser can create comments on any project"""
        project, document = project_with_document
        superuser = UserFactory(is_superuser=True)

        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            "/api/v1/communications/comments",
            {
                "document": document.pk,
                "text": "Test comment from superuser",
            },
        )

        assert response.status_code == 201
        assert Comment.objects.count() == 1

    def test_ba_lead_gets_201_on_comment_creation(
        self, api_client, project_with_document
    ):
        """Business area lead can create comments on their BA projects"""
        project, document = project_with_document
        business_area = BusinessAreaFactory(name="Test BA")
        project.business_area = business_area
        project.save()

        user = UserFactory()
        UserWorkFactory(user=user, business_area=business_area)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/comments",
            {
                "document": document.pk,
                "text": "Test comment from BA lead",
            },
        )

        assert response.status_code == 201
        assert Comment.objects.count() == 1


@pytest.mark.django_db
class TestCommentEditPermissions:
    """Test comment edit permission checks"""

    def test_author_without_permission_gets_403_on_edit(
        self, api_client, project_with_document
    ):
        """Author who lost project access cannot edit their comment"""
        project, document = project_with_document
        user = UserFactory()

        # Create comment (user was team member at creation time)
        comment = Comment.objects.create(
            user=user,
            document=document,
            text="Original comment",
            ip_address="127.0.0.1",
        )

        # User is no longer team member and has no other permissions
        api_client.force_authenticate(user=user)
        response = api_client.put(
            f"/api/v1/communications/comments/{comment.pk}",
            {
                "text": "Updated comment",
            },
        )

        assert response.status_code == 403
        assert "permission" in response.data["error"].lower()
        comment.refresh_from_db()
        assert comment.text == "Original comment"

    def test_author_with_permission_gets_202_on_edit(
        self, api_client, project_with_document
    ):
        """Author with current project access can edit their comment"""
        project, document = project_with_document
        user = UserFactory()
        ProjectMemberFactory(project=project, user=user)

        comment = Comment.objects.create(
            user=user,
            document=document,
            text="Original comment",
            ip_address="127.0.0.1",
        )

        api_client.force_authenticate(user=user)
        response = api_client.put(
            f"/api/v1/communications/comments/{comment.pk}",
            {
                "text": "Updated comment",
            },
        )

        assert response.status_code == 202
        comment.refresh_from_db()
        assert comment.text == "Updated comment"

    def test_non_author_gets_403_on_edit(self, api_client, project_with_document):
        """Non-author cannot edit comment even with project access"""
        project, document = project_with_document
        author = UserFactory()
        other_user = UserFactory(is_superuser=True)  # Even superuser can't edit

        comment = Comment.objects.create(
            user=author,
            document=document,
            text="Original comment",
            ip_address="127.0.0.1",
        )

        api_client.force_authenticate(user=other_user)
        response = api_client.put(
            f"/api/v1/communications/comments/{comment.pk}",
            {
                "text": "Updated comment",
            },
        )

        assert response.status_code == 403
        comment.refresh_from_db()
        assert comment.text == "Original comment"


@pytest.mark.django_db
class TestCommentDeletePermissions:
    """Test comment delete permission checks"""

    def test_author_without_permission_gets_204_on_delete(
        self, api_client, project_with_document
    ):
        """Author can delete their comment even after losing project access"""
        project, document = project_with_document
        user = UserFactory()

        comment = Comment.objects.create(
            user=user,
            document=document,
            text="Test comment",
            ip_address="127.0.0.1",
        )

        # User has no project permissions
        api_client.force_authenticate(user=user)
        response = api_client.delete(f"/api/v1/communications/comments/{comment.pk}")

        assert response.status_code == 204
        # Comment is soft-deleted (is_removed=True), not hard-deleted
        comment.refresh_from_db()
        assert comment.is_removed is True
        assert Comment.objects.count() == 1  # Still exists in DB
        assert Comment.objects.filter(is_removed=False).count() == 0  # But not visible

    def test_non_author_gets_403_on_delete(self, api_client, project_with_document):
        """Non-author cannot delete comment even with project access"""
        project, document = project_with_document
        author = UserFactory()
        other_user = UserFactory(is_superuser=True)  # Even superuser can't delete

        comment = Comment.objects.create(
            user=author,
            document=document,
            text="Test comment",
            ip_address="127.0.0.1",
        )

        api_client.force_authenticate(user=other_user)
        response = api_client.delete(f"/api/v1/communications/comments/{comment.pk}")

        assert response.status_code == 403
        assert Comment.objects.count() == 1


@pytest.mark.django_db
class TestReactionPermissions:
    """Test reaction permission checks"""

    def test_unauthorized_user_gets_403_on_reaction(
        self, api_client, project_with_document
    ):
        """Unauthorized user cannot react to comments"""
        project, document = project_with_document
        author = UserFactory()
        user = UserFactory()  # No permissions

        comment = Comment.objects.create(
            user=author,
            document=document,
            text="Test comment",
            ip_address="127.0.0.1",
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/reactions",
            {
                "comment": comment.pk,
                "reaction": "thumbup",
            },
        )

        assert response.status_code == 403
        assert "permission" in response.data["error"].lower()
        assert Reaction.objects.count() == 0

    def test_authorized_user_gets_201_on_reaction(
        self, api_client, project_with_document
    ):
        """Authorized user can react to comments"""
        project, document = project_with_document
        author = UserFactory()
        user = UserFactory()
        ProjectMemberFactory(project=project, user=user)

        comment = Comment.objects.create(
            user=author,
            document=document,
            text="Test comment",
            ip_address="127.0.0.1",
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/reactions",
            {
                "comment": comment.pk,
                "reaction": "thumbup",
            },
        )

        assert response.status_code == 201
        assert Reaction.objects.count() == 1
        reaction = Reaction.objects.first()
        assert reaction.user == user
        assert reaction.comment == comment

    def test_authorized_user_gets_204_on_reaction_toggle_off(
        self, api_client, project_with_document
    ):
        """Authorized user can toggle off their reaction"""
        project, document = project_with_document
        author = UserFactory()
        user = UserFactory()
        ProjectMemberFactory(project=project, user=user)

        comment = Comment.objects.create(
            user=author,
            document=document,
            text="Test comment",
            ip_address="127.0.0.1",
        )

        # Create initial reaction
        Reaction.objects.create(
            user=user,
            comment=comment,
            reaction=Reaction.ReactionChoices.THUMBUP,
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/reactions",
            {
                "comment": comment.pk,
                "reaction": "thumbup",
            },
        )

        assert response.status_code == 204
        assert Reaction.objects.count() == 0

    def test_directorate_user_can_react(self, api_client, project_with_document):
        """Directorate user can react to comments"""
        project, document = project_with_document
        author = UserFactory()
        directorate_ba = BusinessAreaFactory(name="Directorate")
        user = UserFactory()
        UserWorkFactory(user=user, business_area=directorate_ba)

        comment = Comment.objects.create(
            user=author,
            document=document,
            text="Test comment",
            ip_address="127.0.0.1",
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/reactions",
            {
                "comment": comment.pk,
                "reaction": "heart",
            },
        )

        assert response.status_code == 201
        assert Reaction.objects.count() == 1

    def test_superuser_can_react(self, api_client, project_with_document):
        """Superuser can react to comments"""
        project, document = project_with_document
        author = UserFactory()
        superuser = UserFactory(is_superuser=True)

        comment = Comment.objects.create(
            user=author,
            document=document,
            text="Test comment",
            ip_address="127.0.0.1",
        )

        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            "/api/v1/communications/reactions",
            {
                "comment": comment.pk,
                "reaction": "celebrate",
            },
        )

        assert response.status_code == 201
        assert Reaction.objects.count() == 1

    def test_ba_lead_can_react(self, api_client, project_with_document):
        """Business area lead can react to comments on their BA projects"""
        project, document = project_with_document
        business_area = BusinessAreaFactory(name="Test BA")
        project.business_area = business_area
        project.save()

        author = UserFactory()
        user = UserFactory()
        UserWorkFactory(user=user, business_area=business_area)

        comment = Comment.objects.create(
            user=author,
            document=document,
            text="Test comment",
            ip_address="127.0.0.1",
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/reactions",
            {
                "comment": comment.pk,
                "reaction": "thumbup",
            },
        )

        assert response.status_code == 201
        assert Reaction.objects.count() == 1


@pytest.mark.django_db
class TestPermissionEdgeCases:
    """Test edge cases in permission checks"""

    def test_comment_creation_with_invalid_document(self, api_client):
        """Comment creation with invalid document ID returns 400"""
        user = UserFactory(is_superuser=True)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/comments",
            {
                "document": 99999,  # Non-existent document
                "text": "Test comment",
            },
        )

        assert response.status_code == 400
        # Serializer validation error returns different format
        assert "document" in response.data or "error" in response.data

    def test_comment_creation_without_document(self, api_client):
        """Comment creation without document ID returns 400"""
        user = UserFactory(is_superuser=True)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/comments",
            {
                "text": "Test comment",
            },
        )

        assert response.status_code == 400

    def test_reaction_without_comment_id(self, api_client):
        """Reaction without comment ID returns 400"""
        user = UserFactory(is_superuser=True)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/reactions",
            {
                "reaction": "thumbup",
            },
        )

        assert response.status_code == 400
        assert "comment" in response.data["error"].lower()

    def test_reaction_without_reaction_type(self, api_client, project_with_document):
        """Reaction without reaction type returns 400"""
        project, document = project_with_document
        user = UserFactory(is_superuser=True)

        comment = Comment.objects.create(
            user=user,
            document=document,
            text="Test comment",
            ip_address="127.0.0.1",
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            "/api/v1/communications/reactions",
            {
                "comment": comment.pk,
            },
        )

        assert response.status_code == 400
        assert "reaction" in response.data["error"].lower()
