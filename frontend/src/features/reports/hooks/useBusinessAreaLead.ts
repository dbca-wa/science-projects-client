import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getProblematicProjects,
	getUnapprovedDocs,
	getBusinessAreaDetail,
	updateBusinessAreaLead,
} from "../services/business-area.service";

// Re-export from shared for backward compatibility
export { useMyBusinessAreas } from "@/shared/hooks/queries/useMyBusinessAreas";

/**
 * Fetch a single business area by ID
 */
export const useBusinessAreaDetail = (id: number | undefined) =>
	useQuery({
		queryKey: ["business-areas", "detail", id],
		queryFn: () => getBusinessAreaDetail(id!),
		enabled: !!id,
		staleTime: 5 * 60_000,
	});

/**
 * Fetch problematic projects for a business area.
 * Query is gated by the `enabled` flag for lazy tab loading.
 */
export const useProblematicProjects = (baId: number, enabled: boolean) =>
	useQuery({
		queryKey: ["business-areas", baId, "problematic-projects"],
		queryFn: () => getProblematicProjects(baId),
		staleTime: 5 * 60_000,
		enabled,
	});

/**
 * Fetch unapproved documents for a business area.
 * Query is gated by the `enabled` flag for lazy tab loading.
 */
export const useUnapprovedDocs = (baId: number, enabled: boolean) =>
	useQuery({
		queryKey: ["business-areas", baId, "unapproved-docs"],
		queryFn: () => getUnapprovedDocs(baId),
		staleTime: 5 * 60_000,
		enabled,
	});

/**
 * Mutation to update a business area's name, image, or introduction.
 * Invalidates the BA list and detail caches on success.
 */
export const useUpdateBusinessAreaLead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
			updateBusinessAreaLead(id, formData),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["business-areas"],
				}),
				queryClient.invalidateQueries({
					queryKey: ["businessAreas"],
				}),
			]);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update business area");
		},
	});
};
