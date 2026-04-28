import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getEmailTestingSettings,
	updateEmailTestingSettings,
	sendTestEmail,
	sendAllTestEmails,
	type IEmailTestingSettings,
} from "../services/admin.service";

/** Fetch current email testing settings from AdminOptions */
export const useEmailTestingSettings = () => {
	return useQuery({
		queryKey: ["admin-options", "email-testing"],
		queryFn: getEmailTestingSettings,
		staleTime: 5 * 60_000,
	});
};

/** Update email testing settings */
export const useUpdateEmailTestingSettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IEmailTestingSettings) =>
			updateEmailTestingSettings(data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["admin-options", "email-testing"],
			});
			toast.success("Email testing settings updated");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update email testing settings");
		},
	});
};

/** Send a test email to verify Mandrill configuration */
export const useSendTestEmail = () => {
	return useMutation({
		mutationFn: sendTestEmail,
		onSuccess: (data) => {
			toast.success(data.message || "Test email sent");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to send test email");
		},
	});
};

/** Send all email templates with sample data for visual review */
export const useSendAllTestEmails = () => {
	return useMutation({
		mutationFn: (overrides?: {
			recipient_user_id?: number | null;
			actioner_user_id?: number | null;
		}) => sendAllTestEmails(overrides),
		onSuccess: (data) => {
			toast.success(data.message || "All test emails sent");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to send all test emails");
		},
	});
};
