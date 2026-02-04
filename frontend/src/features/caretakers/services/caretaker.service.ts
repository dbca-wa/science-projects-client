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
 * Check caretaker status for the current user (alias for compatibility)
 */
export const checkCaretaker = getCaretakerCheck;

// ============================================================================
// CARETAKER RELATIONSHIPS (CRUD)
// ============================================================================

/**
 * Get all caretakers
 * @returns Array of all caretaker relationships
 */
export const getCaretakers = async (): Promise<ICaretaker[]> => {
  return apiClient.get<ICaretaker[]>(CARETAKER_ENDPOINTS.LIST);
};

/**
 * Get a specific caretaker by ID
 * @param id - Caretaker relationship ID
 * @returns Caretaker relationship details
 */
export const getCaretaker = async (id: number): Promise<ICaretaker> => {
  return apiClient.get<ICaretaker>(CARETAKER_ENDPOINTS.DETAIL(id));
};

/**
 * Create a new caretaker relationship (admin only)
 * @param data - Caretaker relationship data
 * @returns Created caretaker relationship
 */
export const createCaretaker = async (
  data: ICaretakerRequest
): Promise<ICaretaker> => {
  return apiClient.post<ICaretaker>(CARETAKER_ENDPOINTS.CREATE, data);
};

/**
 * Update an existing caretaker relationship
 * @param id - Caretaker relationship ID
 * @param data - Partial caretaker data to update
 * @returns Updated caretaker relationship
 */
export const updateCaretaker = async (
  id: number,
  data: Partial<ICaretakerRequest>
): Promise<ICaretaker> => {
  return apiClient.patch<ICaretaker>(CARETAKER_ENDPOINTS.UPDATE(id), data);
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

/**
 * Respond to a caretaker request (approve or reject)
 * Allows the requested caretaker to directly approve or reject the request
 * @param params - Task ID and action (approve or reject)
 */
export const respondToCaretakerRequest = async (params: {
  taskId: number;
  action: "approve" | "reject";
}): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>(
    `/adminoptions/tasks/${params.taskId}/respond`,
    { action: params.action }
  );
};

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

/**
 * Admin: Set caretaker for a user (bypasses approval workflow)
 * @param data - Caretaker relationship data
 * @returns Created caretaker relationship
 */
export const adminSetCaretaker = async (
  data: ICaretakerRequest
): Promise<ICaretaker> => {
  return apiClient.post<ICaretaker>(CARETAKER_ENDPOINTS.ADMIN_SET, data);
};
