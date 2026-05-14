"""
Tests for protection guards across all document endpoints.

Verifies that projects in protected states (completed, terminated, closure_requested)
have their status preserved during document actions, and that batch/cycle/bump
operations correctly exclude or skip protected project documents.
"""

from datetime import date
from unittest.mock import patch

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import (
    ProjectDocumentFactory,
    ProjectFactory,
    UserFactory,
)
from documents.models import (
    AnnualReport,
    ProgressReport,
    ProjectDocument,
)
from documents.services.approval_service import ApprovalService
from documents.services.document_service import DocumentService

# ─── Fixtures ─────────────────────────────────────────────────────────────────


@pytest.fixture
def superuser(db):
    """Superuser for API authentication."""
    return UserFactory(
        username="protguard_super",
        email="protguard_super@dbca.wa.gov.au",
        is_superuser=True,
        is_staff=True,
    )


@pytest.fixture
def api_client(superuser):
    """Authenticated API client."""
    client = APIClient()
    client.force_authenticate(user=superuser)
    return client


@pytest.fixture
def annual_report(db):
    """Annual report for progress/student report creation."""
    return AnnualReport.objects.create(
        year=2025,
        is_published=False,
        date_open=date(2025, 1, 1),
        date_closed=date(2025, 12, 31),
    )


def _make_stage3_ready_doc(project, kind="progressreport", superuser=None):
    """Helper: create a document ready for stage 3 approval (PL + BA approved)."""
    doc = ProjectDocumentFactory(
        project=project,
        kind=kind,
        status="inapproval",
        project_lead_approval_granted=True,
        business_area_lead_approval_granted=True,
        directorate_approval_granted=False,
    )
    return doc


# ─── Tests 1-3: ApprovalService.approve_stage_three on protected projects ────


@pytest.mark.django_db
class TestApproveStageThreeProtected:
    """Tests 1-3: Approve stage 3 on protected projects → document approved, status unchanged."""

    def test_approve_stage_three_completed_project(self, superuser):
        """Test 1: Approve stage 3 on completed project → document approved, project status unchanged."""
        project = ProjectFactory(status="completed", members=[])
        doc = _make_stage3_ready_doc(project)

        ApprovalService.approve_stage_three(doc, superuser, send_notifications=False)

        doc.refresh_from_db()
        project.refresh_from_db()
        assert doc.directorate_approval_granted is True
        assert doc.status == ProjectDocument.StatusChoices.APPROVED
        assert project.status == "completed"

    def test_approve_stage_three_terminated_project(self, superuser):
        """Test 2: Approve stage 3 on terminated project → document approved, project status unchanged."""
        project = ProjectFactory(status="terminated", members=[])
        doc = _make_stage3_ready_doc(project)

        ApprovalService.approve_stage_three(doc, superuser, send_notifications=False)

        doc.refresh_from_db()
        project.refresh_from_db()
        assert doc.directorate_approval_granted is True
        assert doc.status == ProjectDocument.StatusChoices.APPROVED
        assert project.status == "terminated"

    def test_approve_stage_three_closure_requested_project(self, superuser):
        """Test 3: Approve stage 3 on closure_requested project → document approved, project status unchanged."""
        project = ProjectFactory(status="closure_requested", members=[])
        doc = _make_stage3_ready_doc(project)

        ApprovalService.approve_stage_three(doc, superuser, send_notifications=False)

        doc.refresh_from_db()
        project.refresh_from_db()
        assert doc.directorate_approval_granted is True
        assert doc.status == ProjectDocument.StatusChoices.APPROVED
        assert project.status == "closure_requested"


# ─── Tests 4-5: Recall and Send Back on protected projects ───────────────────


@pytest.mark.django_db
class TestRecallAndSendBackProtected:
    """Tests 4-5: Recall/send back on protected projects → project status unchanged."""

    def test_recall_on_protected_project(self, superuser):
        """Test 4: Recall on protected project → document recalled, project status unchanged."""
        project = ProjectFactory(status="completed", members=[])
        doc = ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="approved",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=True,
        )

        ApprovalService.recall(doc, superuser, stage=3)

        doc.refresh_from_db()
        project.refresh_from_db()
        assert doc.directorate_approval_granted is False
        assert doc.status == ProjectDocument.StatusChoices.INAPPROVAL
        assert project.status == "completed"

    def test_send_back_on_protected_project(self, superuser):
        """Test 5: Send back on protected project → document sent back, project status unchanged."""
        project = ProjectFactory(status="terminated", members=[])
        doc = ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="approved",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=True,
        )

        ApprovalService.send_back(doc, superuser)

        doc.refresh_from_db()
        project.refresh_from_db()
        assert doc.directorate_approval_granted is False
        assert doc.status == ProjectDocument.StatusChoices.REVISING
        assert project.status == "terminated"


# ─── Tests 6-7: Document deletion on protected projects ──────────────────────


@pytest.mark.django_db
class TestDeleteDocumentProtected:
    """Tests 6-7: Delete documents on protected projects → status unchanged."""

    def test_delete_non_closure_document_on_protected_project(self, superuser):
        """Test 6: Delete non-closure document on protected project → deleted, status unchanged."""
        project = ProjectFactory(status="completed", members=[])
        doc = ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="inapproval",
        )
        doc_pk = doc.pk

        DocumentService.delete_document(doc_pk, superuser)

        project.refresh_from_db()
        assert project.status == "completed"
        assert not ProjectDocument.objects.filter(pk=doc_pk).exists()

    def test_delete_closure_document_on_protected_project(self, superuser):
        """Test 7: Delete closure document on protected project → deleted (allowed for reopen flow)."""
        project = ProjectFactory(status="closure_requested", members=[])
        doc = ProjectDocumentFactory(
            project=project,
            kind="projectclosure",
            status="approved",
        )
        doc_pk = doc.pk

        DocumentService.delete_document(doc_pk, superuser)

        project.refresh_from_db()
        # Closure deletion does not change project status — reopen view handles that
        assert project.status == "closure_requested"
        assert not ProjectDocument.objects.filter(pk=doc_pk).exists()


# ─── Test 8: BatchApprove with mix of protected and non-protected ────────────


@pytest.mark.django_db
class TestBatchApproveProtection:
    """Test 8: BatchApprove with mix of protected and non-protected documents."""

    def test_batch_approve_mixed_protected_and_active(self, api_client, superuser):
        """Test 8: BatchApprove with mix → only non-protected approved, skipped list returned."""
        # Active project with stage-3 ready doc
        active_project = ProjectFactory(status="active", members=[])
        active_doc = _make_stage3_ready_doc(active_project)

        # Protected project with stage-3 ready doc
        protected_project = ProjectFactory(status="completed", members=[])
        protected_doc = _make_stage3_ready_doc(protected_project)

        response = api_client.post(
            "/api/v1/documents/batchapprove",
            {
                "document_ids": [active_doc.pk, protected_doc.pk],
                "stage": 3,
                "send_notifications": False,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.data

        # Active doc should be approved
        assert active_doc.pk in data["approved"]

        # Protected doc should be in skipped list
        skipped_ids = [s["document_id"] for s in data["skipped"]]
        assert protected_doc.pk in skipped_ids

        # Verify project statuses unchanged
        active_project.refresh_from_db()
        protected_project.refresh_from_db()
        assert protected_project.status == "completed"


# ─── Tests 9-10: BatchApproveOld and BatchApproveCurrent exclude closure_requested ─


@pytest.mark.django_db
class TestBatchApproveOldAndCurrentExclusion:
    """Tests 9-10: BatchApproveOld and BatchApproveCurrent exclude closure_requested projects."""

    def test_batch_approve_old_excludes_closure_requested(
        self, api_client, superuser, annual_report
    ):
        """Test 9: BatchApproveOld excludes closure_requested projects."""
        # Create a closure_requested project with an older progress report
        project = ProjectFactory(status="closure_requested", members=[])
        doc = ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="inapproval",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=False,
        )
        # Create a progress report detail linked to an OLDER year
        older_report = AnnualReport.objects.create(
            year=2020,
            is_published=False,
            date_open=date(2020, 1, 1),
            date_closed=date(2020, 12, 31),
        )
        ProgressReport.objects.create(
            document=doc,
            project=project,
            report=older_report,
            year=2020,
        )

        response = api_client.post(
            "/api/v1/documents/batchapproveold",
            {"send_notifications": False},
            format="json",
        )

        # The endpoint should succeed and NOT approve the protected doc
        assert response.status_code in (status.HTTP_200_OK, status.HTTP_202_ACCEPTED)
        doc.refresh_from_db()
        assert doc.directorate_approval_granted is False
        project.refresh_from_db()
        assert project.status == "closure_requested"

    def test_batch_approve_current_excludes_closure_requested(
        self, api_client, superuser, annual_report
    ):
        """Test 10: BatchApproveCurrent excludes closure_requested projects."""
        # Create a closure_requested project with a current-year progress report
        project = ProjectFactory(status="closure_requested", members=[])
        doc = ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="inapproval",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=False,
        )
        ProgressReport.objects.create(
            document=doc,
            project=project,
            report=annual_report,
            year=annual_report.year,
        )

        response = api_client.post(
            "/api/v1/documents/batchapprovecurrent",
            {"send_notifications": False},
            format="json",
        )

        assert response.status_code in (status.HTTP_200_OK, status.HTTP_202_ACCEPTED)
        doc.refresh_from_db()
        assert doc.directorate_approval_granted is False
        project.refresh_from_db()
        assert project.status == "closure_requested"


# ─── Test 11: NewCycleOpen does not create reports for protected projects ────


@pytest.mark.django_db
class TestNewCycleOpenProtection:
    """Test 11: NewCycleOpen does not create reports for protected projects."""

    @patch("documents.views.notifications.NotificationService.send_bump_emails")
    def test_new_cycle_open_skips_protected_projects(
        self, mock_bump, api_client, superuser, annual_report
    ):
        """Test 11: NewCycleOpen does not create reports for protected projects."""
        # Create a completed science project (should be excluded)
        protected_project = ProjectFactory(
            status="completed", kind="science", members=[]
        )

        # Create an active science project (should be included)
        active_project = ProjectFactory(status="active", kind="science", members=[])

        # Count docs before
        docs_before = ProjectDocument.objects.filter(
            project=protected_project, kind="progressreport"
        ).count()

        response = api_client.post(
            "/api/v1/documents/opennewcycle",
            {
                "update": False,
                "prepopulate": False,
                "send_emails": False,
            },
            format="json",
        )

        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_202_ACCEPTED,
        )

        # Protected project should NOT have a new progress report
        docs_after = ProjectDocument.objects.filter(
            project=protected_project, kind="progressreport"
        ).count()
        assert docs_after == docs_before

        # Active project SHOULD have a new progress report
        active_docs = ProjectDocument.objects.filter(
            project=active_project, kind="progressreport"
        ).count()
        assert active_docs == 1


# ─── Test 12: DocumentSpawner rejects creation on protected project ──────────


@pytest.mark.django_db
class TestDocumentSpawnerProtection:
    """Test 12: DocumentSpawner rejects creation on protected project with HTTP 400."""

    def test_document_spawner_rejects_protected_project(self, api_client, superuser):
        """Test 12: DocumentSpawner rejects creation on protected project with HTTP 400."""
        project = ProjectFactory(status="completed", kind="science", members=[])

        response = api_client.post(
            "/api/v1/documents/spawn",
            {"kind": "concept", "project": project.pk},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "closed" in response.data["error"].lower()


# ─── Test 13: SendBumpEmails single-doc rejects for protected project ────────


@pytest.mark.django_db
class TestSendBumpEmailsProtection:
    """Test 13: SendBumpEmails single-doc rejects for protected project with HTTP 400."""

    def test_send_bump_emails_rejects_protected_single_doc(self, api_client, superuser):
        """Test 13: SendBumpEmails single-doc rejects for protected project with HTTP 400."""
        project = ProjectFactory(status="completed", members=[])
        doc = ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="inapproval",
        )

        response = api_client.post(
            "/api/v1/documents/sendbumpemails",
            {
                "documentsRequiringAction": [
                    {
                        "userToTakeAction": superuser.pk,
                        "documentKind": "progressreport",
                        "projectTitle": "Test Project",
                        "projectId": project.pk,
                        "actionCapacity": "Project Lead",
                        "documentId": doc.pk,
                    }
                ],
                "send_aggressive": True,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "closed" in response.data["error"].lower()


# ─── Test 14: SendBumpAll skips protected docs ───────────────────────────────


@pytest.mark.django_db
class TestSendBumpAllProtection:
    """Test 14: SendBumpAll skips protected docs, processes rest, returns excluded_count."""

    @patch("config.helpers.send_email_with_embedded_image")
    def test_send_bump_all_skips_protected_returns_excluded_count(
        self, mock_send, api_client, superuser, annual_report
    ):
        """Test 14: SendBumpAll skips protected docs, processes rest, returns excluded_count."""
        # Create an active project with a stage-1 pending doc (should be bumped)
        active_project = ProjectFactory(status="active", kind="science", members=[])
        active_lead = UserFactory(
            is_staff=True, is_active=True, email="activelead@dbca.wa.gov.au"
        )
        active_project.members.create(
            user=active_lead, is_leader=True, role="supervising"
        )
        active_doc = ProjectDocumentFactory(
            project=active_project,
            kind="progressreport",
            status="inreview",
            project_lead_approval_granted=False,
        )
        ProgressReport.objects.create(
            document=active_doc,
            project=active_project,
            report=annual_report,
            year=annual_report.year,
        )

        # Create a protected project with a pending doc (should be excluded)
        protected_project = ProjectFactory(
            status="completed", kind="science", members=[]
        )
        protected_lead = UserFactory(
            is_staff=True, is_active=True, email="protlead@dbca.wa.gov.au"
        )
        protected_project.members.create(
            user=protected_lead, is_leader=True, role="supervising"
        )
        protected_doc = ProjectDocumentFactory(
            project=protected_project,
            kind="progressreport",
            status="inreview",
            project_lead_approval_granted=False,
        )
        ProgressReport.objects.create(
            document=protected_doc,
            project=protected_project,
            report=annual_report,
            year=annual_report.year,
        )

        response = api_client.post(
            "/api/v1/documents/sendbumpall",
            {"send_aggressive": True},
            format="json",
        )

        # The response should include excluded_count
        assert response.status_code == status.HTTP_200_OK
        data = response.data
        assert "excluded_count" in data
        assert data["excluded_count"] >= 1


# ─── Test 15: ProjectDocsPendingMyActionAllStages excludes closure_requested ──


@pytest.mark.django_db
class TestPendingMyActionExclusion:
    """Test 15: ProjectDocsPendingMyActionAllStages excludes closure_requested projects."""

    def test_pending_my_action_excludes_closure_requested(self, api_client, superuser):
        """Test 15: ProjectDocsPendingMyActionAllStages excludes closure_requested projects."""
        # Create a closure_requested project with a pending doc
        project = ProjectFactory(status="closure_requested", members=[])
        project.members.create(user=superuser, is_leader=True, role="supervising")
        doc = ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="inapproval",
            project_lead_approval_granted=False,
        )

        response = api_client.get("/api/v1/documents/projectdocuments/pendingmyaction")

        assert response.status_code == status.HTTP_200_OK
        # The document should NOT appear in any category
        all_doc_ids = [d["id"] for d in response.data["all"]]
        assert doc.pk not in all_doc_ids


# ─── Tests 16-18: "Latest document wins" logic ──────────────────────────────


@pytest.mark.django_db
class TestLatestDocumentWins:
    """Tests 16-18: 'Latest document wins' — approve earlier docs when later docs exist."""

    def test_approve_concept_plan_when_progress_report_exists(self, superuser):
        """Test 16: Approve concept plan when progress report exists → status unchanged."""
        project = ProjectFactory(status="active", members=[])
        # Create a concept plan ready for stage 3
        concept_doc = ProjectDocumentFactory(
            project=project,
            kind="concept",
            status="inapproval",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=False,
        )
        # Create a later-stage progress report (stage 3 in document order)
        ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="inapproval",
        )

        original_status = project.status
        ApprovalService.approve_stage_three(
            concept_doc, superuser, send_notifications=False
        )

        concept_doc.refresh_from_db()
        project.refresh_from_db()
        assert concept_doc.directorate_approval_granted is True
        assert concept_doc.status == ProjectDocument.StatusChoices.APPROVED
        # Project status should NOT change because a later-stage doc exists
        assert project.status == original_status

    def test_approve_project_plan_when_progress_report_exists(self, superuser):
        """Test 17: Approve project plan when progress report exists → status unchanged."""
        project = ProjectFactory(status="active", members=[])
        # Create a project plan ready for stage 3
        plan_doc = ProjectDocumentFactory(
            project=project,
            kind="projectplan",
            status="inapproval",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=False,
        )
        # Create a later-stage progress report
        ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="new",
        )

        original_status = project.status
        ApprovalService.approve_stage_three(
            plan_doc, superuser, send_notifications=False
        )

        plan_doc.refresh_from_db()
        project.refresh_from_db()
        assert plan_doc.directorate_approval_granted is True
        assert plan_doc.status == ProjectDocument.StatusChoices.APPROVED
        # Project status should NOT change because a later-stage doc exists
        assert project.status == original_status

    def test_approve_project_plan_no_progress_report_changes_status(self, superuser):
        """Test 18: Approve project plan when NO progress report exists → status changes to active."""
        project = ProjectFactory(status="pending", members=[])
        # Create a project plan ready for stage 3 — no later-stage docs
        plan_doc = ProjectDocumentFactory(
            project=project,
            kind="projectplan",
            status="inapproval",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=False,
        )

        ApprovalService.approve_stage_three(
            plan_doc, superuser, send_notifications=False
        )

        plan_doc.refresh_from_db()
        project.refresh_from_db()
        assert plan_doc.directorate_approval_granted is True
        assert plan_doc.status == ProjectDocument.StatusChoices.APPROVED
        # Project status SHOULD change to active (no later-stage doc)
        assert project.status == "active"


# ─── Test 19: Reopen project → protection guards no longer apply ─────────────


@pytest.mark.django_db
class TestReopenProjectRestoresNormal:
    """Test 19: Reopen project → protection guards no longer apply, tasks reappear."""

    @patch(
        "documents.services.notification_service.NotificationService.notify_project_reopened"
    )
    def test_reopen_project_removes_protection(
        self, mock_notify, api_client, superuser
    ):
        """Test 19: Reopen project → protection guards no longer apply, tasks reappear."""
        # Create a completed project with a closure document and a lingering doc
        project = ProjectFactory(status="completed", kind="science", members=[])
        project.members.create(user=superuser, is_leader=True, role="supervising")
        closure_doc = ProjectDocumentFactory(
            project=project,
            kind="projectclosure",
            status="approved",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=True,
        )
        # Lingering progress report (not approved)
        lingering_doc = ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="inapproval",
            project_lead_approval_granted=False,
        )

        # Reopen the project
        response = api_client.post(
            f"/api/v1/documents/projectclosures/reopen/{project.pk}",
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED

        # Project should no longer be protected
        project.refresh_from_db()
        assert project.status not in ("completed", "terminated", "closure_requested")

        # Closure document should be deleted
        assert not ProjectDocument.objects.filter(pk=closure_doc.pk).exists()

        # Lingering doc should now appear in pending tasks
        response = api_client.get("/api/v1/documents/projectdocuments/pendingmyaction")
        assert response.status_code == status.HTTP_200_OK
        all_doc_ids = [d["id"] for d in response.data["all"]]
        assert lingering_doc.pk in all_doc_ids


# ─── Test 20: FinalDocApproval on protected project ──────────────────────────


@pytest.mark.django_db
class TestFinalDocApprovalProtected:
    """Test 20: FinalDocApproval on protected project → document approved, project status unchanged."""

    def test_final_doc_approval_on_protected_project(self, api_client, superuser):
        """Test 20: FinalDocApproval on protected project → document approved, project status unchanged."""
        project = ProjectFactory(status="completed", members=[])
        doc = ProjectDocumentFactory(
            project=project,
            kind="progressreport",
            status="inapproval",
            project_lead_approval_granted=True,
            business_area_lead_approval_granted=True,
            directorate_approval_granted=False,
        )

        response = api_client.post(
            "/api/v1/documents/actions/finalApproval",
            {"documentPk": doc.pk, "isActive": False},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED

        doc.refresh_from_db()
        project.refresh_from_db()
        assert doc.directorate_approval_granted is True
        assert doc.status == ProjectDocument.StatusChoices.APPROVED
        # Project status should remain unchanged (completed)
        assert project.status == "completed"
