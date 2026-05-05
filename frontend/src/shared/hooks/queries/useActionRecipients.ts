import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

interface ActionRecipient {
	name: string;
	email: string;
	role: string;
}

interface ActionRecipientsResponse {
	recipients: ActionRecipient[];
	role_label: string;
	warning?: string;
}

export type { ActionRecipient, ActionRecipientsResponse };

/**
 * Query keys for action recipients
 */
export const actionRecipientsKeys = {
	all: ["action-recipients"] as const,
	detail: (documentId: number, action: string, stage: number) =>
		[...actionRecipientsKeys.all, documentId, action, stage] as const,
};

/**
 * Hook for fetching email recipients for a document action.
 * Returns the actual people who will receive the notification email,
 * allowing the modal to display names and emails before the user confirms.
 *
 * - Enabled only when all parameters are provided
 * - 30 second stale time (recipients can change if roles are reassigned)
 *
 * @param documentId - Document primary key
 * @param action - The document action (submit, approve, recall, send_back)
 * @param stage - Numeric approval stage (1 = project_lead, 2 = business_area_lead, 3 = directorate)
 */
export const useActionRecipients = (
	documentId: number | null,
	action: string | null,
	stage: number | null
) => {
	return useQuery({
		queryKey: actionRecipientsKeys.detail(
			documentId as number,
			action as string,
			stage as number
		),
		queryFn: () =>
			apiClient.get<ActionRecipientsResponse>(
				`documents/projectdocuments/${documentId}/action-recipients?action=${action}&stage=${stage}`
			),
		enabled: !!documentId && !!action && !!stage,
		staleTime: 30_000,
	});
};
