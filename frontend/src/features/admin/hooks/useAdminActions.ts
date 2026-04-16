import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	batchApprove,
	batchApproveOld,
	openNewCycle,
} from "../services/admin.service";

/** Batch approve current reports */
export const useBatchApprove = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: batchApprove,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["report-info"] });
			await queryClient.invalidateQueries({ queryKey: ["reports"] });
			toast.success("Reports batch approved successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to batch approve reports");
		},
	});
};

/** Batch approve old reports */
export const useBatchApproveOld = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: batchApproveOld,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["report-info"] });
			await queryClient.invalidateQueries({ queryKey: ["reports"] });
			toast.success("Old reports batch approved successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to batch approve old reports");
		},
	});
};

/** Open a new reporting cycle */
export const useOpenNewCycle = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: openNewCycle,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["report-info"] });
			await queryClient.invalidateQueries({ queryKey: ["reports"] });
			toast.success("New reporting cycle opened successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to open new cycle");
		},
	});
};
