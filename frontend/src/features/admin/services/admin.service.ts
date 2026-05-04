import { apiClient } from "@/shared/services/api/client.service";
import { ADMIN_ENDPOINTS } from "./admin.endpoints";
import type {
	IBranch,
	IBusinessArea,
	IBusinessAreaCreate,
	IBusinessAreaUpdate,
	IDivision,
	IAffiliation,
	IDepartmentalService,
	IAddress,
	ISimpleLocationData,
	IBranchForm,
	IAddressForm,
	IAffiliationForm,
	IDivisionForm,
	ILocationForm,
	IServiceForm,
	IReportInfoForm,
} from "../types/admin.types";
import type { IAnnualReport } from "@/shared/types/report.types";

// Branches
export const getBranches = async (): Promise<IBranch[]> => {
	return apiClient.get<IBranch[]>(ADMIN_ENDPOINTS.BRANCHES);
};

export const createBranch = async (data: IBranchForm): Promise<IBranch> => {
	return apiClient.post<IBranch>(ADMIN_ENDPOINTS.BRANCHES, data);
};

export const updateBranch = async (
	id: number,
	data: IBranchForm
): Promise<IBranch> => {
	return apiClient.put<IBranch>(ADMIN_ENDPOINTS.BRANCH_DETAIL(id), data);
};

export const deleteBranch = async (id: number): Promise<void> => {
	return apiClient.delete(ADMIN_ENDPOINTS.BRANCH_DETAIL(id));
};

// Business Areas
export const getBusinessAreas = async (): Promise<IBusinessArea[]> => {
	return apiClient.get<IBusinessArea[]>(ADMIN_ENDPOINTS.BUSINESS_AREAS);
};

export const createBusinessArea = async (
	data: IBusinessAreaCreate
): Promise<IBusinessArea> => {
	return apiClient.post<IBusinessArea>(ADMIN_ENDPOINTS.BUSINESS_AREAS, data);
};

export const updateBusinessArea = async (
	id: number,
	data: IBusinessAreaUpdate
): Promise<IBusinessArea> => {
	return apiClient.put<IBusinessArea>(
		ADMIN_ENDPOINTS.BUSINESS_AREA_DETAIL(id),
		data
	);
};

/** Create a business area using FormData (for image file uploads) */
export const createBusinessAreaFormData = async (
	formData: FormData
): Promise<IBusinessArea> => {
	return apiClient.post<IBusinessArea>(
		ADMIN_ENDPOINTS.BUSINESS_AREAS,
		formData,
		{
			headers: { "Content-Type": "multipart/form-data" },
		}
	);
};

/** Update a business area using FormData (for image file uploads) */
export const updateBusinessAreaFormData = async (
	id: number,
	formData: FormData
): Promise<IBusinessArea> => {
	return apiClient.put<IBusinessArea>(
		ADMIN_ENDPOINTS.BUSINESS_AREA_DETAIL(id),
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } }
	);
};

export const deleteBusinessArea = async (id: number): Promise<void> => {
	return apiClient.delete(ADMIN_ENDPOINTS.BUSINESS_AREA_DETAIL(id));
};

/** Fetch a single business area by ID (uses the full BusinessAreaSerializer) */
export const getBusinessAreaDetail = async (
	id: number
): Promise<IBusinessArea> => {
	return apiClient.get<IBusinessArea>(ADMIN_ENDPOINTS.BUSINESS_AREA_DETAIL(id));
};

// Affiliations
export const getAffiliations = async (): Promise<IAffiliation[]> => {
	return apiClient.get<IAffiliation[]>(ADMIN_ENDPOINTS.AFFILIATIONS);
};

export const createAffiliation = async (
	data: IAffiliationForm
): Promise<IAffiliation> => {
	return apiClient.post<IAffiliation>(ADMIN_ENDPOINTS.AFFILIATIONS, data);
};

export const updateAffiliation = async (
	id: number,
	data: IAffiliationForm
): Promise<IAffiliation> => {
	return apiClient.put<IAffiliation>(
		ADMIN_ENDPOINTS.AFFILIATION_DETAIL(id),
		data
	);
};

export const deleteAffiliation = async (id: number): Promise<void> => {
	return apiClient.delete(ADMIN_ENDPOINTS.AFFILIATION_DETAIL(id));
};

// Affiliation merge and clean operations
export const mergeAffiliations = async (data: {
	primaryAffiliation: { pk: number };
	secondaryAffiliations: { pk: number }[];
}): Promise<{ message: string }> => {
	return apiClient.post(ADMIN_ENDPOINTS.AFFILIATION_MERGE, data);
};

export const cleanOrphanedAffiliations = async (): Promise<{
	message: string;
	deleted_count: number;
}> => {
	return apiClient.post(ADMIN_ENDPOINTS.AFFILIATION_CLEAN);
};

// Divisions
// Re-exported from shared for backward compatibility
export { getDivisions } from "@/shared/services/org.service";

export const createDivision = async (
	data: IDivisionForm
): Promise<IDivision> => {
	return apiClient.post<IDivision>(ADMIN_ENDPOINTS.DIVISIONS, data);
};

export const updateDivision = async (
	id: number,
	data: IDivisionForm
): Promise<IDivision> => {
	return apiClient.put<IDivision>(ADMIN_ENDPOINTS.DIVISION_DETAIL(id), data);
};

export const deleteDivision = async (id: number): Promise<void> => {
	return apiClient.delete(ADMIN_ENDPOINTS.DIVISION_DETAIL(id));
};

/** Update the key stakeholder for a division */
export const updateDivisionKeyStakeholder = async (
	divisionId: number,
	userId: number | null
): Promise<IDivision> => {
	return apiClient.post<IDivision>(
		ADMIN_ENDPOINTS.DIVISION_EMAIL_LIST(divisionId),
		{ keyStakeholder: userId }
	);
};

/** Update the approvers list for a division */
export const updateDivisionApprovers = async (
	divisionId: number,
	userIds: number[]
): Promise<IDivision> => {
	return apiClient.post<IDivision>(
		ADMIN_ENDPOINTS.DIVISION_EMAIL_LIST(divisionId),
		{ approversList: userIds }
	);
};

// Services
export const getServices = async (): Promise<IDepartmentalService[]> => {
	return apiClient.get<IDepartmentalService[]>(ADMIN_ENDPOINTS.SERVICES);
};

export const createService = async (
	data: IServiceForm
): Promise<IDepartmentalService> => {
	return apiClient.post<IDepartmentalService>(ADMIN_ENDPOINTS.SERVICES, data);
};

export const updateService = async (
	id: number,
	data: IServiceForm
): Promise<IDepartmentalService> => {
	return apiClient.put<IDepartmentalService>(
		ADMIN_ENDPOINTS.SERVICE_DETAIL(id),
		data
	);
};

export const deleteService = async (id: number): Promise<void> => {
	return apiClient.delete(ADMIN_ENDPOINTS.SERVICE_DETAIL(id));
};

// Addresses
export const getAddresses = async (): Promise<IAddress[]> => {
	return apiClient.get<IAddress[]>(ADMIN_ENDPOINTS.ADDRESSES);
};

export const createAddress = async (data: IAddressForm): Promise<IAddress> => {
	return apiClient.post<IAddress>(ADMIN_ENDPOINTS.ADDRESSES, data);
};

export const updateAddress = async (
	id: number,
	data: IAddressForm
): Promise<IAddress> => {
	return apiClient.put<IAddress>(ADMIN_ENDPOINTS.ADDRESS_DETAIL(id), data);
};

export const deleteAddress = async (id: number): Promise<void> => {
	return apiClient.delete(ADMIN_ENDPOINTS.ADDRESS_DETAIL(id));
};

// Locations
export const getLocations = async (): Promise<ISimpleLocationData[]> => {
	return apiClient.get<ISimpleLocationData[]>(ADMIN_ENDPOINTS.LOCATIONS);
};

export const createLocation = async (
	data: ILocationForm
): Promise<ISimpleLocationData> => {
	return apiClient.post<ISimpleLocationData>(ADMIN_ENDPOINTS.LOCATIONS, data);
};

export const updateLocation = async (
	id: number,
	data: ILocationForm
): Promise<ISimpleLocationData> => {
	return apiClient.put<ISimpleLocationData>(
		ADMIN_ENDPOINTS.LOCATION_DETAIL(id),
		data
	);
};

export const deleteLocation = async (id: number): Promise<void> => {
	return apiClient.delete(ADMIN_ENDPOINTS.LOCATION_DETAIL(id));
};

// Report Info
export const getReportInfos = async (): Promise<IAnnualReport[]> => {
	return apiClient.get<IAnnualReport[]>(ADMIN_ENDPOINTS.REPORTS);
};

export const createReportInfo = async (data: {
	year: number;
	division: number;
}): Promise<IAnnualReport> => {
	return apiClient.post<IAnnualReport>(ADMIN_ENDPOINTS.REPORTS, data);
};

export const updateReportInfo = async (
	id: number,
	data: IReportInfoForm
): Promise<IAnnualReport> => {
	return apiClient.put<IAnnualReport>(ADMIN_ENDPOINTS.REPORT_DETAIL(id), data);
};

export const deleteReportInfo = async (id: number): Promise<void> => {
	return apiClient.delete(ADMIN_ENDPOINTS.REPORT_DETAIL(id));
};

// Admin actions
export const batchApprove = async (data?: {
	division?: string;
	send_notifications?: boolean;
}): Promise<void> => {
	return apiClient.post(ADMIN_ENDPOINTS.BATCH_APPROVE, {
		division: data?.division,
		send_notifications: data?.send_notifications ?? false,
	});
};

export const batchApproveOld = async (data?: {
	division?: string;
	send_notifications?: boolean;
}): Promise<void> => {
	return apiClient.post(ADMIN_ENDPOINTS.BATCH_APPROVE_OLD, {
		division: data?.division,
		send_notifications: data?.send_notifications ?? false,
	});
};

export const openNewCycle = async (data?: {
	division?: string;
	update?: boolean;
	prepopulate?: boolean;
	send_emails?: boolean;
	recipient_groups?: string[];
	excluded_user_ids?: number[];
	custom_message?: string;
	custom_messages?: {
		ba_leads: string;
		project_leads: string;
		team_members: string;
	};
}): Promise<void> => {
	return apiClient.post(ADMIN_ENDPOINTS.OPEN_NEW_CYCLE, {
		division: data?.division,
		update: data?.update ?? true,
		prepopulate: data?.prepopulate ?? false,
		send_emails: data?.send_emails ?? false,
		recipient_groups: data?.recipient_groups,
		excluded_user_ids: data?.excluded_user_ids,
		custom_message: data?.custom_message,
		custom_messages: data?.custom_messages,
	});
};

// Email testing settings
export interface IEmailTestingSettings {
	email_testing_mode: boolean;
	email_test_user: number | null;
}

export interface IAdminOptionsResponse {
	id: number;
	email_testing_mode: boolean;
	email_test_user: {
		id: number;
		display_first_name: string;
		display_last_name: string;
		email: string;
	} | null;
}

export const getEmailTestingSettings =
	async (): Promise<IAdminOptionsResponse> => {
		return apiClient.get<IAdminOptionsResponse>(
			ADMIN_ENDPOINTS.ADMIN_OPTIONS_DETAIL(1)
		);
	};

export const updateEmailTestingSettings = async (
	data: IEmailTestingSettings
): Promise<IAdminOptionsResponse> => {
	return apiClient.put<IAdminOptionsResponse>(
		ADMIN_ENDPOINTS.ADMIN_OPTIONS_DETAIL(1),
		data
	);
};

export const sendAllTestEmails = async (overrides?: {
	recipient_user_id?: number | null;
	actioner_user_id?: number | null;
	template_name?: string;
}): Promise<{
	message: string;
	preview_dir: string;
	results: Array<{ template: string; status?: string; error?: string }>;
}> => {
	return apiClient.post(ADMIN_ENDPOINTS.SEND_ALL_TEST_EMAILS, overrides ?? {});
};

// New cycle draft (database persistence)
export interface NewCycleDraftResponse {
	draft: Record<string, unknown> | null;
}

export const getNewCycleDraft = async (): Promise<NewCycleDraftResponse> => {
	return apiClient.get<NewCycleDraftResponse>(ADMIN_ENDPOINTS.NEW_CYCLE_DRAFT);
};

export const saveNewCycleDraft = async (
	draft: Record<string, unknown>
): Promise<{ status: string }> => {
	return apiClient.post(ADMIN_ENDPOINTS.NEW_CYCLE_DRAFT, { draft });
};

export const clearNewCycleDraft = async (): Promise<{ status: string }> => {
	return apiClient.delete(ADMIN_ENDPOINTS.NEW_CYCLE_DRAFT);
};

// Data list services
import type {
	IUnapprovedProject,
	IProblematicProjectsData,
	IStaffUser,
} from "../types/admin.types";

export const getUnapprovedDocs = async (): Promise<IUnapprovedProject[]> => {
	return apiClient.get<IUnapprovedProject[]>(ADMIN_ENDPOINTS.UNAPPROVED_DOCS);
};

export const getProblematicProjects =
	async (): Promise<IProblematicProjectsData> => {
		return apiClient.get<IProblematicProjectsData>(
			ADMIN_ENDPOINTS.PROBLEMATIC_PROJECTS
		);
	};

/** Paginated user list response from the users/list endpoint */
interface IUserListResponse {
	users: IStaffUser[];
	total_results: number;
	total_pages: number;
}

export const getStaffUsers = async (): Promise<IStaffUser[]> => {
	const response = await apiClient.get<IUserListResponse>(
		`${ADMIN_ENDPOINTS.USERS_LIST}?only_staff=true`
	);
	return response.users;
};

export const getStaffEmailList = async (): Promise<IStaffUser[]> => {
	const response = await apiClient.get<IUserListResponse>(
		`${ADMIN_ENDPOINTS.USERS_LIST}?only_staff=true`
	);
	return response.users;
};

// Remedy service functions

export interface IRemedyResponse {
	successful: number;
	failed?: number;
	skipped?: number;
	details?: Array<Record<string, unknown>>;
}

export const remedyOpenClosed = async (data: {
	projects: number[];
	status: "active" | "suspended" | "completed" | "terminated";
}): Promise<IRemedyResponse> => {
	return apiClient.post<IRemedyResponse>(
		ADMIN_ENDPOINTS.REMEDY_OPEN_CLOSED,
		data
	);
};

export const remedyMemberless = async (data: {
	projects: number[];
}): Promise<IRemedyResponse> => {
	return apiClient.post<IRemedyResponse>(
		ADMIN_ENDPOINTS.REMEDY_MEMBERLESS,
		data
	);
};

export const remedyLeaderless = async (data: {
	projects: number[];
}): Promise<IRemedyResponse> => {
	return apiClient.post<IRemedyResponse>(
		ADMIN_ENDPOINTS.REMEDY_LEADERLESS,
		data
	);
};

export const remedyMultipleLeaders = async (data: {
	projects: number[];
}): Promise<IRemedyResponse> => {
	return apiClient.post<IRemedyResponse>(
		ADMIN_ENDPOINTS.REMEDY_MULTIPLE_LEADERS,
		data
	);
};

export const remedyExternalLeaders = async (data: {
	projects: number[];
}): Promise<IRemedyResponse> => {
	return apiClient.post<IRemedyResponse>(
		ADMIN_ENDPOINTS.REMEDY_EXTERNAL_LEADERS,
		data
	);
};
