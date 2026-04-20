"""
Tests for CreateProgressReport and CreateStudentReport views — creating
progress and student reports for projects.
"""

import datetime

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import (
    BusinessAreaFactory,
    ProjectDocumentFactory,
    ProjectFactory,
    ProjectMemberFactory,
    UserFactory,
)
from common.tests.test_helpers import projects_urls
from documents.models import AnnualReport, ProgressReport, StudentReport


@pytest.fixture
def api_client():
    """Provide API client for view tests"""
    return APIClient()


@pytest.fixture
def annual_report(db):
    """Provide an annual report"""
    return AnnualReport.objects.create(
        year=2024,
        is_published=False,
        date_open=datetime.date(2023, 7, 1),
        date_closed=datetime.date(2024, 6, 30),
    )


class TestCreateProgressReport:
    """Tests for CreateProgressReport view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_progress_report(self, api_client, annual_report):
        """Authenticated user can create a progress report"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            projects_urls.path(project.pk, "progress-reports"),
            {"report_id": annual_report.pk, "year": 2024},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert ProgressReport.objects.filter(project=project, year=2024).exists()

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_missing_report_id_returns_400(self, api_client):
        """Missing report_id returns 400"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])

        api_client.force_authenticate(user=user)
        response = api_client.post(
            projects_urls.path(project.pk, "progress-reports"),
            {"year": 2024},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_missing_year_returns_400(self, api_client, annual_report):
        """Missing year returns 400"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])

        api_client.force_authenticate(user=user)
        response = api_client.post(
            projects_urls.path(project.pk, "progress-reports"),
            {"report_id": annual_report.pk},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_nonexistent_annual_report_returns_404(self, api_client):
        """Non-existent annual report returns 404"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])

        api_client.force_authenticate(user=user)
        response = api_client.post(
            projects_urls.path(project.pk, "progress-reports"),
            {"report_id": 99999, "year": 2024},
            format="json",
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_duplicate_year_returns_400(self, api_client, annual_report):
        """Creating a duplicate progress report for the same year returns 400"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])

        # Create the first progress report
        doc = ProjectDocumentFactory(
            project=project, kind="progressreport", status="new"
        )
        ProgressReport.objects.create(
            document=doc, report=annual_report, project=project, year=2024
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            projects_urls.path(project.pk, "progress-reports"),
            {"report_id": annual_report.pk, "year": 2024},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_returns_403(self, api_client, annual_report):
        """Unauthenticated request is rejected"""
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        response = api_client.post(
            projects_urls.path(project.pk, "progress-reports"),
            {"report_id": annual_report.pk, "year": 2024},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestCreateStudentReport:
    """Tests for CreateStudentReport view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_student_report(self, api_client, annual_report):
        """Authenticated user can create a student report"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, kind="student", members=[])
        ProjectMemberFactory(project=project, user=user, is_leader=True)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            projects_urls.path(project.pk, "student-reports"),
            {"report_id": annual_report.pk, "year": 2024},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert StudentReport.objects.filter(project=project, year=2024).exists()

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_missing_fields_returns_400(self, api_client):
        """Missing report_id and year returns 400"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])

        api_client.force_authenticate(user=user)
        response = api_client.post(
            projects_urls.path(project.pk, "student-reports"),
            {},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_nonexistent_annual_report_returns_404(self, api_client):
        """Non-existent annual report returns 404"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])

        api_client.force_authenticate(user=user)
        response = api_client.post(
            projects_urls.path(project.pk, "student-reports"),
            {"report_id": 99999, "year": 2024},
            format="json",
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_duplicate_year_returns_400(self, api_client, annual_report):
        """Creating a duplicate student report for the same year returns 400"""
        user = UserFactory()
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, kind="student", members=[])

        # Create the first student report
        doc = ProjectDocumentFactory(
            project=project, kind="studentreport", status="new"
        )
        StudentReport.objects.create(
            document=doc, report=annual_report, project=project, year=2024
        )

        api_client.force_authenticate(user=user)
        response = api_client.post(
            projects_urls.path(project.pk, "student-reports"),
            {"report_id": annual_report.pk, "year": 2024},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_returns_403(self, api_client, annual_report):
        """Unauthenticated request is rejected"""
        ba = BusinessAreaFactory()
        project = ProjectFactory(business_area=ba, members=[])
        response = api_client.post(
            projects_urls.path(project.pk, "student-reports"),
            {"report_id": annual_report.pk, "year": 2024},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
