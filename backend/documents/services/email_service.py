"""
Email service - Abstraction layer for email sending

This service provides a clean interface for sending emails,
making it easy to swap email providers or modify email logic.
"""

from django.conf import settings
from django.template.loader import render_to_string

from config.helpers import send_email_with_embedded_image


class EmailService:
    """Centralized email sending service"""

    @staticmethod
    def _get_base_context():
        """Returns base context variables shared across all email templates.

        Uses logo_url=True as a truthy flag so templates render the logo block.
        The actual image is delivered via CID attachment (src="cid:dbca-logo")
        handled by send_email_with_embedded_image().
        """
        return {
            "logo_url": True,
            "site_url": settings.SITE_URL,
            "site_name": "SPMS",
        }

    @staticmethod
    def send_template_email(
        template_name: str,
        recipient_email: list[str],
        subject: str,
        context: dict,
        from_email: str = None,
    ) -> bool:
        """
        Send email using HTML template

        Args:
            template_name: Template file name (e.g., 'document_approved_email.html')
            recipient_email: List of recipient email addresses
            subject: Email subject line
            context: Template context dictionary
            from_email: Sender email (defaults to settings.DEFAULT_FROM_EMAIL)

        Returns:
            bool: True if email sent successfully

        Raises:
            EmailSendError: If email fails to send
        """
        if from_email is None:
            from_email = settings.DEFAULT_FROM_EMAIL

        # Merge base context (logo_url, site_url, site_name) into template context
        merged_context = {**EmailService._get_base_context(), **context}

        # Render template
        template_path = f"./email_templates/{template_name}"
        html_content = render_to_string(template_path, merged_context)

        # Send email
        try:
            send_email_with_embedded_image(
                recipient_email=recipient_email,
                subject=subject,
                html_content=html_content,
            )
            return True
        except Exception as e:
            settings.LOGGER.error(f"Email send failed: {e}")
            raise EmailSendError("Failed to send email. Please try again.")

    @staticmethod
    def send_document_notification(
        notification_type: str,
        document,
        recipients: list[dict],
        actioning_user,
        additional_context: dict = None,
    ):
        """
        Send document-related notification

        Args:
            notification_type: Type of notification (approved, recalled, etc.)
            document: Document instance
            recipients: List of recipient dicts with 'name' and 'email'
            actioning_user: User performing the action
            additional_context: Additional template context
        """
        # Map notification types to templates
        template_map = {
            "approved": "document_approved_email.html",
            "approved_directorate": "document_approved_directorate_email.html",
            "recalled": "document_recalled_email.html",
            "sent_back": "document_sent_back_email.html",
            "ready": "document_ready_email.html",
            "feedback": "feedback_received_email.html",
            "review": "review_document_email.html",
            "bump": "bump_email.html",
            "mention": "document_comment_mention.html",
            "new_cycle": "new_cycle_open_email.html",
            "project_closed": "project_closed_email.html",
            "project_reopened": "project_reopened_email.html",
            "spms_invite": "spms_link_email.html",
        }

        template_name = template_map.get(notification_type)
        if not template_name:
            raise ValueError(f"Unknown notification type: {notification_type}")

        # Build context
        context = {
            "document": document,
            "actioning_user": actioning_user,
            "actioning_user_email": actioning_user.email,
            "actioning_user_name": (
                actioning_user.get_full_name()
                if hasattr(actioning_user, "get_full_name")
                else str(actioning_user)
            ),
            **(additional_context or {}),
        }

        # Send to each recipient
        for recipient in recipients:
            context["recipient_name"] = recipient["name"]
            context["user_kind"] = recipient.get("kind", "User")

            EmailService.send_template_email(
                template_name=template_name,
                recipient_email=[recipient["email"]],
                subject=context.get("email_subject", f"Document {notification_type}"),
                context=context,
            )


class EmailSendError(Exception):
    """Custom exception for email sending failures"""
