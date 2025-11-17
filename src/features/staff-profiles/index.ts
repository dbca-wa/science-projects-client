// ============================================================
// STAFF PROFILES FEATURE - PUBLIC API
// ============================================================

// Hooks
export { useStaffProfile } from "./hooks/useStaffProfile";
export { useStaffProfileHero } from "./hooks/useStaffProfileHero";
export { useStaffCV } from "./hooks/useStaffCV";
export { useStaffOverview } from "./hooks/useStaffOverview";
export { useScienceStaffProfileList } from "./hooks/useScienceStaffProfileList";
export { useUserPublications } from "./hooks/useUserPublications";
export { useCheckStaffProfile } from "./hooks/useCheckStaffProfile";
export { useTeamLead } from "./hooks/useTeamLead";

// Components - Layout
export { default as ScienceStaffLayout } from "./components/layout/ScienceStaffLayout";

// Components - Header & Footer
export { default as ScienceHeader } from "./components/Header/ScienceHeader";
export { default as ScienceFooter } from "./components/Footer/ScienceFooter";

// Components - Staff
export { default as PublicationDialog } from "./components/Staff/PublicationDialog";
export { default as PublicationDrawer } from "./components/Staff/PublicationDrawer";
export { default as StaffNotFound } from "./components/Staff/StaffNotFound";

// Components - Staff Search
export { default as ScienceStaffSearchBar } from "./components/Staff/All/ScienceStaffSearchBar";
export { default as ScienceStaffSearchResult } from "./components/Staff/All/ScienceStaffSearchResult";

// Components - Staff Detail
export { default as StaffHero } from "./components/Staff/Detail/StaffHero";
export { default as StaffContent } from "./components/Staff/Detail/StaffContent";
export { default as OverviewSection } from "./components/Staff/Detail/OverviewSection";
export { default as CVSection } from "./components/Staff/Detail/CVSection";
export { default as ProjectsSection } from "./components/Staff/Detail/ProjectsSection";
export { default as PublicationsSection } from "./components/Staff/Detail/PublicationsSection";

// Components - Utility
export { default as DBCASVG } from "./components/DBCASVG";
export { default as SimpleSkeletonSection } from "./components/SimpleSkeletonSection";
export { default as StaffResultSkeleton } from "./components/StaffResultSkeleton";

// Services
export * from "./services/staff-profiles.service";

// Types
export type {
  IStaffProfileAddress,
  IStaffProfileBranch,
  IStaffUserResult,
  IStaffUser,
  KeywordTag,
  ITAssetData,
  IStaffProfileData,
  IStaffProfileBaseData,
  IStaffProfileHeroData,
  IStaffOverviewData,
  IStaffEmploymentEntry,
  IStaffPublicationEntry,
  QualificationKind,
  IStaffEducationEntry,
  IStaffCVData,
  PublicationResponse,
} from "./types/staff-profiles.types";
