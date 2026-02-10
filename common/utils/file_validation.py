"""
File upload validation utilities.

This module provides secure file upload validation using magic bytes (file signatures)
to prevent malicious file uploads. It validates both file content and extensions.

Security approach:
- Magic bytes validation (content inspection)
- Extension validation
- File size limits
- Filename sanitisation

See ADR-008 for detailed rationale.
"""

import logging
import os
import re
from pathlib import Path
from typing import Tuple

logger = logging.getLogger(__name__)

# File signatures (magic bytes) for validation
# Format: MIME type -> (magic bytes, offset)
FILE_SIGNATURES = {
    # Images (production use)
    "image/jpeg": [(b"\xff\xd8\xff", 0)],
    "image/png": [(b"\x89PNG\r\n\x1a\n", 0)],
    # Documents (production use)
    "application/pdf": [(b"%PDF-", 0)],
}

# Maximum file size: 10MB (default)
MAX_FILE_SIZE = 10 * 1024 * 1024

# Allowed MIME types with their expected extensions
ALLOWED_MIME_TYPES = {
    # Images (production use)
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    # Documents (production use)
    "application/pdf": [".pdf"],
}


class FileValidationError(Exception):
    """Raised when file validation fails."""


def _check_magic_bytes(file_path: str, mime_type: str) -> bool:
    """
    Check if file matches expected magic bytes for MIME type.

    Args:
        file_path: Path to file
        mime_type: Expected MIME type

    Returns:
        True if magic bytes match, False otherwise
    """
    if mime_type not in FILE_SIGNATURES:
        return False

    signatures = FILE_SIGNATURES[mime_type]

    # If no signatures defined, cannot validate
    if not signatures:
        return False

    try:
        with open(file_path, "rb") as f:
            # Read first 32 bytes for magic byte checking
            header = f.read(32)

            for magic_bytes, offset in signatures:
                if len(header) >= offset + len(magic_bytes):
                    if header[offset : offset + len(magic_bytes)] == magic_bytes:
                        return True

        return False
    except Exception as e:
        logger.error(f"Error checking magic bytes for {file_path}: {e}")
        return False


def get_file_mime_type(file_path: str) -> str:
    """
    Get the MIME type of a file using magic bytes inspection.

    Args:
        file_path: Path to the file to inspect

    Returns:
        MIME type string (e.g., "image/jpeg")

    Raises:
        FileValidationError: If file cannot be read or MIME type cannot be determined
    """
    try:
        # Try to detect MIME type from magic bytes
        with open(file_path, "rb") as f:
            header = f.read(32)

        # Check against known signatures
        for mime_type, signatures in FILE_SIGNATURES.items():
            if not signatures:  # Skip if no signatures defined
                continue

            for magic_bytes, offset in signatures:
                if len(header) >= offset + len(magic_bytes):
                    if header[offset : offset + len(magic_bytes)] == magic_bytes:
                        logger.debug(f"Detected MIME type for {file_path}: {mime_type}")
                        return mime_type

        raise FileValidationError("Could not determine file type from magic bytes")

    except FileValidationError:
        raise
    except Exception as e:
        logger.error(f"Failed to determine MIME type for {file_path}: {e}")
        raise FileValidationError(f"Could not determine file type: {e}")


def sanitise_filename(filename: str) -> str:
    """
    Sanitise a filename to prevent directory traversal and other attacks.

    Removes:
    - Path separators (/, \\)
    - Null bytes
    - Control characters
    - Leading/trailing dots and spaces

    Args:
        filename: Original filename

    Returns:
        Sanitised filename

    Raises:
        FileValidationError: If filename becomes empty after sanitisation
    """
    # Remove path separators and null bytes
    filename = filename.replace("/", "").replace("\\", "").replace("\x00", "")

    # Remove control characters
    filename = re.sub(r"[\x00-\x1f\x7f]", "", filename)

    # Remove leading/trailing dots and spaces
    filename = filename.strip(". ")

    if not filename:
        raise FileValidationError("Filename is empty after sanitisation")

    logger.debug(f"Sanitised filename: {filename}")
    return filename


def validate_file_upload(
    file_path: str, original_filename: str, max_size: int = MAX_FILE_SIZE
) -> Tuple[str, str]:
    """
    Validate an uploaded file using magic bytes inspection.

    Performs the following checks:
    1. File size validation
    2. Magic bytes validation (actual file content)
    3. Extension validation (matches content)
    4. Filename sanitisation

    Args:
        file_path: Path to the uploaded file (temporary location)
        original_filename: Original filename from upload
        max_size: Maximum allowed file size in bytes (default: 10MB)

    Returns:
        Tuple of (sanitised_filename, mime_type)

    Raises:
        FileValidationError: If validation fails for any reason

    Example:
        >>> sanitised_name, mime_type = validate_file_upload(
        ...     "/tmp/upload123.jpg",
        ...     "user_photo.jpg"
        ... )
        >>> print(f"Valid {mime_type} file: {sanitised_name}")
        Valid image/jpeg file: user_photo.jpg
    """
    # 1. Check file exists
    if not os.path.exists(file_path):
        raise FileValidationError("File does not exist")

    # 2. Check file size
    file_size = os.path.getsize(file_path)
    if file_size > max_size:
        max_mb = max_size / (1024 * 1024)
        actual_mb = file_size / (1024 * 1024)
        raise FileValidationError(
            f"File size ({actual_mb:.2f}MB) exceeds maximum allowed size ({max_mb:.2f}MB)"
        )

    if file_size == 0:
        raise FileValidationError("File is empty")

    # 3. Sanitise filename
    sanitised_name = sanitise_filename(original_filename)

    # 4. Get file extension
    file_ext = Path(sanitised_name).suffix.lower()
    if not file_ext:
        raise FileValidationError("File has no extension")

    # 5. Detect actual MIME type using magic bytes
    detected_mime = get_file_mime_type(file_path)

    # 6. Check if MIME type is allowed
    if detected_mime not in ALLOWED_MIME_TYPES:
        raise FileValidationError(
            f"File type not allowed: {detected_mime}. "
            f"Allowed types: {', '.join(ALLOWED_MIME_TYPES.keys())}"
        )

    # 7. Verify extension matches MIME type
    expected_extensions = ALLOWED_MIME_TYPES[detected_mime]
    if file_ext not in expected_extensions:
        raise FileValidationError(
            f"File extension '{file_ext}' does not match detected file type '{detected_mime}'. "
            f"Expected one of: {', '.join(expected_extensions)}"
        )

    logger.info(
        f"File validation successful: {sanitised_name} ({detected_mime}, {file_size} bytes)"
    )

    return sanitised_name, detected_mime


def validate_image_upload(
    file_path: str, original_filename: str, max_size: int = MAX_FILE_SIZE
) -> Tuple[str, str]:
    """
    Validate an uploaded image file.

    Convenience wrapper around validate_file_upload that additionally
    checks the file is JPEG or PNG only.

    Args:
        file_path: Path to the uploaded file
        original_filename: Original filename from upload
        max_size: Maximum allowed file size in bytes

    Returns:
        Tuple of (sanitised_filename, mime_type)

    Raises:
        FileValidationError: If validation fails or file is not JPEG/PNG
    """
    sanitised_name, mime_type = validate_file_upload(
        file_path, original_filename, max_size
    )

    if mime_type not in ["image/jpeg", "image/png"]:
        raise FileValidationError(
            f"File is not a JPEG or PNG image. Detected type: {mime_type}"
        )

    return sanitised_name, mime_type


def validate_document_upload(
    file_path: str, original_filename: str, max_size: int = MAX_FILE_SIZE
) -> Tuple[str, str]:
    """
    Validate an uploaded document file.

    Convenience wrapper around validate_file_upload that additionally
    checks the file is a PDF document.

    Args:
        file_path: Path to the uploaded file
        original_filename: Original filename from upload
        max_size: Maximum allowed file size in bytes

    Returns:
        Tuple of (sanitised_filename, mime_type)

    Raises:
        FileValidationError: If validation fails or file is not a PDF
    """
    sanitised_name, mime_type = validate_file_upload(
        file_path, original_filename, max_size
    )

    if mime_type != "application/pdf":
        raise FileValidationError(f"File is not a PDF. Detected type: {mime_type}")

    return sanitised_name, mime_type
