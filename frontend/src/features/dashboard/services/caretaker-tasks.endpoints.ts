import { apiClient } from "@/shared/services/api/client.service";
import type { ICaretakerTasksResponse } from "../types/caretaker-tasks.types";

/**
 * Get pending document tasks for all users the specified user is caretaking for
 * @param userId - The caretaker's user ID
 * @returns Caretaker tasks grouped by type and caretakee
 */
export const getCaretakerTasks = async (
  userId: number
): Promise<ICaretakerTasksResponse> => {
  const response = await apiClient.get<ICaretakerTasksResponse>(
    `/adminoptions/caretakers/pending/${userId}`
  );
  return response;
};
