"""
Unit tests for file validation utilities.

Tests cover:
- Valid file uploads (images, documents)
- Invalid file types
- Extension mismatches
- File size validation
- Filename sanitisation
- Edge cases
"""

import pytest

from common.utils.file_validation import (
    FileValidationError,
    get_file_mime_type,
    sanitise_filename,
    validate_document_upload,
    validate_file_upload,
    validate_image_upload,
)


class TestGetFileMimeType:
    """Tests for MIME type detection using magic bytes."""

    def test_detect_jpeg_mime_type(self, tmp_path):
        """Test detection of JPEG image."""
        # JPEG magic bytes: FF D8 FF
        jpeg_file = tmp_path / "test.jpg"
        jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF")

        mime_type = get_file_mime_type(str(jpeg_file))
        assert mime_type == "image/jpeg"

    def test_detect_png_mime_type(self, tmp_path):
        """Test detection of PNG image."""
        # PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
        png_file = tmp_path / "test.png"
        png_file.write_bytes(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR")

        mime_type = get_file_mime_type(str(png_file))
        assert mime_type == "image/png"

    def test_detect_pdf_mime_type(self, tmp_path):
        """Test detection of PDF document."""
        # PDF magic bytes: 25 50 44 46 (%PDF)
        pdf_file = tmp_path / "test.pdf"
        pdf_file.write_bytes(b"%PDF-1.4\n")

        mime_type = get_file_mime_type(str(pdf_file))
        assert mime_type == "application/pdf"

    def test_nonexistent_file_raises_error(self):
        """Test that nonexistent file raises error."""
        with pytest.raises(FileValidationError, match="Could not determine file type"):
            get_file_mime_type("/nonexistent/file.jpg")


class TestSanitiseFilename:
    """Tests for filename sanitisation."""

    def test_sanitise_normal_filename(self):
        """Test that normal filename passes through."""
        result = sanitise_filename("document.pdf")
        assert result == "document.pdf"

    def test_remove_path_separators(self):
        """Test removal of path separators."""
        result = sanitise_filename("../../../etc/passwd")
        assert result == "etcpasswd"

    def test_remove_null_bytes(self):
        """Test removal of null bytes."""
        result = sanitise_filename("file\x00.pdf")
        assert result == "file.pdf"

    def test_remove_control_characters(self):
        """Test removal of control characters."""
        result = sanitise_filename("file\x01\x02\x03.pdf")
        assert result == "file.pdf"

    def test_strip_leading_trailing_dots(self):
        """Test stripping of leading/trailing dots."""
        result = sanitise_filename("...file.pdf...")
        assert result == "file.pdf"

    def test_strip_leading_trailing_spaces(self):
        """Test stripping of leading/trailing spaces."""
        result = sanitise_filename("   file.pdf   ")
        assert result == "file.pdf"

    def test_empty_filename_raises_error(self):
        """Test that empty filename raises error."""
        with pytest.raises(FileValidationError, match="Filename is empty"):
            sanitise_filename("")

    def test_only_dots_raises_error(self):
        """Test that filename with only dots raises error."""
        with pytest.raises(FileValidationError, match="Filename is empty"):
            sanitise_filename("...")

    def test_unicode_filename(self):
        """Test that Unicode characters are preserved."""
        result = sanitise_filename("文档.pdf")
        assert result == "文档.pdf"


class TestValidateFileUpload:
    """Tests for general file upload validation."""

    def test_valid_jpeg_upload(self, tmp_path):
        """Test validation of valid JPEG file."""
        jpeg_file = tmp_path / "photo.jpg"
        jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        sanitised_name, mime_type = validate_file_upload(str(jpeg_file), "photo.jpg")

        assert sanitised_name == "photo.jpg"
        assert mime_type == "image/jpeg"

    def test_valid_png_upload(self, tmp_path):
        """Test validation of valid PNG file."""
        png_file = tmp_path / "image.png"
        png_file.write_bytes(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 100)

        sanitised_name, mime_type = validate_file_upload(str(png_file), "image.png")

        assert sanitised_name == "image.png"
        assert mime_type == "image/png"

    def test_valid_pdf_upload(self, tmp_path):
        """Test validation of valid PDF file."""
        pdf_file = tmp_path / "document.pdf"
        pdf_file.write_bytes(b"%PDF-1.4\n" + b"\x00" * 100)

        sanitised_name, mime_type = validate_file_upload(str(pdf_file), "document.pdf")

        assert sanitised_name == "document.pdf"
        assert mime_type == "application/pdf"

    def test_extension_mismatch_raises_error(self, tmp_path):
        """Test that extension mismatch raises error."""
        # Create a JPEG file but name it .png
        jpeg_file = tmp_path / "fake.png"
        jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        with pytest.raises(
            FileValidationError,
            match="File extension '.png' does not match detected file type 'image/jpeg'",
        ):
            validate_file_upload(str(jpeg_file), "fake.png")

    def test_disallowed_mime_type_raises_error(self, tmp_path):
        """Test that disallowed MIME type raises error."""
        # Create an executable file (ELF magic bytes)
        exe_file = tmp_path / "malicious.exe"
        exe_file.write_bytes(b"\x7fELF" + b"\x00" * 100)

        with pytest.raises(FileValidationError, match="File type not allowed"):
            validate_file_upload(str(exe_file), "malicious.exe")

    def test_file_too_large_raises_error(self, tmp_path):
        """Test that oversized file raises error."""
        large_file = tmp_path / "large.jpg"
        # Create 11MB file (exceeds 10MB limit)
        large_file.write_bytes(
            b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * (11 * 1024 * 1024)
        )

        with pytest.raises(
            FileValidationError, match="File size .* exceeds maximum allowed size"
        ):
            validate_file_upload(str(large_file), "large.jpg")

    def test_empty_file_raises_error(self, tmp_path):
        """Test that empty file raises error."""
        empty_file = tmp_path / "empty.jpg"
        empty_file.write_bytes(b"")

        with pytest.raises(FileValidationError, match="File is empty"):
            validate_file_upload(str(empty_file), "empty.jpg")

    def test_no_extension_raises_error(self, tmp_path):
        """Test that file without extension raises error."""
        no_ext_file = tmp_path / "noextension"
        no_ext_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        with pytest.raises(FileValidationError, match="File has no extension"):
            validate_file_upload(str(no_ext_file), "noextension")

    def test_nonexistent_file_raises_error(self):
        """Test that nonexistent file raises error."""
        with pytest.raises(FileValidationError, match="File does not exist"):
            validate_file_upload("/nonexistent/file.jpg", "file.jpg")

    def test_filename_sanitisation(self, tmp_path):
        """Test that malicious filename is sanitised."""
        jpeg_file = tmp_path / "photo.jpg"
        jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        sanitised_name, mime_type = validate_file_upload(
            str(jpeg_file), "../../../etc/passwd.jpg"
        )

        assert sanitised_name == "etcpasswd.jpg"
        assert mime_type == "image/jpeg"

    def test_custom_max_size(self, tmp_path):
        """Test validation with custom max size."""
        small_file = tmp_path / "small.jpg"
        # Create 2KB file
        small_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 2000)

        # Should pass with 10KB limit
        sanitised_name, mime_type = validate_file_upload(
            str(small_file), "small.jpg", max_size=10 * 1024
        )
        assert sanitised_name == "small.jpg"

        # Should fail with 1KB limit
        with pytest.raises(FileValidationError, match="exceeds maximum allowed size"):
            validate_file_upload(str(small_file), "small.jpg", max_size=1024)


class TestValidateImageUpload:
    """Tests for image-specific validation."""

    def test_valid_jpeg_image(self, tmp_path):
        """Test validation of valid JPEG image."""
        jpeg_file = tmp_path / "photo.jpg"
        jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        sanitised_name, mime_type = validate_image_upload(str(jpeg_file), "photo.jpg")

        assert sanitised_name == "photo.jpg"
        assert mime_type == "image/jpeg"

    def test_valid_png_image(self, tmp_path):
        """Test validation of valid PNG image."""
        png_file = tmp_path / "image.png"
        png_file.write_bytes(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 100)

        sanitised_name, mime_type = validate_image_upload(str(png_file), "image.png")

        assert sanitised_name == "image.png"
        assert mime_type == "image/png"

    def test_pdf_not_image_raises_error(self, tmp_path):
        """Test that PDF file raises error for image validation."""
        pdf_file = tmp_path / "document.pdf"
        pdf_file.write_bytes(b"%PDF-1.4\n" + b"\x00" * 100)

        with pytest.raises(FileValidationError, match="File is not an image"):
            validate_image_upload(str(pdf_file), "document.pdf")


class TestValidateDocumentUpload:
    """Tests for document-specific validation."""

    def test_valid_pdf_document(self, tmp_path):
        """Test validation of valid PDF document."""
        pdf_file = tmp_path / "document.pdf"
        pdf_file.write_bytes(b"%PDF-1.4\n" + b"\x00" * 100)

        sanitised_name, mime_type = validate_document_upload(
            str(pdf_file), "document.pdf"
        )

        assert sanitised_name == "document.pdf"
        assert mime_type == "application/pdf"

    def test_image_not_document_raises_error(self, tmp_path):
        """Test that image file raises error for document validation."""
        jpeg_file = tmp_path / "photo.jpg"
        jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        with pytest.raises(FileValidationError, match="File is not a document"):
            validate_document_upload(str(jpeg_file), "photo.jpg")


class TestEdgeCases:
    """Tests for edge cases and security scenarios."""

    def test_jpeg_with_pdf_extension(self, tmp_path):
        """Test JPEG file with .pdf extension is rejected."""
        fake_pdf = tmp_path / "fake.pdf"
        fake_pdf.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        with pytest.raises(
            FileValidationError,
            match="File extension '.pdf' does not match detected file type 'image/jpeg'",
        ):
            validate_file_upload(str(fake_pdf), "fake.pdf")

    def test_pdf_with_jpg_extension(self, tmp_path):
        """Test PDF file with .jpg extension is rejected."""
        fake_jpg = tmp_path / "fake.jpg"
        fake_jpg.write_bytes(b"%PDF-1.4\n" + b"\x00" * 100)

        with pytest.raises(
            FileValidationError,
            match="File extension '.jpg' does not match detected file type 'application/pdf'",
        ):
            validate_file_upload(str(fake_jpg), "fake.jpg")

    def test_shell_script_rejected(self, tmp_path):
        """Test that shell script is rejected."""
        script_file = tmp_path / "script.sh"
        script_file.write_bytes(b"#!/bin/bash\nrm -rf /")

        with pytest.raises(FileValidationError, match="File type not allowed"):
            validate_file_upload(str(script_file), "script.sh")

    def test_html_file_rejected(self, tmp_path):
        """Test that HTML file is rejected."""
        html_file = tmp_path / "page.html"
        html_file.write_bytes(b"<!DOCTYPE html><html><body>XSS</body></html>")

        with pytest.raises(FileValidationError, match="File type not allowed"):
            validate_file_upload(str(html_file), "page.html")

    def test_path_traversal_in_filename(self, tmp_path):
        """Test that path traversal attempt is sanitised."""
        jpeg_file = tmp_path / "photo.jpg"
        jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        sanitised_name, _ = validate_file_upload(
            str(jpeg_file), "../../../../etc/passwd.jpg"
        )

        assert sanitised_name == "etcpasswd.jpg"
        assert "/" not in sanitised_name
        assert "\\" not in sanitised_name

    def test_null_byte_in_filename(self, tmp_path):
        """Test that null byte in filename is removed."""
        jpeg_file = tmp_path / "photo.jpg"
        jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        sanitised_name, _ = validate_file_upload(str(jpeg_file), "photo\x00.jpg.exe")

        assert sanitised_name == "photo.jpg.exe"
        assert "\x00" not in sanitised_name

    def test_very_long_filename(self, tmp_path):
        """Test handling of very long filename."""
        jpeg_file = tmp_path / "photo.jpg"
        jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

        long_name = "a" * 500 + ".jpg"
        sanitised_name, _ = validate_file_upload(str(jpeg_file), long_name)

        # Filename should be sanitised but still valid
        assert sanitised_name.endswith(".jpg")
        assert len(sanitised_name) > 0


class TestPropertyBasedValidation:
    """Property-based tests for file validation using hypothesis."""

    def test_valid_files_always_pass_validation(self, tmp_path):
        """
        Property: Any file with correct magic bytes and matching extension
        should always pass validation.

        This test generates random valid files and verifies they all pass.
        """
        from hypothesis import given
        from hypothesis import strategies as st

        # Define valid file types with their magic bytes and extensions
        valid_file_types = [
            ("image/jpeg", b"\xff\xd8\xff\xe0\x00\x10JFIF", ".jpg"),
            ("image/png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", ".png"),
            ("application/pdf", b"%PDF-1.4\n", ".pdf"),
        ]

        @given(
            file_type_idx=st.integers(min_value=0, max_value=len(valid_file_types) - 1),
            content_size=st.integers(min_value=100, max_value=1000),
        )
        def property_test(file_type_idx, content_size):
            mime_type, magic_bytes, extension = valid_file_types[file_type_idx]

            # Create file with valid magic bytes
            test_file = tmp_path / f"test{extension}"
            test_file.write_bytes(magic_bytes + b"\x00" * content_size)

            # Should always pass validation
            sanitised_name, detected_mime = validate_file_upload(
                str(test_file), f"test{extension}"
            )

            assert sanitised_name == f"test{extension}"
            assert detected_mime == mime_type

        property_test()

    def test_invalid_files_always_fail_validation(self, tmp_path):
        """
        Property: Any file with invalid/unknown magic bytes should always
        fail validation, regardless of extension.

        This test generates random invalid files and verifies they all fail.
        """
        from hypothesis import given
        from hypothesis import strategies as st

        @given(
            random_bytes=st.binary(min_size=10, max_size=100),
            extension=st.sampled_from([".jpg", ".png", ".pdf"]),
        )
        def property_test(random_bytes, extension):
            # Skip if random bytes happen to match valid magic bytes
            valid_magic_starts = [
                b"\xff\xd8\xff",  # JPEG
                b"\x89PNG",  # PNG
                b"%PDF",  # PDF
                b"GIF8",  # GIF
                b"RIFF",  # WEBP
                b"PK\x03\x04",  # ZIP/Office
            ]

            if any(random_bytes.startswith(magic) for magic in valid_magic_starts):
                return  # Skip this case

            # Create file with invalid magic bytes
            test_file = tmp_path / f"invalid{extension}"
            test_file.write_bytes(random_bytes)

            # Should always fail validation
            with pytest.raises(FileValidationError):
                validate_file_upload(str(test_file), f"invalid{extension}")

        property_test()

    def test_extension_mismatch_always_detected(self, tmp_path):
        """
        Property: Any file where the magic bytes don't match the extension
        should always be detected and rejected.

        This test generates files with mismatched content and extensions.
        """
        from hypothesis import given
        from hypothesis import strategies as st

        # Define file types
        file_types = [
            ("image/jpeg", b"\xff\xd8\xff\xe0\x00\x10JFIF", ".jpg"),
            ("image/png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", ".png"),
            ("application/pdf", b"%PDF-1.4\n", ".pdf"),
        ]

        @given(
            content_idx=st.integers(min_value=0, max_value=len(file_types) - 1),
            extension_idx=st.integers(min_value=0, max_value=len(file_types) - 1),
        )
        def property_test(content_idx, extension_idx):
            # Skip if content and extension match
            if content_idx == extension_idx:
                return

            content_mime, magic_bytes, _ = file_types[content_idx]
            _, _, wrong_extension = file_types[extension_idx]

            # Create file with mismatched content and extension
            test_file = tmp_path / f"mismatch{wrong_extension}"
            test_file.write_bytes(magic_bytes + b"\x00" * 100)

            # Should always fail validation
            with pytest.raises(
                FileValidationError, match="does not match detected file type"
            ):
                validate_file_upload(str(test_file), f"mismatch{wrong_extension}")

        property_test()

    def test_filename_sanitisation_always_safe(self, tmp_path):
        """
        Property: Any filename, no matter how malicious, should always be
        sanitised to a safe version without path traversal characters.

        This test generates random potentially malicious filenames.
        """
        from hypothesis import given
        from hypothesis import strategies as st

        @given(
            malicious_chars=st.text(
                alphabet=st.characters(
                    blacklist_categories=("Cs",),  # Exclude surrogates
                    blacklist_characters="\x00",  # Exclude null bytes
                ),
                min_size=1,
                max_size=50,
            ),
        )
        def property_test(malicious_chars):
            # Create a valid JPEG file
            jpeg_file = tmp_path / "test.jpg"
            jpeg_file.write_bytes(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)

            # Try to validate with malicious filename
            try:
                filename = f"{malicious_chars}.jpg"
                sanitised_name, _ = validate_file_upload(str(jpeg_file), filename)

                # Sanitised name should never contain path separators
                assert "/" not in sanitised_name
                assert "\\" not in sanitised_name
                assert "\x00" not in sanitised_name

                # Should still have .jpg extension
                assert sanitised_name.endswith(".jpg")

            except FileValidationError as e:
                # Empty filename after sanitisation is acceptable
                if "empty" not in str(e).lower():
                    raise

        property_test()

    def test_file_size_limits_always_enforced(self, tmp_path):
        """
        Property: Files exceeding the size limit should always be rejected,
        regardless of content or extension.

        This test generates files of various sizes.
        """
        from hypothesis import given
        from hypothesis import strategies as st

        @given(
            file_size=st.integers(min_value=0, max_value=15 * 1024 * 1024),
            max_size=st.integers(min_value=1024, max_value=10 * 1024 * 1024),
        )
        def property_test(file_size, max_size):
            # Create JPEG file of specified size
            jpeg_file = tmp_path / "size_test.jpg"
            content = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * file_size
            jpeg_file.write_bytes(content)

            actual_size = len(content)

            if actual_size == 0:
                # Empty files should always fail
                with pytest.raises(FileValidationError, match="empty"):
                    validate_file_upload(
                        str(jpeg_file), "size_test.jpg", max_size=max_size
                    )
            elif actual_size > max_size:
                # Oversized files should always fail
                with pytest.raises(FileValidationError, match="exceeds maximum"):
                    validate_file_upload(
                        str(jpeg_file), "size_test.jpg", max_size=max_size
                    )
            else:
                # Files within limit should pass
                sanitised_name, mime_type = validate_file_upload(
                    str(jpeg_file), "size_test.jpg", max_size=max_size
                )
                assert sanitised_name == "size_test.jpg"
                assert mime_type == "image/jpeg"

        property_test()
