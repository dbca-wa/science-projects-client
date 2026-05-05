import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getBusinessAreas,
	getBusinessAreaDetail,
	createBusinessAreaFormData,
	updateBusinessAreaFormData,
	deleteBusinessArea,
} from "../services/admin.service";

/**
 * Fetch all business areas
 */
export const useBusinessAreas = () =>
	useQuery({
		queryKey: ["business-areas"],
		queryFn: getBusinessAreas,
		staleTime: 10 * 60_000,
	});

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
 * Create a new business area using FormData (for image uploads)
 */
export const useCreateBusinessAreaFormData = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createBusinessAreaFormData,
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["business-areas"] }),
				queryClient.invalidateQueries({ queryKey: ["businessAreas"] }),
			]);
			toast.success("Business area created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create business area");
		},
	});
};

/**
 * Update an existing business area using FormData (for image uploads)
 */
export const useUpdateBusinessAreaFormData = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
			updateBusinessAreaFormData(id, formData),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["business-areas"] }),
				queryClient.invalidateQueries({ queryKey: ["businessAreas"] }),
			]);
			toast.success("Business area updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update business area");
		},
	});
};

/**
 * Delete a business area
 */
export const useDeleteBusinessArea = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteBusinessArea,
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["business-areas"] }),
				queryClient.invalidateQueries({ queryKey: ["businessAreas"] }),
			]);
			toast.success("Business area deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete business area");
		},
	});
};
