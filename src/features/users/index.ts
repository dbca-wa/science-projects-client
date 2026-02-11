/**
 * Users Feature
 * Barrel export for user management functionality
 */

// Components
export * from "./components";

// Hooks
export * from "./hooks";

// Types (from types directory - search, filters, props)
export type {
	UserSearchParams,
	UserSearchFilters,
	UserSearchResponse,
	UserCardProps,
	UserAvatarProps,
	SearchBarProps,
	FilterPanelProps,
	PaginationProps,
	UserDetailSectionProps,
} from "./types";

// Schemas (exports both schemas and their inferred types)
// These are the canonical form data types - use these instead of manual interfaces
export {
	userCreateSchema,
	userEditSchema,
	type UserCreateFormData,
	type UserEditFormData,
} from "./schemas";

// Note: caretakerRequestSchema moved to @/features/caretakers/schemas

// Services
export * from "./services";
