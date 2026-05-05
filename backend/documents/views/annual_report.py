"""
Annual report views
"""

import json
import time
from datetime import date

from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q
from django.http import StreamingHttpResponse
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import BaseRenderer
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
)
from rest_framework.views import APIView

from medias.models import AnnualReportPDF, LegacyAnnualReportPDF
from medias.serializers import (
    AnnualReportPDFSerializer,
    TinyLegacyAnnualReportPDFSerializer,
)

from ..models import AnnualReport, ProgressReport, StudentReport
from ..serializers import (
    AnnualReportSerializer,
    MiniAnnualReportSerializer,
    ProgressReportSerializer,
    StudentReportSerializer,
    TinyAnnualReportSerializer,
)
from ..services.annual_report_service import AnnualReportGenerationService


class Reports(APIView):
    """List and create annual reports"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List annual reports, optionally filtered by division slug"""
        settings.LOGGER.info(f"{request.user} is viewing reports")
        queryset = AnnualReport.objects.select_related("division").all()

        division_slug = request.query_params.get("division")
        if division_slug:
            queryset = queryset.filter(division__slug=division_slug)

        serializer = TinyAnnualReportSerializer(
            queryset.order_by("-year"),
            many=True,
            context={"request": request},
        )
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        """Create annual report — requires year and division only"""
        settings.LOGGER.info(f"{request.user} is creating a report")

        year = request.data.get("year")
        division_id = request.data.get("division")

        if not year:
            return Response({"error": "Year is required."}, status=HTTP_400_BAD_REQUEST)

        try:
            year = int(year)
        except (ValueError, TypeError):
            return Response(
                {"error": "Year must be a valid number."}, status=HTTP_400_BAD_REQUEST
            )

        # Normalise division_id: treat 0, empty string, None as "no division"
        if division_id:
            try:
                division_id = int(division_id)
                if division_id <= 0:
                    division_id = None
            except (ValueError, TypeError):
                division_id = None
        else:
            division_id = None

        # Validate division exists if provided
        if division_id:
            from agencies.models import Division

            if not Division.objects.filter(pk=division_id).exists():
                return Response(
                    {"error": "Division not found."},
                    status=HTTP_400_BAD_REQUEST,
                )

            # Non-superusers can only create reports for divisions they are key_stakeholder of
            if not request.user.is_superuser:
                division = Division.objects.get(pk=division_id)
                if division.key_stakeholder != request.user:
                    return Response(
                        {
                            "error": "You can only create reports for divisions you are the key stakeholder of."
                        },
                        status=HTTP_400_BAD_REQUEST,
                    )

        # Validate year+division uniqueness
        existing = AnnualReport.objects.filter(year=year)
        if division_id:
            existing = existing.filter(division_id=division_id)
        else:
            existing = existing.filter(division__isnull=True)

        if existing.exists():
            return Response(
                {
                    "error": f"An annual report for year {year} already exists for this division."
                },
                status=HTTP_400_BAD_REQUEST,
            )

        report = AnnualReport.objects.create(
            year=year,
            division_id=division_id,
            creator=request.user,
            date_open=date(year - 1, 7, 1),
            date_closed=date(year, 6, 30),
        )

        return Response(
            TinyAnnualReportSerializer(report).data, status=HTTP_201_CREATED
        )


class ReportDetail(APIView):
    """Get, update, and delete annual reports"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Get annual report by ID"""
        try:
            report = AnnualReport.objects.select_related("division").get(pk=pk)
        except AnnualReport.DoesNotExist:
            raise NotFound

        serializer = AnnualReportSerializer(report, context={"request": request})
        return Response(serializer.data, status=HTTP_200_OK)

    def put(self, request, pk):
        """Update annual report"""
        try:
            report = AnnualReport.objects.select_related("division").get(pk=pk)
        except AnnualReport.DoesNotExist:
            raise NotFound

        settings.LOGGER.info(f"{request.user} is updating report {report}")
        serializer = AnnualReportSerializer(
            report,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            settings.LOGGER.error(f"{serializer.errors}")
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        updated_report = serializer.save()
        return Response(
            TinyAnnualReportSerializer(updated_report).data, status=HTTP_202_ACCEPTED
        )

    def delete(self, request, pk):
        """Delete annual report"""
        try:
            report = AnnualReport.objects.get(pk=pk)
        except AnnualReport.DoesNotExist:
            raise NotFound

        settings.LOGGER.info(f"{request.user} is deleting report {report}")

        # Delete associated progress reports
        progress_reports = ProgressReport.objects.filter(report=report).all()
        for pr in progress_reports:
            pr.document.delete()

        # Delete associated student reports
        student_reports = StudentReport.objects.filter(report=report).all()
        for sr in student_reports:
            sr.document.delete()

        report.delete()
        return Response(status=HTTP_204_NO_CONTENT)


class GetLatestReportYear(APIView):
    """Get the latest annual report year"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        latest_report = (
            AnnualReport.objects.select_related("division").order_by("-year").first()
        )

        if latest_report is not None:
            serializer = AnnualReportSerializer(
                latest_report,
                context={"request": request},
            )
            return Response(serializer.data, status=HTTP_200_OK)
        else:
            raise NotFound


class GetAvailableReportYearsForStudentReport(APIView):
    """Get available report years for student reports"""

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """
        Returns list of reports with year and ID.
        Only returns years where a student report doesn't already exist for the project.
        Filters to years from the project's inception year onwards (1 year prior allowed
        for financial year alignment — e.g. project created in 2026 can report for FY24-25).
        """
        from projects.models import Project

        if not project_id:
            raise NotFound

        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise NotFound

        # Get years that already have student reports for this project
        existing_years = set(
            StudentReport.objects.filter(document__project_id=project_id).values_list(
                "year", flat=True
            )
        )

        # Determine the earliest allowed year based on project inception
        # Allow 1 year prior for financial year alignment
        project_year = project.year if project.year else 2020
        earliest_allowed_year = project_year - 1

        # Filter: available years = annual report years - existing report years,
        # and only years >= earliest_allowed_year
        available_reports = AnnualReport.objects.filter(
            year__gte=earliest_allowed_year
        ).exclude(year__in=existing_years)

        serializer = MiniAnnualReportSerializer(
            available_reports,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data, status=HTTP_200_OK)


class GetAvailableReportYearsForProgressReport(APIView):
    """Get available report years for progress reports"""

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """
        Returns list of reports with year and ID.
        Only returns years where a progress report doesn't already exist for the project.
        Filters to years from the project's inception year onwards (1 year prior allowed
        for financial year alignment — e.g. project created in 2026 can report for FY24-25).
        """
        from projects.models import Project

        if not project_id:
            raise NotFound

        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise NotFound

        # Get years that already have progress reports for this project
        existing_years = set(
            ProgressReport.objects.filter(document__project_id=project_id).values_list(
                "year", flat=True
            )
        )

        # Get all annual report years
        all_annual_reports = AnnualReport.objects.all()

        # Determine the earliest allowed year based on project inception
        # Allow 1 year prior for financial year alignment
        project_year = project.year if project.year else 2020
        earliest_allowed_year = project_year - 1

        # Filter: available years = annual report years - existing report years,
        # and only years >= earliest_allowed_year
        available_reports = all_annual_reports.filter(
            year__gte=earliest_allowed_year
        ).exclude(year__in=existing_years)

        serializer = MiniAnnualReportSerializer(
            available_reports,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data, status=HTTP_200_OK)


class GetWithoutPDFs(APIView):
    """Get annual reports with draft PDFs (Drafts tab).

    Returns all reports that have a draft_file, regardless of whether
    they also have a published_file. This allows users to see both
    the draft and published versions.

    NOTE: To re-enable filtering out published reports from drafts, add:
        .filter(
            Q(pdf__published_file__isnull=True) | Q(pdf__published_file=""),
        )
    after the .exclude(pdf__draft_file="") line.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        reports_with_drafts = (
            AnnualReport.objects.select_related("division")
            .filter(
                pdf__draft_file__isnull=False,
            )
            .exclude(
                pdf__draft_file="",
            )
        )

        serializer = TinyAnnualReportSerializer(
            reports_with_drafts,
            context={"request": request},
            many=True,
        )
        return Response(serializer.data, status=HTTP_200_OK)


class GetAllReportPDFs(APIView):
    """Single endpoint returning all report PDFs pre-categorised for the tabs.

    Returns { published: [...], drafts: [...], legacy: [...] } so the frontend
    only needs one API call for the entire Published Reports page.

    NOTE: To re-enable filtering out published reports from drafts, change the
    drafts query to also filter with:
        .filter(Q(pdf__published_file__isnull=True) | Q(pdf__published_file=""))
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Published: reports with a published_file
        published_qs = (
            AnnualReport.objects.select_related("division")
            .filter(pdf__published_file__isnull=False)
            .exclude(pdf__published_file="")
        )

        # Drafts: reports with a draft_file (includes those also published)
        drafts_qs = (
            AnnualReport.objects.select_related("division")
            .filter(pdf__draft_file__isnull=False)
            .exclude(pdf__draft_file="")
        )

        # Legacy: standalone uploaded PDFs from older years
        legacy_qs = LegacyAnnualReportPDF.objects.all()

        return Response(
            {
                "published": TinyAnnualReportSerializer(
                    published_qs, context={"request": request}, many=True
                ).data,
                "drafts": TinyAnnualReportSerializer(
                    drafts_qs, context={"request": request}, many=True
                ).data,
                "legacy": TinyLegacyAnnualReportPDFSerializer(
                    legacy_qs, context={"request": request}, many=True
                ).data,
            },
            status=HTTP_200_OK,
        )


class GetReportPDF(APIView):
    """Get annual report PDF data (reads from draft_file for preview)"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report_pdf_obj = AnnualReportPDF.objects.get(report=pk)
        except AnnualReportPDF.DoesNotExist:
            raise NotFound

        serializer = AnnualReportPDFSerializer(report_pdf_obj)

        # Convert serialised data to dictionary
        serialized_data = json.loads(json.dumps(serializer.data, cls=DjangoJSONEncoder))

        # Include PDF data in response
        serialized_data["pdf_data"] = serializer.data.get("pdf_data")
        return Response(serialized_data, status=HTTP_200_OK)


class GetReportPDFStatus(APIView):
    """Lightweight endpoint returning PDF metadata without the base64 data"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            report = AnnualReport.objects.get(pk=pk)
        except AnnualReport.DoesNotExist:
            raise NotFound

        try:
            pdf_obj = AnnualReportPDF.objects.get(report=pk)
            has_draft = bool(pdf_obj.draft_file)
            has_published = bool(pdf_obj.published_file)
            draft_url = pdf_obj.draft_file.url if pdf_obj.draft_file else None
            published_url = (
                pdf_obj.published_file.url if pdf_obj.published_file else None
            )
        except AnnualReportPDF.DoesNotExist:
            has_draft = False
            has_published = False
            draft_url = None
            published_url = None

        return Response(
            {
                "has_draft": has_draft,
                "has_published": has_published,
                "draft_file": draft_url,
                "published_file": published_url,
                "report": {
                    "id": report.pk,
                    "pdf_generation_in_progress": report.pdf_generation_in_progress,
                },
            },
            status=HTTP_200_OK,
        )


class PublishReportPDF(APIView):
    """Promote draft PDF to published for an annual report."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        settings.LOGGER.info(f"{request.user} is publishing report PDF (pk={pk})")
        try:
            report = AnnualReport.objects.select_related("division").get(pk=pk)
        except AnnualReport.DoesNotExist:
            raise NotFound(f"Annual report {pk} not found")

        # Permission: superuser or key stakeholder of the report's division
        if not request.user.is_superuser:
            if (
                not report.division
                or not hasattr(report.division, "key_stakeholder")
                or report.division.key_stakeholder != request.user
            ):
                return Response(
                    {"error": "Permission denied"}, status=HTTP_403_FORBIDDEN
                )

        try:
            pdf = report.pdf
        except AnnualReportPDF.DoesNotExist:
            return Response(
                {"error": "No PDF record for this report"}, status=HTTP_400_BAD_REQUEST
            )

        if not pdf.draft_file:
            return Response(
                {"error": "No draft PDF to publish"}, status=HTTP_400_BAD_REQUEST
            )

        # Copy draft content to published with a clean filename (no _DRAFT suffix)
        from django.core.files.base import ContentFile

        draft_content = pdf.draft_file.read()
        published_name = (
            pdf.draft_file.name.replace("_DRAFT", "")
            .replace("drafts/", "published/")
            .split("/")[-1]  # Just the filename
        )
        pdf.published_file.save(published_name, ContentFile(draft_content))

        report.is_published = True
        report.save(update_fields=["is_published"])

        return Response({"status": "published"}, status=HTTP_200_OK)


class GetWithPDFs(APIView):
    """Get annual reports with published PDFs (Official tab)"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        reports_with_pdfs = (
            AnnualReport.objects.select_related("division")
            .filter(
                pdf__published_file__isnull=False,
            )
            .exclude(pdf__published_file="")
        )
        serializer = TinyAnnualReportSerializer(
            reports_with_pdfs,
            context={"request": request},
            many=True,
        )
        return Response(serializer.data, status=HTTP_200_OK)


class GetLegacyPDFs(APIView):
    """Get legacy annual report PDFs"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        legacy_items = LegacyAnnualReportPDF.objects.all()
        serializer = TinyLegacyAnnualReportPDFSerializer(
            legacy_items,
            context={"request": request},
            many=True,
        )
        return Response(serializer.data, status=HTTP_200_OK)


class GetCompletedReports(APIView):
    """Get completed (published) annual reports"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        completed_reports = (
            AnnualReport.objects.select_related("division")
            .filter(is_published=True)
            .all()
        )
        if completed_reports:
            serializer = AnnualReportSerializer(
                completed_reports,
                context={"request": request},
                many=True,
            )
            return Response(serializer.data, status=HTTP_200_OK)
        else:
            return Response([], status=HTTP_200_OK)


class EventStreamRenderer(BaseRenderer):
    """Renderer that accepts text/event-stream for SSE endpoints."""

    media_type = "text/event-stream"
    format = "text"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class GenerationProgressSSE(APIView):
    """SSE endpoint streaming annual report generation progress"""

    permission_classes = [IsAuthenticated]
    renderer_classes = [EventStreamRenderer]

    def get(self, request, pk):
        """Stream generation progress as Server-Sent Events"""
        try:
            AnnualReport.objects.get(pk=pk)
        except AnnualReport.DoesNotExist:
            raise NotFound(f"Annual report {pk} not found")

        response = StreamingHttpResponse(
            self._sse_generator(pk),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response

    def _sse_generator(self, report_pk):
        """Generator yielding SSE-formatted progress events."""
        # Initial check — yield idle if no generation active
        progress = AnnualReportGenerationService.get_progress(report_pk)
        if progress is None:
            try:
                report = AnnualReport.objects.get(pk=report_pk)
                if not report.pdf_generation_in_progress:
                    yield self._format_sse({"status": "idle"})
                    return
            except AnnualReport.DoesNotExist:
                yield self._format_sse({"status": "idle"})
                return

        # Polling loop
        while True:
            progress = AnnualReportGenerationService.get_progress(report_pk)
            if progress:
                yield self._format_sse(progress)
                if progress.get("status") in ("completed", "error"):
                    AnnualReportGenerationService.clear_progress(report_pk)
                    return
            else:
                # No progress data — check if generation is still flagged
                try:
                    report = AnnualReport.objects.get(pk=report_pk)
                    if not report.pdf_generation_in_progress:
                        yield self._format_sse({"status": "idle"})
                        AnnualReportGenerationService.clear_progress(report_pk)
                        return
                except AnnualReport.DoesNotExist:
                    yield self._format_sse({"status": "idle"})
                    return
            time.sleep(1)

    @staticmethod
    def _format_sse(data: dict) -> str:
        """Format a dict as an SSE data line."""
        return f"data: {json.dumps(data)}\n\n"


class LatestYearsProgressReports(APIView):
    """Get approved progress reports for a specific annual report"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        report_id = request.query_params.get("report_id")

        if report_id:
            try:
                target_report = AnnualReport.objects.select_related("division").get(
                    pk=report_id
                )
            except AnnualReport.DoesNotExist:
                return Response(status=HTTP_404_NOT_FOUND)
        else:
            target_report = (
                AnnualReport.objects.select_related("division")
                .order_by("-year")
                .first()
            )

        if not target_report:
            return Response(status=HTTP_404_NOT_FOUND)

        # Filter by the report's division if it has one
        active_docs = ProgressReport.objects.filter(
            Q(report=target_report) & Q(document__status="approved")
        ).exclude(project__status="suspended")
        if target_report.division:
            active_docs = active_docs.filter(
                project__business_area__division=target_report.division
            )

        # Optimise for ProgressReportSerializer which nests document → project → BA → division
        active_docs = active_docs.select_related(
            "document",
            "document__project",
            "document__project__business_area",
            "document__project__business_area__image",
            "document__project__business_area__division",
            "document__project__business_area__division__director",
            "document__project__business_area__division__approver",
            "document__project__business_area__division__key_stakeholder",
            "document__project__business_area__leader",
            "document__project__business_area__caretaker",
            "document__project__business_area__finance_admin",
            "document__project__business_area__data_custodian",
            "document__project__image",
            "document__project__image__uploader",
            "document__pdf",
            "document__creator",
            "document__modifier",
        ).prefetch_related(
            "document__project__business_area__division__approvers",
            "document__project__business_area__division__directorate_email_list",
        )

        serializer = ProgressReportSerializer(
            active_docs, many=True, context={"request": request}
        )
        return Response(serializer.data, status=HTTP_200_OK)


class LatestYearsStudentReports(APIView):
    """Get approved student reports for a specific annual report"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        report_id = request.query_params.get("report_id")

        if report_id:
            try:
                target_report = AnnualReport.objects.select_related("division").get(
                    pk=report_id
                )
            except AnnualReport.DoesNotExist:
                return Response(status=HTTP_404_NOT_FOUND)
        else:
            target_report = (
                AnnualReport.objects.select_related("division")
                .order_by("-year")
                .first()
            )

        if not target_report:
            return Response(status=HTTP_404_NOT_FOUND)

        # Filter by the report's division if it has one
        active_docs = StudentReport.objects.filter(
            Q(report=target_report) & Q(document__status="approved")
        ).exclude(project__status="suspended")
        if target_report.division:
            active_docs = active_docs.filter(
                project__business_area__division=target_report.division
            )

        # Optimise for StudentReportSerializer which nests document → project → BA → division
        active_docs = active_docs.select_related(
            "document",
            "document__project",
            "document__project__business_area",
            "document__project__business_area__image",
            "document__project__business_area__division",
            "document__project__business_area__division__director",
            "document__project__business_area__division__approver",
            "document__project__business_area__division__key_stakeholder",
            "document__project__business_area__leader",
            "document__project__business_area__caretaker",
            "document__project__business_area__finance_admin",
            "document__project__business_area__data_custodian",
            "document__project__image",
            "document__project__image__uploader",
            "document__pdf",
            "document__creator",
            "document__modifier",
        ).prefetch_related(
            "document__project__business_area__division__approvers",
            "document__project__business_area__division__directorate_email_list",
        )

        serializer = StudentReportSerializer(
            active_docs, many=True, context={"request": request}
        )
        return Response(serializer.data, status=HTTP_200_OK)


class LatestYearsInactiveReports(APIView):
    """Get inactive (non-approved) reports for a specific annual report"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        report_id = request.query_params.get("report_id")

        if report_id:
            try:
                target_report = AnnualReport.objects.select_related("division").get(
                    pk=report_id
                )
            except AnnualReport.DoesNotExist:
                return Response(status=HTTP_404_NOT_FOUND)
        else:
            target_report = (
                AnnualReport.objects.select_related("division")
                .order_by("-year")
                .first()
            )

        if not target_report:
            return Response(status=HTTP_404_NOT_FOUND)

        # Base querysets scoped to the target report
        sr_qs = StudentReport.objects.filter(Q(report=target_report)).exclude(
            document__status__in=["approved"]
        )
        pr_qs = ProgressReport.objects.filter(Q(report=target_report)).exclude(
            document__status__in=["approved"]
        )

        # Filter by the report's division if it has one
        if target_report.division:
            sr_qs = sr_qs.filter(
                project__business_area__division=target_report.division
            )
            pr_qs = pr_qs.filter(
                project__business_area__division=target_report.division
            )

        # Optimise both querysets for their serialisers
        _select = (
            "document",
            "document__project",
            "document__project__business_area",
            "document__project__business_area__image",
            "document__project__business_area__division",
            "document__project__business_area__division__director",
            "document__project__business_area__division__approver",
            "document__project__business_area__division__key_stakeholder",
            "document__project__business_area__leader",
            "document__project__business_area__caretaker",
            "document__project__business_area__finance_admin",
            "document__project__business_area__data_custodian",
            "document__project__image",
            "document__project__image__uploader",
            "document__pdf",
            "document__creator",
            "document__modifier",
        )
        _prefetch = (
            "document__project__business_area__division__approvers",
            "document__project__business_area__division__directorate_email_list",
        )
        sr_qs = sr_qs.select_related(*_select).prefetch_related(*_prefetch)
        pr_qs = pr_qs.select_related(*_select).prefetch_related(*_prefetch)

        sr_serializer = StudentReportSerializer(
            sr_qs, many=True, context={"request": request}
        )
        pr_serializer = ProgressReportSerializer(
            pr_qs, many=True, context={"request": request}
        )

        return Response(
            {
                "student_reports": sr_serializer.data,
                "progress_reports": pr_serializer.data,
            },
            status=HTTP_200_OK,
        )


class FullLatestReport(APIView):
    """Get full details of latest annual report"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = AnnualReport.objects.select_related("division").all()

        # Filter by division slug if provided
        division_slug = request.query_params.get("division")
        if division_slug:
            queryset = queryset.filter(division__slug=division_slug)

        latest_report = queryset.order_by("-year").first()
        if latest_report:
            serializer = AnnualReportSerializer(
                latest_report,
                context={"request": request},
            )
            return Response(serializer.data, status=HTTP_200_OK)
        else:
            return Response(status=HTTP_404_NOT_FOUND)
