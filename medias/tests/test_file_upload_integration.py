"""
Integration tests for file upload validation across all media models.

Tests cover:
- Project photos (images)
- Annual report media (images)
- Business area photos (images)
- Agency images (images)
- Methodology photos (images)
- User avatars (images)
- Project document PDFs (documents)
- Annual report PDFs (documents)
- AEC endorsement PDFs (documents)
"""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from common.utils.file_validation import FileValidationError
from medias.models import (
    AECEndorsementPDF,
    AgencyImage,
    AnnualReportMedia,
    AnnualReportPDF,
    BusinessAreaPhoto,
    ProjectDocumentPDF,
    ProjectPhoto,
    ProjectPlanMethodologyPhoto,
    UserAvatar,
)


@pytest.mark.django_db
class TestProjectPhotoUpload:
    """Integration tests for ProjectPhoto uploads."""

    def test_valid_jpeg_upload(self, user, project):
        """Test uploading valid JPEG image."""
        # Create valid JPEG file
        jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
        jpeg_file = SimpleUploadedFile(
            "project.jpg", jpeg_content, content_type="image/jpeg"
        )

        # Create ProjectPhoto
        photo = ProjectPhoto.objects.create(
            file=jpeg_file, project=project, uploader=user
        )

        assert photo.file is not None
        assert photo.size > 0
        assert photo.project == project

    def test_valid_png_upload(self, user, project):
        """Test uploading valid PNG image."""
        # Create valid PNG file
        png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 100
        png_file = SimpleUploadedFile(
            "project.png", png_content, content_type="image/png"
        )

        # Create ProjectPhoto
        photo = ProjectPhoto.objects.create(
            file=png_file, project=project, uploader=user
        )

        assert photo.file is not None
        assert photo.size > 0

    def test_invalid_file_type_rejected(self, user, project):
        """Test that non-image file is rejected."""
        # Create PDF file (not an image)
        pdf_content = b"%PDF-1.4\n" + b"\x00" * 100
        pdf_file = SimpleUploadedFile(
            "fake.jpg", pdf_content, content_type="image/jpeg"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            ProjectPhoto.objects.create(file=pdf_file, project=project, uploader=user)

    def test_extension_mismatch_rejected(self, user, project):
        """Test that extension mismatch is detected."""
        # Create JPEG with PNG extension
        jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
        fake_file = SimpleUploadedFile(
            "fake.png", jpeg_content, content_type="image/png"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            ProjectPhoto.objects.create(file=fake_file, project=project, uploader=user)


@pytest.mark.django_db
class TestAnnualReportMediaUpload:
    """Integration tests for AnnualReportMedia uploads."""

    def test_valid_image_upload(self, user, annual_report):
        """Test uploading valid image for annual report."""
        # Create valid JPEG file
        jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
        jpeg_file = SimpleUploadedFile(
            "cover.jpg", jpeg_content, content_type="image/jpeg"
        )

        # Create AnnualReportMedia
        media = AnnualReportMedia.objects.create(
            file=jpeg_file,
            kind=AnnualReportMedia.MediaTypes.COVER,
            report=annual_report,
            uploader=user,
        )

        assert media.file is not None
        assert media.size > 0
        assert media.kind == AnnualReportMedia.MediaTypes.COVER

    def test_invalid_file_rejected(self, user, annual_report):
        """Test that invalid file is rejected."""
        # Create invalid file
        invalid_content = b"not an image"
        invalid_file = SimpleUploadedFile(
            "invalid.jpg", invalid_content, content_type="image/jpeg"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            AnnualReportMedia.objects.create(
                file=invalid_file,
                kind=AnnualReportMedia.MediaTypes.COVER,
                report=annual_report,
                uploader=user,
            )


@pytest.mark.django_db
class TestUserAvatarUpload:
    """Integration tests for UserAvatar uploads."""

    def test_valid_avatar_upload(self, user):
        """Test uploading valid avatar image."""
        # Create valid JPEG file
        jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
        jpeg_file = SimpleUploadedFile(
            "avatar.jpg", jpeg_content, content_type="image/jpeg"
        )

        # Create UserAvatar
        avatar = UserAvatar.objects.create(file=jpeg_file, user=user)

        assert avatar.file is not None
        assert avatar.size > 0
        assert avatar.user == user

    def test_invalid_avatar_rejected(self, user):
        """Test that invalid avatar is rejected."""
        # Create PDF file (not an image)
        pdf_content = b"%PDF-1.4\n" + b"\x00" * 100
        pdf_file = SimpleUploadedFile(
            "avatar.jpg", pdf_content, content_type="image/jpeg"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            UserAvatar.objects.create(file=pdf_file, user=user)


@pytest.mark.django_db
class TestBusinessAreaPhotoUpload:
    """Integration tests for BusinessAreaPhoto uploads."""

    def test_valid_photo_upload(self, user, business_area):
        """Test uploading valid business area photo."""
        # Create valid PNG file
        png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 100
        png_file = SimpleUploadedFile(
            "business_area.png", png_content, content_type="image/png"
        )

        # Create BusinessAreaPhoto
        photo = BusinessAreaPhoto.objects.create(
            file=png_file, business_area=business_area, uploader=user
        )

        assert photo.file is not None
        assert photo.size > 0

    def test_invalid_photo_rejected(self, user, business_area):
        """Test that invalid photo is rejected."""
        # Create invalid file
        invalid_content = b"not an image"
        invalid_file = SimpleUploadedFile(
            "invalid.png", invalid_content, content_type="image/png"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            BusinessAreaPhoto.objects.create(
                file=invalid_file, business_area=business_area, uploader=user
            )


@pytest.mark.django_db
class TestAgencyImageUpload:
    """Integration tests for AgencyImage uploads."""

    def test_valid_image_upload(self, agency):
        """Test uploading valid agency image."""
        # Create valid JPEG file
        jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
        jpeg_file = SimpleUploadedFile(
            "agency.jpg", jpeg_content, content_type="image/jpeg"
        )

        # Create AgencyImage
        image = AgencyImage.objects.create(file=jpeg_file, agency=agency)

        assert image.file is not None
        assert image.size > 0

    def test_invalid_image_rejected(self, agency):
        """Test that invalid image is rejected."""
        # Create PDF file (not an image)
        pdf_content = b"%PDF-1.4\n" + b"\x00" * 100
        pdf_file = SimpleUploadedFile(
            "agency.jpg", pdf_content, content_type="image/jpeg"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            AgencyImage.objects.create(file=pdf_file, agency=agency)


@pytest.mark.django_db
class TestMethodologyPhotoUpload:
    """Integration tests for ProjectPlanMethodologyPhoto uploads."""

    def test_valid_photo_upload(self, user, project_plan):
        """Test uploading valid methodology photo."""
        # Create valid JPEG file
        jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
        jpeg_file = SimpleUploadedFile(
            "methodology.jpg", jpeg_content, content_type="image/jpeg"
        )

        # Create ProjectPlanMethodologyPhoto
        photo = ProjectPlanMethodologyPhoto.objects.create(
            file=jpeg_file, project_plan=project_plan, uploader=user
        )

        assert photo.file is not None
        assert photo.size > 0

    def test_invalid_photo_rejected(self, user, project_plan):
        """Test that invalid photo is rejected."""
        # Create invalid file
        invalid_content = b"not an image"
        invalid_file = SimpleUploadedFile(
            "invalid.jpg", invalid_content, content_type="image/jpeg"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            ProjectPlanMethodologyPhoto.objects.create(
                file=invalid_file, project_plan=project_plan, uploader=user
            )


@pytest.mark.django_db
class TestProjectDocumentPDFUpload:
    """Integration tests for ProjectDocumentPDF uploads."""

    def test_valid_pdf_upload(self, project, project_document):
        """Test uploading valid PDF document."""
        # Create valid PDF file
        pdf_content = b"%PDF-1.4\n" + b"\x00" * 100
        pdf_file = SimpleUploadedFile(
            "document.pdf", pdf_content, content_type="application/pdf"
        )

        # Create ProjectDocumentPDF
        pdf = ProjectDocumentPDF.objects.create(
            file=pdf_file, document=project_document, project=project
        )

        assert pdf.file is not None
        assert pdf.size > 0

    def test_invalid_pdf_rejected(self, project, project_document):
        """Test that invalid PDF is rejected."""
        # Create JPEG file (not a PDF)
        jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
        fake_pdf = SimpleUploadedFile(
            "document.pdf", jpeg_content, content_type="application/pdf"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            ProjectDocumentPDF.objects.create(
                file=fake_pdf, document=project_document, project=project
            )

    def test_extension_mismatch_rejected(self, project, project_document):
        """Test that extension mismatch is detected."""
        # Create PDF with JPG extension
        pdf_content = b"%PDF-1.4\n" + b"\x00" * 100
        fake_file = SimpleUploadedFile(
            "document.jpg", pdf_content, content_type="image/jpeg"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            ProjectDocumentPDF.objects.create(
                file=fake_file, document=project_document, project=project
            )


@pytest.mark.django_db
class TestAnnualReportPDFUpload:
    """Integration tests for AnnualReportPDF uploads."""

    def test_valid_pdf_upload(self, user, annual_report):
        """Test uploading valid annual report PDF."""
        # Create valid PDF file
        pdf_content = b"%PDF-1.4\n" + b"\x00" * 100
        pdf_file = SimpleUploadedFile(
            "annual_report.pdf", pdf_content, content_type="application/pdf"
        )

        # Create AnnualReportPDF
        pdf = AnnualReportPDF.objects.create(
            file=pdf_file, report=annual_report, creator=user
        )

        assert pdf.file is not None
        assert pdf.size > 0

    def test_invalid_pdf_rejected(self, user, annual_report):
        """Test that invalid PDF is rejected."""
        # Create invalid file
        invalid_content = b"not a pdf"
        invalid_file = SimpleUploadedFile(
            "invalid.pdf", invalid_content, content_type="application/pdf"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            AnnualReportPDF.objects.create(
                file=invalid_file, report=annual_report, creator=user
            )


@pytest.mark.django_db
class TestAECEndorsementPDFUpload:
    """Integration tests for AECEndorsementPDF uploads."""

    def test_valid_pdf_upload(self, user, endorsement):
        """Test uploading valid AEC endorsement PDF."""
        # Create valid PDF file
        pdf_content = b"%PDF-1.4\n" + b"\x00" * 100
        pdf_file = SimpleUploadedFile(
            "endorsement.pdf", pdf_content, content_type="application/pdf"
        )

        # Create AECEndorsementPDF
        pdf = AECEndorsementPDF.objects.create(
            file=pdf_file, endorsement=endorsement, creator=user
        )

        assert pdf.file is not None
        assert pdf.size > 0

    def test_invalid_pdf_rejected(self, user, endorsement):
        """Test that invalid PDF is rejected."""
        # Create JPEG file (not a PDF)
        jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100
        fake_pdf = SimpleUploadedFile(
            "endorsement.pdf", jpeg_content, content_type="application/pdf"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError):
            AECEndorsementPDF.objects.create(
                file=fake_pdf, endorsement=endorsement, creator=user
            )


@pytest.mark.django_db
class TestFileSizeValidation:
    """Integration tests for file size validation."""

    def test_oversized_image_rejected(self, user, project):
        """Test that oversized image is rejected."""
        # Create 11MB JPEG file (exceeds 10MB limit)
        large_content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * (11 * 1024 * 1024)
        large_file = SimpleUploadedFile(
            "large.jpg", large_content, content_type="image/jpeg"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError, match="exceeds maximum"):
            ProjectPhoto.objects.create(file=large_file, project=project, uploader=user)

    def test_oversized_pdf_rejected(self, user, annual_report):
        """Test that oversized PDF is rejected."""
        # Create 101MB PDF file (exceeds 100MB limit for annual reports)
        large_content = b"%PDF-1.4\n" + b"\x00" * (101 * 1024 * 1024)
        large_file = SimpleUploadedFile(
            "large.pdf", large_content, content_type="application/pdf"
        )

        # Should raise validation error
        with pytest.raises(FileValidationError, match="exceeds maximum"):
            AnnualReportPDF.objects.create(
                file=large_file, report=annual_report, creator=user
            )
