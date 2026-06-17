import { apiClient } from "@/shared/services/api/client.service";

interface MergeUsersPayload {
	primaryUser: number;
	secondaryUsers: number[];
}

/**
 * Merge secondary user accounts into a primary user.
 * Transfers project memberships, comments, and documents
 * from secondary users to the primary user.
 */
export const mergeUsers = async (data: MergeUsersPayload): Promise<void> => {
	await apiClient.post("adminoptions/mergeusers", data);
};
