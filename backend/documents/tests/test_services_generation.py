"""
Tests for document services.

Tests business logic in document services.
"""

from unittest.mock import Mock, patch

import pytest
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from common.tests.factories import ProjectDocumentFactory, ProjectFactory, UserFactory
from documents.services.email_service import EmailSendError, EmailService
from documents.services.pdf_service import PDFService
from documents.tests.factories import (
    ConceptPlanFactory,
)

User = get_user_model()


class TestPDFService:
    """Test PDFService business logic"""

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @patch("documents.services.pdf_service.render_to_string")
    @pytest.mark.unit
    def test_generate_document_pdf_success(self, mock_render, mock_subprocess):
        """Test generate_document_pdf creates PDF successfully"""
        # Arrange
        from documents.tests.factories import ConceptPlanFactory

        concept_plan = ConceptPlanFactory()
        mock_render.return_value = "<html>Test document</html>"
        mock_subprocess.return_value = Mock(returncode=0, stderr="")

        # Act
        with patch("builtins.open", create=True) as mock_open:
            mock_open.return_value.__enter__.return_value.read.return_value = (
                b"PDF content"
            )
            pdf_file = PDFService.generate_document_pdf(concept_plan.document)

        # Assert
        assert pdf_file is not None
        assert pdf_file.name == f"concept_{concept_plan.document.pk}.pdf"
        mock_render.assert_called_once()
        mock_subprocess.assert_called_once()

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @patch("documents.services.pdf_service.render_to_string")
    @pytest.mark.unit
    def test_generate_document_pdf_custom_template(self, mock_render, mock_subprocess):
        """Test generate_document_pdf uses custom template"""
        # Arrange
        from documents.tests.factories import ConceptPlanFactory

        concept_plan = ConceptPlanFactory()
        mock_render.return_value = "<html>Custom template</html>"
        mock_subprocess.return_value = Mock(returncode=0, stderr="")

        # Act
        with patch("builtins.open", create=True) as mock_open:
            mock_open.return_value.__enter__.return_value.read.return_value = (
                b"PDF content"
            )
            pdf_file = PDFService.generate_document_pdf(
                concept_plan.document, template_name="custom_template.html"
            )

        # Assert
        assert pdf_file is not None
        mock_render.assert_called_once()
        # Verify custom template was used
        call_args = mock_render.call_args
        assert "custom_template.html" in call_args[0][0]

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @patch("documents.services.pdf_service.render_to_string")
    @pytest.mark.unit
    def test_generate_document_pdf_prince_failure(self, mock_render, mock_subprocess):
        """Test generate_document_pdf handles Prince XML failure"""
        # Arrange
        from documents.tests.factories import ConceptPlanFactory

        concept_plan = ConceptPlanFactory()
        mock_render.return_value = "<html>Test document</html>"
        mock_subprocess.return_value = Mock(returncode=1, stderr="Prince error")

        # Act & Assert
        with pytest.raises(ValidationError, match="Prince XML failed"):
            PDFService.generate_document_pdf(concept_plan.document)

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @patch("documents.services.pdf_service.render_to_string")
    @pytest.mark.unit
    def test_generate_document_pdf_timeout(self, mock_render, mock_subprocess):
        """Test generate_document_pdf handles timeout"""
        # Arrange
        from subprocess import TimeoutExpired

        from documents.tests.factories import ConceptPlanFactory

        concept_plan = ConceptPlanFactory()
        mock_render.return_value = "<html>Test document</html>"
        mock_subprocess.side_effect = TimeoutExpired("prince", 300)

        # Act & Assert
        with pytest.raises(ValidationError, match="timed out"):
            PDFService.generate_document_pdf(concept_plan.document)

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @patch("documents.services.pdf_service.render_to_string")
    @pytest.mark.unit
    def test_generate_document_pdf_template_error(self, mock_render, mock_subprocess):
        """Test generate_document_pdf handles template rendering error"""
        # Arrange
        from documents.tests.factories import ConceptPlanFactory

        concept_plan = ConceptPlanFactory()
        mock_render.side_effect = Exception("Template not found")

        # Act & Assert
        with pytest.raises(ValidationError, match="Failed to generate PDF"):
            PDFService.generate_document_pdf(concept_plan.document)

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @patch("documents.services.pdf_service.render_to_string")
    @pytest.mark.unit
    def test_generate_annual_report_pdf_success(
        self, mock_render, mock_subprocess, annual_report
    ):
        """Test generate_annual_report_pdf creates PDF successfully"""
        # Arrange
        mock_render.return_value = "<html>Annual report</html>"
        mock_subprocess.return_value = Mock(returncode=0, stderr="")

        # Act
        with patch("builtins.open", create=True) as mock_open:
            mock_open.return_value.__enter__.return_value.read.return_value = (
                b"PDF content"
            )
            pdf_file = PDFService.generate_annual_report_pdf(annual_report)

        # Assert
        assert pdf_file is not None
        assert pdf_file.name == f"annual_report_{annual_report.year}.pdf"
        mock_render.assert_called_once()
        mock_subprocess.assert_called_once()

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @patch("documents.services.pdf_service.render_to_string")
    @pytest.mark.unit
    def test_generate_annual_report_pdf_custom_template(
        self, mock_render, mock_subprocess, annual_report
    ):
        """Test generate_annual_report_pdf uses custom template"""
        # Arrange
        mock_render.return_value = "<html>Custom annual report</html>"
        mock_subprocess.return_value = Mock(returncode=0, stderr="")

        # Act
        with patch("builtins.open", create=True) as mock_open:
            mock_open.return_value.__enter__.return_value.read.return_value = (
                b"PDF content"
            )
            pdf_file = PDFService.generate_annual_report_pdf(
                annual_report, template_name="custom_annual.html"
            )

        # Assert
        assert pdf_file is not None
        mock_render.assert_called_once()
        call_args = mock_render.call_args
        assert "custom_annual.html" in call_args[0][0]

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @patch("documents.services.pdf_service.render_to_string")
    @pytest.mark.unit
    def test_generate_annual_report_pdf_failure(
        self, mock_render, mock_subprocess, annual_report
    ):
        """Test generate_annual_report_pdf handles failure"""
        # Arrange
        mock_render.return_value = "<html>Annual report</html>"
        mock_subprocess.return_value = Mock(returncode=1, stderr="Generation failed")

        # Act & Assert
        with pytest.raises(ValidationError, match="Prince XML failed"):
            PDFService.generate_annual_report_pdf(annual_report)

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_build_document_context_concept_plan(self):
        """Test _build_document_context for concept plan"""
        # Arrange
        from documents.tests.factories import ConceptPlanFactory

        concept_plan = ConceptPlanFactory()

        # Act
        context = PDFService._build_document_context(concept_plan.document)

        # Assert
        assert "document" in context
        assert "project" in context
        assert "business_area" in context
        assert context["document"] == concept_plan.document
        assert context["project"] == concept_plan.document.project
        # Verify concept plan details are included
        assert "details" in context
        assert context["details"] == concept_plan

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_build_document_context_project_plan(self):
        """Test _build_document_context for project plan"""
        # Arrange
        from documents.tests.factories import ProjectPlanFactory

        project_plan = ProjectPlanFactory()

        # Act
        context = PDFService._build_document_context(project_plan.document)

        # Assert
        assert "document" in context
        assert "project" in context
        assert "business_area" in context
        assert context["document"] == project_plan.document
        # Verify project plan details are included
        assert "details" in context
        assert context["details"] == project_plan
        # Verify endorsements are included (even if empty)
        assert "endorsements" in context

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_build_document_context_progress_report_without_details(self):
        """Test _build_document_context for progress report without details"""
        # Arrange - Create document without progress report details
        # (ProgressReport requires report_id which complicates factory setup)
        document = ProjectDocumentFactory(kind="progressreport")

        # Act
        context = PDFService._build_document_context(document)

        # Assert
        assert "document" in context
        assert "project" in context
        assert context["document"].kind == "progressreport"
        # Details won't be in context since we didn't create ProgressReport
        # This tests the code path for documents without details

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_build_document_context_student_report_without_details(self):
        """Test _build_document_context for student report without details"""
        # Arrange - Create document without student report details
        from documents.tests.factories import StudentReportFactory

        student_report = StudentReportFactory()

        # Act
        context = PDFService._build_document_context(student_report.document)

        # Assert
        assert "document" in context
        assert "project" in context
        assert context["document"].kind == "studentreport"
        # Verify student report details are included
        assert "details" in context
        assert context["details"] == student_report

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_build_document_context_project_closure_without_details(self):
        """Test _build_document_context for project closure without details"""
        # Arrange - Create document without project closure details
        from documents.tests.factories import ProjectClosureFactory

        project_closure = ProjectClosureFactory()

        # Act
        context = PDFService._build_document_context(project_closure.document)

        # Assert
        assert "document" in context
        assert "project" in context
        assert context["document"].kind == "projectclosure"
        # Verify project closure details are included
        assert "details" in context
        assert context["details"] == project_closure

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_build_annual_report_context(self, annual_report):
        """Test _build_annual_report_context includes reports"""
        # Arrange - just test the context structure without creating progress reports
        # (ProgressReport requires report_id which complicates factory setup)

        # Act
        context = PDFService._build_annual_report_context(annual_report)

        # Assert
        assert "report" in context
        assert "progress_reports" in context
        assert "student_reports" in context
        assert context["report"] == annual_report
        # Verify querysets are returned (even if empty)
        assert hasattr(context["progress_reports"], "count")
        assert hasattr(context["student_reports"], "count")

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_mark_pdf_generation_started(self):
        """Test mark_pdf_generation_started sets flag"""
        # Arrange
        from documents.tests.factories import ConceptPlanFactory

        concept_plan = ConceptPlanFactory()
        concept_plan.document.pdf_generation_in_progress = False
        concept_plan.document.save()

        # Act
        PDFService.mark_pdf_generation_started(concept_plan.document)

        # Assert
        concept_plan.document.refresh_from_db()
        assert concept_plan.document.pdf_generation_in_progress is True

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_mark_pdf_generation_complete(self):
        """Test mark_pdf_generation_complete clears flag"""
        # Arrange
        from documents.tests.factories import ConceptPlanFactory

        concept_plan = ConceptPlanFactory()
        concept_plan.document.pdf_generation_in_progress = True
        concept_plan.document.save()

        # Act
        PDFService.mark_pdf_generation_complete(concept_plan.document)

        # Assert
        concept_plan.document.refresh_from_db()
        assert concept_plan.document.pdf_generation_in_progress is False

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_cancel_pdf_generation(self):
        """Test cancel_pdf_generation clears flag"""
        # Arrange
        from documents.tests.factories import ConceptPlanFactory

        concept_plan = ConceptPlanFactory()
        concept_plan.document.pdf_generation_in_progress = True
        concept_plan.document.save()

        # Act
        PDFService.cancel_pdf_generation(concept_plan.document)

        # Assert
        concept_plan.document.refresh_from_db()
        assert concept_plan.document.pdf_generation_in_progress is False

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @patch("documents.services.pdf_service.render_to_string")
    @pytest.mark.unit
    def test_html_to_pdf_success(self, mock_render, mock_subprocess):
        """Test _html_to_pdf converts HTML to PDF"""
        # Arrange
        html_content = "<html><body>Test</body></html>"
        mock_subprocess.return_value = Mock(returncode=0, stderr="")

        # Act
        with patch("builtins.open", create=True) as mock_open:
            mock_open.return_value.__enter__.return_value.read.return_value = (
                b"PDF content"
            )
            pdf_content = PDFService._html_to_pdf(html_content)

        # Assert
        assert pdf_content == b"PDF content"
        mock_subprocess.assert_called_once()
        # Verify Prince command was called correctly
        call_args = mock_subprocess.call_args
        assert "prince" in call_args[0][0]

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @pytest.mark.unit
    def test_html_to_pdf_prince_error(self, mock_subprocess):
        """Test _html_to_pdf handles Prince error"""
        # Arrange
        html_content = "<html><body>Test</body></html>"
        mock_subprocess.return_value = Mock(returncode=1, stderr="Prince error message")

        # Act & Assert
        with pytest.raises(ValidationError, match="Prince XML failed"):
            PDFService._html_to_pdf(html_content)

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @pytest.mark.unit
    def test_html_to_pdf_timeout_error(self, mock_subprocess):
        """Test _html_to_pdf handles timeout"""
        # Arrange
        from subprocess import TimeoutExpired

        html_content = "<html><body>Test</body></html>"
        mock_subprocess.side_effect = TimeoutExpired("prince", 300)

        # Act & Assert
        with pytest.raises(ValidationError, match="timed out"):
            PDFService._html_to_pdf(html_content)

    @pytest.mark.django_db
    @patch("documents.services.pdf_service.subprocess.run")
    @pytest.mark.unit
    def test_html_to_pdf_generic_error(self, mock_subprocess):
        """Test _html_to_pdf handles generic errors"""
        # Arrange
        html_content = "<html><body>Test</body></html>"
        mock_subprocess.side_effect = Exception("Unexpected error")

        # Act & Assert
        with pytest.raises(ValidationError, match="PDF generation error"):
            PDFService._html_to_pdf(html_content)


class TestNotificationService:
    """Test NotificationService business logic"""

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.unit
    def test_notify_document_approved(self, mock_send):
        """Test notify_document_approved sends notification"""
        # Arrange
        from documents.services.notification_service import NotificationService

        user = UserFactory()
        concept_plan = ConceptPlanFactory()

        # Act
        NotificationService.notify_document_approved(concept_plan.document, user)

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "approved"
        assert call_args[1]["document"] == concept_plan.document
        assert call_args[1]["actioning_user"] == user
        assert "email_subject" in call_args[1]["additional_context"]

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.unit
    def test_notify_document_approved_directorate(self, mock_send):
        """Test notify_document_approved_directorate sends notification"""
        # Arrange
        from documents.services.notification_service import NotificationService

        user = UserFactory()
        concept_plan = ConceptPlanFactory()

        # Act
        NotificationService.notify_document_approved_directorate(
            concept_plan.document, user
        )

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "approved_directorate"
        assert call_args[1]["document"] == concept_plan.document
        assert call_args[1]["actioning_user"] == user

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.unit
    def test_notify_document_recalled(self, mock_send):
        """Test notify_document_recalled sends notification with reason"""
        # Arrange
        from documents.services.notification_service import NotificationService

        user = UserFactory()
        concept_plan = ConceptPlanFactory()
        reason = "Need to make changes"

        # Act
        NotificationService.notify_document_recalled(
            concept_plan.document, user, reason
        )

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "recalled"
        assert call_args[1]["additional_context"]["recall_reason"] == reason

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.unit
    def test_notify_document_sent_back(self, mock_send):
        """Test notify_document_sent_back sends notification with reason"""
        # Arrange
        from documents.services.notification_service import NotificationService

        user = UserFactory()
        concept_plan = ConceptPlanFactory()
        reason = "Needs more detail"

        # Act
        NotificationService.notify_document_sent_back(
            concept_plan.document, user, reason
        )

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "sent_back"
        assert call_args[1]["additional_context"]["sent_back_reason"] == reason

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.unit
    def test_notify_document_ready(self, mock_send):
        """Test notify_document_ready sends notification to approvers"""
        # Arrange
        from documents.services.notification_service import NotificationService

        user = UserFactory()
        concept_plan = ConceptPlanFactory()

        # Act
        NotificationService.notify_document_ready(concept_plan.document, user)

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "ready"
        assert call_args[1]["actioning_user"] == user

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.unit
    def test_notify_feedback_received(self, mock_send):
        """Test notify_feedback_received sends notification with feedback"""
        # Arrange
        from documents.services.notification_service import NotificationService

        user = UserFactory()
        concept_plan = ConceptPlanFactory()
        feedback = "Great work on this document"

        # Act
        NotificationService.notify_feedback_received(
            concept_plan.document, user, feedback
        )

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "feedback"
        assert call_args[1]["additional_context"]["feedback_text"] == feedback

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.unit
    def test_notify_review_request(self, mock_send):
        """Test notify_review_request sends notification to approvers"""
        # Arrange
        from documents.services.notification_service import NotificationService

        user = UserFactory()
        concept_plan = ConceptPlanFactory()

        # Act
        NotificationService.notify_review_request(concept_plan.document, user)

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "review"
        assert call_args[1]["actioning_user"] == user

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.unit
    def test_send_bump_emails(self, mock_send):
        """Test send_bump_emails sends reminders for multiple documents"""
        # Arrange
        from documents.services.notification_service import NotificationService

        concept_plan1 = ConceptPlanFactory()
        concept_plan2 = ConceptPlanFactory()
        documents = [concept_plan1.document, concept_plan2.document]

        # Act
        NotificationService.send_bump_emails(documents, reminder_type="overdue")

        # Assert
        assert mock_send.call_count == 2
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "bump"
        assert call_args[1]["additional_context"]["reminder_type"] == "overdue"

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.integration
    def test_notify_comment_mention(self, mock_send):
        """Test notify_comment_mention sends notification to mentioned user"""
        # Arrange
        from documents.services.notification_service import NotificationService

        commenter = UserFactory(first_name="John", last_name="Doe")
        mentioned_user = UserFactory(
            first_name="Jane", last_name="Smith", email="jane@example.com"
        )
        concept_plan = ConceptPlanFactory()
        comment = "Hey @jane, can you review this?"

        # Act
        NotificationService.notify_comment_mention(
            concept_plan.document, comment, mentioned_user, commenter
        )

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "mention"
        assert call_args[1]["actioning_user"] == commenter
        assert call_args[1]["additional_context"]["comment"] == comment
        # Verify recipient is the mentioned user
        recipients = call_args[1]["recipients"]
        assert len(recipients) == 1
        assert recipients[0]["email"] == "jane@example.com"

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.integration
    def test_notify_new_cycle_open(self, mock_send):
        """Test notify_new_cycle_open sends notifications for all projects"""
        # Arrange
        from datetime import datetime

        from documents.models import AnnualReport
        from documents.services.notification_service import NotificationService

        cycle = AnnualReport.objects.create(
            year=2024,
            is_published=False,
            date_open=datetime(2024, 1, 1),
            date_closed=datetime(2024, 12, 31),
        )
        project1 = ProjectFactory()
        project2 = ProjectFactory()
        projects = [project1, project2]

        # Act
        NotificationService.notify_new_cycle_open(cycle, projects)

        # Assert
        assert mock_send.call_count == 2
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "new_cycle"
        assert call_args[1]["additional_context"]["cycle"] == cycle

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.integration
    def test_notify_project_closed(self, mock_send):
        """Test notify_project_closed sends notification to project team"""
        # Arrange
        from documents.services.notification_service import NotificationService

        user = UserFactory()
        project = ProjectFactory()

        # Act
        NotificationService.notify_project_closed(project, user)

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "project_closed"
        assert call_args[1]["actioning_user"] == user
        assert call_args[1]["additional_context"]["project"] == project

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.integration
    def test_notify_project_reopened(self, mock_send):
        """Test notify_project_reopened sends notification to project team"""
        # Arrange
        from documents.services.notification_service import NotificationService

        user = UserFactory()
        project = ProjectFactory()

        # Act
        NotificationService.notify_project_reopened(project, user)

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "project_reopened"
        assert call_args[1]["actioning_user"] == user
        assert call_args[1]["additional_context"]["project"] == project

    @pytest.mark.django_db
    @patch(
        "documents.services.notification_service.EmailService.send_document_notification"
    )
    @pytest.mark.unit
    def test_send_spms_invite(self, mock_send):
        """Test send_spms_invite sends invitation email"""
        # Arrange
        from documents.services.notification_service import NotificationService

        inviter = UserFactory(first_name="Admin", last_name="User")
        invited_user = UserFactory(
            first_name="New", last_name="User", email="new@example.com"
        )
        invite_link = "https://spms.example.com/invite/abc123"

        # Act
        NotificationService.send_spms_invite(invited_user, inviter, invite_link)

        # Assert
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert call_args[1]["notification_type"] == "spms_invite"
        assert call_args[1]["actioning_user"] == inviter
        assert call_args[1]["additional_context"]["invite_link"] == invite_link
        # Verify recipient is the invited user
        recipients = call_args[1]["recipients"]
        assert len(recipients) == 1
        assert recipients[0]["email"] == "new@example.com"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_document_recipients_with_project_team(self):
        """Test _get_document_recipients includes project team members"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory
        from documents.services.notification_service import NotificationService

        # Create business area without leader to avoid extra recipient
        business_area = BusinessAreaFactory(leader=None)
        project = ProjectFactory(business_area=business_area)
        # Clear auto-generated members
        project.members.all().delete()

        leader = UserFactory(
            first_name="Lead", last_name="User", email="lead@example.com"
        )
        member = UserFactory(
            first_name="Team", last_name="Member", email="member@example.com"
        )

        project.members.create(user=leader, is_leader=True, role="supervising")
        project.members.create(user=member, is_leader=False, role="research")

        document = ProjectDocumentFactory(project=project)

        # Act
        recipients = NotificationService._get_document_recipients(document)

        # Assert
        assert len(recipients) == 2
        emails = [r["email"] for r in recipients]
        assert "lead@example.com" in emails
        assert "member@example.com" in emails
        # Verify kinds are correct
        leader_recipient = next(
            r for r in recipients if r["email"] == "lead@example.com"
        )
        assert leader_recipient["kind"] == "Project Lead"
        member_recipient = next(
            r for r in recipients if r["email"] == "member@example.com"
        )
        assert member_recipient["kind"] == "Team Member"

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_document_recipients_with_ba_leader(self):
        """Test _get_document_recipients includes business area leader"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory
        from documents.services.notification_service import NotificationService

        ba_leader = UserFactory(
            first_name="BA", last_name="Leader", email="ba@example.com"
        )
        business_area = BusinessAreaFactory(leader=ba_leader)
        project = ProjectFactory(business_area=business_area)
        document = ProjectDocumentFactory(project=project)

        # Act
        recipients = NotificationService._get_document_recipients(document)

        # Assert
        emails = [r["email"] for r in recipients]
        assert "ba@example.com" in emails
        ba_recipient = next(r for r in recipients if r["email"] == "ba@example.com")
        assert ba_recipient["kind"] == "Business Area Leader"

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_directorate_recipients(self):
        """Test _get_directorate_recipients includes director"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory, DivisionFactory
        from documents.services.notification_service import NotificationService

        director = UserFactory(
            first_name="Director", last_name="User", email="director@example.com"
        )
        division = DivisionFactory(director=director)
        business_area = BusinessAreaFactory(division=division)
        project = ProjectFactory(business_area=business_area)
        document = ProjectDocumentFactory(project=project)

        # Act
        recipients = NotificationService._get_directorate_recipients(document)

        # Assert
        assert len(recipients) == 1
        assert recipients[0]["email"] == "director@example.com"
        assert recipients[0]["kind"] == "Director"

    @pytest.mark.django_db
    @pytest.mark.unit
    def test_get_directorate_recipients_no_division(self):
        """Test _get_directorate_recipients returns empty when no division"""
        # Arrange
        from common.tests.factories import BusinessAreaFactory
        from documents.services.notification_service import NotificationService

        business_area = BusinessAreaFactory(division=None)
        project = ProjectFactory(business_area=business_area)
        document = ProjectDocumentFactory(project=project)

        # Act
        recipients = NotificationService._get_directorate_recipients(document)

        # Assert
        assert len(recipients) == 0

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_approver_recipients(self):
        """Test _get_approver_recipients includes project leaders"""
        # Arrange
        from documents.services.notification_service import NotificationService

        project = ProjectFactory()
        # Clear auto-generated members
        project.members.all().delete()

        leader = UserFactory(
            first_name="Lead", last_name="User", email="lead@example.com"
        )
        member = UserFactory(
            first_name="Team", last_name="Member", email="member@example.com"
        )

        project.members.create(user=leader, is_leader=True, role="supervising")
        project.members.create(user=member, is_leader=False, role="research")

        document = ProjectDocumentFactory(project=project)

        # Act
        recipients = NotificationService._get_approver_recipients(document)

        # Assert
        # Should only include leaders
        assert len(recipients) == 1
        assert recipients[0]["email"] == "lead@example.com"
        assert recipients[0]["kind"] == "Project Lead"

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_get_project_team_recipients(self):
        """Test _get_project_team_recipients includes all team members"""
        # Arrange
        from documents.services.notification_service import NotificationService

        project = ProjectFactory()
        # Clear auto-generated members
        project.members.all().delete()

        leader = UserFactory(
            first_name="Lead", last_name="User", email="lead@example.com"
        )
        member1 = UserFactory(
            first_name="Member", last_name="One", email="member1@example.com"
        )
        member2 = UserFactory(
            first_name="Member", last_name="Two", email="member2@example.com"
        )

        project.members.create(user=leader, is_leader=True, role="supervising")
        project.members.create(user=member1, is_leader=False, role="research")
        project.members.create(user=member2, is_leader=False, role="technical")

        # Act
        recipients = NotificationService._get_project_team_recipients(project)

        # Assert
        assert len(recipients) == 3
        emails = [r["email"] for r in recipients]
        assert "lead@example.com" in emails
        assert "member1@example.com" in emails
        assert "member2@example.com" in emails


class TestEmailService:
    """Test EmailService business logic"""

    @pytest.mark.django_db
    @patch("documents.services.email_service.send_email_with_embedded_image")
    @patch("documents.services.email_service.render_to_string")
    @pytest.mark.unit
    def test_send_template_email_success(self, mock_render, mock_send):
        """Test send_template_email sends email correctly"""
        # Arrange
        mock_render.return_value = "<html>Test email</html>"
        mock_send.return_value = None

        # Act
        result = EmailService.send_template_email(
            template_name="test_email.html",
            recipient_email=["test@example.com"],
            subject="Test Subject",
            context={"key": "value"},
        )

        # Assert
        assert result is True
        mock_render.assert_called_once()
        mock_send.assert_called_once()

    @pytest.mark.django_db
    @patch("documents.services.email_service.send_email_with_embedded_image")
    @patch("documents.services.email_service.render_to_string")
    @pytest.mark.unit
    def test_send_template_email_failure(self, mock_render, mock_send):
        """Test send_template_email raises error on failure"""
        # Arrange
        mock_render.return_value = "<html>Test email</html>"
        mock_send.side_effect = Exception("SMTP error")

        # Act & Assert
        with pytest.raises(EmailSendError):
            EmailService.send_template_email(
                template_name="test_email.html",
                recipient_email=["test@example.com"],
                subject="Test Subject",
                context={"key": "value"},
            )

    @pytest.mark.django_db
    @patch("documents.services.email_service.EmailService.send_template_email")
    @pytest.mark.integration
    def test_send_document_notification(self, mock_send):
        """Test send_document_notification sends to all recipients"""
        # Arrange
        user = UserFactory()
        concept_plan = ConceptPlanFactory()
        recipients = [
            {"name": "User 1", "email": "user1@example.com", "kind": "Project Lead"},
            {"name": "User 2", "email": "user2@example.com", "kind": "Team Member"},
        ]

        # Act
        EmailService.send_document_notification(
            notification_type="approved",
            document=concept_plan.document,
            recipients=recipients,
            actioning_user=user,
        )

        # Assert
        assert mock_send.call_count == 2

    @pytest.mark.django_db
    @pytest.mark.integration
    def test_send_document_notification_invalid_type(self):
        """Test send_document_notification fails for invalid type"""
        # Arrange
        user = UserFactory()
        concept_plan = ConceptPlanFactory()
        recipients = [{"name": "User", "email": "user@example.com"}]

        # Act & Assert
        with pytest.raises(ValueError):
            EmailService.send_document_notification(
                notification_type="invalid_type",
                document=concept_plan.document,
                recipients=recipients,
                actioning_user=user,
            )
