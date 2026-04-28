/**
 * Payload for requesting a caretaker.
 * Canonical definition — used by shared hooks and feature services.
 */
export interface ICaretakerRequest {
	user_id: number;
	caretaker_id: number;
	reason: "leave" | "resignation" | "other";
	end_date?: string;
	notes?: string;
	approve_immediately?: boolean;
}

/**
 * Query key factory for caretaker-related queries.
 * Shared so that both shared/ hooks and feature hooks use consistent keys.
 */
export const caretakerKeys = {
	all: ["caretakers"] as const,
	lists: () => [...caretakerKeys.all, "list"] as const,
	list: (filters: string) => [...caretakerKeys.lists(), { filters }] as const,
	details: () => [...caretakerKeys.all, "detail"] as const,
	detail: (id: number) => [...caretakerKeys.details(), id] as const,
	check: (userId: number) => [...caretakerKeys.all, "check", userId] as const,
	pending: (userId: number) =>
		[...caretakerKeys.all, "pending", userId] as const,
	outgoing: (userId: number) =>
		[...caretakerKeys.all, "outgoing", userId] as const,
};

/** Response from the caretaker check endpoint */
export interface ICaretakerCheckResponse {
	is_caretaker: boolean;
	caretaking_for: unknown[];
	become_caretaker_request_object?: {
		id: number;
		status: string;
		primary_user?: {
			id: number;
			display_first_name: string;
			display_last_name: string;
		};
		secondary_users?: {
			id: number;
			display_first_name: string;
			display_last_name: string;
		}[];
	} | null;
}

/** A pending caretaker request for a user */
export interface IPendingCaretakerRequest {
	id: number;
	status: string;
	action: string;
	primary_user?: {
		id: number;
		display_first_name: string;
		display_last_name: string;
	};
	secondary_users?: {
		id: number;
		display_first_name: string;
		display_last_name: string;
		email: string;
		image?: { file?: string } | null;
	}[];
	reason?: string;
	notes?: string;
	created_at?: string;
	end_date?: string | null;
}
