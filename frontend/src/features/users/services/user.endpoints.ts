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
  REMOVE_AVATAR: (userId: number | string) => `users/${userId}/remove_avatar`,

  // User validation
  CHECK_EMAIL_EXISTS: "users/check-email-exists",

  // Admin actions (Phase 3)
  TOGGLE_ADMIN: (userId: number | string) => `users/${userId}/admin`,
  TOGGLE_ACTIVE: (userId: number | string) => `users/${userId}/toggleactive`,
  DELETE: (userId: number | string) => `users/${userId}`,
  REQUEST_MERGE: "adminoptions/tasks",

  // Staff profile
  TOGGLE_STAFF_PROFILE_VISIBILITY: (staffProfilePk: number | string) =>
    `users/staffprofiles/${staffProfilePk}/toggle_visibility`,
} as const;
