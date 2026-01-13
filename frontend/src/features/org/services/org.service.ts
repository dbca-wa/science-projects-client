import { apiClient } from "@/shared/services/api/client.service";
import { ORG_ENDPOINTS } from "./org.endpoints";
import type {
	IAddress,
	IAffiliation,
	IBranch,
	IBusinessAreaCreate,
	IDepartmentalService,
	IDivision,
} from "@/shared/types/org.types";
import type { IMergeAffiliation } from "@/shared/types/admin.types";
import type {
	IAddLocationForm,
	ISimpleLocationData,
	OrganisedLocationData,
} from "@/shared/types/location.types";
import { logger } from "@/shared/services/logger.service";
import type {
	BusinessAreaUpdateProps,
	IMyBAUpdateSubmissionData,
	IUnapprovedDocsForBAProps,
} from "../types/ba.types";

// ADDRESSES
export const getAllAddresses = async (): Promise<IAddress[]> => {
	return apiClient.get<IAddress[]>(ORG_ENDPOINTS.ADDRESSES.LIST);
};

export const createAddress = async (formData: IAddress): Promise<IAddress> => {
	return apiClient.post<IAddress>(ORG_ENDPOINTS.ADDRESSES.CREATE, formData);
};

export const updateAddress = async (formData: IAddress): Promise<IAddress> => {
	return apiClient.put<IAddress>(
		ORG_ENDPOINTS.ADDRESSES.UPDATE(formData.pk),
		formData
	);
};

export const deleteAddress = async (
	pk: number
): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		ORG_ENDPOINTS.ADDRESSES.DELETE(pk)
	);
};

// BRANCHES
export const getBranchByPk = async (pk: number): Promise<IBranch> => {
	return apiClient.get<IBranch>(ORG_ENDPOINTS.BRANCHES.DETAIL(pk));
};

export const getAllBranches = async (): Promise<IBranch[]> => {
	return apiClient.get<IBranch[]>(ORG_ENDPOINTS.BRANCHES.LIST);
};

export const getBranchesBasedOnSearchTerm = async (
	searchTerm: string,
	page: number
): Promise<{
	branches: IBranch[];
	total_results: number;
	total_pages: number;
}> => {
	let url = `${ORG_ENDPOINTS.BRANCHES.LIST}?page=${page}`;

	if (searchTerm !== "") {
		url += `&searchTerm=${searchTerm}`;
	}

	return apiClient.get<{
		branches: IBranch[];
		total_results: number;
		total_pages: number;
	}>(url);
};

export const createBranch = async (formData: IBranch): Promise<IBranch> => {
	return apiClient.post<IBranch>(ORG_ENDPOINTS.BRANCHES.CREATE, formData);
};

export const updateBranch = async (formData: IBranch): Promise<IBranch> => {
	return apiClient.put<IBranch>(
		ORG_ENDPOINTS.BRANCHES.UPDATE(formData.pk),
		formData
	);
};

export const deleteBranch = async (
	pk: number
): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		ORG_ENDPOINTS.BRANCHES.DELETE(pk)
	);
};

// AFFILIATIONS
export const getAffiliationByPk = async (pk: number): Promise<IAffiliation> => {
	return apiClient.get<IAffiliation>(ORG_ENDPOINTS.AFFILIATIONS.DETAIL(pk));
};

export const getAllAffiliations = async (): Promise<IAffiliation[]> => {
	return apiClient.get<IAffiliation[]>(ORG_ENDPOINTS.AFFILIATIONS.LIST);
};

export const getAffiliationsBasedOnSearchTerm = async (
	searchTerm: string,
	page: number
): Promise<{
	affiliations: IAffiliation[];
	total_results: number;
	total_pages: number;
}> => {
	let url = `${ORG_ENDPOINTS.AFFILIATIONS.LIST}?page=${page}`;

	if (searchTerm !== "") {
		url += `&searchTerm=${searchTerm}`;
	}

	return apiClient.get<{
		affiliations: IAffiliation[];
		total_results: number;
		total_pages: number;
	}>(url);
};

export const createAffiliation = async (
	formData: IAffiliation
): Promise<IAffiliation> => {
	return apiClient.post<IAffiliation>(
		ORG_ENDPOINTS.AFFILIATIONS.CREATE,
		formData
	);
};

export const mergeAffiliations = async (
	formData: IMergeAffiliation
): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		ORG_ENDPOINTS.AFFILIATIONS.MERGE,
		formData
	);
};

export const cleanOrphanedAffiliations = async (): Promise<{
	success: boolean;
}> => {
	return apiClient.post<{ success: boolean }>(
		ORG_ENDPOINTS.AFFILIATIONS.CLEAN_ORPHANED
	);
};

export const updateAffiliation = async (
	formData: IAffiliation
): Promise<IAffiliation> => {
	return apiClient.put<IAffiliation>(
		ORG_ENDPOINTS.AFFILIATIONS.UPDATE(formData.pk),
		formData
	);
};

export const deleteAffiliation = async (
	pk: number
): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		ORG_ENDPOINTS.AFFILIATIONS.DELETE(pk)
	);
};

// BUSINESS AREAS
export const getAllBusinessAreas = async (): Promise<unknown[]> => {
	return apiClient.get<unknown[]>(ORG_ENDPOINTS.BUSINESS_AREAS.LIST);
};

export const getMyBusinessAreas = async (): Promise<unknown[]> => {
	return apiClient.get<unknown[]>(ORG_ENDPOINTS.BUSINESS_AREAS.MINE);
};

export const getSingleBusinessArea = async (pk: number): Promise<unknown> => {
	return apiClient.get<unknown>(ORG_ENDPOINTS.BUSINESS_AREAS.DETAIL(pk));
};

export const createBusinessArea = async (
	formData: IBusinessAreaCreate
): Promise<unknown> => {
	const newFormData = new FormData();

	if (formData.division !== undefined) {
		newFormData.append("division", formData.division.toString());
	}
	if (formData.old_id !== undefined) {
		newFormData.append("old_id", formData.old_id.toString());
	}
	if (formData.name !== undefined) {
		newFormData.append("name", formData.name);
	}
	if (formData.agency !== undefined) {
		newFormData.append("agency", formData.agency.toString());
	}
	if (formData.focus !== undefined) {
		newFormData.append("focus", formData.focus);
	}
	if (formData.introduction !== undefined) {
		newFormData.append("introduction", formData.introduction);
	}
	if (formData.data_custodian !== undefined) {
		newFormData.append(
			"data_custodian",
			formData.data_custodian.toString()
		);
	}
	if (formData.finance_admin !== undefined) {
		newFormData.append("finance_admin", formData.finance_admin.toString());
	}
	if (formData.leader !== undefined) {
		newFormData.append("leader", formData.leader.toString());
	}
	if (formData.image !== null) {
		if (formData.image instanceof File) {
			newFormData.append("image", formData.image);
		} else if (typeof formData.image === "string") {
			newFormData.append("image", formData.image);
		}
	}

	return apiClient.post<unknown>(
		ORG_ENDPOINTS.BUSINESS_AREAS.CREATE,
		newFormData
	);
};

export const updateBusinessArea = async (
	formData: BusinessAreaUpdateProps
): Promise<unknown> => {
	const newFormData = new FormData();

	if (formData.division !== undefined) {
		newFormData.append("division", formData.division.toString());
	}
	if (formData.old_id !== undefined) {
		newFormData.append("old_id", formData.old_id.toString());
	}
	if (formData.name !== undefined) {
		newFormData.append("name", formData.name);
	}
	if (formData.slug !== undefined) {
		newFormData.append("slug", formData.slug);
	}
	if (formData.agency !== undefined) {
		newFormData.append("agency", formData.agency.toString());
	}
	if (formData.focus !== undefined) {
		newFormData.append("focus", formData.focus);
	}
	if (formData.introduction !== undefined) {
		newFormData.append("introduction", formData.introduction);
	}
	if (formData.data_custodian !== undefined) {
		newFormData.append(
			"data_custodian",
			formData.data_custodian.toString()
		);
	}
	if (formData.finance_admin !== undefined) {
		newFormData.append("finance_admin", formData.finance_admin.toString());
	}
	if (formData.leader !== undefined) {
		newFormData.append("leader", formData.leader.toString());
	}
	if (formData.image !== null) {
		if (formData.image instanceof File) {
			newFormData.append("image", formData.image);
		} else if (typeof formData.image === "string") {
			newFormData.append("image", formData.image);
		}
	} else {
		if (formData.selectedImageUrl === null) {
			newFormData.append("selectedImageUrl", "delete");
		}
	}

	return apiClient.put<unknown>(
		ORG_ENDPOINTS.BUSINESS_AREAS.UPDATE(formData.pk!),
		newFormData
	);
};

export const deleteBusinessArea = async (
	pk: number
): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		ORG_ENDPOINTS.BUSINESS_AREAS.DELETE(pk)
	);
};

export const activateBusinessArea = async (
	pk: number
): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		ORG_ENDPOINTS.BUSINESS_AREAS.SET_ACTIVE(pk)
	);
};

// DIVISIONS
export const getAllDivisions = async (): Promise<IDivision[]> => {
	return apiClient.get<IDivision[]>(ORG_ENDPOINTS.DIVISIONS.LIST);
};

export const createDivision = async (
	formData: IDivision
): Promise<IDivision> => {
	return apiClient.post<IDivision>(ORG_ENDPOINTS.DIVISIONS.CREATE, formData);
};

export const updateDivision = async (
	formData: IDivision
): Promise<IDivision> => {
	return apiClient.put<IDivision>(
		ORG_ENDPOINTS.DIVISIONS.UPDATE(formData.pk),
		formData
	);
};

export const deleteDivision = async (
	pk: number
): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		ORG_ENDPOINTS.DIVISIONS.DELETE(pk)
	);
};

// LOCATIONS
export const getAllLocations = async (): Promise<OrganisedLocationData> => {
	try {
		const locationsData = await apiClient.get<ISimpleLocationData[]>(
			ORG_ENDPOINTS.LOCATIONS.LIST
		);

		const organizedLocations: OrganisedLocationData = {
			dbcaregion: [],
			dbcadistrict: [],
			ibra: [],
			imcra: [],
			nrm: [],
		};

		locationsData.forEach((location: ISimpleLocationData) => {
			const areaType = location.area_type;
			if (areaType in organizedLocations) {
				organizedLocations[areaType].push(location);
			}
		});

		for (const areaType in organizedLocations) {
			organizedLocations[areaType].sort((a, b) => {
				const nameA = a.name.toUpperCase();
				const nameB = b.name.toUpperCase();
				if (nameA.startsWith("ALL ") && !nameB.startsWith("ALL ")) {
					return -1;
				} else if (
					!nameA.startsWith("ALL ") &&
					nameB.startsWith("ALL ")
				) {
					return 1;
				} else {
					return nameA.localeCompare(nameB);
				}
			});
		}

		return organizedLocations;
	} catch (error: unknown) {
		logger.error(error as string);
		return {
			dbcaregion: [],
			dbcadistrict: [],
			ibra: [],
			imcra: [],
			nrm: [],
		};
	}
};

export const createLocation = async (
	formData: IAddLocationForm
): Promise<IAddLocationForm> => {
	formData.old_id = 1;
	return apiClient.post<IAddLocationForm>(
		ORG_ENDPOINTS.LOCATIONS.CREATE,
		formData
	);
};

export const updateLocation = async (
	formData: IAddLocationForm
): Promise<IAddLocationForm> => {
	return apiClient.put<IAddLocationForm>(
		ORG_ENDPOINTS.LOCATIONS.UPDATE(formData.pk),
		formData
	);
};

export const deleteLocation = async (
	pk: number
): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		ORG_ENDPOINTS.LOCATIONS.DELETE(pk)
	);
};

// DEPARTMENTAL SERVICES
export const getAllDepartmentalServices = async (): Promise<
	IDepartmentalService[]
> => {
	return apiClient.get<IDepartmentalService[]>(ORG_ENDPOINTS.SERVICES.LIST);
};

export const createDepartmentalService = async (
	formData: IDepartmentalService
): Promise<IDepartmentalService> => {
	return apiClient.post<IDepartmentalService>(
		ORG_ENDPOINTS.SERVICES.CREATE,
		formData
	);
};

export const updateDepartmentalService = async (
	formData: IDepartmentalService
): Promise<IDepartmentalService> => {
	return apiClient.put<IDepartmentalService>(
		ORG_ENDPOINTS.SERVICES.UPDATE(formData.pk),
		formData
	);
};

export const deleteDepartmentalService = async (
	pk: number
): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		ORG_ENDPOINTS.SERVICES.DELETE(pk)
	);
};

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
