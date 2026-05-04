import type { IAdminTask } from "@/shared/types/admin.types";
import type { IUserData } from "@/shared/types/user.types";

// Re-export shared types for backward compatibility
export type { IAdminTask };

// ============================================================================
// CARETAKER TYPES
// ============================================================================

/**
 * Active caretaker assignment
 * Represents an approved and active caretaker relationship
 * Matches CaretakerSerializer from backend
 */
export interface ICaretaker {
	id: number;
	user?: IUserData;
	caretaker: IUserData;
	end_date?: string;
	reason: string;
	notes?: string;
	created_at: string;
	updated_at?: string;
}

/**
 * Response from caretaker check endpoint
 * Contains all caretaker-related data for the current user
 */
export interface ICaretakerResponse {
	caretaker_object: ICaretaker | null;
	caretaker_request_object: IAdminTask | null;
	become_caretaker_request_object: IAdminTask | null;
}

/**
 * Caretakee data with recursive caretaking chain
 * Used for displaying users the current user is caretaking for
 */
export interface ICaretakee {
	id: number;
	caretaker_obj_id?: number;
	display_first_name: string | null;
	display_last_name: string | null;
	email: string;
	image?: string;
	end_date?: Date | string | null;
	is_superuser?: boolean;
	caretakers?: ICaretakee[];
	caretaking_for?: ICaretakee[];
}

/**
 * Payload for requesting a caretaker.
 * Re-exported from shared for backward compatibility.
 */
export type { ICaretakerRequest } from "@/shared/types/caretaker.types";

// ============================================================================
// FORM TYPES
// ============================================================================

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface IRequestCaretakerFormProps {
	userId: number;
	onSuccess: () => void;
}

export interface IPendingCaretakerRequestProps {
	request: IAdminTask;
	onCancel: () => void;
}

export interface IActiveCaretakerProps {
	caretaker: ICaretaker;
	onRemove: () => void;
}

export interface ICaretakeesTableProps {
	caretakees: ICaretakee[];
}
