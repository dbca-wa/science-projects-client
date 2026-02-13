# ADR-010: File Upload Validation Strategy

## Context

The Science Projects Management System (SPMS) allows users to upload files for:

- **Documents**: Project documents, annual reports, AEC endorsements (PDF only)
- **Images**: Project photos, user avatars, business area photos, agency images, annual report media (JPEG, PNG only)

File uploads present significant security risks:
- **File Type Spoofing**: Malicious files disguised with innocent extensions (e.g., executable renamed to .pdf)
- **Content Injection**: Files containing malicious scripts or code
- **Denial of Service**: Extremely large files consuming storage and bandwidth
- **Path Traversal**: Filenames designed to write outside intended directories
- **Malware Distribution**: Infected files uploaded and shared with other users

The validation strategy must:
- Verify actual file content, not just extensions
- Prevent execution of uploaded files
- Limit file sizes appropriately based on file type
- Validate file types against allowed lists
- Provide clear error messages for rejected uploads
- Maintain good user experience for legitimate uploads
- Comply with government security requirements

## Decision

We will implement multi-layered file upload validation using content inspection (magic bytes) as the primary security control.

**Validation Layers**:

1. **File Size Validation**: Check size before processing content
2. **Content Inspection**: Validate actual file type using magic bytes (pure Python implementation)
3. **Extension Validation**: Verify extension matches content type
4. **Filename Sanitisation**: Remove dangerous characters and path components
5. **Storage Isolation**: Store uploads in Azure Blob Storage (not filesystem)

**Allowed File Types**:
- **Documents**: PDF only
- **Images**: JPEG, PNG, JPG only

**File Size Limits**:
- **Images**: 3 MB maximum (project photos, user avatars, business area photos, agency images, annual report media)
- **Project Document PDFs**: 10 MB maximum
- **AEC Endorsement PDFs**: 10 MB maximum
- **Annual Report PDFs**: 100 MB maximum (legacy reports and generated reports)

**Implementation Approach**:
- Pure Python implementation using file signatures (magic bytes)
- No external system dependencies required
- Cross-platform compatible (Windows, macOS, Linux)
- Validates first 32 bytes of file content against known signatures

## Consequences

### Positive Consequences

- **Security**: Content inspection prevents file type spoofing attacks
- **User Safety**: Malicious files rejected before storage
- **Clear Errors**: Users receive specific feedback on rejected uploads
- **Compliance**: Meets government security requirements for file handling
- **Storage Safety**: Azure Blob Storage prevents file execution
- **Audit Trail**: All upload attempts logged for security review
- **Maintainability**: Centralised validation logic in utility module
- **Testability**: Validation logic easily unit tested

### Negative Consequences

- **Performance**: Content inspection adds latency to uploads (~10-50ms per file)
- **False Positives**: Some legitimate files may be rejected (rare)
- **User Experience**: Rejected uploads require re-upload with correct format
- **Complexity**: Multiple validation layers increase code complexity
- **Office Formats**: DOCX/XLSX/PPTX all use ZIP format, requiring extension hints

### Neutral Consequences

- **File Type Restrictions**: Users limited to specific file types
- **Size Limits**: Large files must be split or compressed
- **Error Handling**: Requires clear user-facing error messages

## Alternatives Considered

### Extension-Only Validation
**Description**: Validate file uploads based solely on file extension.

**Why Not Chosen**:
- Trivially bypassed by renaming files
- Provides no protection against file type spoofing
- Insufficient for government security requirements
- Industry best practice requires content inspection

**Trade-offs**: Extension validation is fast but provides no real security.

### Virus Scanning Only
**Description**: Rely on antivirus scanning without content validation.

**Why Not Chosen**:
- Antivirus is reactive (requires known signatures)
- Zero-day malware not detected
- Expensive for cloud deployment
- Slower than content inspection
- Should be complementary, not primary control

**Trade-offs**: Virus scanning is valuable but insufficient alone.

### No Validation
**Description**: Accept all file uploads without validation.

**Why Not Chosen**:
- Unacceptable security risk
- Violates government security requirements
- Exposes users to malware
- Enables denial of service attacks
- Previously had no validation and users uploaded 100MB+ photo files, slowing the app on load

**Trade-offs**: No validation is simplest but completely insecure.

### Client-Side Validation Only
**Description**: Validate files in browser before upload.

**Why Not Chosen**:
- Client-side validation easily bypassed
- Cannot be trusted for security
- Must always validate server-side
- Client-side validation is UX enhancement only

**Trade-offs**: Client-side validation improves UX but provides no security.

## Implementation Notes

### File Size Constants

**Location**: `backend/medias/models.py`

```python
# File size limits for validation
IMAGE_MAX_SIZE = 3 * 1024 * 1024  # 3 MB - for all image uploads
PROJECT_PDF_MAX_SIZE = 10 * 1024 * 1024  # 10 MB - for project document PDFs
ANNUAL_REPORT_PDF_MAX_SIZE = 100 * 1024 * 1024  # 100 MB - for annual report PDFs
```

### File Validation Utility

**Location**: `backend/common/utils/file_validation.py`

**Implementation**: Pure Python magic bytes validation (no external dependencies)

```python
# File signatures (magic bytes) for validation
FILE_SIGNATURES = {
    # Images (production use)
    "image/jpeg": [(b"\xff\xd8\xff", 0)],
    "image/png": [(b"\x89PNG\r\n\x1a\n", 0)],
    # Documents (production use)
    "application/pdf": [(b"%PDF-", 0)],
}

# Allowed MIME types with their expected extensions
ALLOWED_MIME_TYPES = {
    # Images (production use)
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    # Documents (production use)
    "application/pdf": [".pdf"],
}

def get_file_mime_type(file_path: str) -> str:
    """
    Get MIME type using magic bytes inspection.
    Pure Python implementation - no external dependencies.
    """
    with open(file_path, "rb") as f:
        header = f.read(32)

    for mime_type, signatures in FILE_SIGNATURES.items():
        for magic_bytes, offset in signatures:
            if header[offset:offset+len(magic_bytes)] == magic_bytes:
                return mime_type

    raise FileValidationError("Could not determine file type")

def validate_file_upload(file_path: str, original_filename: str, max_size: int) -> Tuple[str, str]:
    """
    Validate uploaded file using multiple security layers.

    Returns:
        Tuple of (sanitised_filename, mime_type)

    Raises:
        FileValidationError: If validation fails
    """
    # 1. Check file size
    file_size = os.path.getsize(file_path)
    if file_size > max_size:
        raise FileValidationError(f"File size exceeds {max_size / (1024*1024):.0f}MB limit")

    # 2. Sanitise filename
    sanitised_name = sanitise_filename(original_filename)

    # 3. Get file extension
    file_ext = Path(sanitised_name).suffix.lower()
    if not file_ext:
        raise FileValidationError("File has no extension")

    # 4. Detect MIME type using magic bytes
    detected_mime = get_file_mime_type(file_path)

    # 5. Check if MIME type is allowed
    if detected_mime not in ALLOWED_MIME_TYPES:
        raise FileValidationError(f"File type not allowed: {detected_mime}")

    # 6. Verify extension matches MIME type
    expected_extensions = ALLOWED_MIME_TYPES[detected_mime]
    if file_ext not in expected_extensions:
        raise FileValidationError(
            f"File extension '{file_ext}' does not match detected file type '{detected_mime}'"
        )

    return sanitised_name, detected_mime

def validate_image_upload(file_path: str, original_filename: str, max_size: int) -> Tuple[str, str]:
    """
    Validate an uploaded image file.

    Ensures file is JPEG or PNG only.
    """
    sanitised_name, mime_type = validate_file_upload(file_path, original_filename, max_size)

    if mime_type not in ["image/jpeg", "image/png"]:
        raise FileValidationError(f"File is not a JPEG or PNG image. Detected type: {mime_type}")

    return sanitised_name, mime_type

def validate_document_upload(file_path: str, original_filename: str, max_size: int) -> Tuple[str, str]:
    """
    Validate an uploaded document file.

    Ensures file is PDF only.
    """
    sanitised_name, mime_type = validate_file_upload(file_path, original_filename, max_size)

    if mime_type != "application/pdf":
        raise FileValidationError(f"File is not a PDF. Detected type: {mime_type}")

    return sanitised_name, mime_type
```

### Model Integration

**Media Models** (`medias/models.py`):

All media models use the `_validate_and_save_file` helper function which:
1. Writes uploaded file to temporary location
2. Validates using magic bytes
3. Sanitises filename if needed
4. Updates file field with validated content

```python
def _validate_and_save_file(file_field, validator_func, max_size):
    """
    Helper function to validate a file before saving.

    Args:
        file_field: Django FileField or ImageField
        validator_func: validate_image_upload or validate_document_upload
        max_size: Maximum file size in bytes

    Raises:
        FileValidationError: If validation fails
    """
    # Write to temporary file for validation
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        for chunk in file_field.chunks():
            temp_file.write(chunk)
        temp_path = temp_file.name

    try:
        # Validate the file
        sanitised_name, mime_type = validator_func(temp_path, file_field.name, max_size)

        # Update filename if sanitised
        if sanitised_name != file_field.name:
            with open(temp_path, "rb") as f:
                file_content = f.read()
            file_field.save(sanitised_name, ContentFile(file_content), save=False)

        logger.info(f"File validation successful: {sanitised_name} ({mime_type})")
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.unlink(temp_path)
```

**Image Models** (3 MB limit):
```python
class ProjectPhoto(CommonModel):
    file = models.ImageField(upload_to="projects/", blank=True, null=True)
    size = models.PositiveIntegerField(default=0)
    # ... other fields

    def save(self, *args, **kwargs):
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_image_upload, max_size=IMAGE_MAX_SIZE  # 3 MB
            )
        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

# Same pattern for:
# - UserAvatar (user profile pictures)
# - BusinessAreaPhoto (business area images)
# - AgencyImage (agency logos)
# - AnnualReportMedia (annual report images)
# - ProjectPlanMethodologyPhoto (methodology diagrams)
```

**Document Models**:
```python
class ProjectDocumentPDF(CommonModel):
    file = models.FileField(upload_to="project_documents/", null=True, blank=True)
    size = models.PositiveIntegerField(default=0)
    # ... other fields

    def save(self, *args, **kwargs):
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_document_upload, max_size=PROJECT_PDF_MAX_SIZE  # 10 MB
            )
        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

class AnnualReportPDF(CommonModel):
    file = models.FileField(upload_to="annual_reports/pdfs/", null=True, blank=True)
    size = models.PositiveIntegerField(default=0)
    # ... other fields

    def save(self, *args, **kwargs):
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_document_upload, max_size=ANNUAL_REPORT_PDF_MAX_SIZE  # 100 MB
            )
        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

# Same pattern for:
# - LegacyAnnualReportPDF (100 MB)
# - AECEndorsementPDF (10 MB)
```

### API Error Responses

**Validation Error Response**:
```json
{
  "file": [
    "File extension '.jpg' does not match detected file type 'application/pdf'. Expected one of: .pdf"
  ]
}
```

**Size Error Response** (Image):
```json
{
  "file": [
    "File size (5.23MB) exceeds maximum allowed size (3.00MB)"
  ]
}
```

**Size Error Response** (Annual Report PDF):
```json
{
  "file": [
    "File size (150.45MB) exceeds maximum allowed size (100.00MB)"
  ]
}
```

**Type Error Response**:
```json
{
  "file": [
    "File is not a PDF. Detected type: image/jpeg"
  ]
}
```
```

### Testing Strategy

**Unit Tests** (`common/tests/test_file_validation.py`):
```python
import pytest
from common.utils.file_validation import (
    validate_file_upload,
    validate_image_upload,
    validate_document_upload,
    FileValidationError,
)

def test_valid_pdf():
    """Test valid PDF file passes validation."""
    # Create actual PDF content (magic bytes)
    pdf_content = b'%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'
    # Write to temp file and validate
    # ...
    sanitised_name, mime_type = validate_document_upload(temp_path, "test.pdf", 10*1024*1024)
    assert mime_type == "application/pdf"

def test_valid_jpeg():
    """Test valid JPEG file passes validation."""
    jpeg_content = b'\xFF\xD8\xFF\xE0\x00\x10JFIF'
    # ...
    sanitised_name, mime_type = validate_image_upload(temp_path, "test.jpg", 3*1024*1024)
    assert mime_type == "image/jpeg"

def test_invalid_extension_mismatch():
    """Test file with mismatched extension is rejected."""
    # PDF content with .jpg extension
    pdf_content = b'%PDF-1.4\n'
    # ...
    with pytest.raises(FileValidationError, match="does not match detected file type"):
        validate_image_upload(temp_path, "test.jpg", 3*1024*1024)

def test_file_too_large():
    """Test oversized file is rejected."""
    large_content = b'x' * (4 * 1024 * 1024)  # 4MB (exceeds 3MB image limit)
    # ...
    with pytest.raises(FileValidationError, match="exceeds maximum"):
        validate_image_upload(temp_path, "test.jpg", 3*1024*1024)

def test_invalid_file_type():
    """Test disallowed file type is rejected."""
    # Executable file
    exe_content = b'MZ\x90\x00'  # PE executable magic bytes
    # ...
    with pytest.raises(FileValidationError, match="not allowed"):
        validate_file_upload(temp_path, "test.exe", 10*1024*1024)
```

**Integration Tests** (`medias/tests/test_file_upload_integration.py`):
```python
@pytest.mark.django_db
def test_project_photo_upload_valid_jpeg(project, user):
    """Test uploading valid JPEG succeeds."""
    jpeg_content = b'\xFF\xD8\xFF\xE0\x00\x10JFIF'
    file = SimpleUploadedFile("test.jpg", jpeg_content, content_type="image/jpeg")

    photo = ProjectPhoto.objects.create(file=file, project=project, uploader=user)
    assert photo.size > 0

@pytest.mark.django_db
def test_project_photo_upload_pdf_rejected(project, user):
    """Test uploading PDF as image fails."""
    pdf_content = b'%PDF-1.4\n'
    file = SimpleUploadedFile("test.pdf", pdf_content, content_type="application/pdf")

    with pytest.raises(FileValidationError):
        ProjectPhoto.objects.create(file=file, project=project, uploader=user)

@pytest.mark.django_db
def test_annual_report_pdf_upload_valid(annual_report, user):
    """Test uploading valid PDF succeeds."""
    pdf_content = b'%PDF-1.4\n' + b'x' * 1000  # Small PDF
    file = SimpleUploadedFile("report.pdf", pdf_content, content_type="application/pdf")

    pdf = AnnualReportPDF.objects.create(file=file, report=annual_report, creator=user)
    assert pdf.size > 0

@pytest.mark.django_db
def test_image_size_limit_enforced(project, user):
    """Test 3MB image size limit is enforced."""
    large_jpeg = b'\xFF\xD8\xFF\xE0' + b'x' * (4 * 1024 * 1024)  # 4MB
    file = SimpleUploadedFile("large.jpg", large_jpeg)

    with pytest.raises(FileValidationError, match="exceeds maximum"):
        ProjectPhoto.objects.create(file=file, project=project, uploader=user)
```

**Security Tests** (`medias/tests/test_file_validation_security.py`):
```python
@pytest.mark.django_db
def test_malicious_file_rejected(project, user):
    """Test executable disguised as image is rejected."""
    # Executable magic bytes with .jpg extension
    exe_content = b'MZ\x90\x00'
    file = SimpleUploadedFile("malicious.jpg", exe_content)

    with pytest.raises(FileValidationError):
        ProjectPhoto.objects.create(file=file, project=project, uploader=user)

@pytest.mark.django_db
def test_path_traversal_prevented(project, user):
    """Test filename with path traversal is sanitised."""
    jpeg_content = b'\xFF\xD8\xFF\xE0\x00\x10JFIF'
    file = SimpleUploadedFile("../../etc/passwd.jpg", jpeg_content)

    photo = ProjectPhoto.objects.create(file=file, project=project, uploader=user)
    # Filename should be sanitised (no path separators)
    assert "../" not in photo.file.name
```

### Dependencies

**No External Dependencies Required**:
- Pure Python implementation using file signatures
- Cross-platform compatible (Windows, macOS, Linux)
- No system libraries needed (libmagic not required)
- Works in all deployment environments without additional setup

**Standard Library Only**:
```python
import os
import re
import logging
from pathlib import Path
from typing import Tuple
```

### Logging and Monitoring

**Log Rejected Uploads**:
```python
import logging

logger = logging.getLogger(__name__)

def validate_file_upload(file):
    is_valid, error = validate_file_upload(file)

    if not is_valid:
        logger.warning(
            "File upload rejected",
            extra={
                'filename': file.name,
                'size': file.size,
                'error': error,
                'user_id': getattr(file, 'user_id', None),
            }
        )

    return is_valid, error
```

**Metrics to Track**:
- Upload success rate
- Rejection reasons (size, type, mismatch)
- Average file sizes
- Most common file types

### Migration Strategy

1. **Phase 1**: Implement validation utility with pure Python magic bytes (Complete)
2. **Phase 2**: Add file size constants to medias models (Complete)
3. **Phase 3**: Add validation to all Media models (Complete)
4. **Phase 4**: Write comprehensive unit tests (Complete)
5. **Phase 5**: Write integration tests for upload endpoints (Complete)
6. **Phase 6**: Write security tests (Complete)
7. **Phase 7**: Deploy to staging and test with various file types (Complete)
8. **Phase 8**: Deploy to production with monitoring (Complete)

### Rollback Plan

If validation causes issues:
1. Disable validation via feature flag
2. Fall back to extension-only validation temporarily
3. Fix validation logic
4. Re-enable content inspection

## References

- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [Django File Uploads](https://docs.djangoproject.com/en/4.2/topics/http/file-uploads/)
- [File Signature Database](https://en.wikipedia.org/wiki/List_of_file_signatures)
- [Magic Bytes Reference](https://www.garykessler.net/library/file_sigs.html)
- Related ADRs:
  - ADR-002: Django REST Framework Choice
  - ADR-001: Single Maintainer Philosophy

---

**Date**: 10-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
