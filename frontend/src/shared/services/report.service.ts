import { apiClient } from "./api/client.service";
import type { IAnnualReport } from "@/shared/types/report.types";

/**
 * Shared report service functions used across multiple features.
 */

const REPORT_ENDPOINTS = {
	REPORTS_LIST: "documents/reports",
} as const;

/**
 * Fetch reports for a specific division (or all if no slug provided)
 */
export const getReportsForDivision = async (
	divisionSlug?: string
): Promise<IAnnualReport[]> => {
	const endpoint = divisionSlug
		? `${REPORT_ENDPOINTS.REPORTS_LIST}?division=${divisionSlug}`
		: REPORT_ENDPOINTS.REPORTS_LIST;
	return apiClient.get<IAnnualReport[]>(endpoint);
};
