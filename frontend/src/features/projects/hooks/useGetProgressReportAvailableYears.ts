import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

interface AvailableYear {
	pk: number;
	year: number;
}

/**
 * Fetch available years for progress reports
 * Returns years that have annual reports but no progress reports yet
 */
const getProgressReportAvailableYears = async (
	projectId: number
): Promise<AvailableYear[]> => {
	return apiClient.get<AvailableYear[]>(
		`documents/reports/availableyears/${projectId}/progressreport`
	);
};

/**
 * Hook for fetching available years for progress reports
 */
export const useGetProgressReportAvailableYears = (
	projectId: number,
	enabled = true
) => {
	return useQuery({
		queryKey: ["projects", projectId, "progress-reports", "available-years"],
		queryFn: () => getProgressReportAvailableYears(projectId),
		staleTime: 5 * 60_000, // 5 minutes
		enabled,
	});
};
