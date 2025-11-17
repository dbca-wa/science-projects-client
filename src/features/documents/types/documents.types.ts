// ============================================================================
// Document Editor Types
// ============================================================================

export type EditorType =
  | "PublicProfile"
  | "ProjectDetail"
  | "ProjectDocument"
  | "AnnualReport"
  | "Comment"
  | "Guide";

export type EditorSections =
  | "Public Profile"
  | "Annual Report"
  | "Description"
  | "Concept Plan"
  | "Project Plan"
  | "Progress Report"
  | "Student Report"
  | "Project Closure"
  | "Comment";

type PubliProfileSection = "About Me" | "Expertise" | "";

type AnnualReportSection =
  | "dm"
  | "dm_sign"
  | "service_delivery_intro"
  | "research_intro"
  | "student_intro"
  | "publications";

type ProjectSection =
  | "title"
  | "description"
  | "tagline"
  | "externalDescription"
  | "externalAims";

type ConceptPlanSection =
  | "background"
  | "aims"
  | "outcome"
  | "collaborations"
  | "strategic_context"
  | "staff_time_allocation"
  | "budget";

type ProjectPlanSection =
  | "background"
  | "aims"
  | "outcome"
  | "knowledge_transfer"
  | "project_tasks"
  | "listed_references"
  | "data_management"
  | "methodology"
  | "specimens"
  | "operating_budget"
  | "operating_budget_external"
  | "related_projects";

type ProgressReportSection =
  | "context"
  | "aims"
  | "progress"
  | "implications"
  | "future";

type StudentReportSection = "progress_report";

type ProjectClosureSection =
  | "intended_outcome"
  | "reason"
  | "scientific_outputs"
  | "knowledge_transfer"
  | "data_location"
  | "hardcopy_location"
  | "backup_location";

export type EditorSubsections =
  | "Comment"
  | PubliProfileSection
  | ProjectSection
  | ConceptPlanSection
  | ProjectPlanSection
  | ProgressReportSection
  | StudentReportSection
  | ProjectClosureSection
  | AnnualReportSection;

// ============================================================================
// Document Workflow Types
// ============================================================================

export interface IApproveDocument {
  shouldSendEmail?: boolean;
  feedbackHTML?: string;
  action: "approve" | "recall" | "send_back" | "reopen";
  stage: number; // 1-3
  documentPk: number;
}

export interface BumpEmailData {
  documentId: number;
  documentKind: string;
  projectId: number;
  projectTitle: string;
  userToTakeAction: number;
  userToTakeActionEmail: string;
  userToTakeActionFirstName: string;
  userToTakeActionLastName: string;
  actionCapacity: string;
  requestingUser: number;
  requestingUserEmail: string;
  requestingUserFirstName: string;
  requestingUserLastName: string;
}

// ============================================================================
// Document Structure Types
// ============================================================================

export interface IMainDoc {
  pk: number;
  project: number;
  kind: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface IEndorsement {
  pk: number;
  ae_endorsement_required: boolean;
  ae_endorsement_provided: boolean;
  data_management: string | null;
  no_specimens: boolean;
}

export interface IMethodologyImage {
  pk: number;
  file: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Concept Plan
// ============================================================================

export interface IConceptPlan {
  pk: number;
  document: IMainDoc;
  background: string | null;
  aims: string | null;
  outcome: string | null;
  collaborations: string | null;
  strategic_context: string | null;
  staff_time_allocation: string | null;
  budget: string | null;
  endorsements: IEndorsement;
}

// ============================================================================
// Project Plan
// ============================================================================

export interface IProjectPlan {
  pk: number;
  document: IMainDoc;
  background: string | null;
  aims: string | null;
  outcome: string | null;
  knowledge_transfer: string | null;
  data_management: string | null;
  listed_references: string | null;
  operating_budget: string | null;
  operating_budget_external: string | null;
  methodology: string | null;
  methodology_image: IMethodologyImage | null;
  project_tasks: string | null;
  related_projects: string | null;
  endorsements: IEndorsement;
}

// ============================================================================
// Progress Report
// ============================================================================

export interface IProgressReport {
  pk: number;
  created_at: Date;
  updated_at: Date;
  document: IMainDoc;
  year: number;
  is_final_report: boolean;
  context: string | null;
  aims: string | null;
  progress: string | null;
  implications: string | null;
  future: string | null;
  team_members: any[]; // IProjectMember[] - avoiding circular dependency
}

// ============================================================================
// Student Report
// ============================================================================

export interface IStudentReport {
  pk: number;
  document: IMainDoc;
  progress_report: string;
  year: number;
}

// ============================================================================
// Project Closure
// ============================================================================

export interface IProjectClosure {
  pk: number;
  document: IMainDoc;
  intended_outcome: string | null;
  reason: string | null;
  scientific_outputs: string | null;
  knowledge_transfer: string | null;
  data_location: string | null;
  hardcopy_location: string | null;
  backup_location: string | null;
}

// ============================================================================
// Document Collections
// ============================================================================

export type IProjectDocument =
  | IConceptPlan
  | IProjectPlan
  | IProgressReport
  | IStudentReport
  | IProjectClosure;

export interface IProjectDocuments {
  concept_plan: IConceptPlan | null;
  project_plan: IProjectPlan | null;
  progress_reports: IProgressReport[] | [];
  student_reports: IStudentReport[] | [];
  project_closure: IProjectClosure | null;
}

// ============================================================================
// Task Document Types
// ============================================================================

export interface ITaskDocument {
  pk: number;
  kind: string;
  status: string;
  project: {
    pk: number;
    title: string;
    status: string;
    kind: string;
    year: number;
    business_area: any; // IBusinessArea - avoiding circular dependency
    image: any; // IImageData - avoiding circular dependency
  };
}

// ============================================================================
// Publication Types
// ============================================================================

export interface IStaffPublicationEntry {
  pk?: number;
  public_profile?: number;
  title: string;
  year: number;
}

export interface ISimplePkProp {
  pk: number;
}
