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
import type { IAnnualReport } from "@/features/reports/types/report.types";

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
export const getDivisions = async (): Promise<IDivision[]> => {
	return apiClient.get<IDivision[]>(ADMIN_ENDPOINTS.DIVISIONS);
};

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
export const batchApprove = async (divisionSlug?: string): Promise<void> => {
	return apiClient.post(ADMIN_ENDPOINTS.BATCH_APPROVE, {
		division: divisionSlug,
	});
};

export const batchApproveOld = async (divisionSlug?: string): Promise<void> => {
	return apiClient.post(ADMIN_ENDPOINTS.BATCH_APPROVE_OLD, {
		division: divisionSlug,
	});
};

export const openNewCycle = async (divisionSlug?: string): Promise<void> => {
	return apiClient.post(ADMIN_ENDPOINTS.OPEN_NEW_CYCLE, {
		division: divisionSlug,
	});
};
