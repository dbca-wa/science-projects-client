import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	uploadReportMedia,
	deleteReportMedia,
} from "../services/report.service";

/**
 * Upload a report media image for a given section.
 * Invalidates the report media query on success.
 *
 * @param reportPk - The report primary key
 * @param section - The media section key (e.g. "dbca_banner")
 * @param callbacks - Optional callbacks for optimistic UI updates
 */
export function useUploadReportMedia(
	reportPk: number,
	section: string,
	callbacks?: {
		onSuccess?: () => void;
		onError?: () => void;
	}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (file: File) => uploadReportMedia(reportPk, section, file),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["reports", "media"] });
			callbacks?.onSuccess?.();
			toast.success("Image uploaded");
		},
		onError: (error: Error) => {
			callbacks?.onError?.();
			toast.error(error.message || "Failed to upload image");
		},
	});
}

/**
 * Delete a report media image for a given section.
 * Invalidates the report media query on success.
 *
 * @param reportPk - The report primary key
 * @param section - The media section key (e.g. "dbca_banner")
 */
export function useDeleteReportMedia(reportPk: number, section: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => deleteReportMedia(reportPk, section),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["reports", "media"] });
			toast.success("Image deleted");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete image");
		},
	});
}
