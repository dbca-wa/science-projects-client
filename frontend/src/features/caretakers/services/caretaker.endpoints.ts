/**
 * Caretaker API endpoints
 */
export const CARETAKER_ENDPOINTS = {
	// Caretaker relationships
	LIST: "caretakers/list",
	DETAIL: (id: number) => `caretakers/${id}`,
	CREATE: "caretakers",
	UPDATE: (id: number) => `caretakers/${id}`,
	DELETE: (id: number) => `caretakers/${id}`,

	// Caretaker requests
	REQUESTS_LIST: (userId: number) => `caretakers/requests?user_id=${userId}`,
	REQUESTS_OUTGOING: (userId: number) =>
		`caretakers/requests/outgoing?user_id=${userId}`,
	REQUESTS_CREATE: "caretakers/requests/create",
	REQUESTS_APPROVE: (requestId: number) =>
		`caretakers/requests/${requestId}/approve`,
	REQUESTS_REJECT: (requestId: number) =>
		`caretakers/requests/${requestId}/reject`,
	REQUESTS_CANCEL: (requestId: number) =>
		`caretakers/requests/${requestId}/cancel`,

	// Caretaker utilities
	CHECK: "caretakers/check",
	ADMIN_SET: "caretakers/admin-set",
} as const;

/**
 * Query key factory for caretaker-related queries.
 * Re-exported from shared for backward compatibility.
 */
export { caretakerKeys } from "@/shared/types/caretaker.types";
