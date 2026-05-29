import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
		mutationFn: (data?: { division?: string; send_notifications?: boolean }) =>
			batchApprove(data),
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
		mutationFn: (data?: { division?: string; send_notifications?: boolean }) =>
			batchApproveOld(data),
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
		mutationFn: (data?: {
			division?: string;
			update?: boolean;
			prepopulate?: boolean;
			send_emails?: boolean;
			recipient_groups?: string[];
			excluded_user_ids?: number[];
			recipient_user_pks?: number[];
			custom_message?: string;
			custom_messages?: {
				ba_leads: string;
				project_leads: string;
				team_members: string;
			};
		}) => openNewCycle(data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["report-info"] });
			await queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to open new cycle");
		},
	});
};

/** Load new cycle draft from database */
export const useNewCycleDraft = () => {
	return useQuery({
		queryKey: ["new-cycle-draft"],
		queryFn: () =>
			import("../services/admin.service").then((m) => m.getNewCycleDraft()),
		staleTime: 5 * 60_000,
	});
};

/** Save new cycle draft to database */
export const useSaveNewCycleDraft = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (draft: Record<string, unknown>) =>
			import("../services/admin.service").then((m) =>
				m.saveNewCycleDraft(draft)
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["new-cycle-draft"] });
			toast.success("Draft saved to database");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to save draft");
		},
	});
};

/** Delete the saved new cycle draft from the database */
export const useDeleteNewCycleDraft = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () =>
			import("../services/admin.service").then((m) => m.clearNewCycleDraft()),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["new-cycle-draft"] });
		},
		onError: () => {
			// Non-blocking — draft may not exist on the server
		},
	});
};
