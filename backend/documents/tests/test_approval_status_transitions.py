"""
Tests for document-type-specific project status transitions on stage 3 approval.

Verifies that:
- Concept plan approval → project status = pending + project plan auto-created
- Project plan approval → project status = active
- Project closure approval → project status = intended_outcome (or closure_requested for science)
- Progress report approval → project status = active
- Student report approval → project status = active
"""

import pytest

from common.tests.factories import (
    BusinessAreaFactory,
    DivisionFactory,
    ProjectFactory,
    UserFactory,
)
from documents.models import Endorsement, ProjectDocument, ProjectPlan
from documents.services.approval_service import ApprovalService
from documents.tests.factories import (
    ConceptPlanFactory,
    ProgressReportFactory,
    ProjectClosureFactory,
)


@pytest.fixture
def approval_setup(db):
    """Common setup: director, BA lead, project lead, division, BA, project."""
    director = UserFactory(username="director", is_superuser=True)
    ba_lead = UserFactory(username="ba_lead")
    project_lead = UserFactory(username="project_lead")
    division = DivisionFactory(director=director)
    business_area = BusinessAreaFactory(leader=ba_lead, division=division)
    project = ProjectFactory(business_area=business_area, kind="science")
    project.members.create(user=project_lead, is_leader=True, role="supervising")
    return {
        "director": director,
        "ba_lead": ba_lead,
        "project_lead": project_lead,
        "division": division,
        "business_area": business_area,
        "project": project,
    }


class TestConceptPlanApproval:
    """Concept plan stage 3 → pending + auto-create project plan."""

    @pytest.mark.integration
    def test_sets_project_status_to_pending(self, approval_setup):
        setup = approval_setup
        concept = ConceptPlanFactory(
            document__project=setup["project"],
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
        )

        ApprovalService.approve_stage_three(
            concept.document, setup["director"], send_notifications=False
        )

        setup["project"].refresh_from_db()
        assert setup["project"].status == "pending"

    @pytest.mark.integration
    def test_auto_creates_project_plan(self, approval_setup):
        setup = approval_setup
        concept = ConceptPlanFactory(
            document__project=setup["project"],
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
        )

        ApprovalService.approve_stage_three(
            concept.document, setup["director"], send_notifications=False
        )

        # Project plan document should exist
        pp_doc = ProjectDocument.objects.filter(
            project=setup["project"],
            kind=ProjectDocument.CategoryKindChoices.PROJECTPLAN,
        )
        assert pp_doc.exists()

        # ProjectPlan detail should exist
        assert ProjectPlan.objects.filter(project=setup["project"]).exists()

    @pytest.mark.integration
    def test_auto_creates_endorsement(self, approval_setup):
        setup = approval_setup
        concept = ConceptPlanFactory(
            document__project=setup["project"],
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
        )

        ApprovalService.approve_stage_three(
            concept.document, setup["director"], send_notifications=False
        )

        pp = ProjectPlan.objects.filter(project=setup["project"]).first()
        assert pp is not None
        assert Endorsement.objects.filter(project_plan=pp).exists()

    @pytest.mark.integration
    def test_does_not_duplicate_project_plan(self, approval_setup):
        """Running approval twice should not create a second project plan."""
        setup = approval_setup

        # First concept plan
        concept1 = ConceptPlanFactory(
            document__project=setup["project"],
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
        )
        ApprovalService.approve_stage_three(
            concept1.document, setup["director"], send_notifications=False
        )

        count_after_first = ProjectDocument.objects.filter(
            project=setup["project"],
            kind=ProjectDocument.CategoryKindChoices.PROJECTPLAN,
        ).count()

        # Second concept plan (edge case)
        concept2 = ConceptPlanFactory(
            document__project=setup["project"],
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
        )
        ApprovalService.approve_stage_three(
            concept2.document, setup["director"], send_notifications=False
        )

        count_after_second = ProjectDocument.objects.filter(
            project=setup["project"],
            kind=ProjectDocument.CategoryKindChoices.PROJECTPLAN,
        ).count()

        assert count_after_first == count_after_second == 1


class TestProjectClosureApproval:
    """Project closure stage 3 → intended_outcome or closure_requested."""

    @pytest.mark.integration
    def test_non_science_sets_intended_outcome(self, approval_setup):
        """Non-science project closure → status = intended_outcome."""
        setup = approval_setup
        setup["project"].kind = "student"
        setup["project"].save()

        closure = ProjectClosureFactory(
            document__project=setup["project"],
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
            intended_outcome="completed",
        )

        ApprovalService.approve_stage_three(
            closure.document, setup["director"], send_notifications=False
        )

        setup["project"].refresh_from_db()
        assert setup["project"].status == "completed"

    @pytest.mark.integration
    def test_non_science_terminated(self, approval_setup):
        """Non-science project closure with terminated outcome."""
        setup = approval_setup
        setup["project"].kind = "external"
        setup["project"].save()

        closure = ProjectClosureFactory(
            document__project=setup["project"],
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
            intended_outcome="terminated",
        )

        ApprovalService.approve_stage_three(
            closure.document, setup["director"], send_notifications=False
        )

        setup["project"].refresh_from_db()
        assert setup["project"].status == "terminated"

    @pytest.mark.integration
    def test_science_sets_closure_requested(self, approval_setup):
        """Science project closure stage 3 approval → status = intended_outcome (completed)."""
        setup = approval_setup
        # project.kind is already "science" from fixture

        closure = ProjectClosureFactory(
            document__project=setup["project"],
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
            intended_outcome="completed",
        )

        ApprovalService.approve_stage_three(
            closure.document, setup["director"], send_notifications=False
        )

        setup["project"].refresh_from_db()
        assert setup["project"].status == "completed"


class TestProgressReportApproval:
    """Progress/student report stage 3 → active."""

    @pytest.mark.integration
    def test_progress_report_sets_active(self, approval_setup):
        setup = approval_setup
        from datetime import date

        from documents.models import AnnualReport

        report = AnnualReport.objects.create(
            year=2025, date_open=date(2025, 1, 1), date_closed=date(2025, 12, 31)
        )

        pr = ProgressReportFactory(
            document__project=setup["project"],
            document__status=ProjectDocument.StatusChoices.INAPPROVAL,
            document__project_lead_approval_granted=True,
            document__business_area_lead_approval_granted=True,
            report=report,
            year=2025,
        )

        ApprovalService.approve_stage_three(
            pr.document, setup["director"], send_notifications=False
        )

        setup["project"].refresh_from_db()
        assert setup["project"].status == "active"
