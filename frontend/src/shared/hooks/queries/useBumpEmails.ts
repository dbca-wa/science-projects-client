/**
 * Hooks for bump email functionality.
 * Supports single-document bumps and bulk bump-all with preview.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { DOCUMENT_ENDPOINTS } from "@/shared/services/document.endpoints";

interface BumpPreviewUser {
	user_id: number;
	name: string;
	email: string;
	as_project_lead_count: number;
	as_ba_lead_count: number;
	total: number;
	as_project_lead: Array<{
		document_id: number;
		project_title: string;
		project_id: number;
		document_kind: string;
		document_url: string;
	}>;
	as_ba_lead: Array<{
		document_id: number;
		project_title: string;
		project_id: number;
		document_kind: string;
		document_url: string;
	}>;
}

interface BumpPreviewResponse {
	users: BumpPreviewUser[];
	total_users: number;
	total_documents: number;
}

interface BumpAllResponse {
	emails_sent: number;
	total_users: number;
	errors: string[];
}

interface SingleBumpData {
	documentsRequiringAction: Array<{
		userToTakeAction: number;
		documentKind: string;
		projectTitle: string;
		projectId: number;
		actionCapacity: string;
		documentId: number;
	}>;
}

/** Fetch a preview of who would be bumped, optionally filtered by stage and report */
export const useBumpPreview = (
	enabled = false,
	stage?: 1 | 2,
	reportId?: number
) => {
	const params = new URLSearchParams();
	if (stage) params.set("stage", String(stage));
	if (reportId) params.set("report_id", String(reportId));
	const qs = params.toString();
	const endpoint = qs
		? `${DOCUMENT_ENDPOINTS.BUMP_PREVIEW}?${qs}`
		: DOCUMENT_ENDPOINTS.BUMP_PREVIEW;
	return useQuery({
		queryKey: ["bump", "preview", stage ?? "all", reportId ?? "all"],
		queryFn: () => apiClient.get<BumpPreviewResponse>(endpoint),
		enabled,
		staleTime: 30_000,
	});
};

/** Send consolidated bump emails, optionally filtered by stage and report */
export const useSendBumpAll = () => {
	return useMutation({
		mutationFn: (data?: { stage?: 1 | 2; report_id?: number }) =>
			apiClient.post<BumpAllResponse>(DOCUMENT_ENDPOINTS.SEND_BUMP_ALL, data),
		onSuccess: (data) => {
			toast.success(
				`Bump emails sent to ${data.emails_sent} user${data.emails_sent !== 1 ? "s" : ""}`
			);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to send bump emails");
		},
	});
};

/** Send a single bump email for a specific document */
export const useSendBump = () => {
	return useMutation({
		mutationFn: (data: SingleBumpData) =>
			apiClient.post(DOCUMENT_ENDPOINTS.SEND_BUMP, data),
		onSuccess: () => {
			toast.success("Reminder sent");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to send reminder");
		},
	});
};

interface BatchApproveResponse {
	approved: number;
}

/** Batch approve all stage-3 progress/student reports for the current year */
export const useBatchApproveCurrent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data?: { division?: string }) =>
			apiClient.post<BatchApproveResponse>(
				DOCUMENT_ENDPOINTS.BATCH_APPROVE_CURRENT,
				data
			),
		onSuccess: async (data) => {
			toast.success(
				`${data.approved} report${data.approved !== 1 ? "s" : ""} approved`
			);
			await queryClient.invalidateQueries({
				queryKey: ["reports", "inactive"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["reports", "progress"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["reports", "students"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to batch approve reports");
		},
	});
};

/** Batch approve older (prior-year) progress/student reports */
export const useBatchApproveOld = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data?: { division?: string }) =>
			apiClient.post<string>(DOCUMENT_ENDPOINTS.BATCH_APPROVE_OLD, data),
		onSuccess: async () => {
			toast.success("Prior-year reports approved");
			await queryClient.invalidateQueries({
				queryKey: ["reports", "inactive"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["reports", "progress"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["reports", "students"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to batch approve old reports");
		},
	});
};
