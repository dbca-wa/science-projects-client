import type { IUserData, IUserMe } from "@/shared/types/user.types";
import type { RoleFilter } from "@/app/stores/derived/user-search.store";

// ============================================================================
// USER FORM DATA (Feature-specific)
// ============================================================================

/**
 * NOTE: User creation and edit form types are now defined in the schema files
 * and inferred from Zod schemas for type safety and validation consistency.
 *
 * Import from:
 * - StaffUserCreateFormData from "@/features/users/schemas/staffUserCreate.schema"
 * - ExternalUserCreateFormData from "@/features/users/schemas/externalUserCreate.schema"
 * - UserEditFormData from "@/features/users/schemas/userEdit.schema"
 * - Or from the barrel export: "@/features/users"
 */

// ============================================================================
// USER SEARCH & FILTERING (Feature-specific)
// ============================================================================

export interface UserSearchParams {
	searchTerm: string;
	filters: UserSearchFilters;
	page: number;
}

export interface UserSearchFilters {
	roleFilter?: RoleFilter;
	businessArea?: string | number;
	ignoreArray?: number[];
}

// ============================================================================
// COMPONENT PROPS (Feature-specific)
// ============================================================================

export interface UserCardProps {
	user: IUserData | IUserMe;
	onClick?: (user: IUserData | IUserMe) => void;
	clickable?: boolean;
}

export interface UserAvatarProps {
	user: IUserData | IUserMe;
	size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}
