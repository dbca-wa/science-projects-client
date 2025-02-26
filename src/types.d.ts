import { LexicalEditor } from "lexical";
import { ReactNode } from "react";
import { AxiosError, AxiosResponse } from "axios";
import {
  IDocumentApproved,
  IDocumentReadyEmail,
  IDocumentRecalled,
  INewCycleEmail,
  IProjectClosureEmail,
  IReviewDocumentEmail,
} from "@/lib/api";

export interface ITAssetData {
  id: number;
  email?: string;
  title: string;
  division: string;
  unit: string;
  location: { id: number; name: string };
}

export interface RGB {
  b: number;
  g: number;
  r: number;
}
export interface HSV {
  h: number;
  s: number;
  v: number;
}
export interface Color {
  hex: string;
  hsv: HSV;
  rgb: RGB;
}

// Editor ============================================================================
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
  | "reason"
  | "intended_outcome"
  | "knowledge_transfer"
  | "data_location"
  | "hardcopy_location"
  | "backup_location"
  | "scientific_outputs";

export interface IMiniUser {
  pk: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface IMaintainer {
  maintainer: IMiniUser;
}

export interface IAdminOptions {
  pk: number;
  email_options: string;
  updated_at: Date;
  created_at: Data;
  maintainer: IMiniUser;
  guide_admin: string;
  guide_about: string;
  guide_login: string;
  guide_profile: string;
  guide_user_creation: string;
  guide_user_view: string;
  guide_project_creation: string;
  guide_project_view: string;
  guide_project_team: string;
  guide_documents: string;
  guide_report: string;
}

export interface IConceptPlanGenerationData {
  project_pk: number;
  document_pk: number;
  concept_plan_data_pk: number;
  document_tag: string;
  project_title: string;
  project_status: string;
  business_area_name: string;
  project_team: string[];
  project_image: ProjectImage;
  now: Date;
  project_lead_approval_granted: boolean;
  business_area_lead_approval_granted: boolean;
  directorate_approval_granted: boolean;
  background: string;
  aims: string;
  expected_outcomes: string;
  collaborations: string;
  strategic_context: string;
  staff_time_allocation: string;
  indicative_operating_budget: string;
}

export interface IAffiliation {
  pk?: number;
  created_at?: Date;
  updated_at?: Data;
  name: string;
}

export interface ISetCaretaker {
  primaryUserPk: number;
  caretakerUserPk: number;
}

export interface IMergeUser {
  primaryUser: IUserData;
  secondaryUsers: IUserData[];
}

export interface IMergeUserPk {
  primaryUserPk: number;
  secondaryUserPks: number[];
}

export interface IMergeAffiliation {
  primaryAffiliation: IAffiliation; // or IAffiliation and extract pk
  secondaryAffiliations: IAffiliation[]; // or IAffiliation and extract pk
}

export interface IProjectLeadsEmail {
  shouldDownloadList: boolean;
}

export interface IEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  thisUser: IUserMe;
  emailFunction: (
    props?:
      | IReviewDocumentEmail
      | INewCycleEmail
      | IProjectClosureEmail
      | IDocumentReadyEmail
      | IDocumentApproved
      | IDocumentRecalled,
  ) => Promise<AxiosResponse | AxiosError>; // Allow props to be optional
}

export interface ISendSingleEmail {
  fromUserPk: number;
  fromUserEmail: string;
  fromUserName: string;
  toUserPk?: number;
  toUserEmail: string;
  toUserName?: string;
  project?: number;
  projectTitle?: string;
  projectDocumentKind?:
    | "concept"
    | "projectplan"
    | "progressreport"
    | "studentreport"
    | "projectclosure";
  stage?: number;
}

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
type EditorSubsections =
  | "Comment"
  | PubliProfileSection
  | ProjectSection
  | ConceptPlanSection
  | ProjectPlanSection
  | ProgressReportSection
  | StudentReportSection
  | ProjectClosureSection
  | AnnualReportSection;

export interface CustomAxiosError extends AxiosError {
  response?: {
    data?: {
      non_field_errors?: string[];
    };
  };
}

// USER ============================================================================

export interface IUserData {
  pk: number;
  username: string;
  email: string;
  display_first_name: string;
  display_last_name: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  image: IImageData;
  business_area: IBusinessArea | undefined;
  role: string;
  branch: IBranch;
  affiliation: IAffiliation;
  branches?: IBranch[];
  businessAreas?: IBusinessArea[];
}

export interface ICaretakerRequestObject {
  id: number;
  action: string;
  created_at: Date;
  end_date: Date | null;
  notes: string | null;
  primary_user: {
    pk: number;
    display_first_name: string;
    display_last_name: string;
    image: IImageData;
  };
  reason: string | null;
  secondary_users: {
    pk: number;
    display_first_name: string;
    display_last_name: string;
    image: IImageData;
  }[];
  status: string;
}

export interface ICheckCaretakerStatus {
  caretaker_request_object: ICaretakerRequestObject | null;
  become_caretaker_request_object: ICaretakerRequestObject | null;
  caretaker_object: ICaretakerObject | null;
}

export interface ICaretakerObject {
  pk?: number;
  id?: number;
  caretaker_obj_id?: number;
  user:
    | number
    | {
        pk: number;
        display_first_name: string;
        display_last_name: string;
        image: string;
      };
  caretaker: {
    pk: number;
    display_first_name: string;
    display_last_name: string;
    image: IImageData;
  };
  end_date: Date | null;
  reason: string | null;
  notes: string | null;
}

export interface IUserMe {
  staff_profile_pk?: number;
  public_email?: string;
  custom_title?: string;
  custom_title_on?: boolean;
  staff_profile_hidden?: boolean;
  id?: number;
  pk?: number;
  caretakers: ICaretakerSimpleUserData[];
  caretaking_for: ICaretakerSimpleUserData[];
  display_first_name: string;
  display_last_name: string;
  about: string;
  agency: IAgency;
  branch: IBranch;
  business_area: IBusinessArea | undefined;
  date_joined: Date;
  email: string;
  expertise: string;
  phone: string;
  fax: string;
  username: string;
  first_name: string;
  last_name: string;
  title: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  is_biometrician: boolean;
  is_aec: boolean;
  is_herbarium_curator: boolean;
  image: IImageData;
  role: string | null;
  affiliation: IAffiliation;
  branches?: IBranch[];
  businessAreas?: IBusinessArea[];
  business_areas_led: number[];
}

export interface ICaretakerSimpleUserData {
  pk: number;
  is_superuser: boolean;
  caretaker_obj_id?: number;
  display_first_name: string | null;
  display_last_name: string | null;
  email: string;
  image: string;
  end_date: Date | null;
  caretakers: ICaretakerSimpleUserData[];
  caretaking_for: ICaretakerSimpleUserData[];
}

export interface IMemberUserDetails {
  pk: number;
  is_staff: boolean;
  is_superuser: boolean;
  username: string | null;
  display_first_name: string | null;
  display_last_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  business_area: string | null;
  branch: string | null;
  role: string | null;
  image: IImageData;
  caretaking_for: ICaretakerSimpleUserData[];
  caretakers: ICaretakerSimpleUserData[];
}

export interface IPersonalInformation {
  display_first_name: string | null;
  display_last_name: string | null;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  phone: string;
  fax: string;
}

export interface IProfile {
  image: {
    file: string;
    user: IUserData;
  };
  // image: any;
  about: string;
  expertise: string;
}

// PROJECT DETAILS =============================================================================

interface ISmallUser {
  id: number;
  username: string;
}

interface ISmallProject {
  id: number;
  title: string;
}

interface ISmallService {
  id?: number;
  pk?: numer;
  name: string;
}

interface IBaseProjectDetails {
  id: number;
  created_at: Date;
  updated_at: Date;
  creator: ISmallUser;
  modifier: ISmallUser;
  data_custodian: ISmallUser | null;
  site_custodian: ISmallUser | null;
  owner: ISmallUser;
  project: ISmallProject;
  service: ISmallService | null;
}

interface IStudentProjectDetails {
  id: number;
  old_id: number | null;
  level: string;
  organisation: string;
  project: ISmallProject;
}

interface IExternalProjectDetails {
  id: number;
  old_id: number | null;
  project: ISmallProject;
  aims: string | null;
  budget: string | null;
  collaboration_with: string | null;
  description: string | null;
}

interface IExtendedProjectDetails {
  base: IBaseProjectDetails;
  external: IExternalProjectDetails | [];
  student: IStudentProjectDetails | [];
}

// PROJECT DOCUMENTS ============================================================================

interface IAECPDF {
  created_at: Date;
  updated_at: Date;
  creator: number;
  endorsement: number;
  id?: number;
  pk?: number;
  file: string;
}

interface ISmallProj {
  pk: number;
  kind: string;
  title: string;
}

interface ISmallDoc {
  pk: number;
  project: ISmallProj;
}

interface IEndorsementProjectPlan {
  pk: number;
  document: ISmallDoc;
  aims: string;
  knowledge_transfer: string;
  listed_references: string;
  operating_budget: string;
  operating_budget_external: string;
  outcome: string;
  related_projects: string;
}

interface ITaskEndorsement {
  pk: number;
  project_plan: IEndorsementProjectPlan;
}

interface IEndorsement {
  pk: number;
  project_plan: number;
  bm_endorsement_required: boolean;
  bm_endorsement_provided: boolean;

  hc_endorsement_required: boolean;
  hc_endorsement_provided: boolean;

  dm_endorsement_required: boolean;
  dm_endorsement_provided: boolean;

  ae_endorsement_required: boolean;
  ae_endorsement_provided: boolean;

  data_management: string;
  no_specimens: string;
  aec_pdf: IAECPDF;
}

interface ProjectPDFData {
  pk: number;
  old_file: string | null;
  file: string | null;
  document: IMainDoc;
  project: IProjectData;
}

export interface IReferencedDoc {
  pk: number;
  year?: number;
}

export interface IMidDoc {
  pk: number;
  project: ISmallProj;
  kind: string;
  referenced_doc: IReferencedDoc;
}

export interface ISmallUserWithAvatar {
  pk: number;
  email: string;
  display_first_name: string;
  display_last_name: string;
  image: string;
}

export interface IMainDoc {
  pk?: number;
  id?: number;
  // report?: ISmallReport;
  created_year: number;
  created_at: Date;
  creator: number;
  modifier: number;
  updated_at: Date;
  kind: string;
  project: IProjectData;
  status: string;
  project_lead_approval_granted: boolean;
  business_area_lead_approval_granted: boolean;
  directorate_approval_granted: boolean;
  pdf_generation_in_progress: boolean;
  pdf: IProjectDocPDF;
  for_user?: ISmallUserWithAvatar;
}

interface IProjectDocPDF {
  file: string;
  document?: number;
  project?: number;
}

interface IConceptPlan {
  pk?: number;
  id?: number;
  document: IMainDoc;
  background: string | null;
  aims: string | null;
  outcome: string | null;
  collaborations: string | null;
  strategic_context: string | null;
  staff_time_allocation: string | null;
  budget: string | null;
}

interface IMethodologyImage {
  pk: number;
  file: string;
  project_plan: {
    id: number;
  };
  uploader: {
    id: number;
    username: string;
  };
}

interface IProjectPlan {
  pk: number;
  document: IMainDoc;
  background: string | null;
  aims: string | null;
  outcome: string | null;
  knowledge_transfer: string | null;
  listed_references: string | null;
  involves_plants: boolean;
  involves_animals: boolean;
  operating_budget: string | null;
  operating_budget_external: string | null;
  methodology: string | null;
  methodology_image: IMethodologyImage | null;
  project_tasks: string | null;
  related_projects: string | null;
  endorsements: IEndorsement;
}

interface IProgressReport {
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
  team_members: IProjectMember[];
}

interface IStudentReport {
  pk: number;
  document: IMainDoc;
  progress_report: string;
  year: number;
}

interface IProjectClosure {
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

// Define the union type
type IProjectDocument =
  | IConceptPlan
  | IProjectPlan
  | IProgressReport
  | IStudentReport
  | IProjectClosure;

interface IProjectDocuments {
  concept_plan: IConceptPlan | null;
  project_plan: IProjectPlan | null;
  progress_reports: IProgressReport[] | [];
  student_reports: IStudentReport[] | [];
  project_closure: IProjectClosure | null;
}

// PROJECT MEMBERS ============================================================================

interface IProjectMember {
  id?: number;
  pk?: number;
  project: number;
  is_leader: boolean;
  user: IMemberUserDetails;
  // caretakers: IMemberUserDetails[] | null;
  role: string;
  time_allocation: number;
  position: number;
  short_code: number | null;
  affiliation: IAffiliation;
}

// PROJECT ============================================================================

interface IMiniEndorsement {
  pk: number;
  project_plan: IProjectPlan;
}

interface ITinyProjectData {
  pk?: number | undefined;
  id?: number | undefined;
  title: string;
  image: ProjectImage;
  tag: string;
  // year: number;
  // kind: string;
  // number: number;
}

export interface Position {
  x: number;
  y: number;
}

type ProjectRoles =
  | "supervising"
  | "research"
  | "technical"
  | "externalcol"
  | "externalpeer"
  | "academicsuper"
  | "student"
  | "consulted"
  | "group";

interface IProjectData {
  pk: number | undefined;
  id?: number;
  areas: ISimpleLocationData[];
  kind: string;
  title: string;
  status: string;
  description: string;
  tagline: string;
  image: ProjectImage;
  keywords: string;
  year: number;
  number: number;
  start_date: Date;
  end_date: Date;
  business_area: IBusinessArea;
  deletion_requested: boolean;
  deletion_request_id: number | null;

  created_at: Date;
  updated_at: Date;
  tag?: string;
  role?: ProjectRoles;

  hidden_from_staff_profiles?: number[];
}

interface IFullProjectDetails {
  project: IProjectData;
  details: IExtendedProjectDetails;
  documents: IProjectDocuments;
  members: IProjectMember[] | null;
}

// TASKS ============================================================================

interface ITaskUser {
  pk: number;
  first_name: string;
  last_name: string;
}

type ProjectStatus =
  | "new"
  | "pending"
  | "active"
  | "updating"
  | "closure_requested"
  | "closing"
  | "final_update"
  | "completed"
  | "terminated"
  | "suspended";

interface ITaskProject {
  pk: number;
  title: string;
  status: string;
  kind: string;
  year: number;
  business_area: IBusinessArea;
  image: IImageData;
}

interface ITaskDocument {
  pk: number;
  kind: string;
  status: string;
  project: ITaskProject;
}

export interface IApproveDocument {
  shouldSendEmail?: boolean;
  action: "approve" | "recall" | "send_back" | "reopen";
  stage: number; // 1-3
  documentPk: number;
}

// export interface IApproveProgressReport {
//     action: "approve" | "recall" | "send_back";
//     stage: number; // 1-3
//     documentPk: number;
//     // progressReportPk: number;
// }

// export interface IApproveConceptPlan {
//     action: "approve" | "recall" | "send_back";
//     stage: number; // 1-3
//     documentPk: number;
//     // conceptPlanPk: number;
// }

export interface ITaskDisplayCard {
  pk: number;
  creator: ITaskUser;
  user: ITaskUser;
  // project: ITaskProject;
  document: ITaskDocument;

  name: string;
  description: string;
  notes: string;
  status: string;
  task_type: string;

  date_assigned: Date;
}

// LOCATION ============================================================================

interface OrganisedLocationData {
  [key: string]: ISimpleLocationData[];

  dbcaregion: ISimpleLocationData[];
  dbcadistrict: ISimpleLocationData[];
  ibra: ISimpleLocationData[];
  imcra: ISimpleLocationData[];
  nrm: ISimpleLocationData[];
}

interface ISimpleLocationData {
  pk: number;
  name: string;
  area_type: string;
}

interface IProjectAreas {
  created_at: Date;
  updated_at: Date;
  project: number;
  id: number;
  areas: ISimpleLocationData[];
}

interface IAddLocationForm {
  old_id?: number;
  pk?: string;
  name: string;
  area_type: string;
}

// IMAGE ============================================================================

interface IImageData {
  file: string;
  old_file: string;
  pk: number;
  user: number;
}

interface ProjectImage {
  pk: number;
  old_file: string;
  file: string;
}

interface BusinessAreaImage {
  pk: number;
  old_file: string;
  file: string;
}

// BUSINESS AREA ============================================================================

interface IBusinessAreaUpdate {
  agency?: number;
  old_id?: number;
  pk?: number;
  slug?: string;
  division?: IDivision;
  is_active: boolean;
  name: string;
  focus: string;
  introduction: string;
  image: BusinessAreaImage | File | null;
  leader?: number;
  finance_admin?: number;
  data_custodian?: number;
}

interface IBusinessArea {
  agency?: number;
  old_id?: number;
  pk?: number;
  slug?: string;
  division?: IDivision;
  is_active: boolean;
  name: string;
  focus: string;
  introduction: string;
  image: BusinessAreaImage;
  // | File | null
  leader?: number;
  finance_admin?: number;
  data_custodian?: number;
}

interface IBusinessAreaCreate {
  agency?: number;
  old_id?: number;
  pk?: number;
  slug?: string;
  division?: number;
  is_active: boolean;
  name: string;
  focus: string;
  introduction: string;
  image: BusinessAreaImage | File | null;
  leader?: number;
  finance_admin?: number;
  data_custodian?: number;
}

// SERVICE ============================================================================

interface IDepartmentalService {
  name: string;
  director: number;
  pk?: number;
  old_id?: number;
}

// AGENCY ============================================================================

interface IAgency {
  pk: number;
  name: string;
  key_stakeholder: number;
  is_active: boolean;
}

// BRANCH ============================================================================

interface IBranch {
  pk?: number;
  old_id?: number;

  agency: number;
  name: string;
  manager: number;
}

// ADDRESS ============================================================================

interface IAddress {
  pk?: number;
  agency?: number;
  branch?: number;
  street: string;
  suburb?: string;
  city: string;
  zipcode?: number;
  state: string;
  country: string;
  pobox?: string;
}

// DIVISIONS ============================================================================

interface IDivision {
  pk?: number;
  old_id?: number;
  name: string;
  slug: string;
  director: number;
  approver: number;
}

// REPORT ============================================================================

export interface ILegacyPDF {
  pk: number;
  file: string;
  report: { id: number; year: number };
  year: number;
}

interface ITinyReportMedia {
  pk: number;
  kind: string;
  old_file: string;
  file: string;
  report: number;
}

export interface ISmallReport {
  pk: number;
  date_open?: Date | null;
  date_closed?: Date | null;
  year: number | null;
  creator?: number;
  media?: ITinyReportMedia;
  pdf?: IReportPDF;
}

export interface IReportPDF {
  pk: number;
  file: string | null;
  old_file: string | null;
}

export interface IReport {
  old_id?: number;
  pk?: number;
  id?: number;
  created_at?: Date;
  updated_at?: Date | null;
  date_open: Date | null;
  date_closed: Date | null;
  year: number;

  creator?: number;
  modifier?: number;

  dm: string | null;
  publications: string | null;
  research_intro: string | null;
  service_delivery_intro: string | null;
  student_intro: string | null;
}

export interface IReportCreation {
  old_id?: number;
  pk?: number;
  created_at?: Date;
  updated_at?: Date | null;
  // date_open: Date | null;
  // date_closed: Date | null;
  year: number;

  creator?: number;
  modifier?: number;

  dm: string | null;
  publications: string | null;
  research_intro: string | null;
  service_delivery_intro: string | null;
  student_intro: string | null;
  seek_update: boolean;
}

// Staff Profiles ====================================================================

// User List =========================
export interface IStaffProfileAddress {
  pk: number;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: number;
  pobox: string;
}

export interface IStaffProfileBranch {
  name: string;
  address: IStaffProfileAddress;
}

export interface IStaffUserResult {
  pk?: number;
  title?: string;
  name: string;
  position?: string;
  location?: {
    id: number;
    name: string;
  };
  unit?: string;
  division?: string;
  is_hidden?: boolean;
  // address?: string;
  // branch?: IStaffProfileBranch;

  // email: string;
  disableEmailButton?: boolean;
}

// User Detail =========================

export interface IStaffUser {
  pk: number;
  ba_lead_status?: string | null;
  display_first_name: string;
  display_last_name: string;
  email: string;
  avatar: {
    file: string;
    id: number;
    user: {
      id: number;
    };
  } | null;
}

export interface KeywordTag {
  pk: number;
  name: string;
}

export interface IStaffProfileData {
  pk: number;
  user: number;
  title: string;
  name: string;
  // positionTitle: string;
  // branch: string;
  overview: {
    about: string;
    expertise: string;
  };
  keyword_tags: KeywordTag[];
  it_asset_data?: ITAssetData;
  it_asset_id?: number;
  aucode?: string;
}

export interface IStaffProfileBaseData {
  pk: number;
  is_hidden: boolean;

  user: {
    ba_lead_status: string | null;
    display_first_name: string;
    display_last_name: string;
    is_active: boolean;
    pk: number;
  };
  title: string | null;

  about: string | null;
  expertise: string | null;
  public_email: string | null;

  keyword_tags: KeywordTag[];
  aucode: string | null;

  it_asset_id: number | null;
  it_asset_data: ITAssetData | null;
  employee_id: string | null;
}

export interface IStaffProfileHeroData {
  pk: number;
  user: IStaffUser;
  title: string;
  name: string;
  keyword_tags: KeywordTag[]; // make this max of 5
  it_asset_data: ITAssetData;
  it_asset_id: number;
  custom_title: string;
  custom_title_on: boolean;
}

// Overview

export interface IStaffOverviewData {
  pk: number;
  user: IStaffUser;
  about: string;
  expertise: string;
  keyword_tags: KeywordTag[];
}

// Projects (Handled elsewhere - user projects)

// CV

export interface ICaretakerEntry {
  pk?: number;
  userPk: number;
  caretakerPk: number;
  // startDate: Date;
  endDate: Date;
  reason: "leave" | "resignation" | "other";
  notes?: string; // if other is selected
}

export interface IAdminRequestUser {
  pk: number;
  display_first_name?: string;
  display_last_name?: string;
}

export interface IMakeRequestToAdmins {
  action: "deleteproject" | "mergeuser" | "setcaretaker";

  // Project deletion
  project?: number;

  // Merging and caretaking
  primaryUserPk?: number;
  secondaryUserPks?: number[];
  reason?: string;
  startDate?: Date;
  endDate?: Date | null;
  notes?: string;
}

export interface IActionAdminTask {
  action: "approve" | "reject";
  taskPk?: number;
}

export interface IAdminTask {
  action: "deleteproject" | "mergeuser" | "setcaretaker";
  //  | "mergeaffiliation";
  status: "pending" | "approved" | "fulfilled" | "rejected";
  project?: {
    pk: number;
    title: string;
  };
  requester?: IAdminRequestUser;
  primary_user?: IAdminRequestUser;
  secondary_users?: IAdminRequestUser[];
  reason?: string;
  notes?: string;
  start_date?: Date;
  end_date?: Date;
  pk: number;
  created_at?: Date;
}

export interface IStaffEmploymentEntry {
  pk: number;
  public_profile: number;
  position_title: string;
  start_year: string;
  end_year: string | null;
  section?: boolean;
  employer: string;
}

export interface IStaffPublicationEntry {
  pk: number;
  public_profile: number;
  title: string;
  year: number;
}

export type QualificationKind =
  | "postdoc"
  | "doc"
  | "master"
  | "graddip"
  | "bachelor"
  | "assdegree"
  | "diploma"
  | "cert"
  | "nano";

export interface IStaffEducationEntry {
  pk: number;
  public_profile: number;
  // qualification_field: string;
  // qualification_kind: QualificationKind;
  qualification_name: string;
  // start_year: string;
  end_year: string;
  institution: string;
  location: string;
}

export interface IStaffCVData {
  pk: number;
  user_pk: number;
  employment: IStaffEmploymentEntry[];
  education: IStaffEducationEntry[];
}

// QUOTE ====================================================================

export interface IQuote {
  text: string;
  author: string;
}

// FRONTEND TYPES ====================================================================

interface INavitar {
  isModern: boolean;
  shouldShowName?: boolean;
  // userData: IUserData;
  windowSize: number;
}

interface ISearchTerm {
  searchTerm: string;
}

export interface IDesignProps {
  isModern?: boolean;
}

export interface SubDirectory {
  title: string;
  link: string;
}

export interface IBreadCrumbProps {
  subDirOne: SubDirectory;
  subDirTwo?: SubDirectory;
  subDirThree?: SubDirectory;
  rightSideElement?: ReactNode;
}

export interface IToolbarButton {
  onClick: (event: string) => void;
  editor: LexicalEditor;
  buttonIsOn?: boolean;
}

// CHAT =====================================================================

interface IReaction {
  type: string;
  count: number;
}

interface IChatMessage {
  sendingUser: IUser;
  timeSent: Date;
  payload: string;
  isRead: boolean;
  reactions: IReaction[];
}

interface ISingleChatData {
  chatWith: string;
  lastMessage: IChatMessage;
  isOnline: boolean | null;
}

interface IDashProps {
  activeTab?: number;
}

// SCIENCE PORTFOLIO ================================================================================
export interface ISimplePkProp {
  pk: number;
}
export interface ISimpleIdProp {
  id: number;
}

export interface ICommentReaction {
  pk?: number;
  user: number;
  // user: IUserData;
  comment?: number | null;
  direct_message?: number | null;
  reaction:
    | "thumbup"
    | "thumbdown"
    | "heart"
    | "brokenheart"
    | "hundred"
    | "confused"
    | "funny"
    | "surprised";
}

export interface ICaretakerSubsections {
  userData: IUserMe;
  refetchCaretakerData: () => void;
  caretakerData: ICheckCaretakerStatus;
}

export interface ICaretakerPermissions {
  userIsCaretakerOfMember: boolean;
  userIsCaretakerOfProjectLeader: boolean;
  userIsCaretakerOfBaLeader: boolean;
  userIsCaretakerOfAdmin: boolean;
}

// Publications ================================================================================
export interface Publication {
  DocId: string;
  BiblioText: string;
  staff_only: boolean;
  UserName: string;
  recno: number;
  content: string[];
  title: string;
  Material: string;
  publisher: string;
  AuthorBiblio: string;
  year: string;
  documentKey: string;
  UserId: string;
  author: string;
  citation: string;
  place: string;
  BiblioEditors: string;
  link_address?: string[];
  link_category?: string[];
  link_notes?: string[];
}

export interface LibraryPublicationResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: Publication[];
  isError: boolean;
  errorMessage: string;
}

export interface CustomPublication {
  pk: number;
  public_profile: number;
  title: string;
  year: string;
}

export interface PublicationResponse {
  staffProfilePk: number;
  libraryData: LibraryPublicationResponse;
  customPublications: CustomPublication[];
}
