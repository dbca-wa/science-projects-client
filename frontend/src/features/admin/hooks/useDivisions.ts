import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createDivision,
	updateDivision,
	deleteDivision,
	updateDivisionKeyStakeholder,
	updateDivisionApprovers,
} from "../services/admin.service";
import type { IDivisionForm } from "../types/admin.types";

// Re-export from shared for backward compatibility
export { useDivisions } from "@/shared/hooks/queries/useDivisions";

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

/**
 * Update the key stakeholder for a division
 */
export const useUpdateKeyStakeholder = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			divisionId,
			userId,
		}: {
			divisionId: number;
			userId: number | null;
		}) => updateDivisionKeyStakeholder(divisionId, userId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["divisions"] });
			toast.success("Key stakeholder updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update key stakeholder");
		},
	});
};

/**
 * Update the approvers list for a division
 */
export const useUpdateApprovers = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			divisionId,
			userIds,
		}: {
			divisionId: number;
			userIds: number[];
		}) => updateDivisionApprovers(divisionId, userIds),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["divisions"] });
			toast.success("Approvers updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update approvers");
		},
	});
};
