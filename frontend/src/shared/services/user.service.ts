import { apiClient } from "@/shared/services/api/client.service";
import type { IUserData, IMemberUserDetails } from "@/shared/types/user.types";

/**
 * User search filter options
 */
export interface UserSearchFilters {
	roleFilter?: string;
	businessArea?: string | number;
	ignoreArray?: number[];
}

/**
 * User search response shape
 */
export interface UserSearchResponse {
	users: IUserData[];
	total_results: number;
	total_pages: number;
}

/** Endpoint constants used by shared user service functions */
const USER_SEARCH_URL = "users/list";
const USER_DETAIL_URL = (id: number | string) => `users/${id}`;

/**
 * Search users with filters and pagination
 */
export const getUsersBasedOnSearchTerm = async (
	searchTerm: string,
	page: number,
	filters: UserSearchFilters
): Promise<UserSearchResponse> => {
	let url = `${USER_SEARCH_URL}?page=${page}`;

	if (searchTerm !== "") {
		url += `&search=${encodeURIComponent(searchTerm)}`;
	}

	const roleFilter = filters.roleFilter;
	if (roleFilter && roleFilter !== "all") {
		const roleParamMap: Record<string, string> = {
			external: "only_external=true",
			staff: "only_staff=true",
			ba_lead: "only_ba_lead=true",
			approver: "approver=true",
			key_stakeholder: "only_key_stakeholder=true",
			admin: "only_superuser=true",
		};
		const param = roleParamMap[roleFilter];
		if (param) {
			url += `&${param}`;
		}
	}

	if (filters.businessArea) {
		url += `&businessArea=${filters.businessArea}`;
	}

	if (filters.ignoreArray && filters.ignoreArray.length > 0) {
		url += `&ignoreArray=${filters.ignoreArray.join(",")}`;
	}

	return apiClient.get<UserSearchResponse>(url);
};

/**
 * Get full user details by ID
 */
export const getFullUser = async (id: number): Promise<IMemberUserDetails> => {
	return apiClient.get<IMemberUserDetails>(USER_DETAIL_URL(id));
};
