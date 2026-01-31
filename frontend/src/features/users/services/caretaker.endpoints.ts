import { apiClient } from "@/shared/services/api/client.service";
import type {
  AdminTask,
  CaretakerCheckResponse,
  CaretakeeData,
  RequestCaretakerPayload,
} from "../types/caretaker.types";

// ============================================================================
// CARETAKER ENDPOINTS
// ============================================================================

export const CARETAKER_ENDPOINTS = {
  // Caretaker check - get current user's caretaker status
  CHECK: "adminoptions/caretakers/checkcaretaker",
  
  // Get caretakers for a specific user (recursive) - NOT USED IN ORIGINAL
  // CARETAKERS: (userId: number) => `users/${userId}/caretakers/`,
  
  // Get caretakees for a specific user - NOT USED IN ORIGINAL
  // CARETAKEES: (userId: number) => `users/${userId}/caretaking/`,
  
  // Admin tasks for caretaker requests
  REQUEST_CARETAKER_TASK: "adminoptions/tasks", // Creates AdminTask (requires approval)
  APPROVE_TASK: (taskId: number) => `adminoptions/tasks/${taskId}/approve`, // Admin approves task
  REJECT_TASK: (taskId: number) => `adminoptions/tasks/${taskId}/reject`, // Reject task
  CANCEL_REQUEST: (taskId: number) => `adminoptions/tasks/${taskId}/cancel`, // Cancel pending task
  
  // Caretaker management
  REMOVE_CARETAKER: (caretakerId: number) => `adminoptions/caretakers/${caretakerId}`,
  UPDATE_CARETAKER: (caretakerId: number) => `adminoptions/caretakers/${caretakerId}`,
  
  // Pending caretaker tasks
  PENDING_TASKS: (userId: number) => `adminoptions/caretakers/pending/${userId}`,
  CHECK_PENDING_FOR_USER: (userId: number) => `adminoptions/caretakers/requests?user_id=${userId}`,
} as const;

// ============================================================================
// TANSTACK QUERY KEYS
// ============================================================================

export const caretakerKeys = {
  all: ['caretakers'] as const,
  check: (userId: number) => [...caretakerKeys.all, 'check', userId] as const,
  list: (userId: number) => [...caretakerKeys.all, 'list', userId] as const,
  caretakees: (userId: number) => [...caretakerKeys.all, 'caretakees', userId] as const,
} as const;

// ============================================================================
// CARETAKER API FUNCTIONS
// ============================================================================

/**
 * Get current user's caretaker status
 * Returns caretaker_object, caretaker_request_object, and become_caretaker_request_object
 * @returns CaretakerCheckResponse with all caretaker-related data
 */
export const getCaretakerCheck = async (): Promise<CaretakerCheckResponse> => {
  return apiClient.get<CaretakerCheckResponse>(CARETAKER_ENDPOINTS.CHECK);
};

/**
 * Get caretakers for a specific user (recursive up to 12 levels)
 * NOTE: This endpoint doesn't exist in the original backend
 * Caretaker data comes from the user object itself (user.caretakers)
 * @param _userId - User primary key (unused - data comes from user object)
 * @returns Array of caretaker data with recursive chain
 */
export const getCaretakers = async (_userId: number): Promise<CaretakeeData[]> => {
  // This endpoint doesn't exist in the backend
  // The caretaker data is embedded in the user object
  // Return empty array for now
  return Promise.resolve([]);
};

/**
 * Get users the current user is caretaking for
 * NOTE: This endpoint doesn't exist in the original backend
 * Caretakee data comes from the user object itself (user.caretaking_for)
 * @param _userId - User primary key (unused - data comes from user object)
 * @returns Array of caretakee data
 */
export const getCaretakees = async (_userId: number): Promise<CaretakeeData[]> => {
  // This endpoint doesn't exist in the backend
  // The caretakee data is embedded in the user object
  // Return empty array for now
  return Promise.resolve([]);
};

/**
 * Request a caretaker
 * Creates an AdminTask with action "setcaretaker" and status "pending"
 * Both admins and regular users use this endpoint
 * Admins can optionally approve immediately via separate action
 * @param payload - Caretaker request data
 * @returns Created AdminTask
 */
export const requestCaretaker = async (
  payload: RequestCaretakerPayload
): Promise<AdminTask> => {
  return apiClient.post<AdminTask>(CARETAKER_ENDPOINTS.REQUEST_CARETAKER_TASK, {
    action: "setcaretaker",
    primary_user: payload.user_id,
    secondary_users: [payload.caretaker_id],
    reason: payload.reason,
    end_date: payload.end_date,
    notes: payload.notes,
  });
};

/**
 * Approve a caretaker request (admin only)
 * Approves the AdminTask and creates the Caretaker object
 * @param taskId - AdminTask primary key
 * @returns Success response
 */
export const approveCaretakerTask = async (taskId: number): Promise<void> => {
  return apiClient.post<void>(CARETAKER_ENDPOINTS.APPROVE_TASK(taskId), {});
};

/**
 * Reject a caretaker request
 * Rejects the AdminTask
 * @param taskId - AdminTask primary key
 * @returns Success response
 */
export const rejectCaretakerTask = async (taskId: number): Promise<void> => {
  return apiClient.post<void>(CARETAKER_ENDPOINTS.REJECT_TASK(taskId), {});
};

/**
 * Cancel a pending caretaker request
 * @param taskId - AdminTask primary key
 * @returns Success response
 */
export const cancelCaretakerRequest = async (taskId: number): Promise<void> => {
  return apiClient.post<void>(CARETAKER_ENDPOINTS.CANCEL_REQUEST(taskId), {});
};

/**
 * Remove an active caretaker (delete Caretaker record)
 * @param caretakerId - Caretaker primary key
 * @returns Success response
 */
export const removeCaretaker = async (caretakerId: number): Promise<void> => {
  return apiClient.delete<void>(CARETAKER_ENDPOINTS.REMOVE_CARETAKER(caretakerId));
};

/**
 * Stop caretaking for a user (alias for removeCaretaker)
 * @param caretakerId - Caretaker primary key (from caretakee.caretaker_id)
 * @returns Success response
 */
export const stopCaretaking = async (caretakerId: number): Promise<void> => {
  return removeCaretaker(caretakerId);
};

/**
 * Get pending caretaker requests for a specific user
 * Returns requests where someone has requested to become THIS user's caretaker
 * @param userId - User primary key
 * @returns Array of pending AdminTask objects
 */
export const getPendingCaretakerRequests = async (userId: number): Promise<AdminTask[]> => {
  return apiClient.get<AdminTask[]>(CARETAKER_ENDPOINTS.CHECK_PENDING_FOR_USER(userId));
};