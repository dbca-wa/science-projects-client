import type {
  BusinessAreaImage,
  IBusinessAreaCreate,
} from "@/shared/types";
import type { QueryFunctionContext } from "@tanstack/react-query";
import instance from "@/shared/lib/api/axiosInstance";

// Business Area API Service Functions

export const getAllBusinessAreas = async () => {
  const res = instance.get(`agencies/business_areas`).then((res) => {
    return res.data;
  });
  return res;
};

export const getMyBusinessAreas = async () => {
  const res = instance.get(`agencies/business_areas/mine`).then((res) => {
    return res.data;
  });
  return res;
};

export const getSingleBusinessArea = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;

  const res = instance.get(`agencies/business_areas/${pk}`).then((res) => {
    return res.data;
  });
  return res;
};

export const createBusinessArea = async (formData: IBusinessAreaCreate) => {
  const newFormData = new FormData();

  if (formData.division !== undefined) {
    newFormData.append("division", formData.division.toString());
  }

  if (formData.old_id !== undefined) {
    newFormData.append("old_id", formData.old_id.toString());
  }
  if (formData.name !== undefined) {
    newFormData.append("name", formData.name);
  }
  if (formData.agency !== undefined) {
    newFormData.append("agency", formData.agency.toString());
  }
  if (formData.focus !== undefined) {
    newFormData.append("focus", formData.focus);
  }
  if (formData.introduction !== undefined) {
    newFormData.append("introduction", formData.introduction);
  }
  if (formData.data_custodian !== undefined) {
    newFormData.append("data_custodian", formData.data_custodian.toString());
  }
  if (formData.finance_admin !== undefined) {
    newFormData.append("finance_admin", formData.finance_admin.toString());
  }
  if (formData.leader !== undefined) {
    newFormData.append("leader", formData.leader.toString());
  }

  if (formData.image !== null) {
    if (formData.image instanceof File) {
      newFormData.append("image", formData.image);
    } else if (typeof formData.image === "string") {
      newFormData.append("image", formData.image);
    }
  }

  return instance.post("agencies/business_areas", newFormData).then((res) => {
    return res.data;
  });
};

export interface BusinessAreaUpdateProps {
  agency?: number;
  old_id?: number;
  pk?: number;
  division?: number;
  slug: string;
  name: string;
  focus: string;
  introduction: string;
  image: BusinessAreaImage | File;
  leader: number;
  finance_admin: number;
  data_custodian: number;
  selectedImageUrl: string | null;
}

export const updateBusinessArea = async (formData: BusinessAreaUpdateProps) => {
  const newFormData = new FormData();

  if (formData.division !== undefined) {
    newFormData.append("division", formData.division.toString());
  }

  if (formData.old_id !== undefined) {
    newFormData.append("old_id", formData.old_id.toString());
  }
  if (formData.name !== undefined) {
    newFormData.append("name", formData.name);
  }
  if (formData.slug !== undefined) {
    newFormData.append("slug", formData.slug);
  }
  if (formData.agency !== undefined) {
    newFormData.append("agency", formData.agency.toString());
  }
  if (formData.focus !== undefined) {
    newFormData.append("focus", formData.focus);
  }
  if (formData.introduction !== undefined) {
    newFormData.append("introduction", formData.introduction);
  }
  if (formData.data_custodian !== undefined) {
    newFormData.append("data_custodian", formData.data_custodian.toString());
  }
  if (formData.finance_admin !== undefined) {
    newFormData.append("finance_admin", formData.finance_admin.toString());
  }
  if (formData.leader !== undefined) {
    newFormData.append("leader", formData.leader.toString());
  }

  if (formData.image !== null) {
    if (formData.image instanceof File) {
      newFormData.append("image", formData.image);
    } else if (typeof formData.image === "string") {
      newFormData.append("image", formData.image);
    }
  } else {
    if (formData.selectedImageUrl === null) {
      newFormData.append("selectedImageUrl", "delete");
    }
  }

  return instance
    .put(`agencies/business_areas/${formData.pk}`, newFormData)
    .then((res) => {
      return res.data;
    });
};

export const deleteBusinessArea = async (pk: number) => {
  return instance.delete(`agencies/business_areas/${pk}`).then((res) => {
    return res.data;
  });
};

export const activateBusinessArea = async (pk: number) => {
  return instance
    .post(`agencies/business_areas/setactive/${pk}`)
    .then((res) => {
      return res.data;
    });
};
