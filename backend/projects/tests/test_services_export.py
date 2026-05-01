"""
Tests for project export service — CSV generation.
"""

import pytest

from common.tests.factories import BusinessAreaFactory, ProjectFactory, UserFactory


@pytest.fixture
def project_with_team(db):
    """Create a project with team members for export testing."""
    ba = BusinessAreaFactory()
    leader = UserFactory(username="leader", first_name="Lead", last_name="User")
    ba.leader = leader
    ba.save()

    project = ProjectFactory(business_area=ba, status="active")
    project.members.create(user=leader, is_leader=True, role="supervising")

    member = UserFactory(username="member", first_name="Team", last_name="Member")
    project.members.create(user=member, is_leader=False, role="research", position=1)

    return project


class TestExportService:
    """Tests for ExportService."""

    @pytest.mark.integration
    def test_strip_html_tags(self):
        """Should strip HTML and return plain text."""
        from projects.services.export_service import ExportService

        assert (
            ExportService.strip_html_tags("<p>Hello <b>world</b></p>") == "Hello world"
        )
        assert ExportService.strip_html_tags("") == ""
        assert ExportService.strip_html_tags(None) == ""

    @pytest.mark.integration
    def test_export_all_projects_csv(self, project_with_team):
        """Should generate a CSV response with all projects."""
        from projects.services.export_service import ExportService

        user = UserFactory(username="exporter")
        response = ExportService.export_all_projects_csv(user)

        assert response.status_code == 200
        assert response["Content-Type"] == "text/csv"
        assert "projects-full.csv" in response["Content-Disposition"]

        # Check CSV content
        content = response.content.decode("utf-8")
        assert "ID" in content  # Header row
        assert "Lead User" in content or "Team Member" in content

    @pytest.mark.integration
    def test_export_all_projects_csv_empty(self, db):
        """Should generate CSV even with no projects."""
        from projects.services.export_service import ExportService

        user = UserFactory(username="exporter")
        response = ExportService.export_all_projects_csv(user)

        assert response.status_code == 200
        content = response.content.decode("utf-8")
        assert "ID" in content  # Header row still present

    @pytest.mark.integration
    def test_export_annual_report_csv_no_reports(self, db):
        """Should return 404 when no annual reports exist."""
        from projects.services.export_service import ExportService

        user = UserFactory(username="exporter")
        response = ExportService.export_annual_report_projects_csv(user)

        assert response.status_code == 404
