import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

interface SuspendProjectParams {
	projectId: number;
	suspend: boolean; // true = suspend, false = unsuspend
}

/**
 * Suspend or unsuspend a project
 */
const suspendProject = async ({
	projectId,
	suspend,
}: SuspendProjectParams): Promise<void> => {
	return apiClient.post<void>(`projects/${projectId}/suspend`, {
		suspend,
	});
};

/**
 * Hook for suspending or unsuspending a project
 */
export const useSuspendProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: suspendProject,
		onSuccess: async (_, variables) => {
			const action = variables.suspend ? "suspended" : "unsuspended";
			console.log(`[useSuspendProject] Mutation succeeded - ${action}`);
			console.log(`[useSuspendProject] projectId:`, variables.projectId);

			toast.success(`Project has been ${action}`);

			// Invalidate using predicate to match both string and number IDs
			await queryClient.invalidateQueries({
				predicate: (query) => {
					const [resource, type, id] = query.queryKey;
					// Match project detail queries where ID matches (as string or number)
					return (
						resource === "projects" &&
						type === "detail" &&
						(id === variables.projectId || id === String(variables.projectId))
					);
				},
			});

			console.log(`[useSuspendProject] Query invalidation complete`);
		},
		onError: (error: Error, variables) => {
			const action = variables.suspend ? "suspend" : "unsuspend";
			const message = extractUserFriendlyMessage(
				error,
				`Failed to ${action} project`
			);
			console.error(`[useSuspendProject] Mutation failed:`, error);
			toast.error(message);
		},
	});
};
