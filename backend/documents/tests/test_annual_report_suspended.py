"""
Bug condition exploration tests for annual report suspended project filtering.

These tests encode the EXPECTED (correct) behaviour. They will FAIL on
unfixed code because the queries do not exclude suspended projects.

Validates: Requirements 1.8, 1.9
"""

from datetime import date

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import ProjectFactory, UserFactory
from common.tests.test_helpers import documents_urls
from documents.models import (
    AnnualReport,
    ProgressReport,
    ProjectDocument,
    StudentReport,
)


@pytest.fixture
def user(db):
    """Provide an authenticated user."""
    return UserFactory()


@pytest.fixture
def api_client():
    """Provide an API client."""
    return APIClient()


@pytest.fixture
def annual_report(db):
    """Provide an annual report."""
    return AnnualReport.objects.create(
        year=2024,
        date_open=date(2024, 1, 1),
        date_closed=date(2024, 12, 31),
    )


@pytest.fixture
def suspended_project(db):
    """Provide a suspended project."""
    return ProjectFactory(kind="science", status="suspended")


@pytest.fixture
def active_project(db):
    """Provide an active (non-suspended) project as a control."""
    return ProjectFactory(kind="science", status="active")


def _create_approved_progress_report(project, annual_report, user):
    """Helper to create an approved progress report linked to an annual report."""
    doc = ProjectDocument.objects.create(
        project=project,
        kind="progressreport",
        status="approved",
        creator=user,
        modifier=user,
    )
    return ProgressReport.objects.create(
        document=doc,
        project=project,
        report=annual_report,
        year=annual_report.year,
    )


def _create_approved_student_report(project, annual_report, user):
    """Helper to create an approved student report linked to an annual report."""
    doc = ProjectDocument.objects.create(
        project=project,
        kind="studentreport",
        status="approved",
        creator=user,
        modifier=user,
    )
    return StudentReport.objects.create(
        document=doc,
        project=project,
        report=annual_report,
        year=annual_report.year,
        progress_report="<p>Student progress</p>",
    )


class TestProgressReportsSuspendedExclusion:
    """Test that suspended project progress reports are excluded from annual reports."""

    @pytest.mark.django_db
    def test_suspended_project_progress_report_excluded(
        self, api_client, user, annual_report, suspended_project
    ):
        """Progress reports from suspended projects should NOT appear."""
        _create_approved_progress_report(suspended_project, annual_report, user)

        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("latest_active_progress_reports"),
            {"report_id": annual_report.pk},
        )
        assert response.status_code == status.HTTP_200_OK

        # The suspended project's report should NOT be in the results
        project_ids = [
            item["project"]["id"] for item in response.data if "project" in item
        ]
        assert suspended_project.pk not in project_ids

    @pytest.mark.django_db
    def test_active_project_progress_report_included(
        self, api_client, user, annual_report, active_project
    ):
        """Progress reports from active projects should still appear (control)."""
        _create_approved_progress_report(active_project, annual_report, user)

        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("latest_active_progress_reports"),
            {"report_id": annual_report.pk},
        )
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1


class TestStudentReportsSuspendedExclusion:
    """Test that suspended project student reports are excluded from annual reports."""

    @pytest.mark.django_db
    def test_suspended_project_student_report_excluded(
        self, api_client, user, annual_report, suspended_project
    ):
        """Student reports from suspended projects should NOT appear."""
        _create_approved_student_report(suspended_project, annual_report, user)

        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("latest_active_student_reports"),
            {"report_id": annual_report.pk},
        )
        assert response.status_code == status.HTTP_200_OK

        # The suspended project's report should NOT be in the results
        project_ids = [
            item["project"]["id"] for item in response.data if "project" in item
        ]
        assert suspended_project.pk not in project_ids

    @pytest.mark.django_db
    def test_active_project_student_report_included(
        self, api_client, user, annual_report, active_project
    ):
        """Student reports from active projects should still appear (control)."""
        _create_approved_student_report(active_project, annual_report, user)

        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("latest_active_student_reports"),
            {"report_id": annual_report.pk},
        )
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
