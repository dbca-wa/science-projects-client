"""
Preservation property tests — baseline behaviour of the file upload system.

These tests verify non-buggy paths that must continue to work correctly:
no-change saves, file replacement on existing instances, validation errors,
and size field correctness.
"""

import re
from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from common.utils.file_validation import FileValidationError
from medias.models import ProjectPhoto

# Content-hash filename pattern: {stem}_{8-hex-chars}{ext}
CONTENT_HASH_PATTERN = re.compile(r"^.+_[0-9a-f]{8}\.\w+$")

# Minimal valid JPEG: starts with FF D8 FF magic bytes
JPEG_CONTENT = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    + b"\x00" * 100
)

# Different JPEG content for replacement tests
JPEG_CONTENT_ALT = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    + b"\xff" * 80
    + b"\x00" * 20
)


def _mock_validate_image(path, name, max_size=None):
    """Bypass real file validation for synthetic JPEG content."""
    return (name, "image/jpeg")


def _mock_validate_image_fail(path, name, max_size=None):
    """Simulate validation failure (e.g. wrong magic bytes)."""
    raise FileValidationError("Invalid file: wrong magic bytes")


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
    from django.core.files.storage import default_storage

    return default_storage


@pytest.mark.django_db
class TestPreservationNoChangeSave:
    """
    Saving an existing ProjectPhoto without changing the file should
    trigger zero new storage writes.
    """

    @patch("medias.models.validate_image_upload", side_effect=_mock_validate_image)
    def test_no_change_save_zero_writes(self, _mock_val, project, memory_storage):
        """Re-saving an existing instance without file change writes no new files."""
        # Create and save a new photo (this writes files to storage)
        photo = ProjectPhoto(project=project)
        photo.file = SimpleUploadedFile(
            "photo.jpg", JPEG_CONTENT, content_type="image/jpeg"
        )
        photo.save()

        # Record storage state after initial save
        files_before = _list_all_storage_files(memory_storage)

        # Re-save without changing the file
        photo.save()

        # Storage should have the same files — no new writes
        files_after = _list_all_storage_files(memory_storage)
        assert files_after == files_before, (
            f"Expected no new files after no-change save. "
            f"Before: {files_before}, After: {files_after}"
        )


@pytest.mark.django_db
class TestPreservationFileReplacement:
    """
    Replacing a file on an existing ProjectPhoto (pk is not None) should
    delete the old file and write a new file with a content-hashed name.
    """

    @patch("medias.models.validate_image_upload", side_effect=_mock_validate_image)
    def test_file_replacement_deletes_old_writes_new(
        self, _mock_val, project, memory_storage
    ):
        """Replacing a file on an existing instance cleans up the old file."""
        # Create and save initial photo
        photo = ProjectPhoto(project=project)
        photo.file = SimpleUploadedFile(
            "photo.jpg", JPEG_CONTENT, content_type="image/jpeg"
        )
        photo.save()

        _list_all_storage_files(memory_storage)
        old_file_name = photo.file.name

        # Replace the file with different content
        photo.file = SimpleUploadedFile(
            "photo_new.jpg", JPEG_CONTENT_ALT, content_type="image/jpeg"
        )
        photo.save()

        files_after_replace = _list_all_storage_files(memory_storage)

        # The old file should be gone
        assert old_file_name not in files_after_replace, (
            f"Old file '{old_file_name}' should have been deleted after replacement. "
            f"Files in storage: {files_after_replace}"
        )

        # The new file should have a content-hashed name
        new_file_name = photo.file.name.split("/")[-1]
        assert CONTENT_HASH_PATTERN.match(
            new_file_name
        ), f"New filename should match content-hash pattern, got: {new_file_name}"


@pytest.mark.django_db
class TestPreservationValidationError:
    """
    Uploading an invalid file should raise FileValidationError and
    write zero files to storage.
    """

    @patch(
        "medias.models.validate_image_upload",
        side_effect=_mock_validate_image_fail,
    )
    def test_invalid_file_raises_error_zero_writes(
        self, _mock_val, project, memory_storage
    ):
        """Invalid file upload raises FileValidationError, no files written."""
        photo = ProjectPhoto(project=project)
        photo.file = SimpleUploadedFile(
            "bad_file.jpg", b"\x00\x00\x00\x00BAD_CONTENT", content_type="image/jpeg"
        )

        with pytest.raises(FileValidationError):
            photo.save()

        files = _list_all_storage_files(memory_storage)
        assert (
            len(files) == 0
        ), f"Expected zero files after validation error, found {len(files)}: {files}"


@pytest.mark.django_db
class TestPreservationSizeField:
    """
    After a successful save, instance.size should equal the file's byte length.
    """

    @patch("medias.models.validate_image_upload", side_effect=_mock_validate_image)
    def test_size_field_matches_file_bytes(self, _mock_val, project, memory_storage):
        """instance.size equals the actual file byte length after save."""
        photo = ProjectPhoto(project=project)
        photo.file = SimpleUploadedFile(
            "photo.jpg", JPEG_CONTENT, content_type="image/jpeg"
        )
        photo.save()

        assert photo.size == len(
            JPEG_CONTENT
        ), f"Expected size={len(JPEG_CONTENT)}, got size={photo.size}"
