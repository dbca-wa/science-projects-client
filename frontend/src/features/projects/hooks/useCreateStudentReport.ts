import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { useNavigate } from "react-router";
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
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createStudentReport,
		onSuccess: async (data, variables) => {
			toast.success(`Student report for ${data.year} created successfully`);

			// Refetch project data and wait for it to complete — ensures
			// the student reports tab exists before we navigate to it
			await Promise.all([
				queryClient.refetchQueries({
					queryKey: ["projects", "detail", variables.projectId],
				}),
				queryClient.invalidateQueries({
					queryKey: [
						"projects",
						variables.projectId,
						"student-reports",
						"available-years",
					],
				}),
			]);

			// Navigate to the student reports tab
			navigate(`/projects/${variables.projectId}/student`);
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
