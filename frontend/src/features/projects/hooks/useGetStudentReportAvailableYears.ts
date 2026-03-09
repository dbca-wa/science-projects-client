import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

interface AvailableYear {
	pk: number;
	year: number;
}

/**
 * Fetch available years for student reports
 * Returns years that have annual reports but no student reports yet
 */
const getStudentReportAvailableYears = async (
	projectId: number
): Promise<AvailableYear[]> => {
	return apiClient.get<AvailableYear[]>(
		`documents/reports/availableyears/${projectId}/studentreport`
	);
};

/**
 * Hook for fetching available years for student reports
 */
export const useGetStudentReportAvailableYears = (
	projectId: number,
	enabled = true
) => {
	return useQuery({
		queryKey: ["projects", projectId, "student-reports", "available-years"],
		queryFn: () => getStudentReportAvailableYears(projectId),
		staleTime: 5 * 60_000, // 5 minutes
		enabled,
	});
};
