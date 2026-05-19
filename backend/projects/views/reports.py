"""
Views for creating progress reports and student reports
"""

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from documents.models import (
    AnnualReport,
    ProgressReport,
    ProjectDocument,
    StudentReport,
)
from documents.serializers.progress_report import TinyProgressReportSerializer
from documents.serializers.student_report import TinyStudentReportSerializer


class CreateProgressReport(APIView):
    """Create a new progress report for a project"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Create a new progress report

        Expected payload:
        {
            "report_id": <annual_report_id>,
            "year": <year>
        }
        """
        settings.LOGGER.info(
            f"{request.user} is creating progress report for project (pk={pk})"
        )
        project_id = pk
        report_id = request.data.get("report_id")
        year = request.data.get("year")

        if not report_id or not year:
            return Response(
                {"error": "report_id and year are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            annual_report = AnnualReport.objects.get(pk=report_id)
        except AnnualReport.DoesNotExist:
            return Response(
                {"error": f"Annual report with id {report_id} not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if progress report already exists for this project and year
        existing = ProgressReport.objects.filter(
            document__project_id=project_id, year=year
        ).first()
        if existing:
            return Response(
                {"error": f"Progress report for year {year} already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the project document first
        project_document = ProjectDocument.objects.create(
            project_id=project_id,
            kind="progressreport",
            status="new",
            creator=request.user,
            modifier=request.user,
        )

        # Create the progress report
        progress_report = ProgressReport.objects.create(
            document=project_document,
            report=annual_report,
            project_id=project_id,
            year=year,
        )

        # Only change project status to "updating" if the report is for the
        # latest annual report year. Creating reports for previous years
        # (historical data) should not impact the project status.
        from projects.models import Project

        latest_report = AnnualReport.objects.order_by("-year").first()
        is_latest_year = latest_report and year == latest_report.year

        if is_latest_year:
            project = Project.objects.get(pk=project_id)
            if project.status not in (
                Project.StatusChoices.SUSPENDED,
                Project.StatusChoices.COMPLETED,
                Project.StatusChoices.TERMINATED,
            ):
                project.status = Project.StatusChoices.UPDATING
                project.save()

        settings.LOGGER.info(
            f"{request.user} created progress report {progress_report.id} for project {project_id}"
        )

        serializer = TinyProgressReportSerializer(progress_report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CreateStudentReport(APIView):
    """Create a new student report for a project"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Create a new student report

        Expected payload:
        {
            "report_id": <annual_report_id>,
            "year": <year>
        }
        """
        settings.LOGGER.info(
            f"{request.user} is creating student report for project (pk={pk})"
        )
        project_id = pk
        report_id = request.data.get("report_id")
        year = request.data.get("year")

        if not report_id or not year:
            return Response(
                {"error": "report_id and year are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            annual_report = AnnualReport.objects.get(pk=report_id)
        except AnnualReport.DoesNotExist:
            return Response(
                {"error": f"Annual report with id {report_id} not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if student report already exists for this project and year
        existing = StudentReport.objects.filter(
            document__project_id=project_id, year=year
        ).first()
        if existing:
            return Response(
                {"error": f"Student report for year {year} already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the project document first
        project_document = ProjectDocument.objects.create(
            project_id=project_id,
            kind="studentreport",
            status="new",
            creator=request.user,
            modifier=request.user,
        )

        # Create the student report
        student_report = StudentReport.objects.create(
            document=project_document,
            report=annual_report,
            project_id=project_id,
            year=year,
        )

        # Only change project status to "updating" if the report is for the
        # latest annual report year. Creating reports for previous years
        # (historical data) should not impact the project status.
        from projects.models import Project

        latest_report = AnnualReport.objects.order_by("-year").first()
        is_latest_year = latest_report and year == latest_report.year

        if is_latest_year:
            project = Project.objects.get(pk=project_id)
            if project.status not in (
                Project.StatusChoices.SUSPENDED,
                Project.StatusChoices.COMPLETED,
                Project.StatusChoices.TERMINATED,
            ):
                project.status = Project.StatusChoices.UPDATING
                project.save()

        settings.LOGGER.info(
            f"{request.user} created student report {student_report.id} for project {project_id}"
        )

        serializer = TinyStudentReportSerializer(student_report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
