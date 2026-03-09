import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";

interface UpdateEndorsementsData {
	ae_endorsement_required: boolean;
	ae_endorsement_provided: boolean;
	aec_pdf?: File;
	should_send_emails?: boolean;
}

const updateEndorsements = async (
	projectPlanId: number,
	data: UpdateEndorsementsData
): Promise<void> => {
	const formData = new FormData();

	// Only send the endorsement fields - backend doesn't use should_send_emails
	formData.append(
		"ae_endorsement_required",
		String(data.ae_endorsement_required)
	);
	formData.append(
		"ae_endorsement_provided",
		data.ae_endorsement_required === false
			? String(data.ae_endorsement_required)
			: String(data.ae_endorsement_provided)
	);

	if (data.aec_pdf) {
		formData.append("aec_pdf_file", data.aec_pdf);
	}

	await apiClient.post(
		`documents/project_plans/${projectPlanId}/seek_endorsement`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const useUpdateEndorsements = (projectPlanId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateEndorsementsData) =>
			updateEndorsements(projectPlanId, data),
		onSuccess: (_, variables) => {
			const message = variables.should_send_emails
				? "Endorsements updated and emails sent"
				: "Endorsements updated successfully";
			toast.success(message);
			// Invalidate project query to refresh endorsements data
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update endorsements");
		},
	});
};
