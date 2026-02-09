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
    # Images
    "image/jpeg": [(b"\xff\xd8\xff", 0)],
    "image/png": [(b"\x89PNG\r\n\x1a\n", 0)],
    "image/gif": [(b"GIF87a", 0), (b"GIF89a", 0)],
    "image/webp": [(b"RIFF", 0)],  # Also check for WEBP at offset 8
    "image/svg+xml": [(b"<?xml", 0), (b"<svg", 0)],
    # Documents
    "application/pdf": [(b"%PDF-", 0)],
    "application/msword": [(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1", 0)],  # DOC
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        (b"PK\x03\x04", 0)
    ],  # DOCX (ZIP)
    "application/vnd.ms-excel": [(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1", 0)],  # XLS
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        (b"PK\x03\x04", 0)
    ],  # XLSX (ZIP)
    "application/vnd.ms-powerpoint": [(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1", 0)],  # PPT
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
        (b"PK\x03\x04", 0)
    ],  # PPTX (ZIP)
    "text/plain": [],  # Text files have no magic bytes
    "text/csv": [],  # CSV files have no magic bytes
    # Archives
    "application/zip": [(b"PK\x03\x04", 0), (b"PK\x05\x06", 0), (b"PK\x07\x08", 0)],
    "application/x-rar-compressed": [(b"Rar!\x1a\x07", 0)],
    "application/x-7z-compressed": [(b"7z\xbc\xaf\x27\x1c", 0)],
}

# Maximum file size: 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Allowed MIME types with their expected extensions
ALLOWED_MIME_TYPES = {
    # Images
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "image/svg+xml": [".svg"],
    # Documents
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx"
    ],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.ms-powerpoint": [".ppt"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
        ".pptx"
    ],
    "text/plain": [".txt"],
    "text/csv": [".csv"],
    # Archives
    "application/zip": [".zip"],
    "application/x-rar-compressed": [".rar"],
    "application/x-7z-compressed": [".7z"],
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

    # Text files have no magic bytes - allow them
    if not signatures:
        return True

    try:
        with open(file_path, "rb") as f:
            # Read first 32 bytes for magic byte checking
            header = f.read(32)

            for magic_bytes, offset in signatures:
                if len(header) >= offset + len(magic_bytes):
                    if header[offset : offset + len(magic_bytes)] == magic_bytes:
                        # Special case for WEBP - also check for "WEBP" at offset 8
                        if mime_type == "image/webp":
                            if len(header) >= 12 and header[8:12] == b"WEBP":
                                return True
                        else:
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
            if not signatures:  # Skip text files
                continue

            for magic_bytes, offset in signatures:
                if len(header) >= offset + len(magic_bytes):
                    if header[offset : offset + len(magic_bytes)] == magic_bytes:
                        # Special case for WEBP
                        if mime_type == "image/webp":
                            if len(header) >= 12 and header[8:12] == b"WEBP":
                                logger.debug(
                                    f"Detected MIME type for {file_path}: {mime_type}"
                                )
                                return mime_type
                        # Special case for Office Open XML formats (DOCX, XLSX, PPTX)
                        # They all start with PK (ZIP), need to check extension
                        elif (
                            mime_type.startswith("application/vnd.openxmlformats")
                            or mime_type == "application/zip"
                        ):
                            # For ZIP-based formats, use extension as hint
                            ext = Path(file_path).suffix.lower()
                            if ext == ".docx":
                                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            elif ext == ".xlsx":
                                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            elif ext == ".pptx":
                                return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                            elif ext == ".zip":
                                return "application/zip"
                        else:
                            logger.debug(
                                f"Detected MIME type for {file_path}: {mime_type}"
                            )
                            return mime_type

        # Fallback to extension-based detection for text files
        ext = Path(file_path).suffix.lower()
        if ext == ".txt":
            return "text/plain"
        elif ext == ".csv":
            return "text/csv"

        raise FileValidationError(
            "Could not determine file type from magic bytes or extension"
        )

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
    checks the file is an image type.

    Args:
        file_path: Path to the uploaded file
        original_filename: Original filename from upload
        max_size: Maximum allowed file size in bytes

    Returns:
        Tuple of (sanitised_filename, mime_type)

    Raises:
        FileValidationError: If validation fails or file is not an image
    """
    sanitised_name, mime_type = validate_file_upload(
        file_path, original_filename, max_size
    )

    if not mime_type.startswith("image/"):
        raise FileValidationError(f"File is not an image. Detected type: {mime_type}")

    return sanitised_name, mime_type


def validate_document_upload(
    file_path: str, original_filename: str, max_size: int = MAX_FILE_SIZE
) -> Tuple[str, str]:
    """
    Validate an uploaded document file.

    Convenience wrapper around validate_file_upload that additionally
    checks the file is a document type (PDF, Word, Excel, etc.).

    Args:
        file_path: Path to the uploaded file
        original_filename: Original filename from upload
        max_size: Maximum allowed file size in bytes

    Returns:
        Tuple of (sanitised_filename, mime_type)

    Raises:
        FileValidationError: If validation fails or file is not a document
    """
    sanitised_name, mime_type = validate_file_upload(
        file_path, original_filename, max_size
    )

    # Document MIME types
    document_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
    ]

    if mime_type not in document_types:
        raise FileValidationError(f"File is not a document. Detected type: {mime_type}")

    return sanitised_name, mime_type
