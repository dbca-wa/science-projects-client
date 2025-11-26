import type {
  IProjectMember,
  ISearchTerm,
  ISimplePkProp,
  ProjectStatus,
} from "@/shared/types";
import { type QueryFunctionContext } from "@tanstack/react-query";
import instance from "@/shared/lib/api/axiosInstance";

// PROJECTS ==========================================================================

export const getFullProject = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`projects/${pk}`).then((res) => {
    return res.data;
  });
  return res;
};

export const getFullProjectSimple = async (preselectedProjectPk: number) => {
  try {
    const res = await instance.get(`projects/${preselectedProjectPk}`);
    // console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error; // You can handle errors as needed
  }
};

export interface ISetProjectStatusProps {
  status: ProjectStatus;
  projectId: number | string;
}

export const setProjectStatus = async ({
  projectId,
  status,
}: ISetProjectStatusProps) => {
  const data = {
    status: status,
  };
  const res = instance.put(`projects/${projectId}`, data).then((res) => {
    return res.data;
  });
  return res;
};

export interface ISpecialEndorsement {
  projectPlanPk: number;
  shouldSendEmails?: boolean;
  aecPDFFile?: File;

  aecEndorsementRequired: boolean;
  aecEndorsementProvided: boolean;
}

export const seekEndorsementAndSave = async ({
  projectPlanPk,
  shouldSendEmails,
  aecEndorsementRequired,
  aecEndorsementProvided,
  aecPDFFile,
}: ISpecialEndorsement) => {
  const formData = new FormData();
  formData.append("ae_endorsement_required", aecEndorsementRequired.toString());
  formData.append(
    "ae_endorsement_provided",
    aecEndorsementRequired === false
      ? aecEndorsementRequired.toString()
      : aecEndorsementProvided.toString(),
  );

  if (aecPDFFile !== undefined && aecPDFFile !== null) {
    formData.append("aec_pdf_file", aecPDFFile);
  }
  return instance
    .post(
      `documents/project_plans/${projectPlanPk}/seek_endorsement`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    )
    .then((res) => res.data);
};

export const deleteAECPDFEndorsement = async (projectPlanPk: number) => {
  return instance
    .post(
      `documents/project_plans/${projectPlanPk}/delete_aec_endorsement_pdf`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    )
    .then((res) => res.data);
};

export interface INewMember {
  user: number;
  project: number;
  role: string;
  timeAllocation: number;
  shortCode?: number;
  comments?: string;
  isLeader?: boolean;
  position?: number;
  oldId?: number;
}

export const createTeamMember = async ({
  user,
  project,
  role,
  timeAllocation,
  shortCode,
  comments,
}: INewMember) => {
  const data = {
    user: user,
    project: project,
    role: role,
    time_allocation: timeAllocation,
    short_code: shortCode,
    comments: comments,
    is_leader: false,
    position: 100,
    old_id: 1,
  };

  // console.log(data);

  const response = await instance.post(`projects/project_members`, data);
  return response.data;
};

export type RemoveUserMutationType = {
  user: number;
  project: number;
};

export const removeTeamMemberFromProject = async (
  formData: RemoveUserMutationType,
) => {
  // console.log(formData);

  const response = await instance.delete(
    `projects/project_members/${formData.project}/${formData.user}`,
  );
  // console.log(response.data === "");
  // console.log(response.status);
  return response;
};

export const updateProjectMember = async (formData: any) => {
  // console.log(formData);

  const projectId = formData.projectPk;
  const userId = formData.userPk;
  const shortCode = formData.shortCode;
  const fte = formData.fte;
  const role = formData.role;

  const response = await instance.put(
    `projects/project_members/${projectId}/${userId}`,
    {
      role: role,
      time_allocation: fte,
      short_code: shortCode,
    },
  );
  return response.data;
};

export const promoteUserToLeader = async (formData: RemoveUserMutationType) => {
  // console.log(formData);

  const response = await instance.post(`projects/promote`, {
    user: formData.user,
    project: formData.project,
  });

  // console.log(response.data === "");
  // console.log(response.status);
  return response.data;
};

export const updateTeamMemberPosition = async (
  project_id: number,
  reorderedTeam: IProjectMember[],
) => {
  const data = {
    reordered_team: reorderedTeam, // Include the reorderedTeam data in the request
  };

  const response = await instance.put(`projects/${project_id}/team`, data);
  return response.data.sorted_team; // Assuming your backend returns sorted_team
};

export const getProjectTeam = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`projects/${pk}/team`).then((res) => {
    // console.log("Team Data", res.data);
    return res.data;
  });
  return res;
};

export const getDirectorateMembers = async ({
  queryKey,
}: QueryFunctionContext) => {
  // GET DIRECTORATE FROM BACKEND HERE!!
  const res = instance.get(`users/directorate`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const getDivisionDirectorateMembers = async ({
  queryKey,
}: QueryFunctionContext) => {
  // Extract the division PK from the query key array
  // Assuming your query key is structured like ['directorateList', divisionPk]
  const [_key, pk] = queryKey;

  // console.log({ _key, pk });
  if (!pk || typeof pk !== "number") {
    throw new Error("Division PK is required and must be a number");
  }

  // console.log("Checking with pk:", pk);
  const response = await instance.get(`agencies/divisions/${pk}/email_list`);
  if (response.status === 200) {
    return response.data.directorate_email_list;
  } else {
    return [];
  }
};

// PROJECT CRUD ==========================================================================

export interface ICreateProjectBaseInfo {
  creator: number;
  kind: string;
  year: number;

  title: string;
  description: string;
  keywords: string[] | [];
  imageData: File | null;
}

export interface ICreateProjectDetails {
  dataCustodian: number;
  projectLead: number;
  departmentalService: number;
  businessArea: number;
  startDate: Date;
  endDate: Date;
  // dates: Date[];
}

export interface ICreateProjectExternalDetails {
  externalDescription: string;
  aims: string;
  budget: string;
  collaborationWith: string;
}
export interface ICreateProjectStudentDetails {
  level: string;
  organisation: string;
}

export interface IProjectCreationVariables {
  baseInformationData: ICreateProjectBaseInfo;
  detailsData: ICreateProjectDetails;
  locationData: number[];
  externalData: ICreateProjectExternalDetails;
  studentData: ICreateProjectStudentDetails;
  isExternalSP?: boolean;
}

export const createProject = async ({
  baseInformationData,
  detailsData,
  locationData,
  externalData,
  studentData,
  isExternalSP,
}: IProjectCreationVariables) => {
  // console.log(
  //     baseInformationData, detailsData, locationData, externalData, studentData
  // )

  const formData = new FormData();
  formData.append("year", baseInformationData.year.toString());
  formData.append("kind", baseInformationData.kind);
  formData.append("creator", baseInformationData.creator.toString());
  formData.append("title", baseInformationData.title);
  formData.append("description", baseInformationData.description);
  formData.append("keywords", baseInformationData.keywords.join(", "));
  if (isExternalSP) {
    // console.log(`Is External: ${isExternalSP}`)
    formData.append("isExternalSP", isExternalSP.toString());
  }

  if (baseInformationData.imageData !== null) {
    if (baseInformationData.imageData instanceof File) {
      formData.append("imageData", baseInformationData.imageData);
    } else if (typeof baseInformationData.imageData === "string") {
      formData.append("imageData", baseInformationData.imageData);
    }
  }

  formData.append("businessArea", detailsData.businessArea.toString());

  if (detailsData.departmentalService) {
    formData.append(
      "departmentalService",
      detailsData.departmentalService.toString(),
    );
  }
  formData.append("dataCustodian", detailsData.dataCustodian.toString());
  formData.append("projectLead", detailsData.projectLead.toString());

  if (detailsData.startDate) {
    formData.append("startDate", detailsData.startDate.toISOString());
  }
  if (detailsData.endDate) {
    formData.append("endDate", detailsData.endDate.toISOString());
  }
  // detailsData.dates.forEach((date, index) => {
  //     formData.append('dates', date.toISOString());
  // });

  locationData.forEach((location, index) => {
    formData.append("locations", location.toString());
  });

  if (baseInformationData.kind === "student") {
    formData.append("organisation", studentData.organisation);
    formData.append("level", studentData.level);
  } else if (baseInformationData.kind === "external") {
    formData.append("externalDescription", externalData.externalDescription);
    formData.append("aims", externalData.aims);
    formData.append("budget", externalData.budget);
    formData.append("collaborationWith", externalData.collaborationWith);
  }

  // console.log(formData);

  return instance
    .post(`projects/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export interface IEditProject {
  projectPk: string | number;
  title: string;
  description?: string;
  status?:
    | "new"
    | "pending"
    | "active"
    | "updating"
    | "terminated"
    | "suspended"
    | "closed";
  image?: File | null;
  selectedImageUrl: string | null;
  locations: number[];
  keywords: string[];

  // dates: Date[];
  startDate: Date;
  endDate: Date;
  dataCustodian: number;
  departmentalService: number;
  businessArea: number;

  externalDescription?: string;
  aims?: string;
  budget?: string;
  collaborationWith?: string;
  level?: string;
  organisation?: string;
}

export const updateProjectDetails = async ({
  projectPk,
  title,
  description,
  keywords,
  image,
  selectedImageUrl,
  locations,

  startDate,
  endDate,
  status,
  dataCustodian,
  departmentalService,
  businessArea,

  externalDescription,
  aims,
  budget,
  collaborationWith,
  level,
  organisation,
}: IEditProject) => {
  // console.log('editing')
  // console.log('keywords:', keywords)

  const newFormData = new FormData();

  if (projectPk !== undefined && projectPk !== null) {
    newFormData.append("pk", projectPk.toString());
  }
  if (title !== undefined && title !== null) {
    newFormData.append("title", title);
  }

  if (description !== undefined && description !== null) {
    newFormData.append("description", description);
  }
  if (image !== null && image !== undefined) {
    if (image instanceof File) {
      newFormData.append("image", image);
    } else if (typeof image === "string") {
      newFormData.append("image", image);
    }
  }
  if (selectedImageUrl === null) {
    newFormData.append("selectedImageUrl", "delete");
  }

  if (status !== undefined && status !== null) {
    newFormData.append("status", status);
  }
  if (dataCustodian !== undefined && dataCustodian !== null) {
    newFormData.append("data_custodian", dataCustodian.toString());
  }
  if (keywords !== undefined && keywords !== null) {
    // const keywordString = JSON.stringify(keywords)
    newFormData.append("keywords", keywords.join(", "));
  }

  if (locations !== undefined && locations !== null) {
    if (locations.length > 0) {
      const locationsString = JSON.stringify(locations);
      newFormData.append("locations", locationsString);
    } else if (locations.length <= 0) {
      newFormData.append("locations", "[]");
    }
  } else {
    newFormData.append("locations", "[]");
  }

  if (startDate) {
    // console.log('startDate is', startDate)
    const dateFormatted = new Date(startDate);

    newFormData.append("startDate", dateFormatted.toISOString());
  }
  if (endDate) {
    // console.log('endDate is', endDate)
    const dateFormatted = new Date(endDate);

    newFormData.append("endDate", dateFormatted.toISOString());
  }

  if (departmentalService !== undefined && departmentalService !== null) {
    newFormData.append("service", departmentalService.toString());
  }

  if (businessArea !== undefined && businessArea !== null) {
    // console.log(businessArea)
    newFormData.append("businessArea", businessArea.toString());
  }

  if (
    externalDescription !== undefined &&
    externalDescription !== null &&
    externalDescription.length > 0
  ) {
    newFormData.append("externalDescription", externalDescription.toString());
  }

  if (aims !== undefined && aims !== null && aims.length > 0) {
    newFormData.append("aims", aims.toString());
  }

  if (budget !== undefined && budget !== null && budget.length > 0) {
    newFormData.append("budget", budget.toString());
  }

  if (
    collaborationWith !== undefined &&
    collaborationWith !== null &&
    collaborationWith.length > 0
  ) {
    newFormData.append("collaborationWith", collaborationWith.toString());
  }

  if (level !== undefined && level !== null && level.length > 0) {
    newFormData.append("level", level.toString());
  }

  if (
    organisation !== undefined &&
    organisation !== null &&
    organisation.length > 0
  ) {
    newFormData.append("organisation", organisation.toString());
  }

  const res = instance
    .put(`projects/${projectPk}`, newFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((d) => d.data);
};

export interface IUpdateProjectDescription {
  pk: number;
  description: string;
}

export const updateProjectDescription = async ({
  pk,
  description,
}: IUpdateProjectDescription) => {
  const data = {
    description: description,
  };
  const res = instance.put(`projects/${pk}`, data).then((res) => {
    return res.data;
  });
  return res;
};

export const getMyProjectsBasedOnSearchTerm = async (
  searchTerm: string,
  userPk: number,
) => {
  try {
    let url = `projects/smallsearch`;

    if (userPk !== null && userPk !== 0 && userPk !== undefined) {
      if (searchTerm !== "") {
        url += `?searchTerm=${searchTerm}`;
        url += `&userPk=${userPk}`;
      } else {
        url += `?userPk=${userPk}`;
      }
    }

    const response = await instance.get(url);

    const { projects } = response.data;
    return { projects };
  } catch (error) {
    console.error("Error fetching projects based on search term:", error);
    throw error;
  }
};

export const getAllProjectsYears = async () => {
  const url = "projects/listofyears";
  const response = await instance.get(url);
  return response.data;
};

export const getProjectsBasedOnSearchTerm = async (
  searchTerm: string,
  page: number,
  filters: {
    onlyActive: boolean;
    onlyInactive: boolean;
    filterBA: string;
    filterProjectKind: string;
    filterProjectStatus: string;
    filterYear: number;
    filterUser: number | null;
  },
) => {
  try {
    let url = `projects?page=${page}`;

    if (searchTerm !== "") {
      url += `&searchTerm=${searchTerm}`;
    }

    if (filters.onlyActive) {
      url += "&only_active=true";
    }

    if (filters.onlyInactive) {
      url += "&only_inactive=true";
    }

    if (filters.filterUser) {
      if (filters.filterUser === 0 || filters.filterUser === null) {
        // skip to get all areas
      } else {
        url += `&selected_user=${filters.filterUser}`;
      }
    }

    if (filters.filterBA) {
      if (filters.filterBA === "All") {
        // skip to get all areas
      } else {
        url += `&businessarea=${filters.filterBA}`;
      }
    }

    if (filters.filterProjectStatus) {
      if (filters.filterProjectStatus === "All") {
        // skip to get all
      } else {
        url += `&projectstatus=${filters.filterProjectStatus}`;
      }
    }

    if (filters.filterProjectKind) {
      if (filters.filterProjectKind === "All") {
        // skip to get all
      } else {
        url += `&projectkind=${filters.filterProjectKind}`;
      }
    }
    if (filters.filterYear) {
      if (filters.filterYear === 0) {
        // skip to get all
      } else {
        url += `&year=${filters.filterYear}`;
      }
    }

    // console.log({
    //     "url": url,
    //     "filterBA": filters.filterBA,
    //     "projectStatus": filters.filterProjectStatus,
    //     "projectKind": filters.filterProjectKind,
    // })

    const response = await instance.get(url);

    const { projects, total_results, total_pages } = response.data;
    // console.log(projects)
    return { projects, total_results, total_pages };
  } catch (error) {
    console.error("Error fetching projects based on search term:", error);
    throw error;
  }
};

export const getMapProjectsBasedOnSearchTerm = async (
  searchTerm: string,
  page: number,
  filters: {
    onlyActive: boolean;
    onlyInactive: boolean;
    filterBA: string;
    filterProjectKind: string;
    filterProjectStatus: string;
    filterYear: number;
    selectedLocations: number[];
    filterUser: number | null;
  },
) => {
  try {
    let url = `projects/map?page=${page}`;

    if (searchTerm !== "") {
      url += `&searchTerm=${searchTerm}`;
    }

    if (filters.selectedLocations.length > 0) {
      const locationsString = JSON.stringify(filters.selectedLocations);
      url += `&locations=${locationsString}`;
    }

    if (filters.filterUser) {
      if (filters.filterUser === 0 || filters.filterUser === null) {
        // skip to get all users
      } else {
        url += `&selected_user=${filters.filterUser}`;
      }
    }

    if (filters.onlyActive) {
      url += "&only_active=true";
    }

    if (filters.onlyInactive) {
      url += "&only_inactive=true";
    }

    if (filters.filterBA) {
      if (filters.filterBA === "All") {
        // skip to get all areas
      } else {
        // console.log("BA", filters.filterBA);
        url += `&businessarea=${filters.filterBA}`;
      }
    }

    if (filters.filterProjectStatus) {
      if (filters.filterProjectStatus === "All") {
        // skip to get all
      } else {
        url += `&projectstatus=${filters.filterProjectStatus}`;
      }
    }

    if (filters.filterProjectKind) {
      if (filters.filterProjectKind === "All") {
        // skip to get all
      } else {
        url += `&projectkind=${filters.filterProjectKind}`;
      }
    }
    if (filters.filterYear) {
      if (filters.filterYear === 0) {
        // skip to get all
      } else {
        url += `&year=${filters.filterYear}`;
      }
    }

    // console.log({
    //     "url": url,
    //     "filterBA": filters.filterBA,
    //     "projectStatus": filters.filterProjectStatus,
    //     "projectKind": filters.filterProjectKind,
    // })

    const response = await instance.get(url);

    const { projects, total_results, total_pages } = response.data;
    // console.log(projects)
    return { projects, total_results, total_pages };
  } catch (error) {
    console.error("Error fetching projects based on search term:", error);
    throw error;
  }
};

export const getProjects = async ({ searchTerm }: ISearchTerm) => {
  return instance
    .post("projects/", {
      searchTerm: searchTerm,
    })
    .then((res) => {
      return res.data;
    });
};

export interface IUploadFile {
  pk: number;
  file: File;
}

export interface IHandleMethodologyImage {
  kind: string;
  project_plan_pk: number;

  file: string | File | null;
}

export const handleMethodologyImage = async ({
  kind,
  project_plan_pk,
  file,
}: IHandleMethodologyImage) => {
  if (kind === "update" || kind === "post") {
    const newFormData = new FormData();
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
    newFormData.append("pk", project_plan_pk.toString());

    if (kind === "update") {
      return instance
        .put(`medias/methodology_photos/${project_plan_pk}`, newFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res.data);
    } else if (kind === "post") {
      return instance
        .post(`medias/methodology_photos`, newFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res.data);
    }
  } else if (kind === "delete") {
    return instance
      .delete(`medias/methodology_photos/${project_plan_pk}`)
      .then((res) => res.data);
  }
};

export interface ICloseProjectProps {
  projectKind: string;
  projectPk: number;
  reason: string;
  outcome: "forcecompleted" | "completed" | "terminated" | "suspended";
}

export interface IClosureOutcomeProps {
  outcome: string;
  closurePk: number;
}

export const setClosureOutcome = async ({
  outcome,
  closurePk,
}: IClosureOutcomeProps) => {
  const url = `documents/projectclosures/${closurePk}`;
  const params = {
    intended_outcome: outcome,
  };

  instance.put(url, params).then((res) => res.data);
};

export const closeProjectCall = async ({
  projectPk,
  reason,
  outcome,
  projectKind,
}: ICloseProjectProps) => {
  // console.log(projectPk, reason, outcome);
  if (projectPk !== undefined) {
    const url = `documents/projectdocuments`;
    const docKind = "projectclosure";

    const params = {
      project: projectPk,
      kind: docKind,
      projectKind: projectKind,
      reason: reason,
      outcome: outcome,
    };

    // console.log(params)

    return instance.post(url, params).then((res) => res.data);
  }
};

export const openProjectCall = async ({ pk }: ISimplePkProp) => {
  // console.log(projectPk, reason, outcome);
  if (pk !== undefined) {
    const url = `documents/projectclosures/reopen/${pk}`;
    const params = {
      project: pk,
    };

    // console.log(params)

    return instance.post(url, params).then((res) => res.data);
  }
};

export const suspendProjectCall = async ({ pk }: ISimplePkProp) => {
  // console.log(projectPk, reason, outcome);
  if (pk !== undefined) {
    const url = `projects/${pk}/suspend`;

    return instance.post(url).then((res) => res.data);
  }
};

export const deleteProjectCall = async ({ pk }: ISimplePkProp) => {
  // console.log(pk)
  if (pk !== undefined) {
    const url = `projects/${pk}`;

    return instance.delete(url).then((res) => res.data);
  }
};

export interface ISetProjectAreas {
  projectPk: number;
  areas: number[];
}

export const setProjectAreas = async ({
  areas,
  projectPk,
}: ISetProjectAreas) => {
  // console.log({ areas, projectPk })
  const url = `projects/${projectPk}/areas`;
  const params = {
    areas: areas,
  };
  return instance.put(url, params).then((res) => res.data);
};

// DOWNLOADS =====================================================================================

export const downloadProjectsCSV = () => {
  return instance
    .get(`projects/download`, {
      responseType: "blob",
    })
    .then((res) => res.data);
};

export const downloadProjectsCSVAR = () => {
  return instance
    .get(`projects/download-ar`, {
      responseType: "blob",
    })
    .then((res) => res.data);
};
