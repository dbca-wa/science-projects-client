import { apiClient } from "@/shared/services/api/client.service";
import { USER_ENDPOINTS } from "./user.endpoints";
import type { IUserData, IMemberUserDetails } from "@/shared/types/user.types";
import type {
  UserSearchFilters,
  UserSearchResponse,
} from "../types/user.types";

// ============================================================================
// USER SEARCH (Phase 1 - Read Only)
// ============================================================================

/**
 * Search users with filters and pagination
 * @param searchTerm - Search term to filter by username, first name, last name, or email
 * @param page - Page number for pagination
 * @param filters - Filter options (staff, external, superuser, business area, ignoreArray)
 * @returns Paginated user search results
 */
export const getUsersBasedOnSearchTerm = async (
  searchTerm: string,
  page: number,
  filters: UserSearchFilters
): Promise<UserSearchResponse> => {
  let url = `${USER_ENDPOINTS.SEARCH}?page=${page}`;

  if (searchTerm !== "") {
    url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
  }

  if (filters.onlyExternal) {
    url += "&only_external=true";
  }

  if (filters.onlyStaff) {
    url += "&only_staff=true";
  }

  if (filters.onlySuperuser) {
    url += "&only_superuser=true";
  }

  if (filters.businessArea) {
    url += `&businessArea=${filters.businessArea}`;
  }

  if (filters.ignoreArray && filters.ignoreArray.length > 0) {
    url += `&ignoreArray=${filters.ignoreArray.join(",")}`;
  }

  return apiClient.get<UserSearchResponse>(url);
};

// ============================================================================
// USER DETAIL (Phase 1 - Read Only)
// ============================================================================

/**
 * Get full user details by ID
 * @param id - User ID
 * @returns Full user data with caretaker fields
 */
export const getFullUser = async (id: number): Promise<IMemberUserDetails> => {
  return apiClient.get<IMemberUserDetails>(USER_ENDPOINTS.DETAIL(id));
};

/**
 * Get current authenticated user
 * @returns Current user data
 */
export const getMe = async (): Promise<IUserData> => {
  return apiClient.get<IUserData>(USER_ENDPOINTS.ME);
};

/**
 * Get all users (without pagination)
 * @returns Array of all users
 */
export const getUsers = async (): Promise<IUserData[]> => {
  return apiClient.get<IUserData[]>(USER_ENDPOINTS.LIST);
};

// ============================================================================
// USER MUTATIONS (Phase 2 - Create/Edit)
// ============================================================================

/**
 * Create a new user
 * @param data - User creation form data
 * @returns Created user data
 */
export const createUser = async (
  data: import("../types").UserCreationFormData
): Promise<IUserData> => {
  return apiClient.post<IUserData>(USER_ENDPOINTS.CREATE, {
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    isStaff: data.isStaff || false,
    branch: data.branch,
    businessArea: data.businessArea,
    affiliation: data.affiliation,
  });
};

/**
 * Update user personal information
 * @param userId - User primary key
 * @param data - Personal information to update
 */
export const updatePersonalInformation = async (
  userId: number,
  data: {
    display_first_name?: string;
    display_last_name?: string;
    title?: string;
    phone?: string;
    fax?: string;
  }
): Promise<void> => {
  await apiClient.put(USER_ENDPOINTS.PERSONAL_INFO(userId), data);
};

/**
 * Update user profile (avatar, about, expertise)
 * @param userId - User primary key
 * @param data - Profile data to update
 */
export const updateProfile = async (
  userId: number,
  data: {
    image?: File | string | null;
    about?: string;
    expertise?: string;
  }
): Promise<void> => {
  const formData = new FormData();
  formData.append("userPk", userId.toString());

  if (data.about !== undefined) {
    formData.append("about", data.about);
  }

  if (data.expertise !== undefined) {
    formData.append("expertise", data.expertise);
  }

  // Handle image: File/string means update, undefined means no change
  // Note: null is handled separately via removeUserAvatar
  if (data.image !== undefined && data.image !== null) {
    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else if (typeof data.image === "string") {
      formData.append("image", data.image);
    }
  }

  await apiClient.put(USER_ENDPOINTS.PROFILE(userId), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Remove user avatar
 * @param userId - User primary key
 */
export const removeUserAvatar = async (userId: number): Promise<void> => {
  await apiClient.post(USER_ENDPOINTS.REMOVE_AVATAR(userId));
};

/**
 * Update user membership (branch, business area, affiliation)
 * @param userId - User primary key
 * @param data - Membership data to update
 */
export const updateMembership = async (
  userId: number,
  data: {
    branch?: number | null;
    business_area?: number | null;
    affiliation?: number | null;
  }
): Promise<void> => {
  await apiClient.put(USER_ENDPOINTS.MEMBERSHIP(userId), {
    user_id: userId,
    branch_id: data.branch || 0,
    business_area: data.business_area || 0,
    affiliation: data.affiliation,
  });
};

/**
 * Admin update user - combines all update operations
 * @param userId - User primary key
 * @param data - Complete user edit form data
 * @returns Success message
 */
export const adminUpdateUser = async (
  userId: number,
  data: import("../types").UserEditFormData
): Promise<IUserData> => {
  // Update personal information
  if (
    data.displayFirstName ||
    data.displayLastName ||
    data.title ||
    data.phone ||
    data.fax
  ) {
    await updatePersonalInformation(userId, {
      display_first_name: data.displayFirstName,
      display_last_name: data.displayLastName,
      title: data.title,
      phone: data.phone,
      fax: data.fax,
    });
  }

  // Handle image removal separately
  if (data.image === null) {
    await removeUserAvatar(userId);
  }

  // Update profile (about, expertise, and image if not null)
  if (
    (data.image !== undefined && data.image !== null) ||
    data.about ||
    data.expertise
  ) {
    await updateProfile(userId, {
      image: data.image !== null ? data.image : undefined,
      about: data.about,
      expertise: data.expertise,
    });
  }

  // Update membership
  if (
    data.branch !== undefined ||
    data.businessArea !== undefined ||
    data.affiliation !== undefined
  ) {
    await updateMembership(userId, {
      branch: data.branch,
      business_area: data.businessArea,
      affiliation: data.affiliation,
    });
  }

  // Fetch and return updated user data
  return getFullUser(userId);
};

/**
 * Check if email already exists
 * @param email - Email to check
 * @returns Whether email exists
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  const response = await apiClient.post<{ exists: boolean }>(
    USER_ENDPOINTS.CHECK_EMAIL_EXISTS,
    { email }
  );
  return response.exists;
};

// ============================================================================
// ADMIN ACTIONS (Phase 3)
// ============================================================================

/**
 * Toggle user's admin status (promote/demote)
 * @param userId - User primary key
 * @returns Success response
 */
export const toggleAdminStatus = async (userId: number): Promise<void> => {
  await apiClient.post(USER_ENDPOINTS.TOGGLE_ADMIN(userId));
};

/**
 * Activate a user account
 * @param userId - User primary key
 * @returns Success response
 */
export const activateUser = async (userId: number): Promise<void> => {
  await apiClient.post(USER_ENDPOINTS.TOGGLE_ACTIVE(userId));
};

/**
 * Deactivate a user account
 * @param userId - User primary key
 * @returns Success response
 */
export const deactivateUser = async (userId: number): Promise<void> => {
  await apiClient.post(USER_ENDPOINTS.TOGGLE_ACTIVE(userId));
};

/**
 * Delete a user permanently
 * @param userId - User primary key
 * @returns Success response
 */
export const deleteUser = async (userId: number): Promise<void> => {
  await apiClient.delete(USER_ENDPOINTS.DELETE(userId));
};

/**
 * Request to merge users (creates admin task)
 * @param primaryUserId - Primary user ID (will be kept)
 * @param secondaryUserIds - Secondary user IDs (will be merged and deleted)
 * @returns Success response
 */
export const requestMergeUsers = async (
  primaryUserId: number,
  secondaryUserIds: number[]
): Promise<void> => {
  await apiClient.post(USER_ENDPOINTS.REQUEST_MERGE, {
    action: "mergeuser",
    status: "pending",
    requester: primaryUserId,
    primaryUserId: primaryUserId,
    secondaryUserIds: secondaryUserIds,
  });
};

/**
 * Toggle staff profile visibility
 * @param staffProfileId - Staff profile primary key
 * @returns Success response
 */
export const toggleStaffProfileVisibility = async (
  staffProfileId: number
): Promise<{ success: boolean }> => {
  return apiClient.post<{ success: boolean }>(
    USER_ENDPOINTS.TOGGLE_STAFF_PROFILE_VISIBILITY(staffProfileId)
  );
};
