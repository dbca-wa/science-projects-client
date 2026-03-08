import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { apiClient } from "@/shared/services/api/client.service";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

interface CloseProjectParams {
	projectId: number;
	outcome: "completed" | "terminated";
	reason: string;
}

/**
 * Close a project by creating a project closure document
 */
const closeProject = async ({
	projectId,
	outcome,
	reason,
}: CloseProjectParams): Promise<void> => {
	return apiClient.post<void>(`documents/projectdocuments`, {
		project: projectId,
		kind: "projectclosure",
		reason: reason,
		outcome: outcome,
	});
};

/**
 * Hook for closing a project
 */
export const useCloseProject = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: closeProject,
		onSuccess: async (_, variables) => {
			console.log(`[useCloseProject] Mutation succeeded`);
			console.log(`[useCloseProject] projectId:`, variables.projectId);

			toast.success("Closure requested");

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

			console.log(
				`[useCloseProject] Query invalidation complete, navigating to closure tab`
			);

			// Navigate to the closure tab
			navigate(`/projects/${variables.projectId}/closure`);
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Could not request closure"
			);
			console.error(`[useCloseProject] Mutation failed:`, error);
			toast.error(message);
		},
	});
};
