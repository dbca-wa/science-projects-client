/**
 * User feature components
 */

// Main user components
export { UserCard } from "./UserCard";
export { UserGrid } from "./UserGrid";
export { UserAvatar } from "./UserAvatar";
export { UserSearchBar } from "./UserSearchBar";
export { UserFilterPanel } from "./UserFilterPanel";
export { UserDetailSheet } from "./UserDetailSheet";
export { UserSearchDropdown } from "./UserSearchDropdown";
export { BaseUserSearch, type BaseUserSearchProps, type BaseUserSearchRef } from "./BaseUserSearch";

// Re-export Pagination from shared (for backward compatibility)
export { Pagination } from "@/shared/components/Pagination";

// User forms
export { UserForm } from "./UserForm";
export { UserEditForm } from "./UserEditForm";
export { StaffUserForm } from "./StaffUserForm";
export { ExternalUserForm } from "./ExternalUserForm";

// User detail sections
export { PersonalInfoSection } from "./PersonalInfoSection";
export { PersonalInformationCard } from "./PersonalInformationCard";
export { ProfileSection } from "./ProfileSection";
export { MembershipSection } from "./MembershipSection";
export { StatusSection } from "./StatusSection";
export { PublicAppearanceSection } from "./PublicAppearanceSection";

// User detail fields
export { PersonalInfoFields } from "./PersonalInfoFields";
export { ProfileFields } from "./ProfileFields";
export { MembershipFields } from "./MembershipFields";
export { AccountFields } from "./AccountFields";

// User actions
export { UserAdminActionButtons } from "./UserAdminActionButtons";
export { RequestMergeUserDialog } from "./RequestMergeUserDialog";
export { InAppSearchSection } from "./InAppSearchSection";

// Caretaker components
export * from "./caretaker";

// Modals
export * from "./modals";
