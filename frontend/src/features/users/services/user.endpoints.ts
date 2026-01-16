export const USER_ENDPOINTS = {
  // Base user endpoints
  LIST: "users/",
  ME: "users/me",
  DETAIL: (pk: number | string) => `users/${pk}`,

  // User search
  SEARCH: "users/", // With query params (?page=1&searchTerm=...)

  // User mutations (Phase 2)
  CREATE: "users/",
  PERSONAL_INFO: (userId: number | string) => `users/${userId}/pi`,
  PROFILE: (userId: number | string) => `users/${userId}/profile`,
  MEMBERSHIP: (userPk: number | string) => `users/${userPk}/membership`,

  // User validation
  CHECK_EMAIL_EXISTS: "users/check-email-exists",

  // Admin actions (Phase 3)
  TOGGLE_ADMIN: (userId: number | string) => `users/${userId}/admin`,
  TOGGLE_ACTIVE: (userId: number | string) => `users/${userId}/toggleactive`,
  DELETE: (userId: number | string) => `users/${userId}`,
  REQUEST_MERGE: "adminoptions/tasks",
} as const;
