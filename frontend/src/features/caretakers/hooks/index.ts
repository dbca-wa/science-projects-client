// Caretaker task hooks
export { useCaretakerTasks, caretakerTasksKeys } from "./useCaretakerTasks";
export { useApproveCaretakerTask } from "./useApproveCaretakerTask";
export { useRejectCaretakerTask } from "./useRejectCaretakerTask";

// Caretaker permission hooks (moved to shared/hooks/useCaretakerPermissions.ts)

// User caretaker request hooks
export { useRequestCaretaker } from "./useRequestCaretaker";
export { useCancelCaretakerRequest } from "./useCancelCaretakerRequest";
export { useRemoveCaretaker } from "./useRemoveCaretaker";
export { useBecomeCaretaker } from "./useBecomeCaretaker";
export {
	usePendingCaretakerRequests,
	pendingCaretakerRequestsKeys,
} from "./usePendingCaretakerRequests";
export { useOutgoingCaretakerRequests } from "./useOutgoingCaretakerRequests";

// Additional hooks
export { useCaretakingChain } from "./useCaretakingChain";
export { useCaretakerCheck } from "./useCaretakerCheck";
export { useCancelBecomeCaretakerRequest } from "./useCancelBecomeCaretakerRequest";
