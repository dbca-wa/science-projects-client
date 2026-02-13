# region IMPORTS =====================================================================================================

import logging
import os
import tempfile

from django.core.exceptions import SuspiciousFileOperation
from django.core.files.base import ContentFile
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import UniqueConstraint

from common.models import CommonModel
from common.utils.file_validation import validate_document_upload, validate_image_upload

logger = logging.getLogger(__name__)

# endregion ===========================================================================================================


# region FILE SIZE CONSTANTS ======================================================================================================

# File size limits for validation
IMAGE_MAX_SIZE = 3 * 1024 * 1024  # 3 MB - for all image uploads
PROJECT_PDF_MAX_SIZE = 10 * 1024 * 1024  # 10 MB - for project document PDFs
ANNUAL_REPORT_PDF_MAX_SIZE = 100 * 1024 * 1024  # 100 MB - for annual report PDFs

# endregion ===========================================================================================================


# region HELPER FUNCTIONS ======================================================================================================


def _check_file_changed(instance, file_field_name="file"):
    """
    Check if a file field has changed on a model instance.

    Args:
        instance: Model instance
        file_field_name: Name of the file field (default: "file")

    Returns:
        bool: True if file is new or has changed, False otherwise
    """
    if not instance.pk:
        # New instance - file is new if it exists
        return bool(getattr(instance, file_field_name))

    # Existing instance - check if file has changed
    try:
        model_class = instance.__class__
        old_instance = model_class.objects.get(pk=instance.pk)
        old_file = getattr(old_instance, file_field_name)
        new_file = getattr(instance, file_field_name)
        return old_file != new_file
    except model_class.DoesNotExist:
        # Instance doesn't exist yet (edge case)
        return bool(getattr(instance, file_field_name))


def _validate_and_save_file(file_field, validator_func, max_size=10 * 1024 * 1024):
    """
    Helper function to validate a file before saving.

    Args:
        file_field: Django FileField or ImageField
        validator_func: Validation function (validate_image_upload or validate_document_upload)
        max_size: Maximum file size in bytes

    Raises:
        FileValidationError: If validation fails
    """
    if not file_field:
        return

    # Check if this is an uploaded file or an existing FieldFile
    from django.db.models.fields.files import FieldFile

    temp_is_existing = False
    if isinstance(file_field, FieldFile) and file_field.name:
        # This might be an existing file on disk, try to get its path
        try:
            temp_path = file_field.path
            # Check if file actually exists on disk
            if os.path.exists(temp_path):
                temp_is_existing = True
        except (ValueError, AttributeError, SuspiciousFileOperation):
            # File doesn't exist on disk yet or path is invalid
            pass

    if not temp_is_existing:
        # This is a new upload or file not yet saved
        # Try to get the underlying file object (Django stores it in _file or file attribute)
        actual_file = None
        if hasattr(file_field, "_file") and file_field._file:
            actual_file = file_field._file
        elif hasattr(file_field, "file"):
            actual_file = file_field.file
        else:
            actual_file = file_field

        # Seek to beginning if possible
        if hasattr(actual_file, "seek"):
            try:
                actual_file.seek(0)
            except (OSError, IOError, AttributeError):
                pass

        # Read file content
        try:
            file_content = actual_file.read()
            # Seek back to beginning after reading
            if hasattr(actual_file, "seek"):
                try:
                    actual_file.seek(0)
                except (OSError, IOError, AttributeError):
                    pass
        except (AttributeError, ValueError):
            # If read() doesn't work, try chunks()
            file_content = b"".join(chunk for chunk in file_field.chunks())

        # Write to temporary file for validation
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name

    try:
        # Validate the file
        sanitised_name, mime_type = validator_func(temp_path, file_field.name, max_size)

        # Only need to replace file content if this was a new upload
        if not temp_is_existing:
            # Replace file with validated content (and sanitised name if changed)
            if sanitised_name != file_field.name:
                logger.info(
                    f"Filename sanitised: {file_field.name} -> {sanitised_name}"
                )

            # Replace the file content with what we read earlier
            file_field.save(sanitised_name, ContentFile(file_content), save=False)

        logger.info(f"File validation successful: {sanitised_name} ({mime_type})")

    finally:
        # Clean up temporary file (only if we created one)
        if not temp_is_existing and os.path.exists(temp_path):
            os.unlink(temp_path)


# endregion ===========================================================================================================


# region AR MEDIA MODELS ======================================================================================================


class ProjectDocumentPDF(CommonModel):

    file = models.FileField(upload_to="project_documents/", null=True, blank=True)
    size = models.PositiveIntegerField(default=0)  # New size field
    document = models.OneToOneField(
        "documents.ProjectDocument",
        on_delete=models.CASCADE,
        related_name="pdf",
    )
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="pdfs",
    )

    def __str__(self) -> str:
        return f"PDF for {self.document.kind} - {self.project.title}"

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(self.file, validate_document_upload)

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Project Document PDF"
        verbose_name_plural = "Project Document PDFs"


class AnnualReportMedia(CommonModel):
    """
    Model Images for Report Media
    """

    class MediaTypes(models.TextChoices):
        COVER = "cover", "Cover"
        REAR_COVER = "rear_cover", "Rear Cover"
        SDCHART = "sdchart", "Service Delivery Chart"
        SDCHAPTER = "service_delivery", "Service Delivery"
        RESEARCHCHAPTER = "research", "Research"
        PARTNERSHIPSCHAPTER = "partnerships", "Partnerships"
        COLLABORATIONSCHAPTER = "collaborations", "Collaborations"
        STUDENTPROJECTSCHAPTER = "student_projects", "Student Projects"
        PUBLICATIONSCHAPTER = "publications", "Publications"
        DBCABANNERCROPPED = "dbca_banner_cropped", "DBCA Banner Cropped"
        DBCABANNER = "dbca_banner", "DBCA Banner"

    file = models.ImageField(upload_to="annual_reports/images/", null=True, blank=True)
    size = models.PositiveIntegerField(default=0)  # New size field
    kind = models.CharField(
        max_length=140,
        choices=MediaTypes.choices,
    )
    report = models.ForeignKey(
        "documents.AnnualReport",
        on_delete=models.CASCADE,
        related_name="media",
    )
    uploader = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="annual_report_media_uploaded",
    )

    def __str__(self) -> str:
        return f"({self.report.year}) {self.kind.capitalize()} Annual Report Media"

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_image_upload, max_size=IMAGE_MAX_SIZE
            )

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Annual Report Image"
        verbose_name_plural = "Annual Report Images"
        # Ensures there is only one kind of media per report/year (cannot have two rear covers etc.)
        constraints = [
            UniqueConstraint(
                name="unique_media_per_kind_per_year",
                fields=["kind", "report"],
            )
        ]


class LegacyAnnualReportPDF(CommonModel):
    """
    PDF for Older Published Reports
    """

    file = models.FileField(
        upload_to="annual_reports/legacy/pdfs/", null=True, blank=True
    )
    size = models.PositiveIntegerField(default=0)  # New size field
    year = models.PositiveBigIntegerField(
        validators=[MinValueValidator(2005), MaxValueValidator(2019)]
    )
    creator = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="legacy_annual_report_pdf_generated",
    )

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_document_upload, max_size=ANNUAL_REPORT_PDF_MAX_SIZE
            )

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"({self.year}) Annual Report PDF"

    class Meta:
        verbose_name = "Legacy Annual Report PDF"
        verbose_name_plural = "Legacy Annual Report PDFs"


class AnnualReportPDF(CommonModel):  # The latest pdf for a given annual report
    """
    PDF for Report Media
    """

    file = models.FileField(upload_to="annual_reports/pdfs/", null=True, blank=True)
    size = models.PositiveIntegerField(default=0)  # New size field
    report = models.OneToOneField(
        "documents.AnnualReport",
        on_delete=models.CASCADE,
        related_name="pdf",
    )
    creator = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="annual_report_pdf_generated",
    )

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_document_upload, max_size=ANNUAL_REPORT_PDF_MAX_SIZE
            )

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"({self.report.year}) Annual Report PDF"

    class Meta:
        verbose_name = "Annual Report PDF"
        verbose_name_plural = "Annual Report PDFs"


# endregion ===========================================================================================================


# region PROJECT MODELS ======================================================================================================


class AECEndorsementPDF(CommonModel):  # The latest pdf for a given annual report
    """
    PDF for AEC Endorsements
    """

    file = models.FileField(upload_to="aec_endorsements/", null=True, blank=True)
    size = models.PositiveIntegerField(default=0)  # New size field
    endorsement = models.OneToOneField(
        "documents.Endorsement",
        on_delete=models.CASCADE,
        related_name="aec_pdf",
    )
    creator = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="aec_endorsement_pdfs_uploaded",
    )

    def __str__(self) -> str:
        return f" AEC PDF ({self.endorsement})"

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_document_upload, max_size=PROJECT_PDF_MAX_SIZE
            )

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "AEC PDF"
        verbose_name_plural = "AEC PDFs"


class ProjectPhoto(CommonModel):
    """
    Model Definition for Project Photos
    """

    file = models.ImageField(upload_to="projects/", blank=True, null=True)
    project = models.OneToOneField(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="image",
    )
    uploader = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="project_photos_uploaded",
    )
    size = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_image_upload, max_size=IMAGE_MAX_SIZE
            )

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return "Project Photo File"

    class Meta:
        verbose_name = "Project Image"
        verbose_name_plural = "Project Images"


class ProjectPlanMethodologyPhoto(CommonModel):
    """
    Model Definition for Project Plan Methodology Photos
    """

    file = models.ImageField(upload_to="methodology_images/", blank=True, null=True)
    size = models.PositiveIntegerField(default=0)
    project_plan = models.OneToOneField(
        "documents.ProjectPlan",
        on_delete=models.CASCADE,
        related_name="methodology_image",
    )
    uploader = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="methodology_photos_uploaded",
    )

    def __str__(self) -> str:
        return f"Methodology Image File: {self.file}"

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_image_upload, max_size=IMAGE_MAX_SIZE
            )

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Methodology Image File"
        verbose_name_plural = "Methodology Image Files"


# endregion ===========================================================================================================


# region Business Area / Agency Photos Models ======================================================================================================


class BusinessAreaPhoto(CommonModel):
    """
    Model Definition for BusinessArea Photos
    """

    file = models.ImageField(upload_to="business_areas/", blank=True, null=True)
    size = models.PositiveIntegerField(default=0)  # New size field

    business_area = models.OneToOneField(
        "agencies.BusinessArea",
        on_delete=models.CASCADE,
        related_name="image",
    )
    uploader = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="business_area_photos_uploaded",
    )

    def __str__(self) -> str:
        return "Business Area Photo File"

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_image_upload, max_size=IMAGE_MAX_SIZE
            )

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Business Area Image"
        verbose_name_plural = "Business Area Images"


class AgencyImage(CommonModel):
    """
    Model Definition for Agency Photos (DBCA's image)
    """

    file = models.ImageField(upload_to="agencies/")
    size = models.PositiveIntegerField(default=0)  # New size field
    agency = models.OneToOneField(
        "agencies.Agency",
        on_delete=models.CASCADE,
        related_name="image",
    )

    def __str__(self) -> str:
        return "Agency Photo File"

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_image_upload, max_size=IMAGE_MAX_SIZE
            )

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Agency Image"
        verbose_name_plural = "Agency Images"


# endregion ===========================================================================================================


# region User Avatar Model ======================================================================================================


class UserAvatar(CommonModel):
    """
    Model Definition for User Photos
    """

    file = models.ImageField(upload_to="user_avatars/", blank=True, null=True)
    size = models.PositiveIntegerField(default=0)
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="avatar",
    )

    def __str__(self) -> str:
        return f"User: {self.user} | {self.file.name}"

    def save(self, *args, **kwargs):
        # Validate file if it's new or has changed
        if self.file and _check_file_changed(self):
            _validate_and_save_file(
                self.file, validate_image_upload, max_size=IMAGE_MAX_SIZE
            )

        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "User Avatar Image"
        verbose_name_plural = "User Avatar Images"


# endregion ===========================================================================================================
