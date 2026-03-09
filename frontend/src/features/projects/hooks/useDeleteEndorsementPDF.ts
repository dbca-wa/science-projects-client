import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";

const deleteEndorsementPDF = async (projectPlanId: number): Promise<void> => {
	await apiClient.post(
		`documents/project_plans/${projectPlanId}/delete_aec_endorsement_pdf`
	);
};

export const useDeleteEndorsementPDF = (projectPlanId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deleteEndorsementPDF(projectPlanId),
		onSuccess: () => {
			toast.success("PDF deleted successfully");
			// Invalidate project query to refresh endorsements data
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete PDF");
		},
	});
};
