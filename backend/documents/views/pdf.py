"""
PDF generation views
"""

import threading

from django.conf import settings
from django.http import FileResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_202_ACCEPTED,
    HTTP_400_BAD_REQUEST,
    HTTP_409_CONFLICT,
)
from rest_framework.views import APIView

from ..models import AnnualReport
from ..services.annual_report_service import AnnualReportGenerationService
from ..services.document_service import DocumentService
from ..services.pdf_service import PDFService

NO_CACHE_HEADERS = "no-cache, no-store, must-revalidate"


class DownloadProjectDocument(APIView):
    """Download project document PDF"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Download project document PDF"""
        settings.LOGGER.info(
            f"{request.user} is downloading project document (pk={pk})"
        )
        document = DocumentService.get_document(pk)

        # Check if PDF exists
        if hasattr(document, "pdf") and document.pdf and document.pdf.file:
            response = FileResponse(
                document.pdf.file,
                as_attachment=True,
                filename=f"{document.project.pk}_{document.kind}_{document.pk}.pdf",
            )
            response["Cache-Control"] = NO_CACHE_HEADERS
            return response

        # Generate PDF if not exists
        doc_pdf = PDFService.generate_document_pdf(document)

        response = FileResponse(
            doc_pdf.file,
            as_attachment=True,
            filename=f"{document.project.pk}_{document.kind}_{document.pk}.pdf",
        )
        response["Cache-Control"] = NO_CACHE_HEADERS
        return response


class BeginProjectDocGeneration(APIView):
    """Start project document PDF generation"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Generate and return PDF for project document"""
        settings.LOGGER.info(
            f"{request.user} is generating project document PDF (pk={pk})"
        )
        document = DocumentService.get_document(pk)

        # Mark as in progress
        PDFService.mark_pdf_generation_started(document)

        # Generate PDF and return file
        try:
            doc_pdf = PDFService.generate_document_pdf(document)
            PDFService.mark_pdf_generation_complete(document)

            response = FileResponse(
                doc_pdf.file,
                as_attachment=True,
                filename=f"{document.project.pk}_{document.kind}_{document.pk}.pdf",
            )
            response["Cache-Control"] = NO_CACHE_HEADERS
            return response
        except Exception:
            PDFService.mark_pdf_generation_complete(document)
            raise


class CancelProjectDocGeneration(APIView):
    """Cancel project document PDF generation"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Cancel PDF generation"""
        settings.LOGGER.info(
            f"{request.user} is cancelling project doc generation (pk={pk})"
        )
        document = DocumentService.get_document(pk)
        PDFService.cancel_pdf_generation(document)

        return Response({"message": "PDF generation cancelled"}, status=HTTP_200_OK)


class DownloadAnnualReport(APIView):
    """Download annual report PDF"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Download annual report PDF"""
        settings.LOGGER.info(f"{request.user} is downloading annual report (pk={pk})")
        try:
            report = AnnualReport.objects.select_related("division").get(pk=pk)
        except AnnualReport.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound(f"Annual report {pk} not found")

        # Check if PDF exists — prefer published, fall back to draft
        if hasattr(report, "pdf") and report.pdf:
            pdf_obj = report.pdf
            # Serve published file if available, otherwise draft
            serve_file = pdf_obj.published_file or pdf_obj.draft_file
            if serve_file:
                fy_start = str(report.year - 1)[-2:]
                fy_end = str(report.year)[-2:]
                slug = report.division.slug if report.division else "SPMS"
                download_name = f"{slug} Annual Report FY {fy_start}-{fy_end}.pdf"
                response = FileResponse(
                    serve_file,
                    as_attachment=True,
                    filename=download_name,
                )
                response["Cache-Control"] = NO_CACHE_HEADERS
                return response

        # Generate PDF if not exists
        pdf_file = PDFService.generate_annual_report_pdf(report)

        response = FileResponse(pdf_file, as_attachment=True, filename=pdf_file.name)
        response["Cache-Control"] = NO_CACHE_HEADERS
        return response


class BeginAnnualReportDocGeneration(APIView):
    """Start annual report PDF generation in a background thread"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Start PDF generation for annual report"""
        settings.LOGGER.info(
            f"{request.user} is generating annual report PDF (pk={pk})"
        )
        try:
            AnnualReport.objects.get(pk=pk)
        except AnnualReport.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound(f"Annual report {pk} not found")

        # Validate genkind from request body
        genkind = request.data.get("genkind")
        if genkind not in ("all", "approved"):
            return Response(
                {"error": "genkind must be 'all' or 'approved'"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Acquire generation lock atomically (409 if already in progress)
        if not AnnualReportGenerationService.acquire_generation_lock(pk):
            return Response(
                {"error": "PDF generation already in progress"},
                status=HTTP_409_CONFLICT,
            )

        # Start generation in a daemon thread
        thread = threading.Thread(
            target=AnnualReportGenerationService.generate,
            args=(pk, genkind, request.user),
            daemon=True,
        )
        thread.start()

        response = Response(
            {"report_id": pk},
            status=HTTP_202_ACCEPTED,
        )
        response["Cache-Control"] = NO_CACHE_HEADERS
        return response


class CancelReportDocGeneration(APIView):
    """Cancel annual report PDF generation"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Cancel PDF generation using atomic flag update"""
        settings.LOGGER.info(
            f"{request.user} is cancelling report doc generation (pk={pk})"
        )
        try:
            AnnualReport.objects.get(pk=pk)
        except AnnualReport.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound(f"Annual report {pk} not found")

        # Atomically set flag to False; rows_updated > 0 means it was in progress
        rows_updated = AnnualReport.objects.filter(
            pk=pk, pdf_generation_in_progress=True
        ).update(pdf_generation_in_progress=False)

        if rows_updated:
            settings.LOGGER.info(
                f"PDF generation cancelled by {request.user} for report {pk}"
            )
            return Response(
                {"message": "PDF generation cancelled"},
                status=HTTP_202_ACCEPTED,
            )

        settings.LOGGER.info(
            f"Cancel requested for report {pk} but no generation was in progress"
        )
        return Response(
            {"message": "No generation in progress"},
            status=HTTP_200_OK,
        )
