import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../services/project.service";
import { toast } from "sonner";
import type { IProjectData } from "@/shared/types/project.types";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

/**
 * Hook for creating a new project
 * - Invalidates project list cache on success
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for project creation
 */
export const useCreateProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<IProjectData>) => createProject(data),
		onSuccess: () => {
			// Invalidate project list to refetch with new project
			queryClient.invalidateQueries({ queryKey: ["projects"] });

			// Show success toast
			toast.success("Project created successfully");
		},
		onError: (error: Error) => {
			// Show user-friendly error toast
			const message = extractUserFriendlyMessage(
				error,
				"Failed to create project"
			);
			toast.error(message);
		},
	});
};
