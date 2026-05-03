/**
 * User feature hooks
 */

// User query hooks
export { useUserSearch, userSearchKeys } from "./useUserSearch";
export { useUserDetail, userDetailKeys } from "./useUserDetail";

// User mutation hooks
export { useCreateStaffUser } from "./useCreateStaffUser";
export { useCreateExternalUser } from "./useCreateExternalUser";
export { useUpdateUser } from "./useUpdateUser";

// Admin action hooks
export { useToggleAdminStatus } from "./useToggleAdminStatus";
export { useActivateUser } from "./useActivateUser";
export { useDeactivateUser } from "./useDeactivateUser";
export { useDeleteUser } from "./useDeleteUser";
export { useRequestMergeUsers } from "./useRequestMergeUsers";
export { usePendingMergeRequest } from "./usePendingMergeRequest";
