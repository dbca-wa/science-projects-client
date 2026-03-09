import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ContentType } from "@/shared/types/inline-edit.types";
import { CONTENT_TYPE_CONFIGS } from "@/shared/config/content-types.config";

export interface UseUpdateContentOptions {
	contentType: ContentType;
	entityId: number;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

/**
 * TanStack Query hook for updating content
 *
 * Looks up configuration from CONTENT_TYPE_CONFIGS and creates a mutation
 * with automatic query invalidation on success.
 *
 * @param options - Hook configuration options
 * @returns Mutation object with mutate, isLoading, error, etc.
 *
 * @example
 * const updateMutation = useUpdateContent({
 *   contentType: "project-aims",
 *   entityId: projectId,
 *   onSuccess: () => console.log("Saved!"),
 * });
 *
 * updateMutation.mutate("<p>New content</p>");
 */
export function useUpdateContent({
	contentType,
	entityId,
	onSuccess,
	onError,
}: UseUpdateContentOptions) {
	const queryClient = useQueryClient();
	const config = CONTENT_TYPE_CONFIGS[contentType];

	return useMutation({
		mutationFn: async (content: string) => {
			await config.updateFn(entityId, content);
		},
		onSuccess: () => {
			// Invalidate queries based on configuration
			const invalidateKeys = config.invalidateKeys(entityId);
			invalidateKeys.forEach((key) => {
				queryClient.invalidateQueries({ queryKey: key });
			});

			// Show success toast
			toast.success("Changes saved successfully");

			// Call custom onSuccess callback
			onSuccess?.();
		},
		onError: (error: Error) => {
			// Show error toast
			toast.error(error.message || "Failed to save changes");

			// Call custom onError callback
			onError?.(error);
		},
	});
}
