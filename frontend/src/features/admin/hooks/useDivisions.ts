import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getDivisions,
	createDivision,
	updateDivision,
	deleteDivision,
} from "../services/admin.service";
import type { IDivisionForm } from "../types/admin.types";

/**
 * Fetch all divisions
 */
export const useDivisions = () =>
	useQuery({
		queryKey: ["divisions"],
		queryFn: getDivisions,
		staleTime: 10 * 60_000,
	});

/**
 * Create a new division
 */
export const useCreateDivision = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createDivision,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["divisions"] });
			toast.success("Division created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create division");
		},
	});
};

/**
 * Update an existing division
 */
export const useUpdateDivision = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: IDivisionForm }) =>
			updateDivision(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["divisions"] });
			toast.success("Division updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update division");
		},
	});
};

/**
 * Delete a division
 */
export const useDeleteDivision = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteDivision,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["divisions"] });
			toast.success("Division deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete division");
		},
	});
};
