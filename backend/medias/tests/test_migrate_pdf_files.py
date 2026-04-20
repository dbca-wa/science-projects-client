"""
Tests for the migrate_pdf_files management command.

Covers --dry-run mode, actual migration, and edge cases.
"""

import pytest
from django.core.management import call_command
from django.test import override_settings

from common.tests.factories import SuperuserFactory
from documents.models import AnnualReport
from medias.models import AnnualReportPDF


def _make_pdf_content():
    """Return minimal valid PDF bytes"""
    return (
        b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>"
        b"endobj\n2 0 obj\n<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
        b"3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/"
        b"Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n"
        b"0000000015 00000 n\n0000000068 00000 n\n0000000127 00000 n\n"
        b"trailer\n<</Size 4/Root 1 0 R>>\nstartxref\n225\n%%EOF"
    )


class TestMigratePdfFilesCommand:
    """Tests for the migrate_pdf_files management command"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_dry_run_does_not_move_files(self, tmp_path):
        """--dry-run reports what would happen without moving files"""
        import datetime

        report = AnnualReport.objects.create(
            year=2024,
            is_published=False,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        user = SuperuserFactory()
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)

        # Manually set the deprecated file field to a pdfs/ path
        pdf.file.name = "annual_reports/pdfs/test_report.pdf"
        pdf.save(update_fields=["file"])

        # Create the physical file in the temp media root
        media_root = tmp_path / "media"
        pdfs_dir = media_root / "annual_reports" / "pdfs"
        pdfs_dir.mkdir(parents=True)
        (pdfs_dir / "test_report.pdf").write_bytes(_make_pdf_content())

        with override_settings(MEDIA_ROOT=str(media_root)):
            call_command("migrate_pdf_files", "--dry-run")

        # File should still be in the old location
        assert (pdfs_dir / "test_report.pdf").exists()
        # DB should not be updated
        pdf.refresh_from_db()
        assert pdf.file.name == "annual_reports/pdfs/test_report.pdf"
        assert not pdf.draft_file

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_moves_unpublished_to_drafts(self, tmp_path):
        """Unpublished report's PDF is moved to drafts/"""
        import datetime

        report = AnnualReport.objects.create(
            year=2024,
            is_published=False,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        user = SuperuserFactory()
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.file.name = "annual_reports/pdfs/draft_report.pdf"
        pdf.save(update_fields=["file"])

        media_root = tmp_path / "media"
        pdfs_dir = media_root / "annual_reports" / "pdfs"
        pdfs_dir.mkdir(parents=True)
        (pdfs_dir / "draft_report.pdf").write_bytes(_make_pdf_content())

        with override_settings(MEDIA_ROOT=str(media_root)):
            call_command("migrate_pdf_files")

        pdf.refresh_from_db()
        # Model save() may append a content hash to the filename
        assert pdf.draft_file.name.startswith("annual_reports/drafts/draft_report")
        assert pdf.draft_file.name.endswith(".pdf")
        assert pdf.file == ""
        # Physical file moved from old location
        assert not (pdfs_dir / "draft_report.pdf").exists()

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_moves_published_to_published_dir(self, tmp_path):
        """Published report's PDF is moved to published/"""
        import datetime

        report = AnnualReport.objects.create(
            year=2024,
            is_published=True,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        user = SuperuserFactory()
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.file.name = "annual_reports/pdfs/pub_report.pdf"
        pdf.save(update_fields=["file"])

        media_root = tmp_path / "media"
        pdfs_dir = media_root / "annual_reports" / "pdfs"
        pdfs_dir.mkdir(parents=True)
        (pdfs_dir / "pub_report.pdf").write_bytes(_make_pdf_content())

        with override_settings(MEDIA_ROOT=str(media_root)):
            call_command("migrate_pdf_files")

        pdf.refresh_from_db()
        # Model save() may append a content hash to the filename
        assert pdf.published_file.name.startswith("annual_reports/published/pub_report")
        assert pdf.published_file.name.endswith(".pdf")
        assert pdf.file == ""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_skips_already_migrated(self, tmp_path):
        """Records not in pdfs/ are skipped"""
        import datetime

        report = AnnualReport.objects.create(
            year=2024,
            is_published=False,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        user = SuperuserFactory()
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        # Already in drafts/ — should be skipped
        pdf.file.name = "annual_reports/drafts/already_migrated.pdf"
        pdf.save(update_fields=["file"])

        media_root = tmp_path / "media"
        with override_settings(MEDIA_ROOT=str(media_root)):
            call_command("migrate_pdf_files")

        pdf.refresh_from_db()
        # Should remain unchanged
        assert pdf.file.name == "annual_reports/drafts/already_migrated.pdf"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_skips_empty_file_field(self, tmp_path):
        """Records with no file field value are skipped"""
        import datetime

        report = AnnualReport.objects.create(
            year=2024,
            is_published=False,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        user = SuperuserFactory()
        AnnualReportPDF.objects.create(report=report, creator=user)

        media_root = tmp_path / "media"
        with override_settings(MEDIA_ROOT=str(media_root)):
            call_command("migrate_pdf_files")

        # No error — command completes successfully

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_warns_on_missing_physical_file(self, tmp_path):
        """Warning issued when DB record points to a file that doesn't exist on disk"""
        import datetime

        report = AnnualReport.objects.create(
            year=2024,
            is_published=False,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        user = SuperuserFactory()
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.file.name = "annual_reports/pdfs/ghost.pdf"
        pdf.save(update_fields=["file"])

        media_root = tmp_path / "media"
        # Don't create the physical file — it's missing
        (media_root / "annual_reports" / "pdfs").mkdir(parents=True)

        with override_settings(MEDIA_ROOT=str(media_root)):
            call_command("migrate_pdf_files")

        # DB should remain unchanged (warning path)
        pdf.refresh_from_db()
        assert pdf.file.name == "annual_reports/pdfs/ghost.pdf"
