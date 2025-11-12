// Re-export all functions and types from feature modules
export * from "./features/admin";
export * from "./features/agencies";
export * from "./features/auth";
export * from "./features/communications";
export * from "./features/dashboard";
export * from "./features/documents";
export * from "./features/pdfgen";
export * from "./features/projects";
export * from "./features/users";

// Explicit type re-exports for Vite compatibility
export type {
  IEditProject,
  ICreateProjectBaseInfo,
  ICreateProjectDetails,
  ICreateProjectExternalDetails,
  ICreateProjectStudentDetails,
  IProjectCreationVariables,
  ISetProjectStatusProps,
  ISpecialEndorsement,
  INewMember,
  RemoveUserMutationType,
  ISetProjectAreas,
  IHandleMethodologyImage,
  ICloseProjectProps,
} from "./features/projects";

export type {
  ISpawnDocument,
  IDeleteDocument,
  IHTMLSave,
  ISaveStudentReport,
  ISaveProgressReportSection,
} from "./features/documents";

export type {
  IDocGen,
} from "./features/pdfgen";

export type {
  UserData,
  AdminSwitchVar,
  PRPopulationVar,
  IExtendCaretakerProps,
  INewCycle,
  MutationSuccess,
  MutationError,
  IFullUserUpdateVariables,
  IProfileUpdateVariables,
  IProfileUpdateSuccess,
  IProfileUpdateError,
  IPIUpdateVariables,
  IPIUpdateSuccess,
  IPIUpdateError,
  IMembershipUpdateVariables,
  IApproveProgressReport,
  IStaffPublicEmail,
  IUpdatePublicEmail,
  IMyBAUpdateSubmissionData,
} from "./features/users";

export type {
  IEmailRecipientsString,
  INewCycleEmail,
  IDeleteComment,
} from "./features/communications";

export type {
  IAdjustEmailListProps,
} from "./features/agencies";

export type {
  IHTMLGuideSave,
  GuideSections,
} from "./features/admin";
