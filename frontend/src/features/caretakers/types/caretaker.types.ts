import type { IUserData } from "@/shared/types/user.types";

// ============================================================================
// CARETAKER TYPES
// ============================================================================

/**
 * Simple user data for secondary_users in AdminTask
 * Matches SecondaryUserSerializer from backend
 */
export interface ISecondaryUserData {
  id: number;
  display_first_name: string | null;
  display_last_name: string | null;
  email: string;
  image?: {
    file: string;
  } | null;
}

/**
 * Admin Task for caretaker requests
 * Represents a pending, approved, or rejected caretaker request
 * Matches AdminTaskSerializer from backend
 */
export interface IAdminTask {
  id: number;
  action: "setcaretaker" | "mergeuser" | "deleteproject";
  status: "pending" | "approved" | "fulfilled" | "cancelled" | "rejected";
  requester: IUserData;
  primary_user: ISecondaryUserData;
  secondary_users: ISecondaryUserData[];
  reason: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

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
 * Payload for requesting a caretaker
 * Used when submitting caretaker request form
 */
export interface ICaretakerRequest {
  user_id: number;
  caretaker_id: number;
  reason: "leave" | "resignation" | "other";
  end_date?: string;
  notes?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Form data for caretaker request form
 * Used by RequestCaretakerForm component
 */
export interface ICaretakerRequestFormData {
  reason: "leave" | "resignation" | "other";
  endDate: Date | null;
  notes: string | undefined;
  caretakerUserId: number | undefined;
}

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

export interface IBecomeCaretakerRequestProps {
  request: IAdminTask;
  onResponse?: () => void;
}

export interface IActiveCaretakerProps {
  caretaker: ICaretaker;
  onRemove: () => void;
}

export interface ICaretakeesTableProps {
  caretakees: ICaretakee[];
}

export interface ICaretakerUserSearchProps {
  onSelect: (userId: number) => void;
  excludeUserIds: number[];
}
