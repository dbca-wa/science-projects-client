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

// Caretaker query hooks
export { useCaretakerCheck } from "./useCaretakerCheck";
export { useCaretakers } from "./useCaretakers";
export { useCaretakees } from "./useCaretakees";
export { usePendingCaretakerRequests } from "./usePendingCaretakerRequests";
export { useCaretakingChain } from "./useCaretakingChain";

// Caretaker mutation hooks
export { useRequestCaretaker } from "./useRequestCaretaker";
export { useCancelCaretakerRequest } from "./useCancelCaretakerRequest";
export { useRemoveCaretaker } from "./useRemoveCaretaker";
export { useBecomeCaretaker } from "./useBecomeCaretaker";
export { useCancelBecomeCaretakerRequest } from "./useCancelBecomeCaretakerRequest";
export { useRespondToCaretakerRequest } from "./useRespondToCaretakerRequest";
export { useApproveCaretakerTask } from "./useApproveCaretakerTask";
export { useRejectCaretakerTask } from "./useRejectCaretakerTask";
