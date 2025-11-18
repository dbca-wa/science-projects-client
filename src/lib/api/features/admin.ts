import {
  BusinessAreaImage,
  IActionAdminTask,
  IAddLocationForm,
  IAddress,
  IAdminOptions,
  IAffiliation,
  IBranch,
  IBusinessAreaCreate,
  IDepartmentalService,
  IDivision,
  IMakeRequestToAdmins,
  IMergeAffiliation,
  IReport,
  IReportCreation,
  ISimpleLocationData,
  OrganisedLocationData,
} from "@/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import instance from "../axiosInstance";

// ADMIN

export const getMaintainer = async () => {
  const res = instance.get(`adminoptions/maintainer`).then((res) => res.data);
  return res;
};

export const getAdminOptionsByPk = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  // adminoptions
  const res = instance.get(`adminoptions/${pk}`).then((res) => res.data);
  return res;
};

export const updateAdminOptions = async (formData: IAdminOptions) => {
  return instance.put(`adminoptions/${formData.pk}`, formData).then((res) => {
    return res.data;
  });
};

export enum GuideSections {
  ADMIN = "guide_admin",
  ABOUT = "guide_about",
  LOGIN = "guide_login",
  USER_PROFILE = "guide_profile",
  USER_CREATION = "guide_user_creation",
  USER_VIEW = "guide_user_view",
  PROJECT_CREATION = "guide_project_creation",
  PROJECT_VIEW = "guide_project_view",
  TEAM = "guide_project_team",
  DOCUMENTS = "guide_documents",
  REPORT = "guide_report",
}

export interface ContentType {
  fieldKey: string;
  content: string;
  adminOptionsPk: number;
}

// New types for dynamic guide content
export interface ContentField {
  id?: string;
  title?: string;
  field_key: string;
  description?: string;
  order: number;
}

export interface GuideSection {
  id: string;
  title: string;
  order: number;
  show_divider_after: boolean;
  category?: string;
  is_active: boolean;
  content_fields: ContentField[];
}

// Fetch all guide sections
export const getGuideSections = async () => {
  try {
    const response = await instance.get("adminoptions/guide-sections/");
    return response.data;
  } catch (error) {
    console.error("Error fetching guide sections:", error);
    throw error;
  }
};

// Create a new guide section
export const createGuideSection = async (section: GuideSection) => {
  try {
    const response = await instance.post(
      "adminoptions/guide-sections/",
      section,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating guide section:", error);
    throw error;
  }
};

// Update an existing guide section
export const updateGuideSection = async (section: GuideSection) => {
  try {
    const response = await instance.put(
      `adminoptions/guide-sections/${section.id}/`,
      section,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating guide section:", error);
    throw error;
  }
};

// Delete a guide section
export const deleteGuideSection = async (sectionId: string) => {
  try {
    await instance.delete(`adminoptions/guide-sections/${sectionId}/`);
    return true;
  } catch (error) {
    console.error("Error deleting guide section:", error);
    throw error;
  }
};

// Add a content field to a section
export const addContentField = async (
  sectionId: string,
  field: ContentField,
) => {
  try {
    const response = await instance.post(`adminoptions/content-fields/`, {
      ...field,
      section: sectionId,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding content field:", error);
    throw error;
  }
};

// Update a content field
export const updateContentField = async (
  fieldId: string,
  field: Partial<ContentField>,
) => {
  try {
    const response = await instance.patch(
      `adminoptions/content-fields/${fieldId}/`,
      field,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating content field:", error);
    throw error;
  }
};

// Delete a content field
export const deleteContentField = async (fieldId: string) => {
  try {
    await instance.delete(`adminoptions/content-fields/${fieldId}/`);
    return true;
  } catch (error) {
    console.error("Error deleting content field:", error);
    throw error;
  }
};

export const saveGuideContentToDB = async ({
  fieldKey,
  content,
  adminOptionsPk,
}: {
  fieldKey: string;
  content: string;
  adminOptionsPk: number;
}) => {
  try {
    console.log(
      `Saving content for field ${fieldKey}, length: ${content.length}`,
    );

    // Use the new dedicated endpoint
    const url = `adminoptions/${adminOptionsPk}/update_guide_content/`;
    console.log("API URL:", url);

    // Send data in the format expected by the new endpoint
    const data = {
      field_key: fieldKey, // Note: field_key, not fieldKey
      content: content,
    };

    console.log("Data structure:", JSON.stringify(data, null, 2));

    // Use POST instead of PUT for the new endpoint
    const response = await instance.post(url, data);

    console.log("Save response:", response.status, response.statusText);
    console.log("Response data:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error saving guide content:", error);

    // More detailed error logging
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }

    throw error;
  }
};

// Reorder guide sections
export const reorderGuideSections = async (sectionIds: string[]) => {
  try {
    const response = await instance.post(
      `adminoptions/guide-sections/reorder/`,
      {
        section_ids: sectionIds,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error reordering sections:", error);
    throw error;
  }
};

// Reorder content fields within a section
export const reorderContentFields = async (
  sectionId: string,
  fieldIds: string[],
) => {
  try {
    const response = await instance.post(
      `adminoptions/guide-sections/${sectionId}/reorder_fields/`,
      {
        field_ids: fieldIds,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error reordering content fields:", error);
    throw error;
  }
};

// Update interface to accept string or enum for section
export interface IHTMLGuideSave {
  htmlData: string;
  isUpdate: boolean;
  adminOptionsPk: null | number;
  section: string | GuideSections; // Accept either a string or enum value
  softRefetch?: () => void;
  setIsEditorOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  canSave: boolean;
}

// Extended interface with onSave callback for dynamic content
export interface IHTMLGuideSaveExtended extends IHTMLGuideSave {
  onSave?: (content: string) => Promise<boolean>;
}

// Keep existing function unchanged
export const saveGuideHtmlToDB = async ({
  htmlData,
  adminOptionsPk,
  section,
  isUpdate,
  canSave,
}: IHTMLGuideSave) => {
  const urlType = isUpdate ? instance.put : instance.post;
  const params = {
    [section as string]: htmlData, // Cast to string for safety
  };
  return urlType(`adminoptions/${adminOptionsPk}/`, params, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((res) => res.data);
};

//#region ADMIN REQUESTS ==========================================================================

export const actionAdminRequestCall = async ({
  action,
  taskPk,
}: IActionAdminTask) => {
  const url = `adminoptions/tasks/${taskPk}/${action}`;
  return instance.post(url).then((res) => res.data);
};

export const requestDeleteProjectCall = async ({
  action,
  project,
  reason,
}: IMakeRequestToAdmins) => {
  // console.log(pk)
  if (project !== undefined) {
    const url = `adminoptions/tasks`;

    return instance
      .post(url, {
        project,
        action,
        reason,
      })
      .then((res) => res.data);
  }
};

export const requestMergeUserCall = async ({
  action,
  primaryUserPk,
  secondaryUserPks,
  reason,
}: IMakeRequestToAdmins) => {
  // console.log(pk)
  if (primaryUserPk !== undefined && secondaryUserPks.length > 0) {
    const url = `adminoptions/tasks`;

    return instance
      .post(url, {
        primary_user: primaryUserPk,
        secondary_users: secondaryUserPks,
        action,
        reason,
      })
      .then((res) => res.data);
  }
};

export const cancelAdminTaskRequestCall = ({ taskPk }: { taskPk: number }) => {
  return instance
    .post(`adminoptions/tasks/${taskPk}/cancel`)
    .then((res) => res.data);
};

//#endregion

//  =========================================================== ADMIN CRUD ===========================================================

//#region ADDRESSES ===========================================================

export const getAllAddresses = async () => {
  const res = instance.get(`contacts/addresses`).then((res) => {
    return res.data;
  });
  return res;
};

export const createAddress = async (formData: IAddress) => {
  return instance.post("contacts/addresses", formData).then((res) => {
    return res.data;
  });
};

export const updateAddress = async (formData: IAddress) => {
  return instance
    .put(`contacts/addresses/${formData.pk}`, formData)
    .then((res) => {
      return res.data;
    });
};

export const deleteAddress = async (pk: number) => {
  return instance.delete(`contacts/addresses/${pk}`).then((res) => {
    return res.data;
  });
};
//#endregion

//#region REPORTS ==========================================================================

export const getAvailableReportYearsForProgressReport = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;

  try {
    // console.log(pk)
    const response = await instance.get(
      `documents/reports/availableyears/${pk}/progressreport`,
    );
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching years:", error);
    throw error;
  }
};

export const getAvailableReportYearsForStudentReport = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;

  try {
    const response = await instance.get(
      `documents/reports/availableyears/${pk}/studentreport`,
    );
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching years:", error);
    throw error;
  }
};

export const getLatestReportingYear = async () => {
  try {
    const response = await instance.get("documents/reports/latestyear");
    return response.data;
  } catch (error) {
    console.error("Error fetching latest year:", error);
    throw error;
  }
};

export const getCompletedReports = async () => {
  try {
    const response = await instance.get("documents/reports/completed");
    return response.data;
  } catch (error) {
    console.error("Error fetching completed reports:", error);
    throw error;
  }
};

export const getAllReports = async () => {
  const res = instance.get(`documents/reports`).then((res) => {
    return res.data;
  });
  return res;
};

export const getReportPDFs = async () => {
  const res = instance.get(`medias/report_pdfs`).then((res) => {
    return res.data;
  });
  return res;
};

export const getReportMedia = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  // if (pk !== 0)
  // {
  const res = instance.get(`medias/report_medias/${pk}/media`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const getAnnualReportPDF = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`documents/reports/pdf/${pk}`).then((res) => {
    return res.data;
  });
  return res;
};

export const getLatestReportMedia = async () => {
  const res = instance.get(`medias/report_medias/latest/media`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

interface IReportMediaUploadProps {
  pk: number;
  file: File;
  section:
    | "cover"
    | "rear_cover"
    | "sdchart"
    | "service_delivery"
    | "research"
    | "partnerships"
    | "collaborations"
    | "student_projects"
    | "publications"
    | "dbca_banner_cropped"
    | "dbca_banner";
}

export const uploadReportMediaImage = async ({
  pk,
  file,
  section,
}: IReportMediaUploadProps) => {
  // console.log({ pk, file, section });

  const newFormData = new FormData();

  // if (pk !== undefined) {
  //     newFormData.append('pk', pk.toString());
  // }
  if (section !== undefined) {
    newFormData.append("section", section);
  }
  if (file !== null) {
    // console.log(file)
    if (file instanceof File) {
      // console.log('is file')
      newFormData.append("file", file);
    } else if (typeof file === "string") {
      // console.log('is string')
      newFormData.append("file", file);
    }
  }

  const res = instance
    .post(`medias/report_medias/${pk}/media`, newFormData)
    .then((res) => res);
  return res;
  // return true;
};

interface IReportMediaDeleteProps {
  pk: number;
  section:
    | "cover"
    | "rear_cover"
    | "sdchart"
    | "service_delivery"
    | "research"
    | "partnerships"
    | "collaborations"
    | "student_projects"
    | "publications"
    | "dbca_banner_cropped"
    | "dbca_banner";
}

export const deleteReportMediaImage = async ({
  pk,
  section,
}: IReportMediaDeleteProps) => {
  // console.log({ pk, section });

  const newFormData = new FormData();
  if (section !== undefined) {
    newFormData.append("section", section);
  }
  const res = instance
    .delete(`medias/report_medias/${pk}/media/${section}`)
    .then((res) => res);

  // const res = instance.delete(`medias/report_medias/${pk}/media`, newFormData).then((res) => res);
  return res;
};

export const getFullReport = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  // if (pk !== 0)
  // {
  const res = instance.get(`documents/reports/${pk}`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const getFullLatestReport = async () => {
  // if (pk !== 0)
  // {
  const res = instance.get(`documents/reports/latest`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const createReport = async (formData: IReportCreation) => {
  const { year, ...otherData } = formData;

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const generateDates = (year: number) => {
    const startDate = new Date(year - 1, 6, 1); // July 1st of the prior year
    const endDate = new Date(year, 5, 30); // June 30th of the current year
    return [formatDate(startDate), formatDate(endDate)];
  };

  const [formattedDateOpen, formattedDateClosed] = generateDates(year);

  // Include the year in the data
  const dataToSend = {
    year,
    date_open: formattedDateOpen,
    date_closed: formattedDateClosed,
    ...otherData,
  };

  return instance.post("documents/reports", dataToSend).then((res) => {
    return res.data;
  });
};

export const updateReportMedia = async (formData: IReport) => {
  // console.log(formData);
  return {
    status: 200,
    message: "ok",
  };
};

export const updateReport = async (formData: IReport) => {
  const { date_open, date_closed, ...otherData } = formData;

  const formatDate = (date) => {
    if (typeof date === "string") {
      date = new Date(date); // Parse the string into a Date object
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formattedDateOpen = formatDate(date_open);
  const formattedDateClosed = formatDate(date_closed);

  const dataToSend = {
    date_open: formattedDateOpen,
    date_closed: formattedDateClosed,
    ...otherData,
  };

  return instance
    .put(`documents/reports/${formData.pk}`, dataToSend)
    .then((res) => {
      return res.data;
    });
};

export const deleteReport = async (pk: number) => {
  return instance.delete(`documents/reports/${pk}`).then((res) => {
    return res.data;
  });
};
//#endregion

//#region BRANCHES ==========================================================================

export const getBranchByPk = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`agencies/branches/${pk}`).then((res) => res.data);
  return res;
};

export const getAllBranches = async () => {
  const res = instance.get(`agencies/branches`).then((res) => {
    return res.data;
  });
  return res;
};

export const getAllProblematicProjects = async () => {
  const res = instance.get(`projects/problematic`).then((res) => res.data);
  return res;
};

export const getAllUnapprovedProjectsThisFY = async () => {
  return instance.get(`projects/unapprovedFY`).then((res) => res.data);
};

export const getBranchesBasedOnSearchTerm = async (
  searchTerm: string,
  page: number,
) => {
  try {
    let url = `agencies/branches?page=${page}`;

    if (searchTerm !== "") {
      url += `&searchTerm=${searchTerm}`;
    }

    const response = await instance.get(url);

    const { branches, total_results, total_pages } = response.data;
    return { branches, total_results, total_pages };
  } catch (error) {
    console.error("Error fetching branches based on search term:", error);
    throw error;
  }
};

export const createBranch = async (formData: IBranch) => {
  return instance.post("agencies/branches", formData).then((res) => {
    return res.data;
  });
};

export const updateBranch = async (formData: IBranch) => {
  return instance
    .put(`agencies/branches/${formData.pk}`, formData)
    .then((res) => {
      return res.data;
    });
};

export const deleteBranch = async (pk: number) => {
  return instance.delete(`agencies/branches/${pk}`).then((res) => {
    return res.data;
  });
};
//#endregion

//#region AFFILIATIONS ============================================================================

export const getAffiliationByPk = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance
    .get(`agencies/affiliations/${pk}`)
    .then((res) => res.data);
  return res;
};

export const getAllAffiliations = async () => {
  const res = instance.get(`agencies/affiliations`).then((res) => {
    return res.data;
  });
  return res;
};

export const getAffiliationsBasedOnSearchTerm = async (
  searchTerm: string,
  page: number,
) => {
  try {
    let url = `agencies/affiliations?page=${page}`;

    if (searchTerm !== "") {
      url += `&searchTerm=${searchTerm}`;
    }

    const response = await instance.get(url);

    const { affiliations, total_results, total_pages } = response.data;
    return { affiliations, total_results, total_pages };
  } catch (error) {
    console.error("Error fetching affiliations based on search term:", error);
    throw error;
  }
};

export const createAffiliation = async (formData: IAffiliation) => {
  // console.log(formData);
  return instance.post("agencies/affiliations", formData).then((res) => {
    return res.data;
  });
};

export const mergeAffiliations = async (formData: IMergeAffiliation) => {
  // console.log(formData)
  return instance
    .post("agencies/affiliations/merge", formData)
    .then((res) => res.data);
};

export const cleanOrphanedAffiliations = async () => {
  return instance
    .post("agencies/affiliations/clean_orphaned")
    .then((res) => res.data);
};

export const updateAffiliation = async (formData: IAffiliation) => {
  return instance
    .put(`agencies/affiliations/${formData.pk}`, formData)
    .then((res) => {
      return res.data;
    });
};

export const deleteAffiliation = async (pk: number) => {
  return instance.delete(`agencies/affiliations/${pk}`).then((res) => {
    return res.data;
  });
};
//#endregion

//#region BUSINESS AREAS ==========================================================================

// export const getBusinessAreas = async () => {
//     try {
//         const url = `agencies/business_areas`;
//         const response = await instance.get(url);

//         return response.data;
//     } catch (error) {
//         console.error("Error fetching projects based on search term:", error);
//         throw error;
//     }
// }

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
  // if (formData.slug !== undefined) {
  //     newFormData.append('slug', formData.slug);
  // }
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

  // console.log(newFormData);

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
  // console.log(formData)

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
    // console.log(formData.image)
    if (formData.image instanceof File) {
      // console.log('is file')
      newFormData.append("image", formData.image);
    } else if (typeof formData.image === "string") {
      // console.log('is string')
      newFormData.append("image", formData.image);
    }
  } else {
    if (formData.selectedImageUrl === null) {
      newFormData.append("selectedImageUrl", "delete");
    }
  }

  // console.log(newFormData);

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
//#endregion

//#region DIVISIONS ==========================================================================

export const getAllDivisions = async () => {
  const res = instance.get(`agencies/divisions`).then((res) => {
    return res.data;
  });
  return res;
};

export const createDivision = async (formData: IDivision) => {
  return instance.post("agencies/divisions", formData).then((res) => {
    return res.data;
  });
};

export const updateDivision = async (formData: IDivision) => {
  return instance
    .put(`agencies/divisions/${formData.pk}`, formData)
    .then((res) => {
      return res.data;
    });
};

export const deleteDivision = async (pk: number) => {
  return instance.delete(`agencies/divisions/${pk}`).then((res) => {
    return res.data;
  });
};
//#endregion

//#region LOCATIONS =====================================================================================

export const getAllLocations = async () => {
  try {
    const res = await instance.get(`locations`);

    const locationsData = res.data;

    // Organize locations based on their 'area_type'
    const organizedLocations: OrganisedLocationData = {
      dbcaregion: [],
      dbcadistrict: [],
      ibra: [],
      imcra: [],
      nrm: [],
    };

    // Loop through the locations and add them to the corresponding area_type array
    locationsData.forEach((location: ISimpleLocationData) => {
      const areaType = location.area_type;
      if (areaType in organizedLocations) {
        organizedLocations[areaType].push(location);
      }
    });

    // Sort each array alphabetically based on the 'name' property of each location
    for (const areaType in organizedLocations) {
      organizedLocations[areaType].sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA.startsWith("ALL ") && !nameB.startsWith("ALL ")) {
          return -1;
        } else if (!nameA.startsWith("ALL ") && nameB.startsWith("ALL ")) {
          return 1;
        } else {
          return nameA.localeCompare(nameB);
        }
      });
    }

    return organizedLocations;
  } catch (error) {
    // console.log("Error with Locations")

    return {
      dbcaregion: [],
      dbcadistrict: [],
      ibra: [],
      imcra: [],
      nrm: [],
    };
  }
};

export const createLocation = async (formData: IAddLocationForm) => {
  formData.old_id = 1;
  return instance.post("locations/", formData).then((res) => {
    return res.data;
  });
};

export const updateLocation = async (formData: IAddLocationForm) => {
  return instance.put(`locations/${formData.pk}`, formData).then((res) => {
    return res.data;
  });
};

export const deleteLocation = async (pk: number) => {
  return instance.delete(`locations/${pk}`).then((res) => {
    return res.data;
  });
};
//#endregion

//#region SERVICES ==========================================================================

export const getAllDepartmentalServices = async () => {
  try {
    const url = `agencies/services`;
    const response = await instance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects based on search term:", error);
    throw error;
  }
};

export const createDepartmentalService = async (
  formData: IDepartmentalService,
) => {
  return instance.post("agencies/services", formData).then((res) => {
    return res.data;
  });
};

export const updateDepartmentalService = async (
  formData: IDepartmentalService,
) => {
  return instance
    .put(`agencies/services/${formData.pk}`, formData)
    .then((res) => {
      return res.data;
    });
};

export const deleteDepartmentalService = async (pk: number) => {
  return instance.delete(`agencies/services/${pk}`).then((res) => {
    return res.data;
  });
};

//#endregion

export interface IRemedyProblematicProjects {
  projects: number[];
}

export const remedyMemberlessProjects = async ({
  projects,
}: IRemedyProblematicProjects) => {
  console.log(projects);
  const res = instance
    .post(`projects/remedy/memberless`, { projects: projects })
    .then((res) => {
      return res.data;
    });
  return res;
};

export interface IRemedyProblematicProjects {
  projects: number[];
  status?: "active" | "suspended" | "completed" | "terminated";
}

export const remedyOpenClosedProjects = async ({
  projects,
  status = "active",
}: IRemedyProblematicProjects) => {
  console.log(projects, status);
  const res = instance
    .post(`projects/remedy/open_closed`, {
      projects: projects,
      status: status,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const remedyLeaderlessProjects = async ({
  projects,
}: IRemedyProblematicProjects) => {
  console.log(projects);
  const res = instance
    .post(`projects/remedy/leaderless`, { projects: projects })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const remedyMultipleLeaderProjects = async ({
  projects,
}: IRemedyProblematicProjects) => {
  console.log(projects);
  const res = instance
    .post(`projects/remedy/multiple_leaders`, { projects: projects })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const remedyExternallyLedProjects = async ({
  projects,
}: IRemedyProblematicProjects) => {
  console.log(projects);
  const res = instance
    .post(`projects/remedy/external_leaders`, { projects: projects })
    .then((res) => {
      return res.data;
    });
  return res;
};
