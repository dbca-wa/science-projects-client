"""
Project views
"""

from .admin import (
    ProblematicProjects,
    RemedyExternalLeaderProjects,
    RemedyMemberlessProjects,
    RemedyMultipleLeaderProjects,
    RemedyNoLeaderProjects,
    RemedyOpenClosed,
    RemedyRoleMismatch,
    UnapprovedThisFY,
)
from .areas import AreasForProject, ProjectAreaDetail, ProjectAreas
from .crud import ProjectDetails, Projects
from .details import (
    ExternalProjectAdditional,
    ExternalProjectAdditionalDetail,
    ProjectAdditional,
    ProjectAdditionalDetail,
    SelectedProjectAdditionalDetail,
    StudentProjectAdditional,
    StudentProjectAdditionalDetail,
)
from .drafts import ProjectDraftDetail
from .export import DownloadAllProjectsAsCSV, DownloadARProjectsAsCSV
from .map import ProjectMap
from .members import (
    MembersForProject,
    MentionableUsersForProject,
    ProjectLeaderDetail,
    ProjectMemberDetail,
    ProjectMembers,
    PromoteToLeader,
)
from .reports import CreateProgressReport, CreateStudentReport
from .search import MyProjects, SmallProjectSearch
from .utils import (
    CoreFunctionProjects,
    ExternalProjects,
    ProjectDocs,
    ProjectYears,
    ScienceProjects,
    StudentProjects,
    SuspendProject,
    ToggleUserProfileVisibilityForProject,
)

__all__ = [
    # CRUD
    "Projects",
    "ProjectDetails",
    # Map
    "ProjectMap",
    # Search
    "SmallProjectSearch",
    "MyProjects",
    # Details
    "ProjectAdditional",
    "ProjectAdditionalDetail",
    "StudentProjectAdditional",
    "StudentProjectAdditionalDetail",
    "ExternalProjectAdditional",
    "ExternalProjectAdditionalDetail",
    "SelectedProjectAdditionalDetail",
    # Members
    "ProjectMembers",
    "ProjectMemberDetail",
    "ProjectLeaderDetail",
    "MembersForProject",
    "MentionableUsersForProject",
    "PromoteToLeader",
    # Areas
    "ProjectAreas",
    "ProjectAreaDetail",
    "AreasForProject",
    # Reports
    "CreateProgressReport",
    "CreateStudentReport",
    # Admin
    "UnapprovedThisFY",
    "ProblematicProjects",
    "RemedyOpenClosed",
    "RemedyMemberlessProjects",
    "RemedyNoLeaderProjects",
    "RemedyMultipleLeaderProjects",
    "RemedyExternalLeaderProjects",
    "RemedyRoleMismatch",
    # Export
    "DownloadAllProjectsAsCSV",
    "DownloadARProjectsAsCSV",
    # Drafts
    "ProjectDraftDetail",
    # Utils
    "ProjectYears",
    "SuspendProject",
    "ProjectDocs",
    "ToggleUserProfileVisibilityForProject",
    "CoreFunctionProjects",
    "ScienceProjects",
    "StudentProjects",
    "ExternalProjects",
]
