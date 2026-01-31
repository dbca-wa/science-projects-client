// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Response from /documents/projectdocuments/pendingmyaction endpoint
 * Contains categorized document tasks requiring user action
 */
export interface DocumentTasksResponse {
  all: IProjectDocument[];
  team: IProjectDocument[];
  lead: IProjectDocument[];
  ba: IProjectDocument[];
  directorate: IProjectDocument[];
}

/**
 * Response from /documents/endorsements/pendingmyaction endpoint
 * Contains categorized endorsement tasks requiring user approval
 */
export interface EndorsementTasksResponse {
  aec: IEndorsement[];
  bm: IEndorsement[];
  hc: IEndorsement[];
}

// ============================================================================
// DOCUMENT & ENDORSEMENT TYPES
// ============================================================================

/**
 * Project document requiring user action
 * Represents documents like concept plans, project plans, progress reports, etc.
 */
export interface IProjectDocument {
  id: number;
  kind: "concept" | "projectplan" | "progressreport" | "studentreport" | "projectclosure";
  status: string;
  project: {
    id: number;
    title: string;
    kind: string;
    year: number;
    number: number;
  };
  project_lead_approval_granted: boolean;
  business_area_lead_approval_granted: boolean;
  directorate_approval_granted: boolean;
}

/**
 * Endorsement task requiring user approval
 * Represents AEC, Biometrician, or Herbarium Curator endorsements
 */
export interface IEndorsement {
  id: number;
  project_plan: {
    document: {
      project: {
        id: number;
        title: string;
        kind: string;
      };
    };
  };
  ae_endorsement_required: boolean;
  ae_endorsement_provided: boolean;
  bm_endorsement_required: boolean;
  bm_endorsement_provided: boolean;
  hc_endorsement_required: boolean;
  hc_endorsement_provided: boolean;
}

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

/**
 * Props for MyTasksSection component
 * Main container for displaying all user tasks
 */
export interface MyTasksSectionProps {
  documentTasks: DocumentTasksResponse;
  documentTasksLoading: boolean;
  endorsementTasks: EndorsementTasksResponse;
  endorsementTasksLoading: boolean;
}

/**
 * Props for DocumentTaskCard component
 * Displays a single document task card
 */
export interface DocumentTaskCardProps {
  document: IProjectDocument;
  kind: "team" | "project_lead" | "ba_lead" | "directorate";
}

/**
 * Props for EndorsementTaskCard component
 * Displays a single endorsement task card
 */
export interface EndorsementTaskCardProps {
  endorsement: IEndorsement;
  kind: "aec" | "bm" | "hc";
}

/**
 * Props for SectionDivider component
 * Displays a horizontal divider with centered heading
 */
export interface SectionDividerProps {
  title: string;
}
