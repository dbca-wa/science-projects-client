"""
Tests for annual report PDF generation service and views.

Covers lock management, progress tracking, generation views,
cancellation, and SSE progress streaming.
"""

import json
from unittest.mock import MagicMock, patch

import pytest

from common.tests.factories import UserFactory
from documents.services.annual_report_service import AnnualReportGenerationService

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

GENERATE_URL = "/api/v1/documents/reports/{pk}/generate_pdf"
CANCEL_URL = "/api/v1/documents/reports/{pk}/cancel_doc_gen"
SSE_URL = "/api/v1/documents/reports/{pk}/generation-progress"


@pytest.fixture(autouse=True)
def _clean_progress():
    """Ensure the in-memory progress dict is clean before and after each test."""
    AnnualReportGenerationService._progress.clear()
    yield
    AnnualReportGenerationService._progress.clear()


# ===========================================================================
# 6.1 — Lock management
# ===========================================================================


class TestLockManagement:
    """Tests for AnnualReportGenerationService lock acquisition and release."""

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_acquire_lock_returns_true_on_first_call(self, annual_report):
        """First lock acquisition should succeed."""
        result = AnnualReportGenerationService.acquire_generation_lock(annual_report.pk)
        assert result is True

        annual_report.refresh_from_db()
        assert annual_report.pdf_generation_in_progress is True

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_acquire_lock_returns_false_on_second_call(self, annual_report):
        """Second lock acquisition for the same report should fail."""
        AnnualReportGenerationService.acquire_generation_lock(annual_report.pk)
        result = AnnualReportGenerationService.acquire_generation_lock(annual_report.pk)
        assert result is False

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_release_lock_sets_flag_to_false(self, annual_report):
        """Releasing the lock should set pdf_generation_in_progress to False."""
        AnnualReportGenerationService.acquire_generation_lock(annual_report.pk)
        AnnualReportGenerationService.release_generation_lock(annual_report.pk)

        annual_report.refresh_from_db()
        assert annual_report.pdf_generation_in_progress is False

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_lock_released_in_finally_on_exception(self, annual_report):
        """Lock must be released even when generate() raises an exception."""
        AnnualReportGenerationService.acquire_generation_lock(annual_report.pk)
        user = UserFactory()

        with (
            patch.object(
                AnnualReportGenerationService,
                "get_ar_media_batch",
                side_effect=RuntimeError("boom"),
            ),
            patch("documents.services.annual_report_service.connection") as mock_conn,
        ):
            mock_conn.close = MagicMock()
            AnnualReportGenerationService.generate(annual_report.pk, "all", user)

        annual_report.refresh_from_db()
        assert annual_report.pdf_generation_in_progress is False


# ===========================================================================
# 6.2 — Progress tracking
# ===========================================================================


class TestProgressTracking:
    """Tests for in-memory progress state management."""

    @pytest.mark.unit
    def test_set_progress_stores_data(self):
        """set_progress should store data in the _progress dict."""
        AnnualReportGenerationService.set_progress(
            report_pk=1,
            phase="media_fetch",
            phase_label="Fetching media assets...",
            percentage=10,
            generation_kind="all",
        )

        stored = AnnualReportGenerationService._progress[1]
        assert stored["phase"] == "media_fetch"
        assert stored["phase_label"] == "Fetching media assets..."
        assert stored["percentage"] == 10
        assert stored["generation_kind"] == "all"
        assert stored["status"] == "in_progress"

    @pytest.mark.unit
    def test_get_progress_returns_stored_data(self):
        """get_progress should return the stored dict for a report."""
        AnnualReportGenerationService.set_progress(
            report_pk=42,
            phase="sorting",
            phase_label="Sorting...",
            percentage=45,
        )

        result = AnnualReportGenerationService.get_progress(42)
        assert result is not None
        assert result["phase"] == "sorting"
        assert result["percentage"] == 45

    @pytest.mark.unit
    def test_get_progress_returns_none_when_absent(self):
        """get_progress should return None when no progress exists."""
        result = AnnualReportGenerationService.get_progress(999)
        assert result is None

    @pytest.mark.unit
    def test_clear_progress_removes_entry(self):
        """clear_progress should remove the entry from _progress."""
        AnnualReportGenerationService.set_progress(
            report_pk=7,
            phase="done",
            phase_label="Done",
            percentage=100,
        )
        AnnualReportGenerationService.clear_progress(7)

        assert AnnualReportGenerationService.get_progress(7) is None


# ===========================================================================
# 6.3 — BeginAnnualReportDocGeneration view
# ===========================================================================


class TestBeginAnnualReportDocGeneration:
    """Tests for the generate_pdf endpoint."""

    @pytest.mark.django_db
    @pytest.mark.integration
    @patch("documents.views.pdf.threading.Thread")
    def test_202_on_valid_request(self, mock_thread_cls, api_client, annual_report):
        """Valid request should return 202 and start a thread."""
        user = UserFactory()
        api_client.force_authenticate(user=user)

        mock_thread = MagicMock()
        mock_thread_cls.return_value = mock_thread

        url = GENERATE_URL.format(pk=annual_report.pk)
        response = api_client.post(url, {"genkind": "all"}, format="json")

        assert response.status_code == 202
        assert response.data["report_id"] == annual_report.pk
        mock_thread.start.assert_called_once()

        # Clean up the lock so other tests aren't affected
        AnnualReportGenerationService.release_generation_lock(annual_report.pk)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_400_on_invalid_genkind(self, api_client, annual_report):
        """Invalid genkind should return 400."""
        user = UserFactory()
        api_client.force_authenticate(user=user)

        url = GENERATE_URL.format(pk=annual_report.pk)
        response = api_client.post(url, {"genkind": "invalid"}, format="json")

        assert response.status_code == 400

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_404_on_nonexistent_report(self, api_client):
        """Non-existent report PK should return 404."""
        user = UserFactory()
        api_client.force_authenticate(user=user)

        url = GENERATE_URL.format(pk=99999)
        response = api_client.post(url, {"genkind": "all"}, format="json")

        assert response.status_code == 404

    @pytest.mark.django_db
    @pytest.mark.integration
    @patch("documents.views.pdf.threading.Thread")
    def test_409_when_already_in_progress(
        self, mock_thread_cls, api_client, annual_report
    ):
        """Second generation request should return 409."""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        mock_thread_cls.return_value = MagicMock()

        url = GENERATE_URL.format(pk=annual_report.pk)

        # First request acquires the lock
        api_client.post(url, {"genkind": "all"}, format="json")

        # Second request should be rejected
        response = api_client.post(url, {"genkind": "approved"}, format="json")
        assert response.status_code == 409

        # Clean up
        AnnualReportGenerationService.release_generation_lock(annual_report.pk)


# ===========================================================================
# 6.4 — CancelReportDocGeneration view
# ===========================================================================


class TestCancelReportDocGeneration:
    """Tests for the cancel_doc_gen endpoint."""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_202_when_cancelling_active_generation(self, api_client, annual_report):
        """Cancelling an active generation should return 202."""
        user = UserFactory()
        api_client.force_authenticate(user=user)

        # Simulate generation in progress
        annual_report.pdf_generation_in_progress = True
        annual_report.save(update_fields=["pdf_generation_in_progress"])

        url = CANCEL_URL.format(pk=annual_report.pk)
        response = api_client.post(url)

        assert response.status_code == 202

        annual_report.refresh_from_db()
        assert annual_report.pdf_generation_in_progress is False

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_200_when_no_generation_in_progress(self, api_client, annual_report):
        """Cancelling when nothing is running should return 200."""
        user = UserFactory()
        api_client.force_authenticate(user=user)

        url = CANCEL_URL.format(pk=annual_report.pk)
        response = api_client.post(url)

        assert response.status_code == 200


# ===========================================================================
# 6.5 — GenerationProgressSSE view
# ===========================================================================


class TestGenerationProgressSSE:
    """Tests for the SSE generation-progress endpoint."""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_event_stream_content_type(self, api_client, annual_report):
        """Response should have text/event-stream content type."""
        user = UserFactory()
        api_client.force_authenticate(user=user)

        url = SSE_URL.format(pk=annual_report.pk)
        response = api_client.get(url)

        assert response["Content-Type"] == "text/event-stream"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_emits_idle_when_no_generation_active(self, api_client, annual_report):
        """Should emit idle status when no generation is in progress."""
        user = UserFactory()
        api_client.force_authenticate(user=user)

        url = SSE_URL.format(pk=annual_report.pk)
        response = api_client.get(url)

        content = b"".join(response.streaming_content).decode()
        assert "data:" in content

        # Parse the SSE data line
        data_line = [
            line for line in content.strip().split("\n") if line.startswith("data:")
        ][0]
        payload = json.loads(data_line.replace("data: ", ""))
        assert payload["status"] == "idle"

    @pytest.mark.django_db
    @pytest.mark.integration
    @patch("documents.views.annual_report.time.sleep", return_value=None)
    @patch.object(AnnualReportGenerationService, "get_progress")
    def test_emits_progress_events_when_generating(
        self, mock_get_progress, _mock_sleep, api_client, annual_report
    ):
        """Should emit progress events when generation is in progress."""
        user = UserFactory()
        api_client.force_authenticate(user=user)

        # Simulate generation in progress
        annual_report.pdf_generation_in_progress = True
        annual_report.save(update_fields=["pdf_generation_in_progress"])

        in_progress_event = {
            "phase": "pdf_conversion",
            "phase_label": "Converting to PDF...",
            "percentage": 75,
            "generation_kind": "all",
            "status": "in_progress",
            "error_message": "",
        }
        completed_event = {
            "phase": "file_save",
            "phase_label": "Complete",
            "percentage": 100,
            "generation_kind": "all",
            "status": "completed",
            "error_message": "",
        }

        # The generator calls get_progress:
        #   1) Initial check (not None → skip idle, enter loop)
        #   2) First loop iteration → yield in_progress
        #   3) Second loop iteration → yield completed, exit
        mock_get_progress.side_effect = [
            in_progress_event,
            in_progress_event,
            completed_event,
        ]

        url = SSE_URL.format(pk=annual_report.pk)
        response = api_client.get(url)

        content = b"".join(response.streaming_content).decode()
        data_lines = [
            line for line in content.strip().split("\n") if line.startswith("data:")
        ]

        assert len(data_lines) >= 2

        first_event = json.loads(data_lines[0].replace("data: ", ""))
        assert first_event["percentage"] == 75
        assert first_event["status"] == "in_progress"

        last_event = json.loads(data_lines[-1].replace("data: ", ""))
        assert last_event["status"] == "completed"
        assert last_event["percentage"] == 100
