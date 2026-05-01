"""
Tests for the email helper functions in config/helpers.py.

Focuses on send_email_with_embedded_image which is the single gateway
for all outgoing emails. Tests verify:
- Test mode redirection
- Test mode deduplication
- Test mode banner injection
- Normal mode passthrough
- Logo CID attachment
"""

from unittest.mock import MagicMock, mock_open, patch

import pytest


@pytest.fixture
def mock_admin_opts_test_mode(db):
    """Create AdminOptions with test mode enabled."""
    from adminoptions.models import AdminOptions
    from common.tests.factories import UserFactory

    test_user = UserFactory(
        username="test_recipient",
        email="test@dbca.wa.gov.au",
        first_name="Test",
        last_name="Recipient",
    )
    opts = AdminOptions.objects.create(
        email_testing_mode=True,
        email_test_user=test_user,
    )
    return opts, test_user


@pytest.fixture
def mock_admin_opts_normal(db):
    """Create AdminOptions with test mode disabled."""
    from adminoptions.models import AdminOptions

    return AdminOptions.objects.create(
        email_testing_mode=False,
        email_test_user=None,
    )


class TestSendEmailWithEmbeddedImage:
    """Tests for the send_email_with_embedded_image function."""

    @patch("config.helpers.EmailMultiAlternatives")
    @patch("os.path.exists", return_value=False)
    @pytest.mark.integration
    def test_normal_mode_sends_to_original_recipient(
        self, mock_exists, mock_email_cls, mock_admin_opts_normal
    ):
        """In normal mode, email goes to the original recipient."""
        from config.helpers import send_email_with_embedded_image

        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg

        send_email_with_embedded_image(
            recipient_email=["user@dbca.wa.gov.au"],
            subject="Test Subject",
            html_content="<p>Hello</p>",
        )

        mock_email_cls.assert_called_once()
        call_args = mock_email_cls.call_args
        # Fourth positional arg is recipient list
        assert call_args[0][3] == ["user@dbca.wa.gov.au"]
        mock_msg.send.assert_called_once()

    @patch("config.helpers.EmailMultiAlternatives")
    @patch("os.path.exists", return_value=False)
    @patch("django.core.cache.cache.get", return_value=None)
    @patch("django.core.cache.cache.set")
    @pytest.mark.integration
    def test_test_mode_redirects_to_test_user(
        self,
        mock_cache_set,
        mock_cache_get,
        mock_exists,
        mock_email_cls,
        mock_admin_opts_test_mode,
    ):
        """In test mode, email is redirected to the test user."""
        from config.helpers import send_email_with_embedded_image

        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg
        _, test_user = mock_admin_opts_test_mode

        send_email_with_embedded_image(
            recipient_email=["original@dbca.wa.gov.au"],
            subject="Test Subject",
            html_content="<p>Hello</p>",
        )

        mock_email_cls.assert_called_once()
        call_args = mock_email_cls.call_args
        # Recipient should be redirected to test user
        assert call_args[0][3] == [test_user.email]
        # Subject should have [TEST] prefix
        assert call_args[0][0].startswith("[TEST]")
        mock_msg.send.assert_called_once()

    @patch("config.helpers.EmailMultiAlternatives")
    @patch("os.path.exists", return_value=False)
    @patch("django.core.cache.cache.get", return_value=True)
    @pytest.mark.integration
    def test_test_mode_deduplication_skips_duplicate(
        self,
        mock_cache_get,
        mock_exists,
        mock_email_cls,
        mock_admin_opts_test_mode,
    ):
        """In test mode, duplicate emails (same subject within window) are skipped."""
        from config.helpers import send_email_with_embedded_image

        send_email_with_embedded_image(
            recipient_email=["original@dbca.wa.gov.au"],
            subject="Duplicate Subject",
            html_content="<p>Hello</p>",
        )

        # Email should NOT be sent (dedup cache hit)
        mock_email_cls.assert_not_called()

    @patch("config.helpers.EmailMultiAlternatives")
    @patch("os.path.exists", return_value=False)
    @patch("django.core.cache.cache.get", return_value=None)
    @patch("django.core.cache.cache.set")
    @pytest.mark.integration
    def test_test_mode_injects_banner(
        self,
        mock_cache_set,
        mock_cache_get,
        mock_exists,
        mock_email_cls,
        mock_admin_opts_test_mode,
    ):
        """In test mode, a test banner is injected into the HTML content."""
        from config.helpers import send_email_with_embedded_image

        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg

        send_email_with_embedded_image(
            recipient_email=["original@dbca.wa.gov.au"],
            subject="Banner Test",
            html_content='<html><body style="margin:0"><p>Hello</p></body></html>',
        )

        # Check that attach_alternative was called with HTML containing the test banner
        attach_call = mock_msg.attach_alternative.call_args
        html_content = attach_call[0][0]
        assert "Test Mode" in html_content
        assert "redirected" in html_content
        assert "original@dbca.wa.gov.au" in html_content

    @patch("config.helpers.EmailMultiAlternatives")
    @pytest.mark.integration
    def test_logo_attachment_when_file_exists(
        self, mock_email_cls, mock_admin_opts_normal
    ):
        """Logo should be attached as CID image when file exists."""
        from config.helpers import send_email_with_embedded_image

        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg

        # Mock os.path.exists to return True for logo, and provide fake image data
        with (
            patch("os.path.exists", return_value=True),
            patch("builtins.open", mock_open(read_data=b"\x89PNG\r\n")),
        ):
            send_email_with_embedded_image(
                recipient_email=["user@dbca.wa.gov.au"],
                subject="Logo Test",
                html_content="<p>Hello</p>",
            )

        # Should have attached the logo image
        assert mock_msg.attach.called

    @patch("config.helpers.EmailMultiAlternatives")
    @patch("os.path.exists", return_value=False)
    @pytest.mark.integration
    def test_no_logo_when_file_missing(
        self, mock_exists, mock_email_cls, mock_admin_opts_normal
    ):
        """Email should still send when logo file is missing."""
        from config.helpers import send_email_with_embedded_image

        mock_msg = MagicMock()
        mock_email_cls.return_value = mock_msg

        send_email_with_embedded_image(
            recipient_email=["user@dbca.wa.gov.au"],
            subject="No Logo Test",
            html_content="<p>Hello</p>",
        )

        mock_msg.send.assert_called_once()
        # Logo should NOT be attached
        assert not mock_msg.attach.called
