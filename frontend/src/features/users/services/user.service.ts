import { apiClient } from "@/shared/services/api/client.service";
import { USER_ENDPOINTS } from "./user.endpoints";
import type { IUserData } from "@/shared/types/user.types";

// Import getFullUser for internal use (adminUpdateUser)
import { getFullUser as _getFullUser } from "@/shared/services/user.service";

// Re-export shared user service functions for backward compatibility
export {
	getUsersBasedOnSearchTerm,
	getFullUser,
} from "@/shared/services/user.service";

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
	data: import("../schemas/userCreate.schema").UserCreateFormData
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
		branch: data.branch || null,
		business_area: data.business_area || null,
		affiliation: data.affiliation || null,
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
	data: import("../schemas/userEdit.schema").UserEditFormData
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
	return _getFullUser(userId);
};

/**
 * Check if email already exists
 * @param email - Email to check
 * @returns Whether email exists
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
	const response = await apiClient.get<{ exists: boolean }>(
		USER_ENDPOINTS.CHECK_EMAIL_EXISTS,
		{ params: { email } }
	);
	return response.exists;
};

/**
 * Check if a user with the given name already exists
 * @param firstName - First name to check
 * @param lastName - Last name to check
 * @returns Whether a user with that name exists
 */
export const checkNameExists = async (
	firstName: string,
	lastName: string
): Promise<boolean> => {
	const response = await apiClient.get<{ exists: boolean }>(
		USER_ENDPOINTS.CHECK_NAME_EXISTS,
		{ params: { first_name: firstName, last_name: lastName } }
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
		primary_user: primaryUserId,
		secondary_users: secondaryUserIds,
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

/** Response from the invite endpoint */
export interface InviteResponse {
	email: string;
	first_name: string;
	last_name: string;
	invited: boolean;
}

/** Invite a DBCA user to SPMS (sends email only, no account creation) */
export const inviteUser = async (data: {
	email: string;
	first_name: string;
	last_name: string;
}): Promise<InviteResponse> => {
	return apiClient.post<InviteResponse>(USER_ENDPOINTS.INVITE, data);
};

/** IT Assets search result */
export interface ITAssetUser {
	employee_id: string;
	name: string;
	email: string;
	title: string;
	location: string;
	in_spms: boolean;
	already_invited: boolean;
}

/** Search IT Assets directory for DBCA users */
export const searchITAssets = async (query: string): Promise<ITAssetUser[]> => {
	return apiClient.get<ITAssetUser[]>(USER_ENDPOINTS.IT_ASSETS_SEARCH, {
		params: { q: query },
	});
};
