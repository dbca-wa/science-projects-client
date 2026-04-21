import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getBranches,
	createBranch,
	updateBranch,
	deleteBranch,
} from "../services/admin.service";
import type { IBranchForm } from "../types/admin.types";

/**
 * Fetch all branches
 */
export const useBranches = () =>
	useQuery({
		queryKey: ["branches"],
		queryFn: getBranches,
		staleTime: 10 * 60_000,
	});

/**
 * Create a new branch
 */
export const useCreateBranch = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createBranch,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["branches"] });
			toast.success("Branch created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create branch");
		},
	});
};

/**
 * Update an existing branch
 */
export const useUpdateBranch = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: IBranchForm }) =>
			updateBranch(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["branches"] });
			toast.success("Branch updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update branch");
		},
	});
};

/**
 * Delete a branch
 */
export const useDeleteBranch = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteBranch,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["branches"] });
			toast.success("Branch deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete branch");
		},
	});
};
