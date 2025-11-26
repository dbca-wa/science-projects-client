import type { IDivision } from "@/shared/types";

// Business Area Types

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
