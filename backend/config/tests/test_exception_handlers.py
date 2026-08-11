"""
Tests for the custom DRF exception handler.
"""

from unittest.mock import Mock

import pytest
from rest_framework.exceptions import NotFound

from common.utils.file_validation import FileValidationError
from config.exception_handlers import api_exception_handler


def _valid_jpeg_over(min_bytes):
    """
    Build a real JPEG larger than min_bytes. Random pixel data is used because
    noise does not compress, which keeps the file big at high quality.
    """
    import random
    from io import BytesIO

    from django.core.files.uploadedfile import SimpleUploadedFile
    from PIL import Image

    side = 1400
    rand = random.Random(7)
    image = Image.new("RGB", (side, side))
    image.putdata(
        [
            (rand.randrange(256), rand.randrange(256), rand.randrange(256))
            for _ in range(side * side)
        ]
    )
    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=100, subsampling=0)
    data = buffer.getvalue()
    assert len(data) > min_bytes, f"only produced {len(data)} bytes"
    return SimpleUploadedFile("huge.jpg", data, content_type="image/jpeg")


@pytest.mark.unit
class TestApiExceptionHandler:
    """Tests for api_exception_handler"""

    def test_file_validation_error_becomes_400(self):
        """A rejected upload is a client error, not a server fault."""
        exc = FileValidationError(
            "File size (4.71MB) exceeds maximum allowed size (3.00MB)"
        )

        response = api_exception_handler(exc, {"view": Mock()})

        assert response is not None
        assert response.status_code == 400

    def test_file_validation_error_keeps_the_message(self):
        """The caller needs to know what was wrong with the file."""
        exc = FileValidationError("File type not allowed: application/pdf")

        response = api_exception_handler(exc, {"view": Mock()})

        assert "application/pdf" in response.data["error"]

    def test_drf_exceptions_are_unchanged(self):
        """Exceptions DRF already understands keep their own handling."""
        response = api_exception_handler(NotFound("nope"), {"view": Mock()})

        assert response is not None
        assert response.status_code == 404

    def test_unknown_exceptions_still_propagate(self):
        """Anything else returns None so Django surfaces the real error."""
        response = api_exception_handler(RuntimeError("boom"), {"view": Mock()})

        assert response is None


@pytest.mark.django_db
@pytest.mark.integration
class TestMediaUploadsReturn400:
    """
    File validation runs in model.save(), so every media endpoint depended on
    the handler to avoid returning a 500 for a rejected upload.
    """

    def test_oversized_avatar_returns_400(self, tmp_path, settings):
        """
        The file must be a genuinely valid JPEG, otherwise DRF's ImageField
        rejects it with a 400 of its own and the size check is never reached.
        """
        from rest_framework.test import APIClient

        from common.tests.factories import UserFactory
        from medias.models import IMAGE_MAX_SIZE

        settings.MEDIA_ROOT = str(tmp_path)
        user = UserFactory()
        client = APIClient()
        client.force_authenticate(user=user)

        oversized = _valid_jpeg_over(IMAGE_MAX_SIZE)
        assert oversized.size > IMAGE_MAX_SIZE

        response = client.post(
            "/api/v1/medias/user_avatars",
            data={"user": user.pk, "file": oversized},
            format="multipart",
        )

        assert response.status_code == 400, f"Got {response.status_code}"
        assert "exceeds maximum" in str(response.data)
