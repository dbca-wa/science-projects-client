"""
Tests for approval and notification recipient logic.

Covers:
- _can_approve_stage_three permission checks
- _get_stage_approval_recipients for stage 2
- _get_directorate_recipients (updated to include key stakeholder + approvers)
- _get_recall_recipients for directorate recall
"""

import pytest
from hypothesis import given
from hypothesis import settings as hypothesis_settings
from hypothesis import strategies as st

from common.tests.factories import (
    BusinessAreaFactory,
    DivisionFactory,
    ProjectFactory,
    ProjectMemberFactory,
    SuperuserFactory,
    UserFactory,
)
from documents.services.approval_service import ApprovalService
from documents.services.notification_service import NotificationService
from documents.tests.factories import ProjectDocumentFactory

# ============================================================================
# Unit tests for _can_approve_stage_three
# ============================================================================


@pytest.mark.django_db
class TestCanApproveStageThree:
    """Tests for ApprovalService._can_approve_stage_three"""

    def test_key_stakeholder_allowed(self):
        """Key stakeholder can approve at stage 3"""
        user = UserFactory()
        division = DivisionFactory(key_stakeholder=user)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        assert ApprovalService._can_approve_stage_three(document, user) is True

    def test_approver_allowed(self):
        """Approver can approve at stage 3"""
        user = UserFactory()
        division = DivisionFactory()
        division.approvers.add(user)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        assert ApprovalService._can_approve_stage_three(document, user) is True

    def test_director_allowed(self):
        """Director can approve at stage 3"""
        user = UserFactory()
        division = DivisionFactory(director=user)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        assert ApprovalService._can_approve_stage_three(document, user) is True

    def test_superuser_allowed(self):
        """Superuser can approve at stage 3"""
        user = SuperuserFactory()
        division = DivisionFactory()
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        assert ApprovalService._can_approve_stage_three(document, user) is True

    def test_random_user_denied(self):
        """Random user without any role is denied stage 3 approval"""
        user = UserFactory()
        division = DivisionFactory()
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        assert ApprovalService._can_approve_stage_three(document, user) is False

    def test_no_division_denied(self):
        """User is denied when BA has no division"""
        user = UserFactory()
        ba = BusinessAreaFactory(division=None)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        assert ApprovalService._can_approve_stage_three(document, user) is False


# ============================================================================
# Unit tests for _get_stage_approval_recipients (stage 2)
# ============================================================================


@pytest.mark.django_db
class TestGetStageApprovalRecipientsStage2:
    """Tests for NotificationService._get_stage_approval_recipients at stage 2"""

    def test_includes_key_stakeholder_and_approvers(self):
        """Stage 2 recipients include key stakeholder and approvers"""
        ks_user = UserFactory()
        approver1 = UserFactory()
        approver2 = UserFactory()
        division = DivisionFactory(key_stakeholder=ks_user)
        division.approvers.add(approver1, approver2)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_stage_approval_recipients(document, 2)
        emails = {r["email"] for r in recipients}

        assert ks_user.email in emails
        assert approver1.email in emails
        assert approver2.email in emails

    def test_fallback_to_director(self):
        """Stage 2 falls back to director when no stakeholder or approvers"""
        director = UserFactory()
        division = DivisionFactory(director=director)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_stage_approval_recipients(document, 2)
        emails = {r["email"] for r in recipients}

        assert director.email in emails
        assert len(recipients) == 1

    def test_excludes_directorate_email_list(self):
        """Stage 2 does not include directorate email list users"""
        email_list_user = UserFactory()
        ks_user = UserFactory()
        division = DivisionFactory(key_stakeholder=ks_user)
        division.directorate_email_list.add(email_list_user)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_stage_approval_recipients(document, 2)
        emails = {r["email"] for r in recipients}

        assert email_list_user.email not in emails

    def test_deduplicates_recipients(self):
        """Stage 2 deduplicates when user is both key stakeholder and approver"""
        user = UserFactory()
        division = DivisionFactory(key_stakeholder=user)
        division.approvers.add(user)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_stage_approval_recipients(document, 2)
        emails = [r["email"] for r in recipients]

        assert emails.count(user.email) == 1


# ============================================================================
# Unit tests for _get_directorate_recipients
# ============================================================================


@pytest.mark.django_db
class TestGetDirectorateRecipients:
    """Tests for NotificationService._get_directorate_recipients"""

    def test_includes_key_stakeholder_approvers_and_director(self):
        """Directorate recipients include key stakeholder, approvers, and director"""
        ks_user = UserFactory()
        approver = UserFactory()
        director = UserFactory()
        division = DivisionFactory(
            key_stakeholder=ks_user,
            director=director,
        )
        division.approvers.add(approver)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_directorate_recipients(document)
        emails = {r["email"] for r in recipients}

        assert ks_user.email in emails
        assert approver.email in emails
        assert director.email in emails
        assert len(recipients) == 3

    def test_excludes_directorate_email_list(self):
        """Directorate recipients do not include directorate email list users"""
        email_list_user = UserFactory()
        director = UserFactory()
        division = DivisionFactory(director=director)
        division.directorate_email_list.add(email_list_user)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_directorate_recipients(document)
        emails = {r["email"] for r in recipients}

        assert email_list_user.email not in emails

    def test_deduplicates_when_user_holds_multiple_roles(self):
        """Deduplicates when a user is both director and key stakeholder"""
        user = UserFactory()
        division = DivisionFactory(
            key_stakeholder=user,
            director=user,
        )
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_directorate_recipients(document)
        emails = [r["email"] for r in recipients]

        assert emails.count(user.email) == 1

    def test_fallback_when_no_stakeholder_or_approvers(self):
        """Returns director when no key stakeholder or approvers assigned"""
        director = UserFactory()
        division = DivisionFactory(director=director)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_directorate_recipients(document)
        emails = {r["email"] for r in recipients}

        assert director.email in emails
        assert len(recipients) == 1

    def test_empty_when_no_division(self):
        """Returns empty list when BA has no division"""
        ba = BusinessAreaFactory(division=None)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_directorate_recipients(document)

        assert len(recipients) == 0

    def test_excludes_inactive_users(self):
        """Excludes inactive key stakeholder and approvers"""
        inactive_ks = UserFactory(is_active=False)
        inactive_approver = UserFactory(is_active=False)
        director = UserFactory()
        division = DivisionFactory(
            key_stakeholder=inactive_ks,
            director=director,
        )
        division.approvers.add(inactive_approver)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_directorate_recipients(document)
        emails = {r["email"] for r in recipients}

        assert inactive_ks.email not in emails
        assert inactive_approver.email not in emails
        assert director.email in emails


# ============================================================================
# Unit tests for _get_recall_recipients (directorate recall)
# ============================================================================


@pytest.mark.django_db
class TestGetRecallRecipients:
    """Tests for NotificationService._get_recall_recipients"""

    def test_ba_lead_recall_notifies_key_stakeholder_and_approvers(self):
        """BA lead recall sends to key stakeholder and approvers"""
        ba_lead = UserFactory()
        ks_user = UserFactory()
        approver = UserFactory()
        division = DivisionFactory(key_stakeholder=ks_user)
        division.approvers.add(approver)
        ba = BusinessAreaFactory(division=division, leader=ba_lead)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_recall_recipients(document, ba_lead)
        emails = {r["email"] for r in recipients}

        assert ks_user.email in emails
        assert approver.email in emails

    def test_ba_lead_recall_excludes_directorate_email_list(self):
        """BA lead recall does not include directorate email list users"""
        ba_lead = UserFactory()
        email_list_user = UserFactory()
        ks_user = UserFactory()
        division = DivisionFactory(key_stakeholder=ks_user)
        division.directorate_email_list.add(email_list_user)
        ba = BusinessAreaFactory(division=division, leader=ba_lead)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_recall_recipients(document, ba_lead)
        emails = {r["email"] for r in recipients}

        assert email_list_user.email not in emails

    def test_directorate_recall_notifies_ba_lead(self):
        """Directorate recall sends to BA lead"""
        ba_lead = UserFactory()
        directorate_user = UserFactory()
        division = DivisionFactory(director=directorate_user)
        ba = BusinessAreaFactory(division=division, leader=ba_lead)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_recall_recipients(
            document, directorate_user
        )
        emails = {r["email"] for r in recipients}

        assert ba_lead.email in emails

    def test_project_lead_recall_notifies_ba_lead(self):
        """Project lead recall sends to BA lead"""
        ba_lead = UserFactory()
        project_lead = UserFactory()
        division = DivisionFactory()
        ba = BusinessAreaFactory(division=division, leader=ba_lead)
        project = ProjectFactory(business_area=ba)
        ProjectMemberFactory(project=project, user=project_lead, is_leader=True)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_recall_recipients(document, project_lead)
        emails = {r["email"] for r in recipients}

        assert ba_lead.email in emails


# ============================================================================
# Property-based tests using Hypothesis
# ============================================================================


@pytest.mark.django_db(transaction=True)
class TestPropertyStageThreePermission:
    """Property 1: Stage 3 Permission Check Correctness"""

    @hypothesis_settings(max_examples=100, deadline=30000)
    @given(
        is_director=st.booleans(),
        is_key_stakeholder=st.booleans(),
        is_approver=st.booleans(),
        is_superuser=st.booleans(),
    )
    def test_permission_correctness(
        self, is_director, is_key_stakeholder, is_approver, is_superuser
    ):
        """
        For any user/division/role combination, _can_approve_stage_three returns
        True iff the user is superuser, director, key stakeholder, or approver.
        """
        user = UserFactory(is_superuser=is_superuser)
        division = DivisionFactory(
            director=user if is_director else UserFactory(),
            key_stakeholder=user if is_key_stakeholder else None,
        )
        if is_approver:
            division.approvers.add(user)
        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        result = ApprovalService._can_approve_stage_three(document, user)
        expected = is_superuser or is_director or is_key_stakeholder or is_approver

        assert result == expected, (
            f"Expected {expected} but got {result} for "
            f"superuser={is_superuser}, director={is_director}, "
            f"ks={is_key_stakeholder}, approver={is_approver}"
        )


@pytest.mark.django_db(transaction=True)
class TestPropertyStage2Recipients:
    """Property 2: Stage 2 Notification Recipient Correctness"""

    @hypothesis_settings(max_examples=100, deadline=30000)
    @given(
        has_ks=st.booleans(),
        num_approvers=st.integers(min_value=0, max_value=3),
        has_email_list_user=st.booleans(),
    )
    def test_stage2_recipient_correctness(
        self, has_ks, num_approvers, has_email_list_user
    ):
        """
        Stage 2 recipients include key stakeholder and approvers, fall back
        to director, and never include directorate email list users.
        """
        director = UserFactory()
        ks_user = UserFactory() if has_ks else None
        approvers = [UserFactory() for _ in range(num_approvers)]
        email_list_user = UserFactory() if has_email_list_user else None

        division = DivisionFactory(
            director=director,
            key_stakeholder=ks_user,
        )
        for a in approvers:
            division.approvers.add(a)
        if email_list_user:
            division.directorate_email_list.add(email_list_user)

        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_stage_approval_recipients(document, 2)
        emails = {r["email"] for r in recipients}

        # Key stakeholder included if assigned
        if has_ks:
            assert ks_user.email in emails

        # All approvers included
        for a in approvers:
            assert a.email in emails

        # Fallback to director if no ks/approvers
        if not has_ks and num_approvers == 0:
            assert director.email in emails

        # Email list user never included solely for being on the list
        if has_email_list_user and email_list_user not in approvers:
            if not (has_ks and email_list_user == ks_user):
                assert email_list_user.email not in emails


@pytest.mark.django_db(transaction=True)
class TestPropertyDirectorateRecipients:
    """Property 3: Stage 3 Directorate Notification Recipient Correctness"""

    @hypothesis_settings(max_examples=100, deadline=30000)
    @given(
        has_ks=st.booleans(),
        num_approvers=st.integers(min_value=0, max_value=3),
        has_email_list_user=st.booleans(),
    )
    def test_directorate_recipient_correctness(
        self, has_ks, num_approvers, has_email_list_user
    ):
        """
        _get_directorate_recipients returns key stakeholder, approvers, and
        director — never directorate email list users.
        """
        director = UserFactory()
        ks_user = UserFactory() if has_ks else None
        approvers = [UserFactory() for _ in range(num_approvers)]
        email_list_user = UserFactory() if has_email_list_user else None

        division = DivisionFactory(
            director=director,
            key_stakeholder=ks_user,
        )
        for a in approvers:
            division.approvers.add(a)
        if email_list_user:
            division.directorate_email_list.add(email_list_user)

        ba = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_directorate_recipients(document)
        emails = {r["email"] for r in recipients}

        # Key stakeholder included if assigned
        if has_ks:
            assert ks_user.email in emails

        # All approvers included
        for a in approvers:
            assert a.email in emails

        # Director always included
        assert director.email in emails

        # Email list user never included solely for being on the list
        if has_email_list_user and email_list_user not in approvers:
            if not (has_ks and email_list_user == ks_user):
                if email_list_user != director:
                    assert email_list_user.email not in emails

        # No duplicates
        assert len(emails) == len(recipients)


@pytest.mark.django_db(transaction=True)
class TestPropertyRecallRecipients:
    """Property 4: Recall Notification Recipient Correctness"""

    @hypothesis_settings(max_examples=100, deadline=30000)
    @given(
        has_ks=st.booleans(),
        num_approvers=st.integers(min_value=0, max_value=3),
        has_email_list_user=st.booleans(),
    )
    def test_recall_recipient_correctness(
        self, has_ks, num_approvers, has_email_list_user
    ):
        """
        BA lead recall recipients include only key stakeholder and approvers,
        not directorate email list or director (unless also ks/approver).
        """
        ba_lead = UserFactory()
        director = UserFactory()
        ks_user = UserFactory() if has_ks else None
        approvers = [UserFactory() for _ in range(num_approvers)]
        email_list_user = UserFactory() if has_email_list_user else None

        division = DivisionFactory(
            director=director,
            key_stakeholder=ks_user,
        )
        for a in approvers:
            division.approvers.add(a)
        if email_list_user:
            division.directorate_email_list.add(email_list_user)

        ba = BusinessAreaFactory(division=division, leader=ba_lead)
        project = ProjectFactory(business_area=ba)
        document = ProjectDocumentFactory(project=project)

        recipients = NotificationService._get_recall_recipients(document, ba_lead)
        emails = {r["email"] for r in recipients}

        # Key stakeholder included if assigned
        if has_ks:
            assert ks_user.email in emails

        # All approvers included
        for a in approvers:
            assert a.email in emails

        # Director NOT included (unless also ks or approver)
        if director not in approvers and not (has_ks and director == ks_user):
            assert director.email not in emails

        # Email list user never included
        if has_email_list_user and email_list_user not in approvers:
            if not (has_ks and email_list_user == ks_user):
                assert email_list_user.email not in emails
