import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProjectStatus } from "../services/project.service";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";
import type { ProjectStatus } from "@/shared/types/project.types";

interface SetProjectStatusParams {
	projectId: number;
	status: ProjectStatus;
}

/**
 * Hook for setting project status (superuser only)
 */
export const useSetProjectStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ projectId, status }: SetProjectStatusParams) =>
			updateProjectStatus(projectId, status),
		onSuccess: async (_, variables) => {
			console.log(
				"Set status success, invalidating queries for project:",
				variables.projectId
			);

			// Invalidate project query with await to ensure fresh data before modal closes
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

			console.log("Project query invalidated and refetched");

			toast.success("Project status updated");
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Could not set project status"
			);
			toast.error(message);
		},
	});
};
