import { apiClient } from "@/shared/services/api/client.service";
import { USER_ENDPOINTS } from "./user.endpoints";

// Typing =====================================================
import type { IMergeUserPk } from "@/shared/types/admin.types";
import type { ISimplePkProp } from "@/shared/types/generic.types";
import type { IAffiliation } from "@/shared/types/org.types";
import type {
	IDownloadBCSStaffCSVParams,
	IFullUserUpdateVariables,
	IMembershipUpdateVariables,
	IPIUpdateVariables,
	IProfileUpdateVariables,
} from "../types/user.types";
import type {
	IPersonalInformation,
	IProfile,
	IUserData,
	IUserSearchFilters,
} from "@/shared/types/user.types";

// Local interface only used in this file
interface NameData {
	firstName: string;
	lastName: string;
}

// USER VALIDATION ==============================================================

export const getDoesUserWithEmailExist = async (
	email: string
): Promise<boolean> => {
	const response = await apiClient.post<{ exists: boolean }>(
		USER_ENDPOINTS.CHECK_EMAIL_EXISTS,
		{ email }
	);
	return response.exists;
};

export const getDoesUserWithFullNameExist = async ({
	firstName,
	lastName,
}: NameData): Promise<boolean> => {
	const response = await apiClient.post<{ exists: boolean }>(
		USER_ENDPOINTS.CHECK_NAME_EXISTS,
		{
			first_name: firstName,
			last_name: lastName,
		}
	);
	return response.exists;
};

// USER CRUD ==============================================================

export const createUser = async (userData: IUserData): Promise<IUserData> => {
	return apiClient.post<IUserData>(USER_ENDPOINTS.CREATE, userData);
};

export const getUsers = async (): Promise<IUserData[]> => {
	return apiClient.get<IUserData[]>(USER_ENDPOINTS.LIST);
};

export const getMe = async (): Promise<IUserData> => {
	return apiClient.get<IUserData>(USER_ENDPOINTS.ME);
};

export const getFullUser = async (pk: number): Promise<IUserData> => {
	if (!pk || pk === 0) {
		throw new Error("Invalid user PK");
	}
	return apiClient.get<IUserData>(USER_ENDPOINTS.DETAIL(pk));
};

export const getSingleUser = async (userPk: number): Promise<IUserData> => {
	return apiClient.get<IUserData>(USER_ENDPOINTS.DETAIL(userPk));
};

export const deleteUserAdmin = async (
	userPk: number | string
): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		USER_ENDPOINTS.DELETE(userPk)
	);
};

// USER SEARCH ==============================================================

export const getUsersBasedOnSearchTerm = async (
	searchTerm: string,
	page: number,
	filters: IUserSearchFilters
): Promise<{
	users: IUserData[];
	total_results: number;
	total_pages: number;
}> => {
	let url = `${USER_ENDPOINTS.SEARCH}?page=${page}`;

	if (searchTerm !== "") {
		url += `&searchTerm=${searchTerm}`;
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

	return apiClient.get<{
		users: IUserData[];
		total_results: number;
		total_pages: number;
	}>(url);
};

export const getInternalUsersBasedOnSearchTerm = async (
	searchTerm: string,
	onlyInternal: boolean,
	projectPk?: number,
	ignoreArray?: number[]
): Promise<{ users: IUserData[] }> => {
	let url = USER_ENDPOINTS.SMALL_SEARCH;

	if (searchTerm !== "") {
		url += `?searchTerm=${searchTerm}`;
	}

	if (ignoreArray && ignoreArray.length > 0) {
		url += `${searchTerm ? "&" : "?"}ignoreArray=${ignoreArray.join(",")}`;
	}

	url += `${searchTerm ? "&" : "?"}onlyInternal=${
		onlyInternal === undefined || onlyInternal == false ? "False" : "True"
	}`;

	if (projectPk) {
		url += `${
			searchTerm || onlyInternal ? "&" : "?"
		}fromProject=${projectPk}`;
	}

	return apiClient.get<{ users: IUserData[] }>(url);
};

// DOWNLOADS/EXPORTS ==============================================================

export const downloadBCSStaffCSV = async (
	params: IDownloadBCSStaffCSVParams = {}
): Promise<Blob> => {
	const response = await apiClient.post<Blob>(
		USER_ENDPOINTS.DOWNLOAD_BCS_CSV,
		params,
		{
			responseType: "blob",
		}
	);

	const blob = new Blob([response], { type: "text/csv" });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `bcs_staff_${new Date().toISOString().split("T")[0]}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);

	return response;
};

// USER PROFILE ==============================================================

export const getPersonalInformation = async (
	userId: number | string
): Promise<IPersonalInformation> => {
	return apiClient.get<IPersonalInformation>(
		USER_ENDPOINTS.PERSONAL_INFO(userId)
	);
};

export const getProfile = async (
	userId: number | string
): Promise<IProfile> => {
	return apiClient.get<IProfile>(USER_ENDPOINTS.PROFILE(userId));
};

export const removeUserAvatar = async ({
	pk,
}: ISimplePkProp): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		USER_ENDPOINTS.REMOVE_AVATAR(pk)
	);
};

export const updateMembership = async ({
	userPk,
	branch,
	business_area,
	affiliation,
}: IMembershipUpdateVariables): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(
		USER_ENDPOINTS.MEMBERSHIP(userPk),
		{
			user_pk: userPk,
			branch_pk: branch,
			business_area: business_area,
			affiliation: affiliation,
		}
	);
};

export const updatePersonalInformation = async ({
	display_first_name,
	display_last_name,
	userPk,
	title,
	phone,
	fax,
}: IPIUpdateVariables): Promise<IPersonalInformation> => {
	return apiClient.put<IPersonalInformation>(
		USER_ENDPOINTS.PERSONAL_INFO(userPk),
		{
			display_first_name,
			display_last_name,
			title,
			phone,
			fax,
		}
	);
};

export const updateProfile = async ({
	userPk,
	image,
	about,
	expertise,
}: IProfileUpdateVariables): Promise<IProfile> => {
	const formData = new FormData();
	formData.append("userPk", userPk);

	if (about !== undefined) {
		formData.append("about", about);
	}

	if (expertise !== undefined) {
		formData.append("expertise", expertise);
	}

	if (image !== null) {
		if (image instanceof File) {
			formData.append("image", image);
		} else if (typeof image === "string") {
			formData.append("image", image);
		}
	}

	return apiClient.put<IProfile>(USER_ENDPOINTS.PROFILE(userPk), formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

// USER STATUS ==============================================================

export const checkStaffStatusApiCall = async (
	pk: number
): Promise<{ is_staff: boolean }> => {
	return apiClient.post<{ is_staff: boolean }>(USER_ENDPOINTS.IS_STAFF(pk));
};

export const getUserLastOnlineTimestamp = async (
	userId: string
): Promise<{ last_online: string }> => {
	return apiClient.get<{ last_online: string }>(
		USER_ENDPOINTS.LAST_ONLINE(userId)
	);
};

// USER PROJECTS ==============================================================

export const getUsersProjects = async (pk: number): Promise<unknown> => {
	return apiClient.get<unknown>(USER_ENDPOINTS.PROJECTS(pk));
};

// ADMIN ACTIONS ON USERS ==============================================================

export const switchAdmin = async (
	userPk: number | string
): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		USER_ENDPOINTS.TOGGLE_ADMIN(userPk)
	);
};

export const mergeUsers = async (
	formData: IMergeUserPk
): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(USER_ENDPOINTS.MERGE_USERS, {
		primaryUser: formData.primaryUserPk,
		secondaryUsers: formData.secondaryUserPks,
	});
};

export const deactivateUserAdmin = async (
	userPk: number | string
): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		USER_ENDPOINTS.TOGGLE_ACTIVE(userPk)
	);
};

export const adminUpdateUser = async ({
	display_first_name,
	display_last_name,
	userPk,
	title,
	phone,
	fax,
	branch,
	business_area,
	image,
	about,
	expertise,
	affiliation,
}: IFullUserUpdateVariables): Promise<{ ok: string }> => {
	const handleAffiliation = (affiliation: IAffiliation) => {
		if (typeof affiliation === "string") {
			return Number(affiliation);
		} else if (typeof affiliation === "number") {
			return affiliation;
		} else if (affiliation === undefined) {
			return affiliation;
		}
		return (affiliation as IAffiliation)?.pk;
	};

	const membershipData = {
		affiliation: handleAffiliation(affiliation as IAffiliation),
		userPk: userPk,
		branch: branch !== null && branch !== "" ? Number(branch) : 0,
		business_area:
			business_area !== null && business_area !== ""
				? Number(business_area)
				: 0,
	};

	await updateMembership(membershipData);

	if (image !== undefined && image !== null) {
		const profileData = {
			userPk: userPk.toString(),
			image: image !== undefined && image !== null ? image : "",
			about: about !== undefined && about !== "" ? about : "",
			expertise:
				expertise !== undefined && expertise !== "" ? expertise : "",
		};
		await updateProfile(profileData);
	} else {
		const profileData = {
			userPk: userPk.toString(),
			about: about !== undefined && about !== "" ? about : "",
			expertise:
				expertise !== undefined && expertise !== "" ? expertise : "",
		};
		await updateProfile(profileData);
	}

	const piData = {
		userPk: userPk.toString(),
		display_first_name:
			display_first_name !== undefined && display_first_name !== ""
				? display_first_name
				: "",
		display_last_name:
			display_last_name !== undefined && display_last_name !== ""
				? display_last_name
				: "",
		title: title !== undefined && title !== "" ? title : "",
		phone: phone !== undefined && phone !== "" ? phone : "",
		fax: fax !== undefined && fax !== "" ? fax : "",
	};

	await updatePersonalInformation(piData);

	return { ok: "Update successful" };
};
