"""
Annual Report PDF Generation Service

Orchestrates the full annual report PDF generation pipeline with progress
tracking, lock management, data fetching, context building, and threaded
generation.
"""

import datetime
import os
import re
import time
from collections import defaultdict

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import connection
from django.db.models import Prefetch, Q
from django.template.loader import render_to_string


class AnnualReportGenerationService:
    """Orchestrates annual report PDF generation with progress tracking.

    Progress is stored in the database (AnnualReport.pdf_generation_progress)
    so it is accessible across all Gunicorn workers and Kubernetes pods.
    """

    # region Progress Management ================================================

    @classmethod
    def get_progress(cls, report_pk: int) -> dict | None:
        """Get current progress for a report. Returns None if no generation active."""
        from ..models import AnnualReport

        try:
            progress = (
                AnnualReport.objects.filter(pk=report_pk)
                .values_list("pdf_generation_progress", flat=True)
                .first()
            )
            if progress:
                return progress
        except Exception as e:
            settings.LOGGER.warning(
                f"Failed to read generation progress for report {report_pk}: {e}"
            )
        return None

    @classmethod
    def set_progress(
        cls,
        report_pk: int,
        phase: str,
        phase_label: str,
        percentage: int,
        status: str = "in_progress",
        generation_kind: str = "all",
        error_message: str = "",
    ) -> None:
        """Update progress state for a report in the database."""
        from ..models import AnnualReport

        # Preserve started_at from existing progress
        existing = cls.get_progress(report_pk)
        started_at = (
            existing["started_at"]
            if existing and "started_at" in existing
            else time.time()
        )
        progress_data = {
            "phase": phase,
            "phase_label": phase_label,
            "percentage": percentage,
            "generation_kind": generation_kind,
            "status": status,
            "error_message": error_message,
            "started_at": started_at,
        }
        AnnualReport.objects.filter(pk=report_pk).update(
            pdf_generation_progress=progress_data
        )

    @classmethod
    def clear_progress(cls, report_pk: int) -> None:
        """Remove progress state after generation completes."""
        from ..models import AnnualReport

        AnnualReport.objects.filter(pk=report_pk).update(pdf_generation_progress={})

    # endregion =================================================================

    # region Lock Management ====================================================

    @classmethod
    def acquire_generation_lock(cls, report_pk: int) -> bool:
        """
        Atomically set pdf_generation_in_progress flag.

        Uses a single UPDATE with a WHERE clause to prevent race conditions.
        Returns True if the lock was acquired, False if generation is already
        in progress.
        """
        from ..models import AnnualReport

        rows_updated = AnnualReport.objects.filter(
            pk=report_pk, pdf_generation_in_progress=False
        ).update(pdf_generation_in_progress=True)
        return rows_updated == 1

    @classmethod
    def release_generation_lock(cls, report_pk: int) -> None:
        """Release the generation flag. Called in finally blocks."""
        from ..models import AnnualReport

        AnnualReport.objects.filter(pk=report_pk).update(
            pdf_generation_in_progress=False
        )

    # endregion =================================================================

    # region Cancellation =======================================================

    @classmethod
    def is_cancelled(cls, report_pk: int) -> bool:
        """
        Check if generation has been cancelled.

        Cancellation is detected when the pdf_generation_in_progress flag has
        been set to False externally (by the cancel endpoint).
        """
        from ..models import AnnualReport

        return not AnnualReport.objects.filter(
            pk=report_pk, pdf_generation_in_progress=True
        ).exists()

    # endregion =================================================================

    # region Data Fetching ======================================================

    @classmethod
    def get_ar_media_batch(cls, report_pk: int) -> dict:
        """
        Fetch all AnnualReportMedia for a report in a single query.

        Returns a dict keyed by media kind for efficient lookup.
        """
        from medias.models import AnnualReportMedia

        media_queryset = AnnualReportMedia.objects.filter(report=report_pk).only(
            "kind", "file", "report_id"
        )
        return {media.kind: media for media in media_queryset}

    @classmethod
    def get_reports_by_genkind(cls, report, genkind: str) -> dict:
        """
        Fetch progress reports and student reports filtered by genkind.

        Args:
            report: AnnualReport instance
            genkind: "all" for all reports, "approved" for approved-only

        Returns:
            dict with "progress_reports" and "student_reports" keys containing
            serialised data matching the template's expected structure.
        """
        from projects.models import ProjectMember

        from ..models import ProgressReport, StudentReport
        from ..serializers import (
            OptimisedProgressReportAnnualReportSerializer,
            OptimisedStudentReportAnnualReportSerializer,
        )

        # Filter by the report's division (or all if no division set)
        base_filter = Q(report=report)
        if report.division:
            base_filter &= Q(project__business_area__division=report.division)

        # Add approval filter when generating approved-only
        student_filter = base_filter
        progress_filter = base_filter
        if genkind == "approved":
            student_filter &= Q(document__status="approved")
            progress_filter &= Q(document__status="approved")

        # Student reports
        active_sr_docs = (
            StudentReport.objects.filter(student_filter)
            .exclude(project__business_area__division__name__isnull=True)
            .select_related(
                "document",
                "project",
                "project__business_area",
                "project__image",
                "project__student_project_info",
            )
            .prefetch_related(
                Prefetch(
                    "project__members",
                    queryset=ProjectMember.objects.select_related(
                        "user", "user__profile"
                    ),
                ),
                "project__area",
                "project__business_area__image",
            )
        )

        # Progress reports — regular + project 1127 (special case)
        regular_pr_docs = (
            ProgressReport.objects.filter(progress_filter)
            .exclude(project__business_area__division__name__isnull=True)
            .select_related(
                "document",
                "project",
                "project__business_area",
                "project__image",
                "project__student_project_info",
            )
            .prefetch_related(
                Prefetch(
                    "project__members",
                    queryset=ProjectMember.objects.select_related(
                        "user", "user__profile"
                    ),
                ),
                "project__area",
                "project__business_area__image",
            )
        )

        # Project 1127 reports (without business_area division requirement)
        project_1127_filter = Q(report=report) & Q(project__pk=1127)
        if genkind == "approved":
            project_1127_filter &= Q(document__status="approved")
        project_1127_pr_docs = (
            ProgressReport.objects.filter(project_1127_filter)
            .select_related(
                "document",
                "project",
                "project__image",
                "project__student_project_info",
            )
            .prefetch_related(
                Prefetch(
                    "project__members",
                    queryset=ProjectMember.objects.select_related(
                        "user", "user__profile"
                    ),
                ),
                "project__area",
            )
        )

        active_pr_docs = list(regular_pr_docs) + list(project_1127_pr_docs)

        # Clean empty paragraphs from HTML fields
        empty_p_pattern = re.compile(r"<p>(&nbsp;|\s)*</p>")
        nbsp_pattern = re.compile(r"&nbsp;")

        def clean_html(html_content):
            if not html_content:
                return html_content
            html_content = empty_p_pattern.sub("", html_content)
            html_content = nbsp_pattern.sub(" ", html_content)
            return html_content

        for pr in active_pr_docs:
            pr.context = clean_html(pr.context)
            pr.aims = clean_html(pr.aims)
            pr.progress = clean_html(pr.progress)
            pr.implications = clean_html(pr.implications)
            pr.future = clean_html(pr.future)

        for sr in active_sr_docs:
            sr.progress_report = clean_html(sr.progress_report)

        # Handle project 1127 business area override
        try:
            from agencies.models import BusinessArea

            plant_science_ba = BusinessArea.objects.only(
                "pk", "name", "leader_id", "introduction"
            ).get(name="Plant Science and Herbarium")
            plant_science_ba_data = {
                "name": plant_science_ba.name,
                "pk": plant_science_ba.pk,
                "leader": plant_science_ba.leader_id,
                "introduction": plant_science_ba.introduction or "",
            }
        except Exception:
            plant_science_ba_data = {
                "name": "Plant Science and Herbarium",
                "pk": None,
                "leader": None,
                "introduction": "",
            }

        sr_ser = OptimisedStudentReportAnnualReportSerializer(active_sr_docs, many=True)
        pr_ser = OptimisedProgressReportAnnualReportSerializer(
            active_pr_docs, many=True
        )

        # Apply business area override for project 1127
        for report_data in pr_ser.data:
            if report_data["document"]["project"]["pk"] == 1127:
                report_data["document"]["project"][
                    "business_area"
                ] = plant_science_ba_data

        return {
            "student_reports": sr_ser.data,
            "progress_reports": pr_ser.data,
        }

    @classmethod
    def get_external_projects(cls, report, genkind: str) -> list[dict]:
        """
        Fetch external partnership projects for the report, filtered by genkind.

        Returns a list of dicts with title, partners, funding, and team_members.
        """
        from projects.models import Project, ProjectMember

        base_query = Q(kind__in=[Project.CategoryKindChoices.EXTERNAL])
        if report.division:
            base_query &= Q(business_area__division=report.division)

        if genkind == "approved":
            base_query &= Q(status="active")

        active_external_projects = (
            Project.objects.filter(base_query)
            .exclude(business_area__division__name__isnull=True)
            .exclude(
                status__in=(
                    [
                        Project.StatusChoices.COMPLETED,
                        Project.StatusChoices.SUSPENDED,
                        Project.StatusChoices.TERMINATED,
                    ]
                    if genkind == "all"
                    else []
                )
            )
            .select_related("external_project_info")
            .prefetch_related(
                Prefetch(
                    "members",
                    queryset=ProjectMember.objects.select_related("user").filter(
                        role__in=ProjectMember.STAFF_ROLES
                    ),
                )
            )
            .only(
                "pk",
                "title",
                "external_project_info__collaboration_with",
                "external_project_info__budget",
            )
            .order_by("title")
        )

        result = []
        for project in active_external_projects:
            team_members = []
            if (
                hasattr(project, "_prefetched_objects_cache")
                and "members" in project._prefetched_objects_cache
            ):
                for member in project._prefetched_objects_cache["members"]:
                    if member.user.is_staff:
                        team_members.append(
                            {
                                "role": member.role,
                                "user": {
                                    "pk": member.user.pk,
                                    "display_first_name": member.user.display_first_name,
                                    "display_last_name": member.user.display_last_name,
                                    "is_staff": member.user.is_staff,
                                },
                            }
                        )

            result.append(
                {
                    "pk": project.pk,
                    "title": project.title,
                    "partners": (
                        project.external_project_info.collaboration_with
                        if hasattr(project, "external_project_info")
                        and project.external_project_info
                        else ""
                    ),
                    "funding": (
                        project.external_project_info.budget
                        if hasattr(project, "external_project_info")
                        and project.external_project_info
                        else ""
                    ),
                    "team_members": team_members,
                }
            )

        return result

    # endregion =================================================================

    # region Sorting =============================================================

    @classmethod
    def build_sorted_ba_data(cls, progress_reports) -> list[dict]:
        """
        Group progress reports by business area, sort business areas
        alphabetically, and sort reports within each area by year (desc)
        then title (asc).
        """
        from users.models import User

        ba_dict = {}
        progress_reports_by_ba = defaultdict(list)

        for pr in progress_reports:
            document = pr["document"]
            project = document["project"]
            ba = project["business_area"]

            if ba:
                ba_pk = ba["pk"]
                if ba_pk not in ba_dict:
                    ba_dict[ba_pk] = ba
                progress_reports_by_ba[ba_pk].append(pr)

        # Batch-fetch leader names
        user_pks = [ba["leader"] for ba in ba_dict.values() if ba and ba.get("leader")]
        users_dict = {}
        if user_pks:
            users_dict = {
                user.pk: f"{user.display_first_name} {user.display_last_name}"
                for user in User.objects.filter(pk__in=user_pks).only(
                    "pk", "display_first_name", "display_last_name"
                )
            }

        html_tag_pattern = re.compile(r"<[^>]+>")

        def get_clean_title(html_string):
            """Strip HTML tags for sorting purposes."""
            if not html_string:
                return ""
            clean_text = html_tag_pattern.sub(" ", html_string)
            return " ".join(clean_text.split()).strip()

        sorted_ba_data = []
        for ba_pk, ba in ba_dict.items():
            reports = progress_reports_by_ba[ba_pk]

            sorted_reports = sorted(
                reports,
                key=lambda x: (
                    -int(x["document"]["project"]["year"]),
                    get_clean_title(x["document"]["project"]["title"]).lower(),
                ),
            )

            sorted_ba_data.append(
                {
                    "ba_name": ba["name"],
                    "ba_image": ba.get("image", ""),
                    "ba_leader": users_dict.get(ba.get("leader"), ""),
                    "ba_introduction": ba.get("introduction", ""),
                    "progress_reports": sorted_reports,
                }
            )

        return sorted(sorted_ba_data, key=lambda x: x["ba_name"])

    # endregion =================================================================

    # region Template Context ===================================================

    @classmethod
    def build_template_context(
        cls,
        report,
        genkind: str,
        media_dict: dict,
        sorted_ba_data: list[dict],
        sorted_externals: list[dict],
        sorted_students: list,
    ) -> dict:
        """
        Assemble the full template context dict matching all variables
        expected by annual_report.html.
        """
        base_dir = settings.BASE_DIR

        # Helper to resolve media file path for PrinceXML
        def get_media_url(kind, default=""):
            media = media_dict.get(kind)
            if media and hasattr(media, "file") and media.file:
                if hasattr(media.file, "url") and media.file.url:
                    return media.file.url
            return default

        def get_media_file_path(kind, default=""):
            media = media_dict.get(kind)
            if media and hasattr(media, "file") and media.file:
                if hasattr(media.file, "url") and media.file.url:
                    return os.path.join(base_dir, media.file.url.lstrip("/"))
            return default

        # Generic chapter image fallback
        generic_chapter_image = os.path.join(
            base_dir, "documents", "assets", "generic_chapter_image.jpg"
        )
        if not os.path.exists(generic_chapter_image):
            generic_chapter_image = ""

        # No-image fallback
        no_image_path = os.path.join(
            base_dir, "documents", "assets", "image_not_available.png"
        )
        if not os.path.exists(no_image_path):
            no_image_path = ""

        # CSS path
        prince_css_path = os.path.join(
            base_dir, "documents", "assets", "prince_ar_document_styles.css"
        )

        # DBCA banner images from uploaded media, with fallback to static assets
        dbca_image_path = get_media_file_path("dbca_banner") or os.path.join(
            base_dir, "documents", "assets", "BCSTransparent.png"
        )
        dbca_cropped_image_path = get_media_file_path(
            "dbca_banner_cropped"
        ) or os.path.join(base_dir, "documents", "assets", "BCSTransparentCropped.png")

        # Service delivery structure data
        sds_data = {
            "intro": report.service_delivery_intro,
            "chart": get_media_url("sdchart"),
            "chapter_image": get_media_file_path("service_delivery")
            or generic_chapter_image,
        }

        # Chapter images for each section — fall back to generic if not uploaded
        research_chapter_image = (
            get_media_file_path("research") or generic_chapter_image
        )
        partnerships_chapter_image = (
            get_media_file_path("partnerships") or generic_chapter_image
        )
        collaborations_chapter_image = (
            get_media_file_path("collaborations") or generic_chapter_image
        )
        student_projects_chapter_image = (
            get_media_file_path("student_projects") or generic_chapter_image
        )
        publications_chapter_image = (
            get_media_file_path("publications") or generic_chapter_image
        )

        # Server URL for resolving media URLs in the template
        server_url = (
            "http://127.0.0.1:8000"
            if settings.DEBUG
            else getattr(settings, "PRINCE_SERVER_URL", str(base_dir))
        )

        # Formatted generation timestamp
        now = datetime.datetime.now()
        day_suffix = (
            "th"
            if 10 <= now.day % 100 <= 20
            else {1: "st", 2: "nd", 3: "rd"}.get(now.day % 10, "th")
        )
        time_generated = now.strftime(f"{now.day}{day_suffix} %B, %Y @ %I:%M%p")

        return {
            "financial_year_string": f"{int(report.year - 1)}-{int(report.year)}",
            "directors_message_data": report.dm,
            "directors_message_sign_off": report.dm_sign,
            "sds_data": sds_data,
            "sorted_ba_data_and_pr_dict": sorted_ba_data,
            "sorted_external_project_data": sorted_externals,
            "sorted_student_report_array": sorted_students,
            "publications_data": report.publications,
            "prince_css_path": prince_css_path,
            "dbca_image_path": dbca_image_path,
            "dbca_cropped_image_path": dbca_cropped_image_path,
            "server_url": server_url,
            "generic_chapter_image_path": generic_chapter_image,
            "research_chapter_image": research_chapter_image,
            "partnerships_chapter_image": partnerships_chapter_image,
            "collaborations_chapter_image": collaborations_chapter_image,
            "student_projects_chapter_image": student_projects_chapter_image,
            "publications_chapter_image": publications_chapter_image,
            "no_image_path": no_image_path,
            "time_generated": time_generated,
            "population_time": "",  # Set by caller after context build
            "base_url": base_dir,
        }

    # endregion =================================================================

    # region Generation Pipeline ================================================

    @classmethod
    def generate(cls, report_pk: int, genkind: str, user) -> None:
        """
        Main generation pipeline. Runs in a background thread.

        Phases:
        1. media_fetch (0-15%)  — Batch fetch AnnualReportMedia
        2. data_fetch (15-40%)  — Fetch progress reports, student reports, externals
        3. sorting (40-50%)     — Sort business areas, reports, externals
        4. template_render (50-65%) — Render annual_report.html with context
        5. pdf_conversion (65-90%)  — PrinceXML subprocess
        6. file_save (90-100%)  — Save to AnnualReportPDF, cleanup
        """
        from ..models import AnnualReport

        # Close stale DB connection so the thread gets a fresh one
        connection.close()

        timings = {}
        total_start = time.perf_counter()

        settings.LOGGER.info(
            f"Starting PDF generation for report {report_pk} (genkind={genkind})"
        )

        # Clear any stale progress from a previous generation
        cls.clear_progress(report_pk)

        try:
            # ── Phase 1: Media Fetch ──────────────────────────────────────
            cls.set_progress(
                report_pk,
                "media_fetch",
                "Fetching media assets...",
                0,
                generation_kind=genkind,
            )
            phase_start = time.perf_counter()

            media_dict = cls.get_ar_media_batch(report_pk)

            timings["media_fetch"] = time.perf_counter() - phase_start
            cls.set_progress(
                report_pk,
                "media_fetch",
                "Fetching media assets...",
                15,
                generation_kind=genkind,
            )

            if cls.is_cancelled(report_pk):
                settings.LOGGER.info(
                    f"PDF generation cancelled for report {report_pk} after media_fetch"
                )
                cls.set_progress(
                    report_pk,
                    "error",
                    "Generation cancelled",
                    0,
                    status="error",
                    generation_kind=genkind,
                    error_message="Generation cancelled",
                )
                return

            # ── Phase 2: Data Fetch ───────────────────────────────────────
            cls.set_progress(
                report_pk,
                "data_fetch",
                "Fetching report data...",
                15,
                generation_kind=genkind,
            )
            phase_start = time.perf_counter()

            report = (
                AnnualReport.objects.select_related("division")
                .only(
                    "pk",
                    "year",
                    "dm",
                    "dm_sign",
                    "service_delivery_intro",
                    "publications",
                    "division_id",
                    "division__slug",
                )
                .get(pk=report_pk)
            )

            participating_reports = cls.get_reports_by_genkind(report, genkind)
            participating_externals = cls.get_external_projects(report, genkind)

            timings["data_fetch"] = time.perf_counter() - phase_start
            cls.set_progress(
                report_pk,
                "data_fetch",
                "Fetching report data...",
                40,
                generation_kind=genkind,
            )

            if cls.is_cancelled(report_pk):
                settings.LOGGER.info(
                    f"PDF generation cancelled for report {report_pk} after data_fetch"
                )
                cls.set_progress(
                    report_pk,
                    "error",
                    "Generation cancelled",
                    0,
                    status="error",
                    generation_kind=genkind,
                    error_message="Generation cancelled",
                )
                return

            # ── Phase 3: Sorting ──────────────────────────────────────────
            cls.set_progress(
                report_pk,
                "sorting",
                "Sorting and preparing data...",
                40,
                generation_kind=genkind,
            )
            phase_start = time.perf_counter()

            sorted_ba_data = cls.build_sorted_ba_data(
                participating_reports["progress_reports"]
            )

            # Sort external projects by title
            html_tag_pattern = re.compile(r"<[^>]+>")

            def get_clean_title(html_string):
                if not html_string:
                    return ""
                clean_text = html_tag_pattern.sub(" ", html_string)
                return " ".join(clean_text.split()).strip()

            sorted_externals = sorted(
                participating_externals,
                key=lambda x: get_clean_title(x["title"]).lower(),
            )

            # Sort student reports by year (desc) then title (asc)
            sorted_students = sorted(
                participating_reports["student_reports"],
                key=lambda x: (
                    -int(x["document"]["project"]["year"]),
                    get_clean_title(x["document"]["project"]["title"]).lower(),
                ),
            )

            timings["sorting"] = time.perf_counter() - phase_start
            cls.set_progress(
                report_pk,
                "sorting",
                "Sorting and preparing data...",
                50,
                generation_kind=genkind,
            )

            if cls.is_cancelled(report_pk):
                settings.LOGGER.info(
                    f"PDF generation cancelled for report {report_pk} after sorting"
                )
                cls.set_progress(
                    report_pk,
                    "error",
                    "Generation cancelled",
                    0,
                    status="error",
                    generation_kind=genkind,
                    error_message="Generation cancelled",
                )
                return

            # ── Phase 4: Template Render ──────────────────────────────────
            cls.set_progress(
                report_pk,
                "template_render",
                "Rendering template...",
                50,
                generation_kind=genkind,
            )
            phase_start = time.perf_counter()

            template_context = cls.build_template_context(
                report=report,
                genkind=genkind,
                media_dict=media_dict,
                sorted_ba_data=sorted_ba_data,
                sorted_externals=sorted_externals,
                sorted_students=sorted_students,
            )

            # Set population_time now that context is built
            template_context["population_time"] = (
                f"{time.perf_counter() - total_start:.3f}"
            )

            html_content = render_to_string("annual_report.html", template_context)

            timings["template_render"] = time.perf_counter() - phase_start
            cls.set_progress(
                report_pk,
                "template_render",
                "Rendering template...",
                65,
                generation_kind=genkind,
            )

            if cls.is_cancelled(report_pk):
                settings.LOGGER.info(
                    f"PDF generation cancelled for report {report_pk} after template_render"
                )
                cls.set_progress(
                    report_pk,
                    "error",
                    "Generation cancelled",
                    0,
                    status="error",
                    generation_kind=genkind,
                    error_message="Generation cancelled",
                )
                return

            # ── Phase 5: PDF Conversion ───────────────────────────────────
            cls.set_progress(
                report_pk,
                "pdf_conversion",
                "Converting to PDF...",
                65,
                generation_kind=genkind,
            )
            phase_start = time.perf_counter()

            # Use Popen instead of run() so we can poll for cancellation
            import subprocess
            import tempfile

            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".html", delete=False, encoding="utf-8"
            ) as html_file:
                html_file.write(html_content)
                html_path = html_file.name

            with tempfile.NamedTemporaryFile(
                mode="wb", suffix=".pdf", delete=False
            ) as pdf_file:
                pdf_path = pdf_file.name

            try:
                prince_proc = subprocess.Popen(
                    ["prince", html_path, "-o", pdf_path, "--javascript"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )

                # Poll every 0.5s so cancellation is detected quickly
                while prince_proc.poll() is None:
                    if cls.is_cancelled(report_pk):
                        prince_proc.terminate()
                        prince_proc.wait(timeout=5)
                        settings.LOGGER.info(
                            f"PDF generation cancelled for report {report_pk} "
                            f"during pdf_conversion (PrinceXML terminated)"
                        )
                        cls.set_progress(
                            report_pk,
                            "error",
                            "Generation cancelled",
                            0,
                            status="error",
                            generation_kind=genkind,
                            error_message="Generation cancelled",
                        )
                        return
                    time.sleep(0.5)

                if prince_proc.returncode != 0:
                    stderr = (
                        prince_proc.stderr.read().decode() if prince_proc.stderr else ""
                    )
                    settings.LOGGER.error(f"PrinceXML failed: {stderr}")
                    raise Exception(
                        f"PrinceXML exited with code {prince_proc.returncode}"
                    )

                with open(pdf_path, "rb") as f:
                    pdf_content = f.read()
            finally:
                import os as _os

                if _os.path.exists(html_path):
                    _os.unlink(html_path)
                if _os.path.exists(pdf_path):
                    _os.unlink(pdf_path)

            timings["pdf_conversion"] = time.perf_counter() - phase_start
            cls.set_progress(
                report_pk,
                "pdf_conversion",
                "Converting to PDF...",
                90,
                generation_kind=genkind,
            )

            if cls.is_cancelled(report_pk):
                settings.LOGGER.info(
                    f"PDF generation cancelled for report {report_pk} after pdf_conversion"
                )
                cls.set_progress(
                    report_pk,
                    "error",
                    "Generation cancelled",
                    0,
                    status="error",
                    generation_kind=genkind,
                    error_message="Generation cancelled",
                )
                return

            # ── Phase 6: File Save ────────────────────────────────────────
            cls.set_progress(
                report_pk,
                "file_save",
                "Saving PDF file...",
                90,
                generation_kind=genkind,
            )
            phase_start = time.perf_counter()

            # Build a human-friendly filename for the PDF.
            # e.g. year 2025, division BCS → "BCS_Annual_Report_FY_24-25.pdf"
            fy_start = str(report.year - 1)[-2:]
            fy_end = str(report.year)[-2:]
            division_slug = report.division.slug if report.division else "SPMS"
            pdf_filename = (
                f"{division_slug}_Annual_Report_FY_{fy_start}-{fy_end}_DRAFT.pdf"
            )
            file_content = ContentFile(pdf_content, name=pdf_filename)

            from medias.models import AnnualReportPDF

            doc_pdf, created = AnnualReportPDF.objects.get_or_create(
                report=report,
                defaults={"draft_file": file_content, "creator": user},
            )

            if not created:
                # Delete old draft file from storage before saving new one
                if doc_pdf.draft_file:
                    try:
                        old_path = doc_pdf.draft_file.name
                        if old_path and default_storage.exists(old_path):
                            default_storage.delete(old_path)
                    except Exception as e:
                        settings.LOGGER.warning(
                            f"Could not delete old draft PDF file: {e}"
                        )
                doc_pdf.draft_file = file_content
                doc_pdf.creator = user
                doc_pdf.save()

            # Record file size in bytes
            doc_pdf.size = len(pdf_content)
            doc_pdf.save(update_fields=["size"])

            timings["file_save"] = time.perf_counter() - phase_start

            # ── Complete ──────────────────────────────────────────────────
            total_time = time.perf_counter() - total_start
            size_mb = len(pdf_content) / (1024**2)

            settings.LOGGER.info(
                f"PDF generation complete for report {report_pk} ({genkind}): "
                f"media_fetch={timings['media_fetch']:.3f}s, "
                f"data_fetch={timings['data_fetch']:.3f}s, "
                f"sorting={timings['sorting']:.3f}s, "
                f"template_render={timings['template_render']:.3f}s, "
                f"pdf_conversion={timings['pdf_conversion']:.3f}s, "
                f"file_save={timings['file_save']:.3f}s, "
                f"total={total_time:.3f}s, "
                f"size={size_mb:.2f}MB"
            )

            cls.set_progress(
                report_pk,
                "file_save",
                "Complete",
                100,
                status="completed",
                generation_kind=genkind,
            )

        except Exception as e:
            settings.LOGGER.error(
                f"PDF generation failed for report {report_pk}: {e}",
                exc_info=True,
            )
            cls.set_progress(
                report_pk,
                "error",
                str(e),
                0,
                status="error",
                generation_kind=genkind,
                error_message=str(e),
            )
        finally:
            cls.release_generation_lock(report_pk)

    # endregion =================================================================
