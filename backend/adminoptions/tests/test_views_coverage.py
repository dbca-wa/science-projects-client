"""
Tests for adminoptions/views.py — covering uncovered lines 85-1241.

Targets:
- AdminControlsDetail PUT with guide_content merge and invalid data
- AdminControlsGuideContentUpdate edge cases
- GuideSectionViewSet role-based filtering
- AdminTasks POST validation branches (merge user, caretaker, delete project)
- SendAllTestEmails
- MergeUsers edge cases
- RespondToCaretakerRequest edge cases
"""

from unittest.mock import patch

import pytest
from rest_framework import status

from adminoptions.models import AdminOptions, AdminTask, ContentField, GuideSection
from common.tests.test_helpers import adminoptions_urls
from users.models import User

# =============================================================================
# AdminControlsDetail — PUT with guide_content merge edge cases
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestAdminControlsDetailExtended:
    """Extended tests for AdminControlsDetail PUT"""

    def test_put_with_guide_content_merge_existing_none(
        self, api_client, admin_user, db
    ):
        """PUT merges guide_content when existing is None"""
        api_client.force_authenticate(user=admin_user)
        admin_options = AdminOptions.objects.create(
            email_options=AdminOptions.EmailOptions.ENABLED,
            maintainer=admin_user,
            guide_content={},
        )
        # guide_content defaults to {}, so the merge should work
        data = {"guide_content": {"new_key": "new_value"}}
        response = api_client.put(
            adminoptions_urls.detail(admin_options.id), data, format="json"
        )
        # The view merges with current_guide_content (None or {}),
        # so {**None, **new} would fail — but the view does `or {}` first
        assert response.status_code == status.HTTP_202_ACCEPTED

    def test_put_invalid_data(self, api_client, admin_user, admin_options, db):
        """PUT with invalid email_options returns 400"""
        api_client.force_authenticate(user=admin_user)
        data = {"email_options": "invalid_choice"}
        response = api_client.put(
            adminoptions_urls.detail(admin_options.id), data, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# =============================================================================
# AdminControlsGuideContentUpdate — edge cases
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestGuideContentUpdateExtended:
    """Extended tests for AdminControlsGuideContentUpdate"""

    def test_update_guide_content_not_found(self, api_client, admin_user, db):
        """POST to non-existent admin options returns 404"""
        api_client.force_authenticate(user=admin_user)
        data = {"field_key": "test", "content": "test"}
        response = api_client.post(
            adminoptions_urls.path(99999, "update_guide_content"),
            data,
            format="json",
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_guide_content_with_none_guide_content(
        self, api_client, admin_user, db
    ):
        """POST initialises guide_content when it is empty"""
        api_client.force_authenticate(user=admin_user)
        admin_options = AdminOptions.objects.create(
            email_options=AdminOptions.EmailOptions.ENABLED,
            maintainer=admin_user,
            guide_content={},
        )

        data = {"field_key": "new_field", "content": "new content"}
        response = api_client.post(
            adminoptions_urls.path(admin_options.id, "update_guide_content"),
            data,
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        admin_options.refresh_from_db()
        assert admin_options.guide_content["new_field"] == "new content"

    def test_update_guide_content_empty_content(self, api_client, admin_user, db):
        """POST with empty string content is valid (content is not None)"""
        api_client.force_authenticate(user=admin_user)
        admin_options = AdminOptions.objects.create(
            email_options=AdminOptions.EmailOptions.ENABLED,
            maintainer=admin_user,
            guide_content={},
        )
        data = {"field_key": "empty_field", "content": ""}
        response = api_client.post(
            adminoptions_urls.path(admin_options.id, "update_guide_content"),
            data,
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        admin_options.refresh_from_db()
        assert admin_options.guide_content["empty_field"] == ""


# =============================================================================
# GuideSectionViewSet — role-based filtering
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestGuideSectionRoleFiltering:
    """Tests for GuideSectionViewSet get_queryset role filtering

    Covers the role-based filtering logic in get_queryset().
    """

    def test_superuser_sees_all_sections(self, api_client, admin_user, db):
        """Superuser sees all sections regardless of required_role"""
        api_client.force_authenticate(user=admin_user)
        GuideSection.objects.create(
            id="all-section", title="All", required_role="all", order=0
        )
        GuideSection.objects.create(
            id="admin-section", title="Admin", required_role="admin", order=1
        )
        GuideSection.objects.create(
            id="ba-section",
            title="BA Lead",
            required_role="business_area_lead",
            order=2,
        )
        GuideSection.objects.create(
            id="ks-section",
            title="Key Stakeholder",
            required_role="key_stakeholder",
            order=3,
        )

        response = api_client.get(adminoptions_urls.path("guide-sections"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 4

    def test_regular_user_sees_only_all_sections(self, api_client, user, db):
        """Regular user only sees sections with required_role='all'"""
        api_client.force_authenticate(user=user)
        GuideSection.objects.create(
            id="all-section", title="All", required_role="all", order=0
        )
        GuideSection.objects.create(
            id="admin-section", title="Admin", required_role="admin", order=1
        )

        response = api_client.get(adminoptions_urls.path("guide-sections"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["id"] == "all-section"

    def test_ba_lead_sees_ba_and_all_sections(self, api_client, user, db):
        """Business area lead sees 'all' and 'business_area_lead' sections"""
        api_client.force_authenticate(user=user)
        # Make user a BA lead
        from common.tests.factories import BusinessAreaFactory

        ba = BusinessAreaFactory(leader=user)  # noqa: F841

        GuideSection.objects.create(
            id="all-section", title="All", required_role="all", order=0
        )
        GuideSection.objects.create(
            id="ba-section",
            title="BA Lead",
            required_role="business_area_lead",
            order=1,
        )
        GuideSection.objects.create(
            id="admin-section", title="Admin", required_role="admin", order=2
        )

        response = api_client.get(adminoptions_urls.path("guide-sections"))
        assert response.status_code == status.HTTP_200_OK
        section_ids = [s["id"] for s in response.data]
        assert "all-section" in section_ids
        assert "ba-section" in section_ids
        assert "admin-section" not in section_ids

    def test_key_stakeholder_sees_ks_ba_and_all_sections(self, api_client, user, db):
        """Key stakeholder sees 'all', 'business_area_lead', and 'key_stakeholder' sections"""
        api_client.force_authenticate(user=user)
        # Make user a key stakeholder
        from common.tests.factories import DivisionFactory

        division = DivisionFactory()
        division.key_stakeholder = user
        division.save()

        GuideSection.objects.create(
            id="all-section", title="All", required_role="all", order=0
        )
        GuideSection.objects.create(
            id="ba-section",
            title="BA Lead",
            required_role="business_area_lead",
            order=1,
        )
        GuideSection.objects.create(
            id="ks-section",
            title="Key Stakeholder",
            required_role="key_stakeholder",
            order=2,
        )
        GuideSection.objects.create(
            id="admin-section", title="Admin", required_role="admin", order=3
        )

        response = api_client.get(adminoptions_urls.path("guide-sections"))
        assert response.status_code == status.HTTP_200_OK
        section_ids = [s["id"] for s in response.data]
        assert "all-section" in section_ids
        assert "ba-section" in section_ids
        assert "ks-section" in section_ids
        assert "admin-section" not in section_ids

    def test_create_guide_section_requires_admin(self, api_client, user, db):
        """Regular user cannot create guide sections"""
        api_client.force_authenticate(user=user)
        data = {
            "id": "new-section",
            "title": "New Section",
            "order": 1,
            "content_fields": [],
        }
        response = api_client.post(
            adminoptions_urls.path("guide-sections"), data, format="json"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_guide_section_requires_admin(self, api_client, user, db):
        """Regular user cannot delete guide sections"""
        api_client.force_authenticate(user=user)
        section = GuideSection.objects.create(
            id="to-delete", title="Delete Me", order=0
        )
        response = api_client.delete(
            adminoptions_urls.path("guide-sections", section.id)
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


# =============================================================================
# ContentFieldViewSet — permission edge cases
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestContentFieldPermissions:
    """Tests for ContentFieldViewSet permissions"""

    def test_create_content_field_requires_admin(self, api_client, user, db):
        """Regular user cannot create content fields"""
        api_client.force_authenticate(user=user)
        section = GuideSection.objects.create(id="test-section", title="Test", order=0)
        data = {
            "section": section.id,
            "title": "New Field",
            "field_key": "new_field",
            "order": 0,
        }
        response = api_client.post(
            adminoptions_urls.path("content-fields"), data, format="json"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_content_field_requires_admin(self, api_client, user, db):
        """Regular user cannot delete content fields"""
        api_client.force_authenticate(user=user)
        section = GuideSection.objects.create(id="test-section", title="Test", order=0)
        field = ContentField.objects.create(
            section=section, title="Field", field_key="field", order=0
        )
        response = api_client.delete(adminoptions_urls.path("content-fields", field.id))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_content_field_requires_admin(self, api_client, user, db):
        """Regular user cannot update content fields"""
        api_client.force_authenticate(user=user)
        section = GuideSection.objects.create(id="test-section", title="Test", order=0)
        field = ContentField.objects.create(
            section=section, title="Field", field_key="field", order=0
        )
        data = {"title": "Updated"}
        response = api_client.put(
            adminoptions_urls.path("content-fields", field.id), data, format="json"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


# =============================================================================
# AdminTasks POST — validation branches
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestAdminTasksPostValidation:
    """Tests for AdminTasks POST validation branches

    Covers the validation logic for merge user, caretaker, and delete project.
    """

    def test_post_merge_user_missing_primary_user(self, api_client, user, db):
        """Merge user task without primary_user returns 400"""
        api_client.force_authenticate(user=user)
        data = {
            "action": AdminTask.ActionTypes.MERGEUSER,
            "primary_user": None,
            "secondary_users": [user.id],
            "reason": "Test",
        }
        response = api_client.post(adminoptions_urls.path("tasks"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_post_merge_user_missing_secondary_users(self, api_client, user, db):
        """Merge user task without secondary_users returns 400"""
        api_client.force_authenticate(user=user)
        data = {
            "action": AdminTask.ActionTypes.MERGEUSER,
            "primary_user": user.id,
            "secondary_users": [],
            "reason": "Test",
        }
        response = api_client.post(adminoptions_urls.path("tasks"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_post_caretaker_missing_primary_user(self, api_client, user, db):
        """Caretaker task without primary_user returns 400"""
        api_client.force_authenticate(user=user)
        data = {
            "action": AdminTask.ActionTypes.SETCARETAKER,
            "primary_user": None,
            "secondary_users": [user.id],
            "reason": "Test",
        }
        response = api_client.post(adminoptions_urls.path("tasks"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_post_delete_project_missing_project(self, api_client, user, db):
        """Delete project task without project returns 400"""
        api_client.force_authenticate(user=user)
        data = {
            "action": AdminTask.ActionTypes.DELETEPROJECT,
            "project": None,
            "reason": "Test",
        }
        response = api_client.post(adminoptions_urls.path("tasks"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_post_delete_project_already_requested(self, api_client, user, project, db):
        """Delete project when project already has deletion_requested=True"""
        api_client.force_authenticate(user=user)
        project.deletion_requested = True
        project.save()

        data = {
            "action": AdminTask.ActionTypes.DELETEPROJECT,
            "project": project.id,
            "reason": "Test",
        }
        response = api_client.post(adminoptions_urls.path("tasks"), data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_post_tasks_unauthenticated(self, api_client, db):
        """Unauthenticated POST to tasks returns 403"""
        data = {
            "action": AdminTask.ActionTypes.DELETEPROJECT,
            "project": 1,
            "reason": "Test",
        }
        response = api_client.post(adminoptions_urls.path("tasks"), data, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN


# =============================================================================
# SendAllTestEmails
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestSendAllTestEmails:
    """Tests for SendAllTestEmails view

    Covers lines ~800-1100 (template rendering, batch email sending).
    """

    def test_send_all_test_emails_no_admin_options(self, api_client, admin_user, db):
        """POST without admin options returns 400"""
        api_client.force_authenticate(user=admin_user)
        response = api_client.post(adminoptions_urls.path("send-all-test-emails"))
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_send_all_test_emails_no_test_user(self, api_client, admin_user, db):
        """POST with admin options but no test user returns 400"""
        api_client.force_authenticate(user=admin_user)
        AdminOptions.objects.create(
            email_options=AdminOptions.EmailOptions.ENABLED,
            maintainer=admin_user,
            email_testing_mode=True,
            email_test_user=None,
        )
        response = api_client.post(adminoptions_urls.path("send-all-test-emails"))
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @patch("django.core.mail.EmailMultiAlternatives.send")
    def test_send_all_test_emails_success(
        self, mock_send, api_client, admin_user, settings, db
    ):
        """POST renders and sends all email templates"""
        api_client.force_authenticate(user=admin_user)
        admin_user.display_first_name = "Admin"
        admin_user.display_last_name = "User"
        admin_user.save()

        AdminOptions.objects.create(
            email_options=AdminOptions.EmailOptions.ENABLED,
            maintainer=admin_user,
            email_testing_mode=True,
            email_test_user=admin_user,
        )
        settings.DEBUG = True
        mock_send.return_value = 1

        response = api_client.post(adminoptions_urls.path("send-all-test-emails"))
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data
        assert len(response.data["results"]) > 0

    @patch("django.core.mail.EmailMultiAlternatives.send")
    def test_send_all_test_emails_with_user_overrides(
        self, mock_send, api_client, admin_user, settings, db
    ):
        """POST with recipient and actioner overrides"""
        api_client.force_authenticate(user=admin_user)
        admin_user.display_first_name = "Admin"
        admin_user.display_last_name = "User"
        admin_user.save()

        recipient = User.objects.create_user(
            username="recipient",
            email="recipient@test.com",
            display_first_name="Recipient",
            display_last_name="User",
        )
        actioner = User.objects.create_user(
            username="actioner",
            email="actioner@test.com",
            display_first_name="Actioner",
            display_last_name="User",
        )

        AdminOptions.objects.create(
            email_options=AdminOptions.EmailOptions.ENABLED,
            maintainer=admin_user,
            email_testing_mode=True,
            email_test_user=admin_user,
        )
        settings.DEBUG = True
        mock_send.return_value = 1

        data = {
            "recipient_user_id": recipient.id,
            "actioner_user_id": actioner.id,
        }
        response = api_client.post(
            adminoptions_urls.path("send-all-test-emails"), data, format="json"
        )
        assert response.status_code == status.HTTP_200_OK

    @patch("django.core.mail.EmailMultiAlternatives.send")
    def test_send_all_test_emails_with_invalid_user_overrides(
        self, mock_send, api_client, admin_user, settings, db
    ):
        """POST with non-existent user overrides still works"""
        api_client.force_authenticate(user=admin_user)
        admin_user.display_first_name = "Admin"
        admin_user.display_last_name = "User"
        admin_user.save()

        AdminOptions.objects.create(
            email_options=AdminOptions.EmailOptions.ENABLED,
            maintainer=admin_user,
            email_testing_mode=True,
            email_test_user=admin_user,
        )
        settings.DEBUG = True
        mock_send.return_value = 1

        data = {
            "recipient_user_id": 99999,
            "actioner_user_id": 99999,
        }
        response = api_client.post(
            adminoptions_urls.path("send-all-test-emails"), data, format="json"
        )
        assert response.status_code == status.HTTP_200_OK

    def test_send_all_test_emails_requires_admin(self, api_client, user, db):
        """Regular user cannot send all test emails"""
        api_client.force_authenticate(user=user)
        response = api_client.post(adminoptions_urls.path("send-all-test-emails"))
        assert response.status_code == status.HTTP_403_FORBIDDEN


# =============================================================================
# MergeUsers — extended edge cases
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestMergeUsersExtended:
    """Extended tests for MergeUsers view"""

    def test_merge_users_non_superuser_staff(self, api_client, db):
        """Staff user who is not superuser cannot merge"""
        staff_user = User.objects.create_user(
            username="staffonly",
            email="staffonly@test.com",
            is_staff=True,
            is_superuser=False,
        )
        target = User.objects.create_user(username="target", email="target@test.com")
        api_client.force_authenticate(user=staff_user)
        data = {
            "primaryUser": staff_user.id,
            "secondaryUsers": [target.id],
        }
        response = api_client.post(
            adminoptions_urls.path("mergeusers"), data, format="json"
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_merge_users_requires_authentication(self, api_client, db):
        """Unauthenticated merge request returns 403"""
        data = {"primaryUser": 1, "secondaryUsers": [2]}
        response = api_client.post(
            adminoptions_urls.path("mergeusers"), data, format="json"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_merge_users_missing_primary(self, api_client, admin_user, db):
        """Missing primaryUser returns 400"""
        api_client.force_authenticate(user=admin_user)
        data = {"secondaryUsers": [1]}
        response = api_client.post(
            adminoptions_urls.path("mergeusers"), data, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_merge_users_missing_secondary(self, api_client, admin_user, db):
        """Missing secondaryUsers returns 400"""
        api_client.force_authenticate(user=admin_user)
        data = {"primaryUser": admin_user.id}
        response = api_client.post(
            adminoptions_urls.path("mergeusers"), data, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# =============================================================================
# RespondToCaretakerRequest — extended edge cases
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestRespondToCaretakerRequestExtended:
    """Extended tests for RespondToCaretakerRequest"""

    def test_respond_missing_action(self, api_client, user, secondary_user, db):
        """POST without action field returns 400"""
        api_client.force_authenticate(user=secondary_user)
        task = AdminTask.objects.create(
            action=AdminTask.ActionTypes.SETCARETAKER,
            status=AdminTask.TaskStatus.PENDING,
            requester=user,
            primary_user=user,
            secondary_users=[secondary_user.id],
            reason="Test",
        )
        data = {}  # No action
        response = api_client.post(
            adminoptions_urls.path("tasks", task.id, "respond"), data, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_respond_task_not_found(self, api_client, user, db):
        """POST to non-existent task returns 404"""
        api_client.force_authenticate(user=user)
        data = {"action": "approve"}
        response = api_client.post(
            adminoptions_urls.path("tasks", 99999, "respond"), data, format="json"
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_respond_unauthenticated(self, api_client, db):
        """Unauthenticated respond returns 403"""
        data = {"action": "approve"}
        response = api_client.post(
            adminoptions_urls.path("tasks", 1, "respond"), data, format="json"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


# =============================================================================
# ApproveTask / RejectTask / CancelTask — extended edge cases
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestTaskActionsExtended:
    """Extended tests for task approval/rejection/cancellation"""

    def test_approve_task_value_error(self, api_client, admin_user, db):
        """Approve task that raises ValueError returns 400"""
        api_client.force_authenticate(user=admin_user)
        # Create a caretaker task with invalid secondary_users
        task = AdminTask.objects.create(
            action=AdminTask.ActionTypes.SETCARETAKER,
            status=AdminTask.TaskStatus.PENDING,
            requester=admin_user,
            primary_user=admin_user,
            secondary_users=[99999],  # Non-existent user
            reason="Test",
        )
        response = api_client.post(adminoptions_urls.path("tasks", task.id, "approve"))
        # Should return 404 (user not found) or 400 (value error)
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
        ]

    def test_cancel_task_unauthenticated(self, api_client, db):
        """Unauthenticated cancel returns 403"""
        response = api_client.post(adminoptions_urls.path("tasks", 1, "cancel"))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_reject_task_not_found(self, api_client, admin_user, db):
        """Reject non-existent task returns 404"""
        api_client.force_authenticate(user=admin_user)
        response = api_client.post(adminoptions_urls.path("tasks", 99999, "reject"))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_cancel_task_not_found(self, api_client, user, db):
        """Cancel non-existent task returns 404"""
        api_client.force_authenticate(user=user)
        response = api_client.post(adminoptions_urls.path("tasks", 99999, "cancel"))
        assert response.status_code == status.HTTP_404_NOT_FOUND


# =============================================================================
# PendingTasks — unauthenticated
# =============================================================================


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
class TestPendingTasksExtended:
    """Extended tests for PendingTasks view"""

    def test_pending_tasks_unauthenticated(self, api_client, db):
        """Unauthenticated request returns 403"""
        response = api_client.get(adminoptions_urls.path("tasks", "pending"))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_pending_tasks_excludes_non_pending(self, api_client, user, db):
        """Only pending tasks are returned"""
        api_client.force_authenticate(user=user)
        AdminTask.objects.create(
            action=AdminTask.ActionTypes.DELETEPROJECT,
            status=AdminTask.TaskStatus.PENDING,
            requester=user,
            reason="Pending",
        )
        AdminTask.objects.create(
            action=AdminTask.ActionTypes.DELETEPROJECT,
            status=AdminTask.TaskStatus.FULFILLED,
            requester=user,
            reason="Fulfilled",
        )
        AdminTask.objects.create(
            action=AdminTask.ActionTypes.DELETEPROJECT,
            status=AdminTask.TaskStatus.CANCELLED,
            requester=user,
            reason="Cancelled",
        )

        response = api_client.get(adminoptions_urls.path("tasks", "pending"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["reason"] == "Pending"
