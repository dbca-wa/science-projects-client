import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getReportInfos,
	createReportInfo,
	updateReportInfo,
	deleteReportInfo,
} from "../services/admin.service";
import type { IReportInfoForm } from "../types/admin.types";

/**
 * Fetch all report info records
 */
export const useReportInfo = () =>
	useQuery({
		queryKey: ["report-info"],
		queryFn: getReportInfos,
		staleTime: 10 * 60_000,
	});

/**
 * Create a new report info record (year + division only)
 */
export const useCreateReportInfo = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createReportInfo,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["report-info"] });
			await queryClient.invalidateQueries({ queryKey: ["reports"] });
			toast.success("Report info created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create report info");
		},
	});
};

/**
 * Update an existing report info record
 */
export const useUpdateReportInfo = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: IReportInfoForm }) =>
			updateReportInfo(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["report-info"] });
			toast.success("Report info updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update report info");
		},
	});
};

/**
 * Delete a report info record
 */
export const useDeleteReportInfo = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteReportInfo,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["report-info"] });
			toast.success("Report info deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete report info");
		},
	});
};
