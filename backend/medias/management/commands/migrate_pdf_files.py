"""
Management command to physically move AnnualReportPDF files from the
deprecated ``annual_reports/pdfs/`` directory to ``annual_reports/drafts/``
or ``annual_reports/published/`` based on the report's ``is_published`` flag.

Idempotent — safe to re-run on any environment.
"""

import os
import shutil

from django.conf import settings
from django.core.management.base import BaseCommand

from medias.models import AnnualReportPDF


class Command(BaseCommand):
    help = (
        "Physically move AnnualReportPDF files from annual_reports/pdfs/ "
        "to annual_reports/drafts/ or annual_reports/published/."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be done without moving any files.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        media_root = settings.MEDIA_ROOT

        # Ensure target directories exist
        drafts_dir = os.path.join(media_root, "annual_reports", "drafts")
        published_dir = os.path.join(media_root, "annual_reports", "published")
        if not dry_run:
            os.makedirs(drafts_dir, exist_ok=True)
            os.makedirs(published_dir, exist_ok=True)

        pdfs = AnnualReportPDF.objects.select_related("report").all()
        moved, skipped, warnings = self._process_all(pdfs, media_root, dry_run)

        prefix = "[DRY RUN] " if dry_run else ""
        self.stdout.write(
            self.style.SUCCESS(
                f"{prefix}Complete — moved: {moved}, skipped: {skipped}, warnings: {warnings}"
            )
        )

    def _process_all(self, pdfs, media_root, dry_run):
        moved = 0
        skipped = 0
        warnings = 0

        for pdf in pdfs:
            result = self._process_record(pdf, media_root, dry_run)
            if result == "moved":
                moved += 1
            elif result == "skipped":
                skipped += 1
            elif result == "warning":
                warnings += 1

        return moved, skipped, warnings

    def _process_record(self, pdf, media_root, dry_run):
        """Process a single AnnualReportPDF record. Returns 'moved', 'skipped', or 'warning'."""
        # Skip if no deprecated file field value
        if not pdf.file:
            return "skipped"

        # Skip if already migrated (draft_file or published_file already set
        # AND the file field path is NOT in pdfs/)
        old_path_rel = pdf.file.name
        if not old_path_rel.startswith("annual_reports/pdfs/"):
            # Already migrated or in an unexpected location
            return "skipped"

        # Determine target based on is_published
        is_published = pdf.report.is_published if pdf.report else False
        if is_published:
            target_subdir = "annual_reports/published/"
        else:
            target_subdir = "annual_reports/drafts/"

        filename = os.path.basename(old_path_rel)
        new_path_rel = target_subdir + filename

        old_abs = os.path.join(media_root, old_path_rel)
        new_abs = os.path.join(media_root, new_path_rel)

        # Check source file exists
        if not os.path.exists(old_abs):
            self.stderr.write(
                self.style.WARNING(
                    f"  WARNING: File missing on disk for PDF pk={pdf.pk}: {old_abs}"
                )
            )
            return "warning"

        prefix = "[DRY RUN] " if dry_run else ""
        target_label = "published" if is_published else "drafts"
        self.stdout.write(f"  {prefix}pk={pdf.pk} → {target_label}/{filename}")

        if not dry_run:
            # Copy then delete (safer than move across filesystems)
            shutil.copy2(old_abs, new_abs)
            os.remove(old_abs)

            # Update DB fields
            if is_published:
                pdf.published_file = new_path_rel
            else:
                pdf.draft_file = new_path_rel
            pdf.file = ""
            pdf.save(update_fields=["file", "draft_file", "published_file"])

        return "moved"
