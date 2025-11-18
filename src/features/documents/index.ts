// ============================================================================
// Documents Feature - Public API
// ============================================================================

// Modals
export { BatchApproveModal } from "./components/modals/BatchApproveModal";
export { BatchApproveOldModal } from "./components/modals/BatchApproveOldModal";
export { DeleteCommentModal } from "./components/modals/DeleteCommentModal";
export { DeleteDocumentModal } from "./components/modals/DeleteDocumentModal";
export { DeletePDFEndorsementModal } from "./components/modals/DeletePDFEndorsementModal";
export { DocumentTaskDetailsModal } from "./components/modals/DocumentTaskDetailsModal";
export { SeekEndorsementModal } from "./components/modals/SeekEndorsementModal";
export { EmailFeedbackRTE } from "./components/modals/EmailFeedbackRTE";
export { UnifiedDocumentActionModal } from "./components/modals/UnifiedDocumentActionModal";

// Email Templates
export { DocumentApprovedEmail } from "./components/emails/DocumentApprovedEmail";
export { DocumentReadyForEditingEmail } from "./components/emails/DocumentReadyForEditingEmail";
export { DocumentSentBackEmail } from "./components/emails/DocumentSentBackEmail";

// Hooks
export { useGetDocumentComments } from "./hooks/useGetDocumentComments";
export { useGetDocumentsPendingMyAction } from "./hooks/useGetDocumentsPendingMyAction";
export { useGetDocumentsPendingStageOneInput } from "./hooks/useGetDocumentsPendingStageOneInput";
export { useGetDocumentsPendingStageTwoInput } from "./hooks/useGetDocumentsPendingStageTwoInput";
export { useGetDocumentsPendingStageThreeInput } from "./hooks/useGetDocumentsPendingStageThreeInput";
export { useGetEndorsementsPendingMyAction } from "./hooks/useGetEndorsementsPendingMyAction";

// Services
export * from "./services/documents.service";

// Utils
export * from "./utils/documentConstants";
export * from "./utils/documentStageConstants";

// Types
export type {
  EditorType,
  EditorSections,
  EditorSubsections,
  IApproveDocument,
  BumpEmailData,
  IMainDoc,
  IEndorsement,
  IMethodologyImage,
  IConceptPlan,
  IProjectPlan,
  IProgressReport,
  IStudentReport,
  IProjectClosure,
  IProjectDocument,
  IProjectDocuments,
  ITaskDocument,
  IStaffPublicationEntry,
  ISimplePkProp,
} from "./types/documents.types";
