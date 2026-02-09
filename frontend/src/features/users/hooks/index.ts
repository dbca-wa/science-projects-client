/**
 * User feature hooks
 */

// User query hooks
export { useUserSearch, userSearchKeys } from "./useUserSearch";
export { useUserDetail, userDetailKeys } from "./useUserDetail";
export { useCheckEmailUnique } from "./useCheckEmailUnique";

// User mutation hooks
export { useCreateUser } from "./useCreateUser";
export { useCreateStaffUser } from "./useCreateStaffUser";
export { useCreateExternalUser } from "./useCreateExternalUser";
export { useUpdateUser } from "./useUpdateUser";

// Admin action hooks
export { useToggleAdminStatus } from "./useToggleAdminStatus";
export { useActivateUser } from "./useActivateUser";
export { useDeactivateUser } from "./useDeactivateUser";
export { useDeleteUser } from "./useDeleteUser";
export { useRequestMergeUsers } from "./useRequestMergeUsers";
