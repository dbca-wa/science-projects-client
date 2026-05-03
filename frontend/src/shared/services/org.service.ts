import { apiClient } from "./api/client.service";
import type {
	IBusinessArea,
	IBranch,
	IDivision,
} from "@/shared/types/org.types";

/**
 * Organization-related API endpoints
 */
const ORG_ENDPOINTS = {
	BUSINESS_AREAS: {
		LIST: "agencies/business_areas",
		MINE: "agencies/business_areas/mine",
	},
	BRANCHES: {
		LIST: "agencies/branches",
	},
	AGENCIES: {
		LIST: "agencies/list",
	},
	DIVISIONS: {
		LIST: "agencies/divisions",
	},
} as const;

/**
 * Get all business areas
 * @returns Array of all business areas
 */
export const getAllBusinessAreas = async (): Promise<IBusinessArea[]> => {
	return apiClient.get<IBusinessArea[]>(ORG_ENDPOINTS.BUSINESS_AREAS.LIST);
};

/**
 * Get all branches
 * @returns Array of all branches
 */
export const getAllBranches = async (): Promise<IBranch[]> => {
	return apiClient.get<IBranch[]>(ORG_ENDPOINTS.BRANCHES.LIST);
};

/**
 * Get all divisions
 * @returns Array of all divisions
 */
export const getDivisions = async (): Promise<IDivision[]> => {
	return apiClient.get<IDivision[]>(ORG_ENDPOINTS.DIVISIONS.LIST);
};

/**
 * Fetch business areas where the current user is the leader
 */
export const getMyBusinessAreas = async (): Promise<IBusinessArea[]> => {
	return apiClient.get<IBusinessArea[]>(ORG_ENDPOINTS.BUSINESS_AREAS.MINE);
};
