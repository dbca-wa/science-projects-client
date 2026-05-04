import { apiClient } from "@/shared/services/api/client.service";
import { CARETAKER_ENDPOINTS } from "./caretaker.endpoints";
import type {
	ICaretaker,
	ICaretakerResponse,
	ICaretakerRequest,
	IAdminTask,
} from "../types";

// ============================================================================
// CARETAKER STATUS (Read Only)
// ============================================================================

/**
 * Check caretaker status for the current user
 * Returns active caretaker, pending request, and become caretaker request
 * @returns Caretaker status with three objects
 */
export const getCaretakerCheck = async (): Promise<ICaretakerResponse> => {
	return apiClient.get<ICaretakerResponse>(CARETAKER_ENDPOINTS.CHECK);
};

/**
 * Delete a caretaker relationship
 * @param id - Caretaker relationship ID
 */
export const deleteCaretaker = async (id: number): Promise<void> => {
	await apiClient.delete(CARETAKER_ENDPOINTS.DELETE(id));
};

// ============================================================================
// CARETAKER REQUESTS (Workflow)
// ============================================================================

/**
 * Request a caretaker (creates AdminTask via caretakers app)
 * @param data - Caretaker request data
 * @returns Task ID and task details
 */
export const requestCaretaker = async (
	data: ICaretakerRequest
): Promise<{ task_id: number }> => {
	return apiClient.post<{ task_id: number }>(
		CARETAKER_ENDPOINTS.REQUESTS_CREATE,
		{
			user_id: data.user_id,
			caretaker_id: data.caretaker_id,
			reason: data.reason,
			end_date: data.end_date,
			notes: data.notes,
			approve_immediately: data.approve_immediately,
		}
	);
};

/**
 * Get pending caretaker requests for a user
 * @param userId - User ID to get requests for
 * @returns Array of pending AdminTask objects
 */
export const getPendingCaretakerRequests = async (
	userId: number
): Promise<IAdminTask[]> => {
	return apiClient.get<IAdminTask[]>(CARETAKER_ENDPOINTS.REQUESTS_LIST(userId));
};

/**
 * Get outgoing caretaker requests for a user
 * @param userId - User ID to get outgoing requests for
 * @returns Array of pending AdminTask objects where user is primary_user
 */
export const getOutgoingCaretakerRequests = async (
	userId: number
): Promise<IAdminTask[]> => {
	return apiClient.get<IAdminTask[]>(
		CARETAKER_ENDPOINTS.REQUESTS_OUTGOING(userId)
	);
};

/**
 * Approve a caretaker request
 * @param requestId - AdminTask ID
 * @returns Created caretaker relationship
 */
export const approveCaretakerRequest = async (
	requestId: number
): Promise<ICaretaker> => {
	return apiClient.post<ICaretaker>(
		CARETAKER_ENDPOINTS.REQUESTS_APPROVE(requestId)
	);
};

/**
 * Reject a caretaker request
 * @param requestId - AdminTask ID
 */
export const rejectCaretakerRequest = async (
	requestId: number
): Promise<void> => {
	await apiClient.post(CARETAKER_ENDPOINTS.REQUESTS_REJECT(requestId));
};

/**
 * Cancel a caretaker request (AdminTask)
 * @param taskId - AdminTask ID
 */
export const cancelCaretakerRequest = async (taskId: number): Promise<void> => {
	await apiClient.post(CARETAKER_ENDPOINTS.REQUESTS_CANCEL(taskId));
};
