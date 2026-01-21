import type { IUserData } from "@/shared/types/user.types";

// ============================================================================
// CARETAKER TYPES (Feature-specific)
// ============================================================================

/**
 * Simple user data for secondary_users in AdminTask
 * Matches SecondaryUserSerializer from backend
 */
export interface SecondaryUserData {
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
export interface AdminTask {
  id: number; // Primary key (Django REST Framework uses 'id')
  action: "setcaretaker" | "mergeuser" | "deleteproject";
  status: "pending" | "approved" | "fulfilled" | "cancelled" | "rejected";
  requester: IUserData;
  primary_user: SecondaryUserData;
  secondary_users: SecondaryUserData[]; // Array of serialized user objects
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
export interface Caretaker {
  id: number; // Primary key (Django REST Framework uses 'id')
  user?: IUserData; // The user being caretaken for
  caretaker: IUserData; // The caretaker (always present)
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
export interface CaretakerCheckResponse {
  caretaker_object: Caretaker | null;
  caretaker_request_object: AdminTask | null;
  become_caretaker_request_object: AdminTask | null;
}

/**
 * Caretakee data with recursive caretaking chain
 * Used for displaying users the current user is caretaking for
 * Matches ICaretakerSimpleUserData from user.types.ts
 */
export interface CaretakeeData {
  id: number;
  caretaker_obj_id?: number;
  display_first_name: string | null;
  display_last_name: string | null;
  email: string;
  image?: string;
  end_date?: Date | string | null;
  is_superuser?: boolean;
  caretakers?: CaretakeeData[]; // Recursive caretaking chain
  caretaking_for?: CaretakeeData[];
}

/**
 * Payload for requesting a caretaker
 * Used when submitting caretaker request form
 */
export interface RequestCaretakerPayload {
  user_id: number;
  caretaker_id: number;
  reason: "leave" | "resignation" | "other";
  end_date?: string; // ISO date string
  notes?: string;
}

// ============================================================================
// FORM TYPES (Feature-specific)
// ============================================================================

/**
 * Form data for caretaker request form
 * Used by RequestCaretakerForm component
 */
export interface CaretakerRequestFormData {
  reason: "leave" | "resignation" | "other";
  endDate: Date | null;
  notes: string | undefined;
  caretakerUserId: number | undefined;
}

// ============================================================================
// COMPONENT PROPS (Feature-specific)
// ============================================================================

export interface RequestCaretakerFormProps {
  userId: number;
  onSuccess: () => void;
}

export interface PendingCaretakerRequestProps {
  request: AdminTask;
  onCancel: () => void;
}

export interface BecomeCaretakerRequestProps {
  request: AdminTask;
  onResponse?: () => void;
}

export interface ActiveCaretakerProps {
  caretaker: Caretaker;
  onRemove: () => void;
}

export interface CaretakeesTableProps {
  caretakees: CaretakeeData[];
}

export interface CaretakerUserSearchProps {
  onSelect: (userId: number) => void;
  excludeUserIds: number[];
}