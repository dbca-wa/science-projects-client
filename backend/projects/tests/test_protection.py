"""
Tests for project protection utilities.

Tests is_project_protected() and should_skip_status_transition() from
projects/utils/protection.py.
"""

import pytest

from common.tests.factories import ProjectDocumentFactory, ProjectFactory
from projects.utils.protection import (
    DOCUMENT_STAGE_ORDER,
    is_project_protected,
    should_skip_status_transition,
)


class TestIsProjectProtected:
    """Tests for is_project_protected()"""

    @pytest.mark.unit
    def test_completed_is_protected(self, db):
        """Completed projects are protected."""
        project = ProjectFactory(status="completed", members=[])
        assert is_project_protected(project) is True

    @pytest.mark.unit
    def test_terminated_is_protected(self, db):
        """Terminated projects are protected."""
        project = ProjectFactory(status="terminated", members=[])
        assert is_project_protected(project) is True

    @pytest.mark.unit
    def test_closure_requested_is_protected(self, db):
        """Closure-requested projects are protected."""
        project = ProjectFactory(status="closure_requested", members=[])
        assert is_project_protected(project) is True

    @pytest.mark.unit
    def test_new_is_not_protected(self, db):
        """New projects are not protected."""
        project = ProjectFactory(status="new", members=[])
        assert is_project_protected(project) is False

    @pytest.mark.unit
    def test_pending_is_not_protected(self, db):
        """Pending projects are not protected."""
        project = ProjectFactory(status="pending", members=[])
        assert is_project_protected(project) is False

    @pytest.mark.unit
    def test_active_is_not_protected(self, db):
        """Active projects are not protected."""
        project = ProjectFactory(status="active", members=[])
        assert is_project_protected(project) is False

    @pytest.mark.unit
    def test_updating_is_not_protected(self, db):
        """Updating projects are not protected."""
        project = ProjectFactory(status="updating", members=[])
        assert is_project_protected(project) is False

    @pytest.mark.unit
    def test_suspended_is_not_protected(self, db):
        """Suspended projects are not protected."""
        project = ProjectFactory(status="suspended", members=[])
        assert is_project_protected(project) is False

    @pytest.mark.unit
    def test_closing_is_not_protected(self, db):
        """Closing projects are not protected."""
        project = ProjectFactory(status="closing", members=[])
        assert is_project_protected(project) is False

    @pytest.mark.unit
    def test_final_update_is_not_protected(self, db):
        """Final-update projects are not protected."""
        project = ProjectFactory(status="final_update", members=[])
        assert is_project_protected(project) is False


class TestShouldSkipStatusTransition:
    """Tests for should_skip_status_transition()"""

    @pytest.mark.django_db
    def test_skip_when_later_stage_document_exists(self):
        """Concept plan action should be skipped when a progress report exists."""
        project = ProjectFactory(status="active", members=[])
        concept_doc = ProjectDocumentFactory(project=project, kind="concept")
        # Create a later-stage document (progress report, stage 3)
        ProjectDocumentFactory(project=project, kind="progressreport")

        assert should_skip_status_transition(concept_doc) is True

    @pytest.mark.django_db
    def test_no_skip_when_no_later_stage_document_exists(self):
        """Project plan action should proceed when no later-stage document exists."""
        project = ProjectFactory(status="active", members=[])
        plan_doc = ProjectDocumentFactory(project=project, kind="projectplan")

        assert should_skip_status_transition(plan_doc) is False

    @pytest.mark.django_db
    def test_skip_when_project_is_protected(self):
        """Any document action should be skipped when the project is protected."""
        project = ProjectFactory(status="completed", members=[])
        concept_doc = ProjectDocumentFactory(project=project, kind="concept")

        assert should_skip_status_transition(concept_doc) is True

    @pytest.mark.django_db
    def test_skip_concept_when_project_plan_exists(self):
        """Concept plan action skipped when project plan (stage 2) exists."""
        project = ProjectFactory(status="active", members=[])
        concept_doc = ProjectDocumentFactory(project=project, kind="concept")
        ProjectDocumentFactory(project=project, kind="projectplan")

        assert should_skip_status_transition(concept_doc) is True

    @pytest.mark.django_db
    def test_skip_project_plan_when_progress_report_exists(self):
        """Project plan action skipped when progress report (stage 3) exists."""
        project = ProjectFactory(status="active", members=[])
        plan_doc = ProjectDocumentFactory(project=project, kind="projectplan")
        ProjectDocumentFactory(project=project, kind="progressreport")

        assert should_skip_status_transition(plan_doc) is True

    @pytest.mark.django_db
    def test_skip_project_plan_when_student_report_exists(self):
        """Project plan action skipped when student report (stage 3) exists."""
        project = ProjectFactory(status="active", members=[])
        plan_doc = ProjectDocumentFactory(project=project, kind="projectplan")
        ProjectDocumentFactory(project=project, kind="studentreport")

        assert should_skip_status_transition(plan_doc) is True

    @pytest.mark.django_db
    def test_no_skip_progress_report_when_no_closure_exists(self):
        """Progress report action proceeds when no project closure exists."""
        project = ProjectFactory(status="active", members=[])
        report_doc = ProjectDocumentFactory(project=project, kind="progressreport")

        assert should_skip_status_transition(report_doc) is False

    @pytest.mark.django_db
    def test_skip_progress_report_when_closure_exists(self):
        """Progress report action skipped when project closure (stage 4) exists."""
        project = ProjectFactory(status="active", members=[])
        report_doc = ProjectDocumentFactory(project=project, kind="progressreport")
        ProjectDocumentFactory(project=project, kind="projectclosure")

        assert should_skip_status_transition(report_doc) is True

    @pytest.mark.django_db
    def test_no_skip_closure_document(self):
        """Project closure (highest stage) is never skipped by later documents."""
        project = ProjectFactory(status="active", members=[])
        closure_doc = ProjectDocumentFactory(project=project, kind="projectclosure")

        assert should_skip_status_transition(closure_doc) is False


class TestDocumentStageOrder:
    """Tests for the DOCUMENT_STAGE_ORDER constant."""

    @pytest.mark.unit
    def test_concept_is_stage_1(self):
        """Concept plan is stage 1."""
        assert DOCUMENT_STAGE_ORDER["concept"] == 1

    @pytest.mark.unit
    def test_projectplan_is_stage_2(self):
        """Project plan is stage 2."""
        assert DOCUMENT_STAGE_ORDER["projectplan"] == 2

    @pytest.mark.unit
    def test_progressreport_is_stage_3(self):
        """Progress report is stage 3."""
        assert DOCUMENT_STAGE_ORDER["progressreport"] == 3

    @pytest.mark.unit
    def test_studentreport_is_stage_3(self):
        """Student report is stage 3 (same as progress report)."""
        assert DOCUMENT_STAGE_ORDER["studentreport"] == 3

    @pytest.mark.unit
    def test_projectclosure_is_stage_4(self):
        """Project closure is stage 4."""
        assert DOCUMENT_STAGE_ORDER["projectclosure"] == 4

    @pytest.mark.unit
    def test_stage_ordering(self):
        """Stages follow correct order: concept < projectplan < reports < closure."""
        assert DOCUMENT_STAGE_ORDER["concept"] < DOCUMENT_STAGE_ORDER["projectplan"]
        assert (
            DOCUMENT_STAGE_ORDER["projectplan"] < DOCUMENT_STAGE_ORDER["progressreport"]
        )
        assert (
            DOCUMENT_STAGE_ORDER["progressreport"]
            == DOCUMENT_STAGE_ORDER["studentreport"]
        )
        assert (
            DOCUMENT_STAGE_ORDER["progressreport"]
            < DOCUMENT_STAGE_ORDER["projectclosure"]
        )
