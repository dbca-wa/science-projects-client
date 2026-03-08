import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

interface CreateStudentReportParams {
	projectId: number;
	reportId: number;
	year: number;
}

interface CreateStudentReportResponse {
	id: number;
	year: number;
	project: number;
}

/**
 * Create a new student report
 */
const createStudentReport = async ({
	projectId,
	reportId,
	year,
}: CreateStudentReportParams): Promise<CreateStudentReportResponse> => {
	return apiClient.post<CreateStudentReportResponse>(
		`projects/${projectId}/student-reports`,
		{
			report_id: reportId,
			year,
			kind: "studentreport",
		}
	);
};

/**
 * Hook for creating a new student report
 */
export const useCreateStudentReport = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createStudentReport,
		onSuccess: (data, variables) => {
			toast.success(`Student report for ${data.year} created successfully`);

			// Invalidate queries
			setTimeout(() => {
				queryClient.invalidateQueries({
					queryKey: ["projects", variables.projectId],
				});
				queryClient.invalidateQueries({
					queryKey: [
						"projects",
						variables.projectId,
						"student-reports",
						"available-years",
					],
				});
			}, 350);
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Failed to create student report"
			);
			toast.error(message);
		},
	});
};
