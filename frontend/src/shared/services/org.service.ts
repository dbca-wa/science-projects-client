import { apiClient } from "./api/client.service";
import type { IBusinessArea, IBranch, IAffiliation } from "@/shared/types/org.types";

/**
 * Organization-related API endpoints
 */
const ORG_ENDPOINTS = {
  BUSINESS_AREAS: {
    LIST: "agencies/business_areas",
  },
  BRANCHES: {
    LIST: "agencies/branches",
  },
  AFFILIATIONS: {
    LIST: "agencies/affiliations",
  },
  AGENCIES: {
    LIST: "agencies/list",
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
 * Get all affiliations
 * @returns Array of all affiliations
 */
export const getAllAffiliations = async (): Promise<IAffiliation[]> => {
  return apiClient.get<IAffiliation[]>(ORG_ENDPOINTS.AFFILIATIONS.LIST);
};
