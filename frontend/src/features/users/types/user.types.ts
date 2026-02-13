import type { IUserData, IUserMe } from "@/shared/types/user.types";

// ============================================================================
// USER FORM DATA (Feature-specific)
// ============================================================================

/**
 * NOTE: User creation and edit form types are now defined in the schema files
 * and inferred from Zod schemas for type safety and validation consistency.
 *
 * Import from:
 * - UserCreateFormData from "@/features/users/schemas/userCreate.schema"
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
	onlyExternal?: boolean;
	onlyStaff?: boolean;
	onlySuperuser?: boolean;
	onlyBALead?: boolean;
	businessArea?: string | number;
	ignoreArray?: number[];
}

export interface UserSearchResponse {
	users: IUserData[];
	total_results: number;
	total_pages: number;
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

export interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export interface FilterPanelProps {
	filters: UserSearchFilters;
	onFiltersChange: (filters: UserSearchFilters) => void;
}

export interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export interface UserDetailSectionProps {
	user: IUserData;
}
