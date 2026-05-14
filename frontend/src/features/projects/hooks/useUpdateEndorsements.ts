import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";

interface UpdateEndorsementsData {
	ae_endorsement_required: boolean;
	ae_endorsement_provided: boolean;
	aec_pdf?: File;
}

const updateEndorsements = async (
	projectPlanId: number,
	data: UpdateEndorsementsData
): Promise<void> => {
	const formData = new FormData();

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
			headers: { "Content-Type": undefined },
		}
	);
};

export const useUpdateEndorsements = (projectPlanId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateEndorsementsData) =>
			updateEndorsements(projectPlanId, data),
		onSuccess: () => {
			toast.success("Endorsements updated successfully");
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update endorsements");
		},
	});
};
