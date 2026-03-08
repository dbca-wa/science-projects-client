import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateProjectPayload } from "@/features/projects/types/editProject.types";
import { apiClient } from "@/shared/services/api/client.service";

/**
 * Update a project
 */
async function updateProject(
	projectId: number,
	data: UpdateProjectPayload
): Promise<void> {
	// Handle image upload if it's a File
	if (data.image instanceof File) {
		const formData = new FormData();
		formData.append("image", data.image);

		// Append other fields
		Object.entries(data).forEach(([key, value]) => {
			if (key !== "image" && value !== null && value !== undefined) {
				formData.append(key, String(value));
			}
		});

		await apiClient.put(`/api/v1/projects/${projectId}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	} else {
		// Regular JSON update
		await apiClient.put(`/api/v1/projects/${projectId}`, data);
	}
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateProjectPayload }) =>
			updateProject(id, data),
		onSuccess: (_data, variables) => {
			// Invalidate project detail query
			queryClient.invalidateQueries({
				queryKey: ["projects", "detail", variables.id],
			});

			// Invalidate project list query
			queryClient.invalidateQueries({
				queryKey: ["projects"],
			});
		},
		onError: (error: Error) => {
			console.error("Failed to update project:", error);
		},
	});
}
