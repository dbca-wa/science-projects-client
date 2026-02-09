import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject } from "../services/project.service";
import { toast } from "sonner";
import type { IProjectData } from "@/shared/types/project.types";

/**
 * Hook for updating an existing project
 * - Invalidates project detail and list caches on success
 * - Shows success/error toast notifications
 * 
 * @returns TanStack Query mutation for project update
 */
export const useUpdateProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number | string; data: Partial<IProjectData> }) =>
			updateProject(id, data),
		onSuccess: (_updatedProject: IProjectData, variables) => {
			// Invalidate project detail to refetch updated data
			queryClient.invalidateQueries({
				queryKey: ["projects", "detail", variables.id],
			});

			// Invalidate project list in case title/status changed
			queryClient.invalidateQueries({ queryKey: ["projects"] });

			// Show success toast
			toast.success("Project updated successfully");
		},
		onError: (error: Error) => {
			// Show error toast
			toast.error(`Failed to update project: ${error.message}`);
		},
	});
};
