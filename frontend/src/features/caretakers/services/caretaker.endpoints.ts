
/**
 * Caretaker API endpoints
 */
export const CARETAKER_ENDPOINTS = {
  // Caretaker relationships
  LIST: "caretakers/",
  DETAIL: (id: number) => `caretakers/${id}/`,
  CREATE: "caretakers/",
  UPDATE: (id: number) => `caretakers/${id}/`,
  DELETE: (id: number) => `caretakers/${id}/`,

  // Caretaker requests
  REQUESTS_LIST: (userId: number) => `caretakers/requests/?user_id=${userId}`,
  REQUESTS_CREATE: "caretakers/requests/create/",
  REQUESTS_APPROVE: (requestId: number) => `caretakers/requests/${requestId}/approve/`,
  REQUESTS_REJECT: (requestId: number) => `caretakers/requests/${requestId}/reject/`,
  REQUESTS_CANCEL: (requestId: number) => `caretakers/requests/${requestId}/cancel/`,

  // Caretaker utilities
  CHECK: "caretakers/check/",
  ADMIN_SET: "caretakers/admin-set/",
} as const;

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
