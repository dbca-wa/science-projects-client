"""
Preservation tests for annual report base filtering.

These tests verify that non-suspended projects with approved reports
appear in annual report queries, that division filtering works, and
that unapproved reports are excluded. They must PASS on unfixed code
and STILL pass after the bugfix is applied, confirming no regressions.

Validates: Requirements 3.4, 3.5, 3.6
"""

import pytest
from rest_framework.test import APIClient

from common.tests.factories import (
    BusinessAreaFactory,
    DivisionFactory,
    ProjectFactory,
    UserFactory,
)
from common.tests.test_helpers import documents_urls
from documents.models import (
    AnnualReport,
    ProgressReport,
    ProjectDocument,
    StudentReport,
)


@pytest.mark.django_db
class TestProgressReportBaseFiltering:
    """LatestYearsProgressReports filters by report, approved status, and division."""

    def test_active_project_approved_report_appears(self):
        """Non-suspended project with approved progress report appears in results."""
        user = UserFactory()
        project = ProjectFactory(kind="science", status="active")

        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
        )

        doc = ProjectDocument.objects.create(
            project=project,
            kind="progressreport",
            status="approved",
            creator=user,
            modifier=user,
        )
        ProgressReport.objects.create(
            document=doc,
            report=annual_report,
            project=project,
            year=2024,
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = documents_urls.path("latest_active_progress_reports")
        response = client.get(url, {"report_id": annual_report.pk})

        assert response.status_code == 200
        report_ids = [r["id"] for r in response.data]
        pr = ProgressReport.objects.get(document=doc)
        assert pr.pk in report_ids, "Active project approved report should appear"

    def test_unapproved_report_excluded(self):
        """Reports with non-approved status are excluded."""
        user = UserFactory()
        project = ProjectFactory(kind="science", status="active")

        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
        )

        doc = ProjectDocument.objects.create(
            project=project,
            kind="progressreport",
            status="new",  # Not approved
            creator=user,
            modifier=user,
        )
        ProgressReport.objects.create(
            document=doc,
            report=annual_report,
            project=project,
            year=2024,
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = documents_urls.path("latest_active_progress_reports")
        response = client.get(url, {"report_id": annual_report.pk})

        assert response.status_code == 200
        report_ids = [r["id"] for r in response.data]
        pr = ProgressReport.objects.get(document=doc)
        assert pr.pk not in report_ids, "Unapproved report should be excluded"

    def test_division_filter_works(self):
        """Reports are filtered by the annual report's division."""
        user = UserFactory()
        division_a = DivisionFactory(name="Division A")
        division_b = DivisionFactory(name="Division B")
        ba_a = BusinessAreaFactory(division=division_a)
        ba_b = BusinessAreaFactory(division=division_b)

        project_a = ProjectFactory(kind="science", status="active", business_area=ba_a)
        project_b = ProjectFactory(kind="science", status="active", business_area=ba_b)

        # Annual report scoped to division A
        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
            division=division_a,
        )

        doc_a = ProjectDocument.objects.create(
            project=project_a,
            kind="progressreport",
            status="approved",
            creator=user,
            modifier=user,
        )
        pr_a = ProgressReport.objects.create(
            document=doc_a,
            report=annual_report,
            project=project_a,
            year=2024,
        )

        doc_b = ProjectDocument.objects.create(
            project=project_b,
            kind="progressreport",
            status="approved",
            creator=user,
            modifier=user,
        )
        pr_b = ProgressReport.objects.create(
            document=doc_b,
            report=annual_report,
            project=project_b,
            year=2024,
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = documents_urls.path("latest_active_progress_reports")
        response = client.get(url, {"report_id": annual_report.pk})

        assert response.status_code == 200
        report_ids = [r["id"] for r in response.data]
        assert pr_a.pk in report_ids, "Division A report should appear"
        assert pr_b.pk not in report_ids, "Division B report should be excluded"


@pytest.mark.django_db
class TestStudentReportBaseFiltering:
    """LatestYearsStudentReports filters by report, approved status, and division."""

    def test_active_project_approved_student_report_appears(self):
        """Non-suspended project with approved student report appears in results."""
        user = UserFactory()
        project = ProjectFactory(kind="student", status="active")

        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
        )

        doc = ProjectDocument.objects.create(
            project=project,
            kind="studentreport",
            status="approved",
            creator=user,
            modifier=user,
        )
        StudentReport.objects.create(
            document=doc,
            report=annual_report,
            project=project,
            year=2024,
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = documents_urls.path("latest_active_student_reports")
        response = client.get(url, {"report_id": annual_report.pk})

        assert response.status_code == 200
        report_ids = [r["id"] for r in response.data]
        sr = StudentReport.objects.get(document=doc)
        assert (
            sr.pk in report_ids
        ), "Active project approved student report should appear"

    def test_unapproved_student_report_excluded(self):
        """Student reports with non-approved status are excluded."""
        user = UserFactory()
        project = ProjectFactory(kind="student", status="active")

        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
        )

        doc = ProjectDocument.objects.create(
            project=project,
            kind="studentreport",
            status="new",  # Not approved
            creator=user,
            modifier=user,
        )
        StudentReport.objects.create(
            document=doc,
            report=annual_report,
            project=project,
            year=2024,
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = documents_urls.path("latest_active_student_reports")
        response = client.get(url, {"report_id": annual_report.pk})

        assert response.status_code == 200
        report_ids = [r["id"] for r in response.data]
        sr = StudentReport.objects.get(document=doc)
        assert sr.pk not in report_ids, "Unapproved student report should be excluded"

    def test_division_filter_works_for_student_reports(self):
        """Student reports are filtered by the annual report's division."""
        user = UserFactory()
        division_a = DivisionFactory(name="Division A SR")
        division_b = DivisionFactory(name="Division B SR")
        ba_a = BusinessAreaFactory(division=division_a)
        ba_b = BusinessAreaFactory(division=division_b)

        project_a = ProjectFactory(kind="student", status="active", business_area=ba_a)
        project_b = ProjectFactory(kind="student", status="active", business_area=ba_b)

        # Annual report scoped to division A
        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
            division=division_a,
        )

        doc_a = ProjectDocument.objects.create(
            project=project_a,
            kind="studentreport",
            status="approved",
            creator=user,
            modifier=user,
        )
        sr_a = StudentReport.objects.create(
            document=doc_a,
            report=annual_report,
            project=project_a,
            year=2024,
        )

        doc_b = ProjectDocument.objects.create(
            project=project_b,
            kind="studentreport",
            status="approved",
            creator=user,
            modifier=user,
        )
        sr_b = StudentReport.objects.create(
            document=doc_b,
            report=annual_report,
            project=project_b,
            year=2024,
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = documents_urls.path("latest_active_student_reports")
        response = client.get(url, {"report_id": annual_report.pk})

        assert response.status_code == 200
        report_ids = [r["id"] for r in response.data]
        assert sr_a.pk in report_ids, "Division A student report should appear"
        assert sr_b.pk not in report_ids, "Division B student report should be excluded"
