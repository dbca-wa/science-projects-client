/**
 * API Module - Public Exports
 * 
 * This module provides the public API for the shared API infrastructure.
 * It exports configuration, types, and utilities used across feature services.
 * 
 * @example
 * ```typescript
 * import { API_CONFIG, ApiError, MutationSuccess } from '@/shared/services/api';
 * ```
 */

// ============================================================================
// Configuration
// ============================================================================

/**
 * API configuration constants
 * Contains base URLs, timeouts, and other API settings
 */
export { API_CONFIG } from "./config";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Core error type for API failures
 * All API errors should conform to this interface
 */
export type { ApiError } from "./types";

/**
 * Configuration options for API requests
 */
export type { RequestConfig } from "./types";

/**
 * Generic paginated response from Django REST Framework
 */
export type { PaginatedResponse } from "./types";

/**
 * Django-specific error format types
 */
export type {
  DjangoFieldErrors,
  DjangoNonFieldErrors,
  DjangoDetailError,
  DjangoMessageError,
  DjangoErrorResponse,
} from "./types";

/**
 * Mutation response types for React Query
 */
export type {
  MutationSuccess,
  MutationError,
  ProjectCreationMutationSuccess,
} from "./types";
