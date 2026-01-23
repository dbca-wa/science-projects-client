import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../services/project.service";
import { toast } from "sonner";
import type { IProjectData } from "@/shared/types/project.types";

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
			// Show error toast
			toast.error(`Failed to create project: ${error.message}`);
		},
	});
};
