// Admin-related type definitions

import type { IImageData } from "@/shared/types";

// ADMIN OPTIONS ============================================================================

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
  created_at: Date;
  maintainer: IMiniUser;

  // New guide_content field (JSON object with dynamic keys)
  guide_content: {
    [key: string]: string; // Allows any field key with string content
  };

  // Legacy fields - keeping for backward compatibility
  guide_admin?: string;
  guide_about?: string;
  guide_login?: string;
  guide_profile?: string;
  guide_user_creation?: string;
  guide_user_view?: string;
  guide_project_creation?: string;
  guide_project_view?: string;
  guide_project_team?: string;
  guide_documents?: string;
  guide_report?: string;
}

export interface IGuideContent {
  guide_admin?: string;
  guide_about?: string;
  guide_login?: string;
  guide_profile?: string;
  guide_user_creation?: string;
  guide_user_view?: string;
  guide_project_creation?: string;
  guide_project_view?: string;
  guide_project_team?: string;
  guide_documents?: string;
  guide_report?: string;
  [key: string]: string | undefined; // Allow additional dynamic fields
}

export interface IAdminOptionsTypeSafe {
  pk: number;
  email_options: string;
  updated_at: Date;
  created_at: Date;
  maintainer: IMiniUser;
  guide_content: IGuideContent;

  // Legacy fields - keeping for backward compatibility
  guide_admin?: string;
  guide_about?: string;
  guide_login?: string;
  guide_profile?: string;
  guide_user_creation?: string;
  guide_user_view?: string;
  guide_project_creation?: string;
  guide_project_view?: string;
  guide_project_team?: string;
  guide_documents?: string;
  guide_report?: string;
}

// ADMIN REQUESTS ============================================================================

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

// AFFILIATIONS ============================================================================

export interface IAffiliation {
  pk?: number;
  created_at?: Date;
  updated_at?: Date;
  name: string;
}

export interface IMergeAffiliation {
  primaryAffiliation: IAffiliation;
  secondaryAffiliations: IAffiliation[];
}

// BRANCHES ============================================================================

export interface IBranch {
  pk?: number;
  old_id?: number;
  agency: number;
  name: string;
  manager: number;
}

// ADDRESSES ============================================================================

export interface IAddress {
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

interface IEmailListUser {
  pk: number;
  name: string;
  email: string;
}

export interface IDivision {
  pk?: number;
  old_id?: number;
  name: string;
  slug: string;
  director: number;
  approver: number;
  directorate_email_list?: IEmailListUser[];
}

// BUSINESS AREAS ============================================================================

export interface BusinessAreaImage {
  pk: number;
  old_file: string;
  file: string;
}

export interface IBusinessAreaUpdate {
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

export interface IBusinessArea {
  agency?: number;
  old_id?: number;
  pk?: number;
  slug?: string;
  division?: IDivision | number;
  is_active: boolean;
  name: string;
  focus: string;
  introduction: string;
  image: BusinessAreaImage;
  leader?: number;
  finance_admin?: number;
  data_custodian?: number;
}

export interface IBusinessAreaCreate {
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

// SERVICES ============================================================================

export interface IDepartmentalService {
  name: string;
  director: number;
  pk?: number;
  old_id?: number;
}

// AGENCIES ============================================================================

export interface IAgency {
  pk: number;
  name: string;
  key_stakeholder: number;
  is_active: boolean;
}

// LOCATIONS ============================================================================

export interface OrganisedLocationData {
  [key: string]: ISimpleLocationData[];
  dbcaregion: ISimpleLocationData[];
  dbcadistrict: ISimpleLocationData[];
  ibra: ISimpleLocationData[];
  imcra: ISimpleLocationData[];
  nrm: ISimpleLocationData[];
}

export interface ISimpleLocationData {
  pk: number;
  name: string;
  area_type: string;
}

export interface IProjectAreas {
  created_at: Date;
  updated_at: Date;
  project: number;
  id: number;
  areas: ISimpleLocationData[];
}

export interface IAddLocationForm {
  old_id?: number;
  pk?: string;
  name: string;
  area_type: string;
}

// REPORTS (Admin CRUD) ============================================================================

export interface IReport {
  pk: number;
  year: number;
  date_open: Date | string | null;
  date_closed: Date | string | null;
  pdf_generation_in_progress: boolean;
}

export interface IReportCreation {
  year: number;
  date_open?: Date | string;
  date_closed?: Date | string;
}
