// ============================================================================
// Report Section Types
// ============================================================================

export type AnnualReportSection =
  | "dm"
  | "dm_sign"
  | "service_delivery_intro"
  | "research_intro"
  | "student_intro"
  | "publications";

export type ProgressReportSection =
  | "context"
  | "aims"
  | "progress"
  | "implications"
  | "future";

export type StudentReportSection = "progress_report";

// ============================================================================
// Report Document Interfaces
// ============================================================================

export interface IProgressReport {
  pk: number;
  created_at: Date;
  updated_at: Date;
  document: any; // IMainDoc - keeping as any to avoid circular dependencies
  year: number;
  is_final_report: boolean;
  context: string | null;
  aims: string | null;
  progress: string | null;
  implications: string | null;
  future: string | null;
  team_members: any[]; // IProjectMember[] - keeping as any to avoid circular dependencies
}

export interface IStudentReport {
  pk: number;
  document: any; // IMainDoc - keeping as any to avoid circular dependencies
  progress_report: string;
  year: number;
}

// ============================================================================
// Annual Report PDF
// ============================================================================

export interface IAnnualReportPDFObject {
  id: number;
  file: string;
  creator: number;
  created_at: string;
  updated_at: string;
  pdf_data: string;
  report: {
    id: number;
    pdf_generation_in_progress: boolean;
    year: number;
  };
}

// ============================================================================
// Report Email Types
// ============================================================================

export interface IReportEmailData {
  reportYear: number;
  reportId: number;
  recipientEmail: string;
  recipientName: string;
}
