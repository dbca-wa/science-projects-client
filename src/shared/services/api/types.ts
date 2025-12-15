/**
 * Shared API Type Definitions
 * 
 * This module contains all shared type definitions for the API layer.
 * These types are used across feature services for consistent error handling,
 * request configuration, and response typing.
 */

import { AxiosHeaders } from "axios";

// ============================================================================
// Core Error Types
// ============================================================================

/**
 * Standardized API error type
 * All API errors should be transformed into this format for consistent handling
 */
export interface ApiError {
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  status: number;
  /** Optional error code for categorization */
  code?: string;
  /** Field-specific validation errors (for form validation) */
  errors?: Record<string, string[]>;
  /** Original error object for debugging */
  originalError?: unknown;
}

// ============================================================================
// Request Configuration
// ============================================================================

/**
 * Configuration options for API requests
 * Extends axios request config with commonly used options
 */
export interface RequestConfig {
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** URL query parameters */
  params?: Record<string, any>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Expected response type */
  responseType?: "json" | "blob" | "text" | "arraybuffer";
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Generic paginated response from Django REST Framework
 * Used for list endpoints that support pagination
 */
export interface PaginatedResponse<T> {
  /** Array of results for the current page */
  results: T[];
  /** Total count of all items */
  count: number;
  /** URL to the next page (null if last page) */
  next: string | null;
  /** URL to the previous page (null if first page) */
  previous: string | null;
  /** Total number of pages (optional, calculated on backend) */
  total_pages?: number;
  /** Current page number (optional) */
  current_page?: number;
}

// ============================================================================
// Django Error Format Types
// ============================================================================

/**
 * Django field-specific validation errors
 * Format: { "field_name": ["error message 1", "error message 2"] }
 */
export interface DjangoFieldErrors {
  [fieldName: string]: string | string[];
}

/**
 * Django non-field errors (validation errors that span multiple fields)
 * Format: { "non_field_errors": ["error message"] }
 */
export interface DjangoNonFieldErrors {
  non_field_errors: string[];
}

/**
 * Django detail error (simple error message)
 * Format: { "detail": "error message" }
 */
export interface DjangoDetailError {
  detail: string;
}

/**
 * Django message error (custom error message)
 * Format: { "message": "error message" }
 */
export interface DjangoMessageError {
  message: string;
}

/**
 * Union type for all possible Django error response formats
 */
export type DjangoErrorResponse =
  | DjangoFieldErrors
  | DjangoNonFieldErrors
  | DjangoDetailError
  | DjangoMessageError
  | string;

// ============================================================================
// Mutation Types (for React Query)
// ============================================================================

/**
 * Standard success response for mutations
 * Used by React Query mutations to indicate successful operations
 */
export interface MutationSuccess<T = any> {
  /** Success message */
  ok: string;
  /** Optional response data */
  data?: T;
}

/**
 * Axios response structure used in mutation errors
 */
interface IMutationResponse {
  data: Record<string, string>;
  headers: AxiosHeaders;
  request: XMLHttpRequest;
  status: number;
  statusText: string;
}

/**
 * Standard error response for mutations
 * Used by React Query mutations to handle errors consistently
 */
export interface MutationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error name/type */
  name: string;
  /** Axios response object with error details */
  response?: IMutationResponse;
}

/**
 * Success response for project creation mutations
 * Includes the created project's primary key and kind
 */
export interface ProjectCreationMutationSuccess {
  /** Primary key of the created project */
  pk: number;
  /** Project kind/type */
  kind: string;
}
