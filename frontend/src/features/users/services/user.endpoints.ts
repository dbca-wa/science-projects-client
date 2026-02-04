export const USER_ENDPOINTS = {
  // Base user endpoints
  LIST: "users/",
  ME: "users/me",
  DETAIL: (id: number | string) => `users/${id}`,

  // User search
  SEARCH: "users/", // With query params (?page=1&searchTerm=...)

  // User mutations
  CREATE: "users/",
  PERSONAL_INFO: (userId: number | string) => `users/${userId}/pi`,
  PROFILE: (userId: number | string) => `users/${userId}/profile`,
  MEMBERSHIP: (userId: number | string) => `users/${userId}/membership`,
  REMOVE_AVATAR: (userId: number | string) => `users/${userId}/remove_avatar`,

  // User validation
  CHECK_EMAIL_EXISTS: "users/check-email-exists",

  // Admin actions
  TOGGLE_ADMIN: (userId: number | string) => `users/${userId}/admin`,
  TOGGLE_ACTIVE: (userId: number | string) => `users/${userId}/toggleactive`,
  DELETE: (userId: number | string) => `users/${userId}`,
  REQUEST_MERGE: "adminoptions/tasks",

  // Staff profile
  TOGGLE_STAFF_PROFILE_VISIBILITY: (staffProfileId: number | string) =>
    `users/staffprofiles/${staffProfileId}/toggle_visibility`,
} as const;
