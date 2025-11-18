// Projects Feature Module - Public API

// Components - Cards
export { ModernProjectCard } from "./components/cards/ModernProjectCard";
export { TraditionalProjectCard } from "./components/cards/TraditionalProjectCard";

// Components - Main
export { DownloadProjectsCSVButton } from "./components/DownloadProjectsCSVButton";
export { PaginatorProject } from "./components/PaginatorProject";
export { ProjectSearchDropdown } from "./components/ProjectSearchDropdown";
export { SearchProjects } from "./components/SearchProjects";
export { SearchProjectsByUser } from "./components/SearchProjectsByUser";
export { ProjectDocumentDropdown } from "./components/ProjectDocumentDropdown";

// Components - Forms
export { AreaCheckAndMaps } from "./components/forms/AreaCheckAndMaps";
export { DatePicker } from "./components/forms/DatePicker";
export { ImagePreview } from "./components/forms/ImagePreview";
export { NewImagePreview } from "./components/forms/NewImagePreview";
export { NewProjectCard } from "./components/forms/NewProjectCard";
export { ProjectBaseInformation } from "./components/forms/ProjectBaseInformation";
export { ProjectDetailsSection } from "./components/forms/ProjectDetailsSection";
export { ProjectExternalSection } from "./components/forms/ProjectExternalSection";
export { ProjectLocationSection } from "./components/forms/ProjectLocationSection";
export { ProjectStudentSection } from "./components/forms/ProjectStudentSection";
export { StartAndEndDateSelector } from "./components/forms/StartAndEndDateSelector";
export { TagInput } from "./components/forms/TagInput";

// Components - Detail
export { CommentSection } from "./components/detail/CommentSection";
export { ConceptPlanContents } from "./components/detail/ConceptPlanContents";
export { DocumentActions } from "./components/detail/DocumentActions";
export { HideProjectModal } from "./components/detail/HideProjectModal";
export { ManageTeam } from "./components/detail/ManageTeam";
export { MethodologyImage } from "./components/detail/MethodologyImage";
export { ProgressReportContents } from "./components/detail/ProgressReportContents";
export { ProjectClosureContents } from "./components/detail/ProjectClosureContents";
export { ProjectOverviewCard } from "./components/detail/ProjectOverviewCard";
export { ProjectPlanContents } from "./components/detail/ProjectPlanContents";
export { ProjectPlanEndorsements } from "./components/detail/ProjectPlanEndorsements";
export { ProjectUserDetails } from "./components/detail/ProjectUserDetails";
export { SaveMethodologyImageButton } from "./components/detail/SaveMethodologyImageButton";
export { SortableTeamMember } from "./components/detail/SortableTeamMember";
export { StudentReportContents } from "./components/detail/StudentReportContents";
export { StudentReportSelector } from "./components/detail/StudentReportSelector";
export { TeamMember } from "./components/detail/TeamMember";
export { TeamMemberContainer } from "./components/detail/TeamMemberContainer";
export { TeamMemberDisplay } from "./components/detail/TeamMemberDisplay";

// Components - Detail - DocActions
export { ProjectDocumentPDFSection } from "./components/detail/DocActions/ProjectDocumentPDFSection";
export { UnifiedDocumentActions } from "./components/detail/DocActions/UnifiedDocumentActions";

// Components - Modals
export { AddUserToProjectModal } from "./components/modals/AddUserToProjectModal";
export { CreateProjectModal } from "./components/modals/CreateProjectModal";
export { CreateProjectPageModal } from "./components/modals/CreateProjectPageModal";
export { DeleteProjectModal } from "./components/modals/DeleteProjectModal";
export { EditProjectModal } from "./components/modals/EditProjectModal";
export { ExternalInternalSPConfirmationModal } from "./components/modals/ExternalInternalSPConfirmationModal";
export { ProjectClosureModal } from "./components/modals/ProjectClosureModal";
export { ProjectDetailEditModal } from "./components/modals/ProjectDetailEditModal";
export { ProjectLeadEmailModal } from "./components/modals/ProjectLeadEmailModal";
export { ProjectReopenModal } from "./components/modals/ProjectReopenModal";
export { ProjectSuspensionModal } from "./components/modals/ProjectSuspensionModal";
export { RequestDeleteProjectModal } from "./components/modals/RequestDeleteProjectModal";
export { SetProjectStatusModal } from "./components/modals/SetProjectStatusModal";

// Components - Emails
export { default as ProjectClosureEmail } from "./components/emails/ProjectClosureEmail";

// Components - Map
export { HeatMapToggle } from "./components/map/HeatMapToggle";
export { MapBackAndSearch } from "./components/map/MapBackAndSearch";
export { MapBusinessAreasSidebar } from "./components/map/MapBusinessAreasSidebar";
export { MapHeatLayer } from "./components/map/MapHeatLayer";
export { MapLocationsSidebar } from "./components/map/MapLocationsSidebar";
export { MapSidebarSection } from "./components/map/MapSidebarSection";
export { MapTopRightControls } from "./components/map/MapTopRightControls";
export { ProjectMapMarker } from "./components/map/ProjectMapMarker";
export { ProjectPopupComponents } from "./components/map/ProjectPopupComponents";

// Hooks
export { useAllProblematicProjects } from "./hooks/useAllProblematicProjects";
export { useGetMyProjects } from "./hooks/useGetMyProjects";
export { useInvolvedProjects } from "./hooks/useInvolvedProjects";
export { useInvolvedStaffProfileProjects } from "./hooks/useInvolvedStaffProfileProjects";
export { useLatestYearsActiveStudentProjects } from "./hooks/useLatestYearsActiveStudentProjects";
export { useProject } from "./hooks/useProject";
export { useProjectTeam } from "./hooks/useProjectTeam";
export { ProjectMapSearchContext } from "./hooks/ProjectMapSearchContext";
export { ProjectSearchContext } from "./hooks/ProjectSearchContext";

// Services
export * from "./services/projects.service";

// Types
// Note: Types are currently in shared/types/index.d.ts and will be moved during import updates

// Utils
export { useDistlledProjectTitle } from "./utils/useDistlledProjectTitle";
export { useGetConceptPlanData } from "./utils/useGetConceptPlanData";
export * from "./utils/projectConstants";
