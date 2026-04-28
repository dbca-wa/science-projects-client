"""
Views for media management
"""

from .annual_reports import (
    AnnualReportMediaDelete,
    AnnualReportMediaDetail,
    AnnualReportMedias,
    AnnualReportMediaUpload,
    AnnualReportPDFDetail,
    AnnualReportPDFs,
    LatestReportMedia,
    LegacyAnnualReportPDFDetail,
    LegacyAnnualReportPDFs,
)
from .avatars import UserAvatarDetail, UserAvatars
from .editor_images import EditorImageDetail, EditorImages
from .photos import (
    AgencyPhotoDetail,
    AgencyPhotos,
    BusinessAreaPhotoDetail,
    BusinessAreaPhotos,
    MethodologyPhotoDetail,
    MethodologyPhotos,
    ProjectPhotoDetail,
    ProjectPhotos,
)
from .project_docs import ProjectDocPDFS

__all__ = [
    # Project documents
    "ProjectDocPDFS",
    # Annual reports
    "AnnualReportPDFs",
    "AnnualReportPDFDetail",
    "LegacyAnnualReportPDFs",
    "LegacyAnnualReportPDFDetail",
    "AnnualReportMedias",
    "AnnualReportMediaDetail",
    "LatestReportMedia",
    "AnnualReportMediaUpload",
    "AnnualReportMediaDelete",
    # Photos
    "BusinessAreaPhotos",
    "BusinessAreaPhotoDetail",
    "ProjectPhotos",
    "ProjectPhotoDetail",
    "MethodologyPhotos",
    "MethodologyPhotoDetail",
    "AgencyPhotos",
    "AgencyPhotoDetail",
    # Avatars
    "UserAvatars",
    "UserAvatarDetail",
    # Editor images
    "EditorImages",
    "EditorImageDetail",
]
