import { apiClient } from "@/shared/services/api/client.service";
import type { ICaretakerEntry, IMergeUserPk } from "@/shared/types/admin.types";
import type { IProjectLeadsEmail } from "@/shared/types/email.types";
import type { ISimplePkProp } from "@/shared/types/generic.types";
import type { IAffiliation } from "@/shared/types/org.types";
import type {
	IStaffEducationEntry,
	IStaffEmploymentEntry,
	KeywordTag,
} from "@/shared/types/staff-profile.types";
import type {
	IPersonalInformation,
	IProfile,
	IUserSearchFilters,
	IUserData,
} from "@/shared/types/user.types";
import type { UserData } from "../types/user.types";

export interface IDownloadBCSStaffCSVParams {
	in_spms?: boolean;
	is_active?: boolean;
}

export const downloadBCSStaffCSV = async (
	params: IDownloadBCSStaffCSVParams = {}
): Promise<Blob> => {
	const response = await apiClient.post<Blob>(
		"users/download_bcs_csv",
		params,
		{
			responseType: "blob",
		}
	);

	// Create a blob URL and trigger download
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

export const checkStaffStatusApiCall = async (
	pk: number
): Promise<{ is_staff: boolean }> => {
	return apiClient.post<{ is_staff: boolean }>(`users/is_staff/${pk}`);
};

// USER CREATION ==============================================================

export const getDoesUserWithEmailExist = async (
	email: string
): Promise<boolean> => {
	const response = await apiClient.post<{ exists: boolean }>(
		"users/check-email-exists",
		{ email }
	);
	return response.exists;
};

interface NameData {
	firstName: string;
	lastName: string;
}

export const getDoesUserWithFullNameExist = async ({
	firstName,
	lastName,
}: NameData): Promise<boolean> => {
	const response = await apiClient.post<{ exists: boolean }>(
		"users/check-name-exists",
		{
			first_name: firstName,
			last_name: lastName,
		}
	);
	return response.exists;
};

export const createUser = async (userData: UserData): Promise<IUserData> => {
	return apiClient.post<IUserData>("users/", userData);
};

export const mergeUsers = async (
	formData: IMergeUserPk
): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(`adminoptions/mergeusers`, {
		primaryUser: formData.primaryUserPk,
		secondaryUsers: formData.secondaryUserPks,
	});
};

export const getUserLastOnlineTimestamp = async (
	userId: string
): Promise<{ last_online: string }> => {
	return apiClient.get<{ last_online: string }>(`users/lastOnline/${userId}`);
};

// USERS ======================================================

export interface AdminSwitchVar {
	userPk: number | string;
}

export const switchAdmin = async ({
	userPk,
}: AdminSwitchVar): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(`users/${userPk}/admin`);
};

export interface PRPopulationVar {
	writeable_document_kind: string;
	section: string;
	project_pk: number;
}

export const getPreviousDataForProgressReportPopulation = async ({
	writeable_document_kind,
	section,
	project_pk,
}: PRPopulationVar): Promise<unknown> => {
	return apiClient.post<unknown>(`documents/get_previous_reports_data`, {
		writeable_document_kind,
		section,
		project_pk,
	});
};

export const deleteUserAdmin = async ({
	userPk,
}: AdminSwitchVar): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(`users/${userPk}`);
};

export const adminSetCaretaker = async ({
	userPk,
	caretakerPk,
	endDate,
	reason,
	notes,
}: ICaretakerEntry): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		`adminoptions/caretakers/adminsetcaretaker`,
		{
			userPk,
			caretakerPk,
			endDate,
			reason,
			notes,
		}
	);
};

export const becomeCaretaker = async ({
	userPk,
	caretakerPk,
	endDate,
	reason,
	notes,
}: ICaretakerEntry): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(`adminoptions/tasks`, {
		action: "setcaretaker",
		status: "pending",
		requester: caretakerPk,
		primary_user: userPk,
		secondary_users: [caretakerPk],
		end_date: endDate,
		reason,
		notes,
	});
};

export const requestCaretaker = async ({
	userPk,
	caretakerPk,
	endDate,
	reason,
	notes,
}: ICaretakerEntry): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(`adminoptions/tasks`, {
		action: "setcaretaker",
		status: "pending",
		requester: userPk,
		primary_user: userPk,
		secondary_users: [caretakerPk],
		end_date: endDate,
		reason,
		notes,
	});
};

export const checkPendingCaretakerRequestsByPk = async (
	pk: number
): Promise<unknown> => {
	return apiClient.post<unknown>(`adminoptions/caretakers/requests`, { pk });
};

export const removeCaretaker = async ({
	id,
}: {
	id: number;
}): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		`adminoptions/caretakers/${id}`
	);
};

export interface IExtendCaretakerProps {
	id: number;
	currentEndDate: Date;
	newEndDate: Date;
}

export const extendCaretaker = async ({
	id,
	currentEndDate,
	newEndDate,
}: IExtendCaretakerProps): Promise<{ success: boolean }> => {
	if (newEndDate <= currentEndDate) {
		throw new Error("The new end date must be after the current end date");
	}
	return apiClient.put<{ success: boolean }>(
		`adminoptions/caretakers/${id}`,
		{
			end_date: newEndDate,
		}
	);
};

export const cancelCaretakerRequest = async ({
	taskPk,
}: {
	taskPk: number;
}): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(`adminoptions/tasks/${taskPk}`, {
		status: "cancelled",
	});
};

export const batchApproveOLDProgressAndStudentReports = async (): Promise<{
	success: boolean;
}> => {
	return apiClient.post<{ success: boolean }>(`documents/batchapproveold`);
};

export const getEmailProjectList = async ({
	shouldDownloadList,
}: IProjectLeadsEmail): Promise<unknown> => {
	return apiClient.post<unknown>(`documents/get_project_lead_emails`, {
		shouldDownloadList,
	});
};

export const getStaffProfileEmailList = async (): Promise<unknown> => {
	return apiClient.get<unknown>(`users/get_staff_profile_emails`);
};

export const batchApproveProgressAndStudentReports = async (): Promise<{
	success: boolean;
}> => {
	return apiClient.post<{ success: boolean }>(`documents/batchapprove`);
};

export const toggleStaffProfileVisibility = async ({
	staffProfilePk,
}: {
	staffProfilePk: number;
}): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		`users/staffprofiles/${staffProfilePk}/toggle_visibility`
	);
};

export const toggleProjectVisibilityOnStaffProfile = async ({
	userPk,
	projectPk,
}: {
	userPk: number;
	projectPk: number;
}): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		`projects/${projectPk}/toggle_user_profile_visibility`,
		{
			user_pk: userPk,
		}
	);
};

export interface INewCycle {
	alsoUpdate: boolean;
	shouldSendEmails: boolean;
	shouldPrepopulate: boolean;
}

export const openNewCycle = async ({
	alsoUpdate,
	shouldSendEmails,
	shouldPrepopulate,
}: INewCycle): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(`documents/opennewcycle`, {
		update: alsoUpdate,
		send_emails: shouldSendEmails,
		prepopulate: shouldPrepopulate,
	});
};

export const deactivateUserAdmin = async ({
	userPk,
}: AdminSwitchVar): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(`users/${userPk}/toggleactive`);
};

export const getMe = async (): Promise<IUserData> => {
	return apiClient.get<IUserData>(`users/me`);
};

export const checkCaretakerStatus = async (): Promise<unknown> => {
	return apiClient.get<unknown>(`adminoptions/caretakers/checkcaretaker`);
};

export const getUsersProjects = async (pk: number): Promise<unknown> => {
	return apiClient.get<unknown>(`users/${pk}/projects`);
};

export const getUsersProjectsForStaffProfile = async (
	pk: number
): Promise<unknown> => {
	return apiClient.get<unknown>(`users/${pk}/projects_staff_profile`);
};

export interface IApproveProgressReport {
	kind: "studentreport" | "progressreport";
	isActive: number;
	reportPk: number;
	documentPk: number;
}

export const approveProgressReport = async ({
	isActive,
	kind,
	reportPk,
	documentPk,
}: IApproveProgressReport): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		`documents/actions/finalApproval`,
		{
			kind,
			reportPk,
			documentPk,
			isActive: isActive.toString() === "1",
		}
	);
};

export const getTeamLead = async (pk: number): Promise<IUserData> => {
	return apiClient.get<IUserData>(`projects/project_members/${pk}/leader`);
};

export interface IUnapprovedDocsForBAProps {
	baArray: number[];
}

export const getUnapprovedDocsForBusinessAreas = async ({
	baArray,
}: IUnapprovedDocsForBAProps): Promise<unknown> => {
	return apiClient.post<unknown>(`agencies/business_areas/unapproved_docs`, {
		baArray,
	});
};

export const getProblematicProjectsForBusinessAreas = async ({
	baArray,
}: IUnapprovedDocsForBAProps): Promise<unknown> => {
	return apiClient.post<unknown>(
		`agencies/business_areas/problematic_projects`,
		{ baArray }
	);
};

// CRITICAL: This is the one you need for useFullUserByPk
export const getFullUser = async (pk: number): Promise<IUserData | null> => {
	if (!pk || pk === 0) {
		return null;
	}
	return apiClient.get<IUserData>(`users/${pk}`);
};

export const getITAssetUser = async (pk: number): Promise<unknown> => {
	if (!pk || pk === 0) {
		return null;
	}
	return apiClient.get<unknown>(`users/${pk}/itassets`);
};

export const getSingleUser = async (userPk: number): Promise<IUserData> => {
	return apiClient.get<IUserData>(`users/${userPk}`);
};

export const getUsersBasedOnSearchTerm = async (
	searchTerm: string,
	page: number,
	filters: IUserSearchFilters
): Promise<{
	users: IUserData[];
	total_results: number;
	total_pages: number;
}> => {
	let url = `users/?page=${page}`;

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
	let url = `users/smallsearch`;

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

export const getUsers = async (): Promise<IUserData[]> => {
	return apiClient.get<IUserData[]>("users/");
};

// USER PROFILE ========================================================

export interface IProfileUpdateVariables {
	userPk: string;
	image?: File | string | null | undefined;
	about?: string;
	expertise?: string;
}

export interface IPIUpdateVariables {
	display_first_name: string;
	display_last_name: string;
	userPk: string;
	title: string;
	phone: string;
	fax: string;
}

export const getPersonalInformation = async (
	userId: number | string
): Promise<IPersonalInformation> => {
	return apiClient.get<IPersonalInformation>(`users/${userId}/pi`);
};

export const getProfile = async (
	userId: number | string
): Promise<IProfile> => {
	return apiClient.get<IProfile>(`users/${userId}/profile`);
};

export interface IFullUserUpdateVariables {
	display_first_name?: string;
	display_last_name?: string;
	userPk: string | number;
	title?: string;
	phone?: string;
	fax?: string;
	branch?: number | string;
	business_area?: number | string;
	image?: File | string | null | undefined;
	about?: string;
	expertise?: string;
	affiliation?: IAffiliation | number;
}

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

export const removeUserAvatar = async ({
	pk,
}: ISimplePkProp): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(`users/${pk}/remove_avatar`);
};

export interface IMembershipUpdateVariables {
	userPk: string | number;
	branch: number;
	business_area: number;
	affiliation?: number;
}

export const updateMembership = async ({
	userPk,
	branch,
	business_area,
	affiliation,
}: IMembershipUpdateVariables): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(`users/${userPk}/membership`, {
		user_pk: userPk,
		branch_pk: branch,
		business_area: business_area,
		affiliation: affiliation,
	});
};

export const updatePersonalInformation = async ({
	display_first_name,
	display_last_name,
	userPk,
	title,
	phone,
	fax,
}: IPIUpdateVariables): Promise<IPersonalInformation> => {
	return apiClient.put<IPersonalInformation>(`users/${userPk}/pi`, {
		display_first_name,
		display_last_name,
		title,
		phone,
		fax,
	});
};

export interface IMyBAUpdateSubmissionData {
	pk: number;
	introduction: string;
	image: File | null;
}

export const updateMyBa = async ({
	pk,
	introduction,
	image,
}: IMyBAUpdateSubmissionData): Promise<unknown> => {
	const formData = new FormData();

	if (image instanceof File) {
		formData.append("image", image);
	} else if (typeof image === "string") {
		formData.append("image", image);
	}

	if (introduction !== null) {
		formData.append("introduction", introduction);
	}

	return apiClient.put<unknown>(`agencies/business_areas/${pk}`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
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

	return apiClient.put<IProfile>(`users/${userPk}/profile`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
};

export interface IUpdateStaffOverviewSection {
	pk: number;
	about?: string;
	expertise?: string;
	keyword_tags?: KeywordTag[];
}

export const updateStaffProfileOverviewSection = async ({
	pk,
	about,
	expertise,
	keyword_tags,
}: IUpdateStaffOverviewSection): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(`users/staffprofiles/${pk}`, {
		about,
		expertise,
		keyword_tags,
	});
};

export const checkUserActiveAndGetStaffProfileData = async (
	pk: number
): Promise<unknown> => {
	return apiClient.get<unknown>(`users/${pk}/check_staff_profile`);
};

export interface IUpdateStaffHeroSection {
	pk: number;
	keyword_tags?: KeywordTag[];
}

export const updateStaffHeroSection = async ({
	pk,
	keyword_tags,
}: IUpdateStaffHeroSection): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(`users/staffprofiles/${pk}`, {
		keyword_tags,
	});
};

export interface IStaffPublicEmail {
	pk: number;
	senderEmail: string;
	message: string;
}

export const publicEmailStaffMember = async ({
	pk,
	senderEmail,
	message,
}: IStaffPublicEmail): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		`users/${pk}/public_email_staff_member`,
		{
			senderEmail,
			message,
		}
	);
};

export const createEmployment = async (
	data: IStaffEmploymentEntry
): Promise<IStaffEmploymentEntry> => {
	return apiClient.post<IStaffEmploymentEntry>(`users/employment_entries/`, {
		...data,
		end_year: data.end_year === "" ? null : data.end_year,
	});
};

export const createEducation = async (
	data: IStaffEducationEntry
): Promise<IStaffEducationEntry> => {
	return apiClient.post<IStaffEducationEntry>(
		`users/education_entries/`,
		data
	);
};

export interface IUpdatePublicEmail {
	staff_profile_pk: number;
	public_email: string;
}

export const updatePublicEmail = async ({
	staff_profile_pk,
	public_email,
}: IUpdatePublicEmail): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(
		`users/staffprofiles/${staff_profile_pk}`,
		{
			public_email,
		}
	);
};

export interface IUpdateCustomTitle {
	staff_profile_pk: number;
	custom_title: string;
	custom_title_on: boolean;
}

export const updateCustomTitle = async ({
	staff_profile_pk,
	custom_title,
	custom_title_on,
}: IUpdateCustomTitle): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(
		`users/staffprofiles/${staff_profile_pk}`,
		{
			custom_title,
			custom_title_on,
		}
	);
};

export const editEmployment = async ({
	pk,
	position_title,
	start_year,
	end_year,
	section,
	employer,
}: IStaffEmploymentEntry): Promise<IStaffEmploymentEntry> => {
	return apiClient.put<IStaffEmploymentEntry>(
		`users/employment_entries/${pk}`,
		{
			position_title,
			start_year,
			end_year: end_year === "" ? null : end_year,
			section,
			employer,
		}
	);
};

export const editEducation = async (
	data: IStaffEducationEntry
): Promise<IStaffEducationEntry> => {
	return apiClient.put<IStaffEducationEntry>(
		`users/education_entries/${data.pk}`,
		data
	);
};

export const deleteEmployment = async ({
	pk,
}: ISimplePkProp): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		`users/employment_entries/${pk}`
	);
};

export const deleteEducation = async ({
	pk,
}: ISimplePkProp): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		`users/education_entries/${pk}`
	);
};

export const getFullStaffProfile = async (pk: number): Promise<unknown> => {
	return apiClient.get<unknown>(`users/${pk}/staffprofiles`);
};

export const getPublicProfileHeroData = async (
	pk: number
): Promise<unknown> => {
	return apiClient.get<unknown>(`users/staffprofiles/${pk}/hero`);
};

export const getPublicProfileOverviewData = async (
	pk: number
): Promise<unknown> => {
	return apiClient.get<unknown>(`users/staffprofiles/${pk}/overview`);
};

export const getPublicProfileCVData = async (pk: number): Promise<unknown> => {
	return apiClient.get<unknown>(`users/staffprofiles/${pk}/cv`);
};

export const getStaffProfiles = async ({
	searchTerm,
	page,
	showHidden,
}: {
	searchTerm: string;
	page: number;
	showHidden: boolean;
}): Promise<unknown> => {
	const params = new URLSearchParams();
	if (searchTerm) params.append("searchTerm", searchTerm);
	params.append("page", page.toString());
	if (showHidden) params.append("showHidden", "true");

	return apiClient.get<unknown>(`users/staffprofiles?${params}`);
};
