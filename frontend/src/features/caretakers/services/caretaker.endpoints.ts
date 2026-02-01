import { apiClient } from "@/shared/services/api/client.service";
import type {
  ICaretaker,
  ICaretakerResponse,
  ICaretakerRequest,
  IAdminTask,
} from "../types";

/**
 * Query key factory for caretaker-related queries
 */
export const caretakerKeys = {
  all: ["caretakers"] as const,
  lists: () => [...caretakerKeys.all, "list"] as const,
  list: (filters: string) => [...caretakerKeys.lists(), { filters }] as const,
  details: () => [...caretakerKeys.all, "detail"] as const,
  detail: (id: number) => [...caretakerKeys.details(), id] as const,
  check: (userId: number) => [...caretakerKeys.all, "check", userId] as const,
  pending: (userId: number) => [...caretakerKeys.all, "pending", userId] as const,
};

/**
 * Check caretaker status for the current user
 * Returns active caretaker, pending request, and become caretaker request
 */
export const getCaretakerCheck = async (): Promise<ICaretakerResponse> => {
  const response = await apiClient.get<ICaretakerResponse>("/caretakers/check/");
  return response;
};

/**
 * Check caretaker status for the current user (alias for compatibility)
 */
export const checkCaretaker = getCaretakerCheck;

/**
 * Get all caretakers
 */
export const getCaretakers = async (): Promise<ICaretaker[]> => {
  const response = await apiClient.get<ICaretaker[]>("/caretakers/");
  return response;
};

/**
 * Get a specific caretaker by ID
 */
export const getCaretaker = async (id: number): Promise<ICaretaker> => {
  const response = await apiClient.get<ICaretaker>(`/caretakers/${id}/`);
  return response;
};

/**
 * Create a new caretaker relationship
 */
export const createCaretaker = async (
  data: ICaretakerRequest
): Promise<ICaretaker> => {
  const response = await apiClient.post<ICaretaker>("/caretakers/", data);
  return response;
};

/**
 * Update an existing caretaker relationship
 */
export const updateCaretaker = async (
  id: number,
  data: Partial<ICaretakerRequest>
): Promise<ICaretaker> => {
  const response = await apiClient.patch<ICaretaker>(`/caretakers/${id}/`, data);
  return response;
};

/**
 * Delete a caretaker relationship
 */
export const deleteCaretaker = async (id: number): Promise<void> => {
  await apiClient.delete(`/caretakers/${id}/`);
};

/**
 * Get pending caretaker requests for a user
 */
export const getPendingCaretakerRequests = async (
  userId: number
): Promise<IAdminTask[]> => {
  const response = await apiClient.get<IAdminTask[]>(
    `/caretakers/requests/?user_id=${userId}`
  );
  return response;
};

/**
 * Approve a caretaker request
 */
export const approveCaretakerRequest = async (
  requestId: number
): Promise<ICaretaker> => {
  const response = await apiClient.post<ICaretaker>(
    `/caretakers/requests/${requestId}/approve/`
  );
  return response;
};

/**
 * Reject a caretaker request
 */
export const rejectCaretakerRequest = async (
  requestId: number
): Promise<void> => {
  await apiClient.post(`/caretakers/requests/${requestId}/reject/`);
};

/**
 * Admin: Set caretaker for a user
 */
export const adminSetCaretaker = async (
  data: ICaretakerRequest
): Promise<ICaretaker> => {
  const response = await apiClient.post<ICaretaker>(
    "/caretakers/admin-set/",
    data
  );
  return response;
};

/**
 * Cancel a caretaker request
 */
export const cancelCaretakerRequest = async (
  taskId: number
): Promise<void> => {
  await apiClient.post(`/adminoptions/admintasks/${taskId}/cancel/`);
};
