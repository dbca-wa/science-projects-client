"""
Tests for AnnualReportGenerationService progress and lock management methods.
"""

import datetime

import pytest

from documents.models import AnnualReport
from documents.services.annual_report_service import AnnualReportGenerationService


@pytest.fixture
def report(db):
    """Provide an annual report for progress tests"""
    return AnnualReport.objects.create(
        year=2024,
        is_published=False,
        date_open=datetime.date(2023, 7, 1),
        date_closed=datetime.date(2024, 6, 30),
    )


class TestProgressManagement:
    """Tests for get_progress, set_progress, clear_progress"""

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_progress_returns_none_when_empty(self, report):
        """No progress data returns None"""
        result = AnnualReportGenerationService.get_progress(report.pk)
        assert result is None

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_set_and_get_progress(self, report):
        """set_progress stores data retrievable by get_progress"""
        AnnualReportGenerationService.set_progress(
            report_pk=report.pk,
            phase="rendering",
            phase_label="Rendering PDF",
            percentage=50,
            status="in_progress",
            generation_kind="all",
        )

        progress = AnnualReportGenerationService.get_progress(report.pk)
        assert progress is not None
        assert progress["phase"] == "rendering"
        assert progress["phase_label"] == "Rendering PDF"
        assert progress["percentage"] == 50
        assert progress["status"] == "in_progress"
        assert progress["generation_kind"] == "all"
        assert "started_at" in progress

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_set_progress_preserves_started_at(self, report):
        """Subsequent set_progress calls preserve the original started_at"""
        AnnualReportGenerationService.set_progress(
            report_pk=report.pk,
            phase="init",
            phase_label="Initialising",
            percentage=0,
        )
        first_progress = AnnualReportGenerationService.get_progress(report.pk)
        original_started_at = first_progress["started_at"]

        AnnualReportGenerationService.set_progress(
            report_pk=report.pk,
            phase="rendering",
            phase_label="Rendering",
            percentage=75,
        )
        second_progress = AnnualReportGenerationService.get_progress(report.pk)
        assert second_progress["started_at"] == original_started_at

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_clear_progress(self, report):
        """clear_progress removes all progress data"""
        AnnualReportGenerationService.set_progress(
            report_pk=report.pk,
            phase="done",
            phase_label="Complete",
            percentage=100,
            status="completed",
        )
        AnnualReportGenerationService.clear_progress(report.pk)

        result = AnnualReportGenerationService.get_progress(report.pk)
        assert result is None

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_progress_nonexistent_report(self):
        """get_progress for a non-existent report returns None"""
        result = AnnualReportGenerationService.get_progress(99999)
        assert result is None

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_set_progress_with_error(self, report):
        """set_progress can store error status and message"""
        AnnualReportGenerationService.set_progress(
            report_pk=report.pk,
            phase="error",
            phase_label="Generation Failed",
            percentage=0,
            status="error",
            error_message="Template rendering failed",
        )

        progress = AnnualReportGenerationService.get_progress(report.pk)
        assert progress["status"] == "error"
        assert progress["error_message"] == "Template rendering failed"


class TestLockManagement:
    """Tests for acquire_generation_lock and release_generation_lock"""

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_acquire_lock_succeeds(self, report):
        """First lock acquisition succeeds"""
        result = AnnualReportGenerationService.acquire_generation_lock(report.pk)
        assert result is True
        report.refresh_from_db()
        assert report.pdf_generation_in_progress is True

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_acquire_lock_fails_when_already_locked(self, report):
        """Second lock acquisition fails (prevents concurrent generation)"""
        AnnualReportGenerationService.acquire_generation_lock(report.pk)
        result = AnnualReportGenerationService.acquire_generation_lock(report.pk)
        assert result is False

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_release_lock(self, report):
        """release_generation_lock clears the flag"""
        AnnualReportGenerationService.acquire_generation_lock(report.pk)
        AnnualReportGenerationService.release_generation_lock(report.pk)
        report.refresh_from_db()
        assert report.pdf_generation_in_progress is False

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_acquire_after_release(self, report):
        """Lock can be re-acquired after release"""
        AnnualReportGenerationService.acquire_generation_lock(report.pk)
        AnnualReportGenerationService.release_generation_lock(report.pk)
        result = AnnualReportGenerationService.acquire_generation_lock(report.pk)
        assert result is True
