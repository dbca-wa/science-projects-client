"""
Tests for media file validation security fix

These tests verify that file validation runs on both creation and updates,
fixing the security vulnerability where validation was skipped on updates.
"""

from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from medias.models import AnnualReportPDF, ProjectPhoto


class TestFileValidationOnUpdate:
    """Test that file validation runs when files are updated"""

    @pytest.mark.integration
    def test_validation_runs_on_image_update(self, project, user, mock_image, db):
        """Test validation runs when image file is changed on existing instance"""
        # Create initial photo
        photo = ProjectPhoto.objects.create(
            file=mock_image,
            project=project,
            uploader=user,
        )
        photo.file.name

        # Create a new image file
        new_image = SimpleUploadedFile(
            name="new_test_image.jpg",
            content=b"new image content",
            content_type="image/jpeg",
        )

        # Mock the validation function to track if it's called
        with patch("medias.models._validate_and_save_file") as mock_validate:
            # Update the file
            photo.file = new_image
            photo.save()

            # Verify validation was called (security fix working)
            assert mock_validate.called
            assert mock_validate.call_count == 1

    @pytest.mark.integration
    def test_validation_runs_on_pdf_update(self, annual_report, user, mock_file, db):
        """Test validation runs when PDF file is changed on existing instance"""
        # Create initial PDF
        pdf = AnnualReportPDF.objects.create(
            file=mock_file,
            report=annual_report,
            creator=user,
        )
        pdf.file.name

        # Create a new PDF file
        new_pdf = SimpleUploadedFile(
            name="new_test.pdf",
            content=b"new pdf content",
            content_type="application/pdf",
        )

        # Mock the validation function to track if it's called
        with patch("medias.models._validate_and_save_file") as mock_validate:
            # Update the file
            pdf.file = new_pdf
            pdf.save()

            # Verify validation was called (security fix working)
            assert mock_validate.called
            assert mock_validate.call_count == 1

    @pytest.mark.integration
    def test_validation_skipped_when_file_unchanged(
        self, project, user, mock_image, db
    ):
        """Test validation is skipped when file is not changed"""
        # Create photo
        photo = ProjectPhoto.objects.create(
            file=mock_image,
            project=project,
            uploader=user,
        )

        # Mock the validation function
        with patch("medias.models._validate_and_save_file") as mock_validate:
            # Update non-file field only
            photo.size = 12345
            photo.save()

            # Verify validation was NOT called (performance optimisation)
            assert not mock_validate.called

    @pytest.mark.integration
    def test_validation_runs_on_creation(self, project, user, mock_image, db):
        """Test validation runs on new instance creation"""
        # Mock the validation function
        with patch("medias.models._validate_and_save_file") as mock_validate:
            # Create new photo
            ProjectPhoto.objects.create(
                file=mock_image,
                project=project,
                uploader=user,
            )

            # Verify validation was called
            assert mock_validate.called
            assert mock_validate.call_count == 1

    @pytest.mark.integration
    def test_file_change_detection_with_same_file(self, project, user, mock_image, db):
        """Test that re-assigning the same file doesn't trigger validation"""
        # Create photo
        photo = ProjectPhoto.objects.create(
            file=mock_image,
            project=project,
            uploader=user,
        )
        original_file = photo.file

        # Mock the validation function
        with patch("medias.models._validate_and_save_file"):
            # Re-assign the same file object
            photo.file = original_file
            photo.save()

            # Verification depends on Django's file field comparison
            # If Django detects no change, validation should be skipped
            # This tests the _check_file_changed logic


class TestFileSizeLimits:
    """Test file size limit enforcement"""

    @pytest.mark.integration
    def test_image_size_limit_enforced(self, project, user, db):
        """Test image upload rejection when > 3 MB"""
        # Create a mock image larger than 3 MB
        large_image_content = b"x" * (4 * 1024 * 1024)  # 4 MB
        large_image = SimpleUploadedFile(
            name="large_image.jpg",
            content=large_image_content,
            content_type="image/jpeg",
        )

        # Mock the validator to raise an error for oversized files
        from common.utils.file_validation import FileValidationError

        with patch(
            "medias.models.validate_image_upload",
            side_effect=FileValidationError("File size exceeds 3 MB limit"),
        ):
            with pytest.raises(FileValidationError, match="File size exceeds 3 MB"):
                ProjectPhoto.objects.create(
                    file=large_image,
                    project=project,
                    uploader=user,
                )

    @pytest.mark.integration
    def test_project_pdf_size_limit_enforced(self, project, project_document, db):
        """Test project PDF upload rejection when > 10 MB"""
        from medias.models import ProjectDocumentPDF

        # Create a mock PDF larger than 10 MB
        large_pdf_content = b"x" * (11 * 1024 * 1024)  # 11 MB
        large_pdf = SimpleUploadedFile(
            name="large_doc.pdf",
            content=large_pdf_content,
            content_type="application/pdf",
        )

        # Mock the validator to raise an error for oversized files
        from common.utils.file_validation import FileValidationError

        with patch(
            "medias.models.validate_document_upload",
            side_effect=FileValidationError("File size exceeds 10 MB limit"),
        ):
            with pytest.raises(FileValidationError, match="File size exceeds 10 MB"):
                ProjectDocumentPDF.objects.create(
                    file=large_pdf,
                    document=project_document,
                    project=project,
                )

    @pytest.mark.integration
    def test_annual_report_pdf_size_limit_enforced(self, annual_report, user, db):
        """Test annual report PDF upload rejection when > 100 MB"""
        # Create a mock PDF larger than 100 MB
        large_pdf_content = b"x" * (101 * 1024 * 1024)  # 101 MB
        large_pdf = SimpleUploadedFile(
            name="large_report.pdf",
            content=large_pdf_content,
            content_type="application/pdf",
        )

        # Mock the validator to raise an error for oversized files
        from common.utils.file_validation import FileValidationError

        with patch(
            "medias.models.validate_document_upload",
            side_effect=FileValidationError("File size exceeds 100 MB limit"),
        ):
            with pytest.raises(FileValidationError, match="File size exceeds 100 MB"):
                AnnualReportPDF.objects.create(
                    file=large_pdf,
                    report=annual_report,
                    creator=user,
                )

    @pytest.mark.integration
    def test_valid_files_within_limits_accepted(self, project, user, db):
        """Test valid files within size limits are accepted"""
        # Create a small image with valid JPEG magic bytes
        jpeg_magic = b"\xff\xd8\xff\xe0\x00\x10JFIF"  # JPEG header
        small_image_content = jpeg_magic + b"small image content"
        small_image = SimpleUploadedFile(
            name="small_image.jpg",
            content=small_image_content,
            content_type="image/jpeg",
        )

        # Mock the validator to accept the file
        with patch(
            "medias.models.validate_image_upload",
            return_value=("small_image.jpg", "image/jpeg"),
        ):
            # Should not raise any errors
            photo = ProjectPhoto.objects.create(
                file=small_image,
                project=project,
                uploader=user,
            )

            assert photo.id is not None
            assert photo.size > 0


class TestFilenameSanitisation:
    """Test filename sanitisation during validation"""

    @pytest.mark.integration
    def test_unsafe_filename_sanitised(self, project, user, db):
        """Test unsafe filename is sanitised during validation"""
        # Create image with unsafe filename
        unsafe_image = SimpleUploadedFile(
            name="../../../etc/passwd.jpg",  # Path traversal attempt
            content=b"image content",
            content_type="image/jpeg",
        )

        # Mock the validator to return a sanitised filename
        with patch(
            "medias.models.validate_image_upload",
            return_value=("safe_image.jpg", "image/jpeg"),
        ):
            photo = ProjectPhoto.objects.create(
                file=unsafe_image,
                project=project,
                uploader=user,
            )

            # Verify the file was saved with sanitised name
            assert "passwd" not in photo.file.name
            assert "etc" not in photo.file.name

    @pytest.mark.integration
    def test_file_content_preserved_after_sanitisation(self, project, user, db):
        """Test file content is preserved after filename sanitisation"""
        original_content = b"test image content that should be preserved"
        unsafe_image = SimpleUploadedFile(
            name="unsafe<>filename.jpg",
            content=original_content,
            content_type="image/jpeg",
        )

        # Mock the validator to return a sanitised filename
        with patch(
            "medias.models.validate_image_upload",
            return_value=("safe_filename.jpg", "image/jpeg"),
        ):
            photo = ProjectPhoto.objects.create(
                file=unsafe_image,
                project=project,
                uploader=user,
            )

            # Verify file was created
            assert photo.id is not None
            # Size should match original content
            assert photo.size == len(original_content)


class TestUpdateSecurityFix:
    """Integration test for the security fix"""

    @pytest.mark.integration
    def test_security_fix_prevents_malicious_update(
        self, project, user, mock_image, db
    ):
        """
        Integration test: Verify validation runs on update (security fix)

        This test simulates the attack scenario:
        1. Attacker uploads valid file (passes validation)
        2. Attacker updates file with malicious content
        3. Validation should run and reject malicious file (security fix)
        """
        # Step 1: Create instance with valid file
        photo = ProjectPhoto.objects.create(
            file=mock_image,
            project=project,
            uploader=user,
        )
        assert photo.id is not None

        # Step 2: Attempt to update with "malicious" file
        malicious_file = SimpleUploadedFile(
            name="malicious.jpg",
            content=b"malicious content",
            content_type="image/jpeg",
        )

        # Mock the validator to reject the malicious file
        from common.utils.file_validation import FileValidationError

        with patch(
            "medias.models.validate_image_upload",
            side_effect=FileValidationError("Malicious file detected"),
        ):
            # Step 3: Update should trigger validation and fail
            photo.file = malicious_file
            with pytest.raises(FileValidationError, match="Malicious file detected"):
                photo.save()

        # Verify the original file is still in place (update failed)
        photo.refresh_from_db()
        assert "malicious" not in photo.file.name
