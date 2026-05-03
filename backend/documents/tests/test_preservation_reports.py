"""
Preservation tests for dedicated report creation endpoints.

These tests verify that CreateProgressReport.post() and
CreateStudentReport.post() create ProjectDocuments with correct
user attribution. They must PASS on unfixed code and STILL pass
after the bugfix is applied, confirming no regressions.

Validates: Requirements 3.2, 3.3
"""

import pytest
from rest_framework.test import APIClient

from common.tests.factories import ProjectFactory, UserFactory
from common.tests.test_helpers import projects_urls
from documents.models import (
    AnnualReport,
    ProgressReport,
    ProjectDocument,
    StudentReport,
)


@pytest.mark.django_db
class TestCreateProgressReportPreservation:
    """CreateProgressReport.post() creates a ProjectDocument with correct user attribution."""

    def test_progress_report_creates_document_with_user_attribution(self):
        user = UserFactory()
        project = ProjectFactory(kind="science", status="active")
        project.members.create(user=user, is_leader=True, role="supervising")

        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = projects_urls.path(project.pk, "progress-reports")
        response = client.post(
            url,
            data={"report_id": annual_report.pk, "year": 2024},
            format="json",
        )

        assert response.status_code == 201

        # Verify the ProjectDocument was created with correct attribution
        doc = ProjectDocument.objects.filter(
            project=project, kind="progressreport"
        ).first()
        assert doc is not None, "ProjectDocument should be created"
        assert doc.creator == user, "creator should be the requesting user"
        assert doc.modifier == user, "modifier should be the requesting user"
        assert doc.status == "new"

        # Verify the ProgressReport detail was created
        pr = ProgressReport.objects.filter(document=doc).first()
        assert pr is not None, "ProgressReport detail should be created"
        assert pr.report == annual_report
        assert pr.year == 2024

    def test_progress_report_rejects_duplicate_year(self):
        user = UserFactory()
        project = ProjectFactory(kind="science", status="active")
        project.members.create(user=user, is_leader=True, role="supervising")

        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = projects_urls.path(project.pk, "progress-reports")

        # First creation should succeed
        response = client.post(
            url,
            data={"report_id": annual_report.pk, "year": 2024},
            format="json",
        )
        assert response.status_code == 201

        # Second creation for same year should fail
        response = client.post(
            url,
            data={"report_id": annual_report.pk, "year": 2024},
            format="json",
        )
        assert response.status_code == 400


@pytest.mark.django_db
class TestCreateStudentReportPreservation:
    """CreateStudentReport.post() creates a ProjectDocument with correct user attribution."""

    def test_student_report_creates_document_with_user_attribution(self):
        user = UserFactory()
        project = ProjectFactory(kind="student", status="active")
        project.members.create(user=user, is_leader=True, role="supervising")

        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = projects_urls.path(project.pk, "student-reports")
        response = client.post(
            url,
            data={"report_id": annual_report.pk, "year": 2024},
            format="json",
        )

        assert response.status_code == 201

        # Verify the ProjectDocument was created with correct attribution
        doc = ProjectDocument.objects.filter(
            project=project, kind="studentreport"
        ).first()
        assert doc is not None, "ProjectDocument should be created"
        assert doc.creator == user, "creator should be the requesting user"
        assert doc.modifier == user, "modifier should be the requesting user"
        assert doc.status == "new"

        # Verify the StudentReport detail was created
        sr = StudentReport.objects.filter(document=doc).first()
        assert sr is not None, "StudentReport detail should be created"
        assert sr.report == annual_report
        assert sr.year == 2024

    def test_student_report_rejects_duplicate_year(self):
        user = UserFactory()
        project = ProjectFactory(kind="student", status="active")
        project.members.create(user=user, is_leader=True, role="supervising")

        annual_report = AnnualReport.objects.create(
            year=2024,
            date_open="2024-01-01",
            date_closed="2024-12-31",
        )

        client = APIClient()
        client.force_authenticate(user=user)

        url = projects_urls.path(project.pk, "student-reports")

        # First creation should succeed
        response = client.post(
            url,
            data={"report_id": annual_report.pk, "year": 2024},
            format="json",
        )
        assert response.status_code == 201

        # Second creation for same year should fail
        response = client.post(
            url,
            data={"report_id": annual_report.pk, "year": 2024},
            format="json",
        )
        assert response.status_code == 400
