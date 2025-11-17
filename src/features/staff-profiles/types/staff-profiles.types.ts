// ============================================================
// STAFF PROFILE TYPES
// ============================================================

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
  disableEmailButton?: boolean;
}

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

export interface ITAssetData {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  location: {
    id: number;
    name: string;
  };
  unit: string;
  division: string;
}

export interface IStaffProfileData {
  pk: number;
  user: number;
  title: string;
  name: string;
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
  keyword_tags: KeywordTag[];
  it_asset_data: ITAssetData;
  it_asset_id: number;
  custom_title: string;
  custom_title_on: boolean;
}

export interface IStaffOverviewData {
  pk: number;
  user: IStaffUser;
  about: string;
  expertise: string;
  keyword_tags: KeywordTag[];
}

// ============================================================
// CV TYPES
// ============================================================

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
  qualification_name: string;
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

// ============================================================
// PUBLICATION TYPES
// ============================================================

export interface PublicationResponse {
  custom_publications: IStaffPublicationEntry[];
  library_publications: any[]; // Define more specifically if structure is known
}
