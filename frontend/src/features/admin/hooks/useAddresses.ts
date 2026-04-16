import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getAddresses,
	createAddress,
	updateAddress,
	deleteAddress,
} from "../services/admin.service";
import type { IAddressForm } from "../types/admin.types";

/**
 * Fetch all addresses
 */
export const useAddresses = () =>
	useQuery({
		queryKey: ["addresses"],
		queryFn: getAddresses,
		staleTime: 10 * 60_000,
	});

/**
 * Create a new address
 */
export const useCreateAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAddress,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["addresses"] });
			toast.success("Address created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create address");
		},
	});
};

/**
 * Update an existing address
 */
export const useUpdateAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: IAddressForm }) =>
			updateAddress(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["addresses"] });
			toast.success("Address updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update address");
		},
	});
};

/**
 * Delete an address
 */
export const useDeleteAddress = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteAddress,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["addresses"] });
			toast.success("Address deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete address");
		},
	});
};
