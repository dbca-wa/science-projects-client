import { apiClient } from "./api/client.service";
import type {
	ICaretakerRequest,
	ICaretakerCheckResponse,
	IPendingCaretakerRequest,
} from "@/shared/types/caretaker.types";

/**
 * Shared caretaker service functions used across multiple features.
 * The canonical caretaker endpoints and full CRUD live in features/caretakers/.
 * Only the functions needed by shared/ hooks are duplicated here.
 */

const CARETAKER_ENDPOINTS = {
	REQUESTS_CREATE: "caretakers/requests/create",
	REQUESTS_CANCEL: (taskId: number) => `caretakers/requests/${taskId}/cancel`,
	CHECK: "caretakers/check",
	REQUESTS_LIST: (userId: number) => `caretakers/requests?user_id=${userId}`,
} as const;

/**
 * Request a caretaker (creates AdminTask via caretakers app)
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
 * Cancel a caretaker request (AdminTask)
 */
export const cancelCaretakerRequest = async (taskId: number): Promise<void> => {
	await apiClient.post(CARETAKER_ENDPOINTS.REQUESTS_CANCEL(taskId));
};

/**
 * Check caretaker status for the current user
 */
export const getCaretakerCheck = async (): Promise<ICaretakerCheckResponse> => {
	return apiClient.get<ICaretakerCheckResponse>(CARETAKER_ENDPOINTS.CHECK);
};

/**
 * Get pending caretaker requests for a user
 */
export const getPendingCaretakerRequests = async (
	userId: number
): Promise<IPendingCaretakerRequest[]> => {
	return apiClient.get<IPendingCaretakerRequest[]>(
		CARETAKER_ENDPOINTS.REQUESTS_LIST(userId)
	);
};
