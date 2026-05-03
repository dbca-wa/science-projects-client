"""
Tests for annual report PDF views: PublishReportPDF, GetWithPDFs, GetWithoutPDFs.
"""

import datetime

import pytest
from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.test import APIClient

from common.tests.factories import DivisionFactory, SuperuserFactory, UserFactory
from common.tests.test_helpers import documents_urls
from documents.models import AnnualReport
from medias.models import AnnualReportPDF


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


class TestPublishReportPDF:
    """Tests for PublishReportPDF view — promotes draft PDF to published"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_superuser_can_publish(self, api_client, annual_report):
        """Superuser can publish a draft PDF"""
        superuser = SuperuserFactory()
        pdf = AnnualReportPDF.objects.create(report=annual_report, creator=superuser)
        pdf.draft_file.save("test_DRAFT.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            documents_urls.path("reports", annual_report.pk, "publish"),
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "published"
        annual_report.refresh_from_db()
        assert annual_report.is_published is True
        pdf.refresh_from_db()
        assert bool(pdf.published_file)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_key_stakeholder_can_publish(self, api_client):
        """Key stakeholder of the report's division can publish"""
        ks_user = UserFactory(is_staff=True)
        division = DivisionFactory(key_stakeholder=ks_user)
        report = AnnualReport.objects.create(
            year=2025,
            division=division,
            date_open=datetime.date(2024, 7, 1),
            date_closed=datetime.date(2025, 6, 30),
        )
        pdf = AnnualReportPDF.objects.create(report=report, creator=ks_user)
        pdf.draft_file.save("ks_DRAFT.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=ks_user)
        response = api_client.post(
            documents_urls.path("reports", report.pk, "publish"),
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "published"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_non_privileged_user_denied(self, api_client, annual_report):
        """Regular user without privileges gets 403"""
        regular_user = UserFactory()
        pdf = AnnualReportPDF.objects.create(report=annual_report, creator=regular_user)
        pdf.draft_file.save("reg_DRAFT.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=regular_user)
        response = api_client.post(
            documents_urls.path("reports", annual_report.pk, "publish"),
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_no_pdf_record_returns_400(self, api_client, annual_report):
        """Report with no PDF record returns 400"""
        superuser = SuperuserFactory()
        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            documents_urls.path("reports", annual_report.pk, "publish"),
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "No PDF record" in response.data["error"]

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_no_draft_file_returns_400(self, api_client, annual_report):
        """PDF record with no draft file returns 400"""
        superuser = SuperuserFactory()
        AnnualReportPDF.objects.create(report=annual_report, creator=superuser)

        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            documents_urls.path("reports", annual_report.pk, "publish"),
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "No draft PDF" in response.data["error"]

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_not_found_report(self, api_client):
        """Non-existent report returns 404"""
        superuser = SuperuserFactory()
        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            documents_urls.path("reports", 99999, "publish"),
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_returns_403(self, api_client, annual_report):
        """Unauthenticated request is rejected"""
        response = api_client.post(
            documents_urls.path("reports", annual_report.pk, "publish"),
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestGetWithPDFs:
    """Tests for GetWithPDFs view — reports with published PDFs (Official tab)"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_reports_with_published_pdfs(self, api_client):
        """Reports with a published PDF appear in the response"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            is_published=True,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.published_file.save("published.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "withPDF"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["year"] == 2024

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_excludes_reports_without_published_pdf(self, api_client):
        """Reports with only a draft PDF do not appear"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.draft_file.save("draft.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "withPDF"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_empty_when_no_published(self, api_client):
        """Empty list when no reports have published PDFs"""
        user = UserFactory()
        AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "withPDF"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_returns_403(self, api_client):
        """Unauthenticated request is rejected"""
        response = api_client.get(documents_urls.path("reports", "withPDF"))
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestGetWithoutPDFs:
    """Tests for GetWithoutPDFs view — reports with drafts but no published PDF"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_reports_with_draft_only(self, api_client):
        """Reports with a draft PDF but no published PDF appear"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.draft_file.save("draft.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "withoutPDF"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["year"] == 2024

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_includes_reports_with_published_pdf_that_have_drafts(self, api_client):
        """Reports with both draft and published PDFs still appear (drafts tab shows all drafts)"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.draft_file.save("draft.pdf", ContentFile(_make_pdf_content()))
        pdf.published_file.save("published.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "withoutPDF"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_excludes_reports_with_no_draft(self, api_client):
        """Reports with no draft PDF at all do not appear"""
        user = UserFactory()
        AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "withoutPDF"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_unauthenticated_returns_403(self, api_client):
        """Unauthenticated request is rejected"""
        response = api_client.get(documents_urls.path("reports", "withoutPDF"))
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestGetReportPDFStatus:
    """Tests for GetReportPDFStatus view — lightweight PDF metadata endpoint"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_status_with_draft(self, api_client):
        """Report with a draft PDF returns has_draft=True"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.draft_file.save("draft.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("reports", "pdf", report.pk, "status"),
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["has_draft"] is True
        assert response.data["has_published"] is False
        assert response.data["draft_file"] is not None
        assert response.data["published_file"] is None

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_status_no_pdf(self, api_client):
        """Report with no PDF record returns has_draft=False, has_published=False"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("reports", "pdf", report.pk, "status"),
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["has_draft"] is False
        assert response.data["has_published"] is False

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_404_for_nonexistent_report(self, api_client):
        """Non-existent report returns 404"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("reports", "pdf", 99999, "status"),
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_status_with_published(self, api_client):
        """Report with both draft and published PDFs returns correct flags"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.draft_file.save("draft.pdf", ContentFile(_make_pdf_content()))
        pdf.published_file.save("published.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("reports", "pdf", report.pk, "status"),
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["has_draft"] is True
        assert response.data["has_published"] is True
        assert response.data["published_file"] is not None


class TestGetReportPDF:
    """Tests for GetReportPDF view — returns PDF data for preview"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_pdf_data(self, api_client):
        """Report with a draft PDF returns serialised PDF data"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        pdf = AnnualReportPDF.objects.create(report=report, creator=user)
        pdf.draft_file.save("draft.pdf", ContentFile(_make_pdf_content()))

        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("reports", "pdf", report.pk),
        )

        assert response.status_code == status.HTTP_200_OK
        assert "id" in response.data

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_404_for_missing_pdf(self, api_client):
        """Report with no PDF record returns 404"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(
            documents_urls.path("reports", "pdf", report.pk),
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestReportsView:
    """Tests for Reports view — list and create annual reports"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_reports(self, api_client):
        """GET returns all annual reports"""
        user = UserFactory()
        AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_list_reports_filtered_by_division(self, api_client):
        """GET with division slug filters reports"""
        user = UserFactory()
        division = DivisionFactory(slug="test-div")
        AnnualReport.objects.create(
            year=2024,
            division=division,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )
        AnnualReport.objects.create(
            year=2025,
            date_open=datetime.date(2024, 7, 1),
            date_closed=datetime.date(2025, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(f"{documents_urls.path('reports')}?division=test-div")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["year"] == 2024

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_report(self, api_client):
        """POST creates a new annual report"""
        superuser = SuperuserFactory()
        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            documents_urls.path("reports"),
            {"year": 2026},
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["year"] == 2026

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_report_missing_year(self, api_client):
        """POST without year returns 400"""
        superuser = SuperuserFactory()
        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            documents_urls.path("reports"),
            {},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_report_invalid_year(self, api_client):
        """POST with non-numeric year returns 400"""
        superuser = SuperuserFactory()
        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            documents_urls.path("reports"),
            {"year": "abc"},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_report_duplicate_year(self, api_client):
        """POST with duplicate year+division returns 400"""
        superuser = SuperuserFactory()
        AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=superuser)
        response = api_client.post(
            documents_urls.path("reports"),
            {"year": 2024},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_create_report_non_superuser_wrong_division(self, api_client):
        """Non-superuser creating report for a division they don't own returns 400"""
        user = UserFactory()
        other_user = UserFactory(is_staff=True)
        division = DivisionFactory(key_stakeholder=other_user)

        api_client.force_authenticate(user=user)
        response = api_client.post(
            documents_urls.path("reports"),
            {"year": 2026, "division": division.pk},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestReportDetailView:
    """Tests for ReportDetail view — get, update, delete"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_report(self, api_client, annual_report):
        """PUT updates an annual report"""
        superuser = SuperuserFactory()
        api_client.force_authenticate(user=superuser)
        response = api_client.put(
            documents_urls.path("reports", annual_report.pk),
            {"dm": "<p>Updated directors message</p>"},
            format="json",
        )

        assert response.status_code == status.HTTP_202_ACCEPTED

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_update_report_not_found(self, api_client):
        """PUT for non-existent report returns 404"""
        superuser = SuperuserFactory()
        api_client.force_authenticate(user=superuser)
        response = api_client.put(
            documents_urls.path("reports", 99999),
            {"dm": "test"},
            format="json",
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_delete_report(self, api_client):
        """DELETE removes an annual report"""
        superuser = SuperuserFactory()
        report = AnnualReport.objects.create(
            year=2099,
            date_open=datetime.date(2098, 7, 1),
            date_closed=datetime.date(2099, 6, 30),
        )

        api_client.force_authenticate(user=superuser)
        response = api_client.delete(
            documents_urls.path("reports", report.pk),
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not AnnualReport.objects.filter(pk=report.pk).exists()


class TestGetLatestReportYear:
    """Tests for GetLatestReportYear view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_latest_report(self, api_client):
        """Returns the most recent annual report"""
        user = UserFactory()
        AnnualReport.objects.create(
            year=2023,
            date_open=datetime.date(2022, 7, 1),
            date_closed=datetime.date(2023, 6, 30),
        )
        AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "latestyear"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["year"] == 2024

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_404_when_no_reports(self, api_client):
        """Returns 404 when no reports exist"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "latestyear"))

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestLatestYearsProgressReports:
    """Tests for LatestYearsProgressReports view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_approved_progress_reports(self, api_client):
        """Returns approved progress reports for a given report"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(
            f"/api/v1/documents/latest_active_progress_reports?report_id={report.pk}"
        )

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_404_for_nonexistent_report(self, api_client):
        """Returns 404 for non-existent report_id"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(
            "/api/v1/documents/latest_active_progress_reports?report_id=99999"
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_latest_when_no_report_id(self, api_client):
        """Without report_id, uses the latest report"""
        user = UserFactory()
        AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get("/api/v1/documents/latest_active_progress_reports")

        assert response.status_code == status.HTTP_200_OK


class TestLatestYearsStudentReports:
    """Tests for LatestYearsStudentReports view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_approved_student_reports(self, api_client):
        """Returns approved student reports for a given report"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(
            f"/api/v1/documents/latest_active_student_reports?report_id={report.pk}"
        )

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)


class TestLatestYearsInactiveReports:
    """Tests for LatestYearsInactiveReports view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_inactive_reports(self, api_client):
        """Returns non-approved reports for a given report"""
        user = UserFactory()
        report = AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(
            f"/api/v1/documents/latest_inactive_reports?report_id={report.pk}"
        )

        assert response.status_code == status.HTTP_200_OK
        assert "student_reports" in response.data
        assert "progress_reports" in response.data


class TestFullLatestReport:
    """Tests for FullLatestReport view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_latest_report(self, api_client):
        """Returns the latest annual report with full details"""
        user = UserFactory()
        AnnualReport.objects.create(
            year=2024,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "latest"))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["year"] == 2024

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_404_when_no_reports(self, api_client):
        """Returns 404 when no reports exist"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "latest"))

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_filters_by_division_slug(self, api_client):
        """Filters by division slug when provided"""
        user = UserFactory()
        division = DivisionFactory(slug="bcs")
        AnnualReport.objects.create(
            year=2024,
            division=division,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(
            f"{documents_urls.path('reports', 'latest')}?division=bcs"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["year"] == 2024


class TestGetCompletedReports:
    """Tests for GetCompletedReports view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_published_reports(self, api_client):
        """Returns reports where is_published=True"""
        user = UserFactory()
        AnnualReport.objects.create(
            year=2024,
            is_published=True,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "completed"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_empty_when_none_published(self, api_client):
        """Returns empty list when no reports are published"""
        user = UserFactory()
        AnnualReport.objects.create(
            year=2024,
            is_published=False,
            date_open=datetime.date(2023, 7, 1),
            date_closed=datetime.date(2024, 6, 30),
        )

        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "completed"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0


class TestGetLegacyPDFs:
    """Tests for GetLegacyPDFs view"""

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_returns_legacy_pdfs(self, api_client):
        """Returns legacy annual report PDFs"""
        user = UserFactory()
        api_client.force_authenticate(user=user)
        response = api_client.get(documents_urls.path("reports", "legacyPDF"))

        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)
