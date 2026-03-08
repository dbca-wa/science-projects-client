import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

interface SetProjectAreasParams {
	projectId: number;
	areas: number[];
}

/**
 * Set project areas
 */
const setProjectAreas = async ({
	projectId,
	areas,
}: SetProjectAreasParams): Promise<void> => {
	await apiClient.post(`projects/${projectId}/areas`, { areas });
};

/**
 * Hook for setting project areas
 */
export const useSetProjectAreas = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: setProjectAreas,
		onSuccess: (_data, variables) => {
			toast.success("Project areas updated successfully");
			// Invalidate project query to refetch with new areas
			queryClient.invalidateQueries({
				queryKey: ["projects", variables.projectId],
			});
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Failed to update project areas"
			);
			toast.error(message);
		},
	});
};
