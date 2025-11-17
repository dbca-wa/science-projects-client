// Admin Feature Module
// Exports for administrative CRUD operations, data management, and system configuration

// Components
export { default as AddressItemDisplay } from "./components/AddressItemDisplay";
export { default as AffiliationItemDisplay } from "./components/AffiliationItemDisplay";
export { default as BranchItemDisplay } from "./components/BranchItemDisplay";
export { default as BusinessAreaItemDisplay } from "./components/BusinessAreaItemDisplay";
export { default as DivisionItemDisplay } from "./components/DivisionItemDisplay";
export { default as LocationItemDisplay } from "./components/LocationItemDisplay";
export { default as ReportItemDisplay } from "./components/ReportItemDisplay";
export { default as ReportMediaChanger } from "./components/ReportMediaChanger";
export { default as ServiceItemDisplay } from "./components/ServiceItemDisplay";
export { default as StatefulMediaChanger } from "./components/StatefulMediaChanger";
export { default as StatefulMediaChangerAvatar } from "./components/StatefulMediaChangerAvatar";
export { default as StatefulMediaChangerProject } from "./components/StatefulMediaChangerProject";

// Data Components
export { default as AllProblematicProjects } from "./components/data/AllProblematicProjects";
export { default as EmailLists } from "./components/data/EmailLists";
export { default as StaffProfileEmails } from "./components/data/StaffProfileEmails";
export { default as StaffUsers } from "./components/data/StaffUsers";
export { default as UnapprovedProjectsThisFY } from "./components/data/UnapprovedProjectsThisFY";
export { default as UserDataTable } from "./components/data/UserDataTable";

// Modals
export { default as ActionAdminRequestModal } from "./components/modals/ActionAdminRequestModal";
export { default as AddDBCAUserModal } from "./components/modals/AddDBCAUserModal";
export { default as AdminTableRowWithModal } from "./components/modals/AdminTableRowWithModal";
export { default as BumpEmailModalContent } from "./components/modals/BumpEmailModalContent";
export { default as CaretakerSetContent } from "./components/modals/CaretakerSetContent";
export { default as CaretakerSetModal } from "./components/modals/CaretakerSetModal";
export { default as CreateInternalUser } from "./components/modals/CreateInternalUser";
export { default as MergeUserContent } from "./components/modals/MergeUserContent";
export { default as MergeUsersModal } from "./components/modals/MergeUsersModal";
export { default as RemedyExternallyLedProjectsModalContent } from "./components/modals/RemedyExternallyLedProjectsModalContent";
export { default as RemedyLeaderlessProjectsModalContent } from "./components/modals/RemedyLeaderlessProjectsModalContent";
export { default as RemedyMemberlessProjectsModalContent } from "./components/modals/RemedyMemberlessProjectsModalContent";
export { default as RemedyMultipleLeaderProjectsModalContent } from "./components/modals/RemedyMultipleLeaderProjectsModalContent";
export { default as RemedyOpenClosedModalContent } from "./components/modals/RemedyOpenClosedModalContent";

// Navigation Components
export { default as AffiliationCreateSearchDropdown } from "./components/AffiliationCreateSearchDropdown";
export { default as AffiliationSearchDropdown } from "./components/AffiliationSearchDropdown";
export { default as BranchSearchDropdown } from "./components/BranchSearchDropdown";

// Hooks
export { default as useAffiliation } from "./hooks/useAffiliation";
export { default as useAffiliations } from "./hooks/useAffiliations";
export { default as useBranch } from "./hooks/useBranch";
export { default as useBranches } from "./hooks/useBranches";
export { default as useDepartmentalServices } from "./hooks/useDepartmentalServices";
export { default as useDirectorateMembers } from "./hooks/useDirectorateMembers";
export { default as useDivisionDirectorateMembers } from "./hooks/useDivisionDirectorateMembers";
export { default as useGetDivisions } from "./hooks/useGetDivisions";
export { default as useGetLocations } from "./hooks/useGetLocations";
export { default as useGetLocationsGeojson } from "./hooks/useGetLocationsGeojson";

// Services
export * from "./services/admin.service";

// Types
export type {
  IActionAdminTask,
  IAddress,
  IAdminOptions,
  IAdminOptionsTypeSafe,
  IAdminRequestUser,
  IAdminTask,
  IAffiliation,
  IAgency,
  IBusinessArea,
  IBusinessAreaCreate,
  IBusinessAreaUpdate,
  IBranch,
  IDepartmentalService,
  IDivision,
  IGuideContent,
  IMaintainer,
  IMakeRequestToAdmins,
  IMergeAffiliation,
  IMiniUser,
  IReport,
  IReportCreation,
  ISimpleLocationData,
  IAddLocationForm,
  IProjectAreas,
  OrganisedLocationData,
  BusinessAreaImage,
} from "./types/admin.types";
