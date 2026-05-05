import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { toast } from "sonner";

export interface SendAnnouncementPayload {
	recipient_groups: string[];
	custom_message?: string;
	custom_messages?: Record<string, string>;
	subject?: string;
	division?: string;
	excluded_user_ids?: number[];
}

interface SendAnnouncementResponse {
	emails_sent: number;
	errors: string[];
}

/** Send announcement emails to selected recipient groups */
export const useSendAnnouncement = () => {
	return useMutation({
		mutationFn: (data: SendAnnouncementPayload) =>
			apiClient.post<SendAnnouncementResponse>(
				"adminoptions/send-announcement",
				data
			),
		onSuccess: (data) => {
			toast.success(
				`Announcement sent to ${data.emails_sent} recipient${data.emails_sent !== 1 ? "s" : ""}`
			);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to send announcement");
		},
	});
};

interface EmailPreviewResponse {
	html: string;
}

/** Fetch a rendered announcement email preview */
export const useAnnouncementEmailPreview = (enabled: boolean) => {
	return useQuery({
		queryKey: ["announcement", "email-preview"],
		queryFn: () =>
			apiClient.post<EmailPreviewResponse>(
				"adminoptions/announcement-email-preview",
				{
					recipient_name: "Recipient Name",
					custom_message: "",
					subject: "SPMS: Announcement",
				}
			),
		enabled,
		staleTime: 5 * 60_000,
	});
};
