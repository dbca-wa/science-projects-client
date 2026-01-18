import type { IUserData, IUserMe } from "@/shared/types/user.types";

// ============================================================================
// USER FORM DATA (Feature-specific)
// ============================================================================

/**
 * Form data for creating a new user
 * Used by UserForm component in create mode
 */
export interface UserCreationFormData {
  // Required fields
  username: string;
  firstName: string;
  lastName: string;
  email: string;

  // Optional personal info
  displayFirstName?: string;
  displayLastName?: string;
  title?: string;
  phone?: string;
  fax?: string;

  // Profile
  image?: File | null;
  about?: string;
  expertise?: string;

  // Membership
  isStaff?: boolean;
  branch?: number;
  businessArea?: number;
  affiliation?: number;
}

/**
 * Form data for editing an existing user
 * Username is excluded (immutable)
 * Image can be File (new upload) or string (existing URL)
 */
export interface UserEditFormData {
  // Personal info (all optional for edit)
  displayFirstName?: string;
  displayLastName?: string;
  title?: string;
  phone?: string;
  fax?: string;

  // Profile
  image?: File | string | null;
  about?: string;
  expertise?: string;

  // Membership
  branch?: number;
  businessArea?: number;
  affiliation?: number;
}

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
  businessArea?: string | number;
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
