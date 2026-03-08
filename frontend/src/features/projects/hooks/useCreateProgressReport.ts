import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { useNavigate } from "react-router";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

interface CreateProgressReportParams {
	projectId: number;
	reportId?: number;
	year: number;
}

interface CreateProgressReportResponse {
	id: number;
	year: number;
	project: number;
}

/**
 * Create a new progress report
 */
const createProgressReport = async ({
	projectId,
	reportId,
	year,
}: CreateProgressReportParams): Promise<CreateProgressReportResponse> => {
	const payload: { year: number; report_id?: number } = { year };
	if (reportId !== undefined) {
		payload.report_id = reportId;
	}
	return apiClient.post<CreateProgressReportResponse>(
		`projects/${projectId}/progress-reports`,
		payload
	);
};

/**
 * Hook for creating a new progress report
 */
export const useCreateProgressReport = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: createProgressReport,
		onSuccess: (data, variables) => {
			toast.success(`Progress report for ${data.year} created successfully`);

			// Invalidate project query to refetch with new progress report
			queryClient.invalidateQueries({
				queryKey: ["projects", variables.projectId],
			});

			// Navigate to the new progress report tab
			// The tab index will be determined by the project detail page
			// based on the number of progress reports
			navigate(`/projects/${variables.projectId}`, {
				state: { scrollToProgressReports: true },
			});
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Failed to create progress report"
			);
			toast.error(message);
		},
	});
};
