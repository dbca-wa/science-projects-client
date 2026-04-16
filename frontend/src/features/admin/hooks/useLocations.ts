import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getLocations,
	createLocation,
	updateLocation,
	deleteLocation,
} from "../services/admin.service";
import type { ILocationForm } from "../types/admin.types";

/**
 * Fetch all locations
 */
export const useLocations = () =>
	useQuery({
		queryKey: ["locations"],
		queryFn: getLocations,
		staleTime: 10 * 60_000,
	});

/**
 * Create a new location
 */
export const useCreateLocation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createLocation,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["locations"] });
			toast.success("Location created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create location");
		},
	});
};

/**
 * Update an existing location
 */
export const useUpdateLocation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: ILocationForm }) =>
			updateLocation(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["locations"] });
			toast.success("Location updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update location");
		},
	});
};

/**
 * Delete a location
 */
export const useDeleteLocation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteLocation,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["locations"] });
			toast.success("Location deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete location");
		},
	});
};
