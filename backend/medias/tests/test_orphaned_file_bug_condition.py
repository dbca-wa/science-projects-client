"""
Tests for orphaned file double-write during new model instance uploads.

Verifies that new model instance uploads write exactly one file to storage
with a content-hashed filename, and do not leave behind an orphaned
intermediate file from the sanitised-name write step.
"""

import re
from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from medias.models import ProjectDocumentPDF, ProjectPhoto, UserAvatar

# Content-hash filename pattern: {stem}_{8-hex-chars}{ext}
CONTENT_HASH_PATTERN = re.compile(r"^.+_[0-9a-f]{8}\.\w+$")

# Minimal valid JPEG: starts with FF D8 FF magic bytes
JPEG_CONTENT = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    + b"\x00" * 100
)

# Minimal valid PDF: starts with %PDF- magic bytes
PDF_CONTENT = (
    b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    b"1 0 obj\n<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj\n<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
    b"3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]"
    b"/Parent 2 0 R/Resources<<>>>>endobj\n"
    b"xref\n0 4\n"
    b"0000000000 65535 f\n0000000015 00000 n\n"
    b"0000000068 00000 n\n0000000127 00000 n\n"
    b"trailer\n<</Size 4/Root 1 0 R>>\nstartxref\n225\n%%EOF"
)


def _mock_validate_image(path, name, max_size=None):
    """Bypass real file validation for synthetic JPEG content."""
    return (name, "image/jpeg")


def _mock_validate_document(path, name, max_size=None):
    """Bypass real file validation for synthetic PDF content."""
    return (name, "application/pdf")


def _list_all_storage_files(storage, prefix=""):
    """Recursively list every file in an InMemoryStorage instance."""
    dirs, files = storage.listdir(prefix)
    all_files = [f"{prefix}/{f}" if prefix else f for f in files]
    for d in dirs:
        sub = f"{prefix}/{d}" if prefix else d
        all_files.extend(_list_all_storage_files(storage, sub))
    return all_files


@pytest.fixture
def memory_storage(settings):
    """Configure InMemoryStorage as the default storage backend."""
    settings.STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.InMemoryStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
    # Import after settings change to get the reconfigured storage
    from django.core.files.storage import default_storage

    return default_storage


@pytest.mark.django_db
class TestOrphanedFileBugCondition:
    """
    New instance uploads should produce exactly one file in storage
    with a content-hashed name and no orphaned intermediate files.
    """

    @patch("medias.models.validate_image_upload", side_effect=_mock_validate_image)
    def test_new_project_photo_single_file(self, _mock_val, project, memory_storage):
        """New ProjectPhoto upload should write exactly 1 file."""
        photo = ProjectPhoto(project=project)
        photo.file = SimpleUploadedFile(
            "photo.jpg", JPEG_CONTENT, content_type="image/jpeg"
        )
        photo.save()

        files = _list_all_storage_files(memory_storage)
        assert (
            len(files) == 1
        ), f"Expected exactly 1 file in storage, found {len(files)}: {files}"
        filename = files[0].split("/")[-1]
        assert CONTENT_HASH_PATTERN.match(
            filename
        ), f"Filename should match content-hash pattern, got: {files[0]}"

    @patch("medias.models.validate_image_upload", side_effect=_mock_validate_image)
    def test_new_user_avatar_single_file(self, _mock_val, user, memory_storage):
        """New UserAvatar upload should write exactly 1 file."""
        avatar = UserAvatar(user=user)
        avatar.file = SimpleUploadedFile(
            "avatar.jpg", JPEG_CONTENT, content_type="image/jpeg"
        )
        avatar.save()

        files = _list_all_storage_files(memory_storage)
        assert (
            len(files) == 1
        ), f"Expected exactly 1 file in storage, found {len(files)}: {files}"
        filename = files[0].split("/")[-1]
        assert CONTENT_HASH_PATTERN.match(
            filename
        ), f"Filename should match content-hash pattern, got: {files[0]}"

    @patch(
        "medias.models.validate_document_upload",
        side_effect=_mock_validate_document,
    )
    def test_new_project_document_pdf_single_file(
        self, _mock_val, project, project_document, memory_storage
    ):
        """New ProjectDocumentPDF upload should write exactly 1 file."""
        pdf = ProjectDocumentPDF(
            document=project_document,
            project=project,
        )
        pdf.file = SimpleUploadedFile(
            "report.pdf", PDF_CONTENT, content_type="application/pdf"
        )
        pdf.save()

        files = _list_all_storage_files(memory_storage)
        assert (
            len(files) == 1
        ), f"Expected exactly 1 file in storage, found {len(files)}: {files}"
        filename = files[0].split("/")[-1]
        assert CONTENT_HASH_PATTERN.match(
            filename
        ), f"Filename should match content-hash pattern, got: {files[0]}"
