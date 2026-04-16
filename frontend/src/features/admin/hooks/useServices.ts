import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getServices,
	createService,
	updateService,
	deleteService,
} from "../services/admin.service";
import type { IServiceForm } from "../types/admin.types";

/**
 * Fetch all departmental services
 */
export const useServices = () =>
	useQuery({
		queryKey: ["services"],
		queryFn: getServices,
		staleTime: 10 * 60_000,
	});

/**
 * Create a new service
 */
export const useCreateService = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createService,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["services"] });
			toast.success("Service created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create service");
		},
	});
};

/**
 * Update an existing service
 */
export const useUpdateService = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: IServiceForm }) =>
			updateService(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["services"] });
			toast.success("Service updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update service");
		},
	});
};

/**
 * Delete a service
 */
export const useDeleteService = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteService,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["services"] });
			toast.success("Service deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete service");
		},
	});
};
