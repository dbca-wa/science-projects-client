// Shared user components
// Components used by 2+ features

export { BaseUserSearch } from "./BaseUserSearch";
export { UserSearchDropdown } from "./UserSearchDropdown";
export { UserDisplay } from "./UserDisplay";
export { UserCombobox } from "./UserCombobox";
export { DocumentUserSheet } from "./DocumentUserSheet";
export { UserLink } from "./UserLink";
export { UserTypeBadge } from "./UserTypeBadge";
export {
	getUserTypeVariant,
	getSimpleUserTypeVariant,
} from "./user-type.utils";
export type { UserTypeVariant } from "./user-type.utils";

// Re-export types
export type { BaseUserSearchRef } from "./BaseUserSearch";
export type { UserComboboxRef } from "./UserCombobox";
