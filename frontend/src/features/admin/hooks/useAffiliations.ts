import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getAffiliations,
	createAffiliation,
	updateAffiliation,
	deleteAffiliation,
	mergeAffiliations,
	cleanOrphanedAffiliations,
} from "../services/admin.service";
import type { IAffiliationForm } from "../types/admin.types";

/**
 * Fetch all affiliations
 */
export const useAffiliations = () =>
	useQuery({
		queryKey: ["affiliations"],
		queryFn: getAffiliations,
		staleTime: 10 * 60_000,
	});

/**
 * Create a new affiliation
 */
export const useCreateAffiliation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAffiliation,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["affiliations"] });
			toast.success("Affiliation created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create affiliation");
		},
	});
};

/**
 * Update an existing affiliation
 */
export const useUpdateAffiliation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: IAffiliationForm }) =>
			updateAffiliation(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["affiliations"] });
			toast.success("Affiliation updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update affiliation");
		},
	});
};

/**
 * Delete an affiliation
 */
export const useDeleteAffiliation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteAffiliation,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["affiliations"] });
			toast.success("Affiliation deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete affiliation");
		},
	});
};

/**
 * Merge secondary affiliations into a primary affiliation
 */
export const useAffiliationMerge = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: mergeAffiliations,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["affiliations"] });
			toast.success("Affiliations merged successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to merge affiliations");
		},
	});
};

/**
 * Remove orphaned affiliations with no links to projects or users
 */
export const useAffiliationClean = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: cleanOrphanedAffiliations,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["affiliations"] });
			toast.success("Orphaned affiliations cleaned successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to clean orphaned affiliations");
		},
	});
};
