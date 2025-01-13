import {
  IAffiliation,
  ICaretakerEntry,
  IMergeUserPk,
  IPersonalInformation,
  IProfile,
  IProjectLeadsEmail,
  ISimplePkProp,
  IStaffEducationEntry,
  IStaffEmploymentEntry,
  KeywordTag,
} from "@/types";
import instance from "../axiosInstance";
import { QueryFunctionContext } from "@tanstack/react-query";
import { AxiosHeaders } from "axios";

export const checkStaffStatusApiCall = async (pk: number) => {
  try {
    const res = await instance.post(`users/is_staff/${pk}`);
    return res.data; // Ensure that `res.data` is returned properly
  } catch (err) {
    console.error("Error fetching staff status:", err);
    throw err;
  }
};

// USER CREATION ==============================================================

export const getDoesUserWithEmailExist = async (email: string) => {
  try {
    const response = await instance.post("users/check-email-exists", {
      email,
    });
    const { exists } = response.data;
    // console.log(exists ? 'User exists' : 'User does not exist');
    return exists;
  } catch (error) {
    console.error("Error checking user by email:", error);
    throw error;
  }
};

interface NameData {
  firstName: string;
  lastName: string;
}

export const getDoesUserWithFullNameExist = async ({
  firstName,
  lastName,
}: NameData) => {
  try {
    const response = await instance.post("users/check-name-exists", {
      first_name: firstName,
      last_name: lastName,
    });
    const { exists } = response.data;
    return exists;
  } catch (error) {
    console.error("Error checking user by full name:", error);
    throw error;
  }
};

export interface UserData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isStaff?: boolean;
  branch?: number;
  businessArea?: number;
  affiliation?: number;
}

export const createUser = async (userData: UserData) => {
  try {
    const response = await instance.post("users/", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const mergeUsers = async (formData: IMergeUserPk) => {
  const response = await instance.post(`adminoptions/mergeusers`, {
    primaryUser: formData.primaryUserPk,
    secondaryUsers: formData.secondaryUserPks,
  });

  return response.data;
};

export const getUserLastOnlineTimestamp = async (userId: string) => {
  try {
    const res = await instance.get(`users/lastOnline/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch last online timestamp:", error);
    throw error;
  }
};

// USERS ======================================================

export interface AdminSwitchVar {
  userPk: number | string;
}

export const switchAdmin = async ({ userPk }: AdminSwitchVar) => {
  const res = instance.post(`users/${userPk}/admin`).then((res) => {
    return res.data;
  });
  return res;
};

export interface PRPopulationVar {
  writeable_document_kind: string;
  section: string;
  project_pk: number;
}

export const getPreviousDataForProgressReportPopulation = async ({
  writeable_document_kind,
  section,
  project_pk,
}: PRPopulationVar) => {
  const res = instance
    .post(`documents/get_previous_reports_data`, {
      writeable_document_kind,
      section,
      project_pk,
    })
    .then((res) => res.data);
  return res;
};

export const deleteUserAdmin = async ({ userPk }: AdminSwitchVar) => {
  const res = instance.delete(`users/${userPk}`).then((res) => {
    return res.data;
  });
  return res;
};

export const adminSetCaretaker = async ({
  userPk,
  caretakerPk,
  endDate,
  reason,
  notes,
}: ICaretakerEntry) => {
  // console.log("DATA:", {
  //   userPk,
  //   caretakerPk,
  //   endDate,
  //   reason,
  //   notes,
  // });
  const res = instance
    .post(`adminoptions/caretakers/adminsetcaretaker`, {
      userPk,
      caretakerPk,
      endDate,
      reason,
      notes,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const requestCaretaker = async ({
  userPk,
  caretakerPk,
  // startDate,
  endDate,
  reason,
  notes,
}: ICaretakerEntry) => {
  const res = instance
    .post(`adminoptions/tasks`, {
      action: "setcaretaker",
      status: "pending",
      requester: userPk,
      primary_user: userPk,
      secondary_users: [caretakerPk],
      // start_date: startDate,
      end_date: endDate,
      reason,
      notes,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const removeCaretaker = async ({ id }: { id: number }) => {
  const res = instance.delete(`adminoptions/caretakers/${id}`).then((res) => {
    return res.data;
  });
  return res;
};

export interface IExtendCaretakerProps {
  id: number;
  currentEndDate: Date;
  newEndDate: Date;
}

export const extendCaretaker = async ({
  id,
  currentEndDate,
  newEndDate,
}: IExtendCaretakerProps) => {
  if (newEndDate <= currentEndDate) {
    throw new Error("The new end date must be after the current end date");
  }
  const res = instance
    .put(`adminoptions/caretakers/${id}`, {
      end_date: newEndDate,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const cancelCaretakerRequest = async ({
  taskPk,
}: {
  taskPk: number;
}) => {
  const res = instance
    .put(`adminoptions/tasks/${taskPk}`, { status: "cancelled" })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const batchApproveOLDProgressAndStudentReports = async () => {
  const res = instance.post(`documents/batchapproveold`).then((res) => {
    return res.data;
  });
  return res;
};

export const getEmailProjectList = async ({
  shouldDownloadList,
}: IProjectLeadsEmail) => {
  const data = {
    shouldDownloadList,
  };
  const res = instance
    .post(`documents/get_project_lead_emails`, data)
    .then((res) => {
      return res.data;
    });
  return res;
};

export const getStaffProfileEmailList = async () => {
  const res = instance.get(`users/get_staff_profile_emails`).then((res) => {
    return res.data;
  });
  return res;
};

export const batchApproveProgressAndStudentReports = async () => {
  const res = instance.post(`documents/batchapprove`).then((res) => {
    return res.data;
  });
  return res;
};

export interface INewCycle {
  alsoUpdate: boolean;
  shouldSendEmails: boolean;
  shouldPrepopulate: boolean;
}

export const openNewCycle = async ({
  alsoUpdate,
  shouldSendEmails,
  shouldPrepopulate,
}: INewCycle) => {
  console.log({ shouldPrepopulate, shouldSendEmails, alsoUpdate });
  // return "hi"
  const res = instance
    .post(`documents/opennewcycle`, {
      update: alsoUpdate,
      send_emails: shouldSendEmails,
      prepopulate: shouldPrepopulate,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const deactivateUserAdmin = async ({ userPk }: AdminSwitchVar) => {
  const res = instance.post(`users/${userPk}/toggleactive`).then((res) => {
    return res.data;
  });
  return res;
};

export const getMe = async () => {
  const res = instance.get(`users/me`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const checkCaretakerStatus = async () => {
  const res = instance
    .get(`adminoptions/caretakers/checkcaretaker`)
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export const getUsersProjects = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/${pk}/projects`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export interface IApproveProgressReport {
  kind: "studentreport" | "progressreport";
  isActive: number;
  reportPk: number;
  documentPk: number;
}

export const approveProgressReport = async ({
  isActive,
  kind,
  reportPk,
  documentPk,
}: IApproveProgressReport) => {
  // console.log({
  //     kind,
  //     reportPk,
  //     documentPk, isActive,
  // })
  const res = instance
    .post(`documents/actions/finalApproval`, {
      kind,
      reportPk,
      documentPk,
      isActive: isActive.toString() === "1" ? true : false,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const getTeamLead = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;

  // console.log(pk)
  const res = instance
    .get(`projects/project_members/${pk}/leader`)
    .then((res) => {
      return res.data;
    });
  return res;
};

export interface IUnapprovedDocsForBAProps {
  baArray: number[];
}

export const getUnapprovedDocsForBusinessAreas = ({
  baArray,
}: IUnapprovedDocsForBAProps) => {
  const res = instance
    .post(`agencies/business_areas/unapproved_docs`, { baArray: baArray })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const getProblematicProjectsForBusinessAreas = ({
  baArray,
}: IUnapprovedDocsForBAProps) => {
  const res = instance
    .post(`agencies/business_areas/problematic_projects`, { baArray: baArray })
    .then((res) => {
      return res.data;
    });
  return res;
};

// getTeamLead;

// interface IFullUserProps {
//     pk: string;
// }

export const getFullUser = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  if (pk !== undefined && pk !== null && pk !== 0) {
    const res = instance.get(`users/${pk}`).then((res) => {
      return res.data;
    });
    return res;
  } else return null;
};

export const getITAssetUser = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  if (pk !== undefined && pk !== null && pk !== 0) {
    const res = instance.get(`users/${pk}/itassets`).then((res) => {
      return res.data;
    });
    return res;
  } else return null;
};

export const getSingleUser = async ({ queryKey }: QueryFunctionContext) => {
  const [_, userPk] = queryKey;
  return instance.get(`users/${userPk}`).then((res) => {
    // console.log(res.data);
    return res.data;
  });
};

export const getUsersBasedOnSearchTerm = async (
  searchTerm: string,
  page: number,
  filters: any,
) => {
  try {
    let url = `users/?page=${page}`;

    if (searchTerm !== "") {
      url += `&searchTerm=${searchTerm}`;
    }

    if (filters.onlyExternal) {
      url += "&only_external=true";
    }

    if (filters.onlyStaff) {
      url += "&only_staff=true";
    }

    if (filters.onlySuperuser) {
      url += "&only_superuser=true";
    }

    if (filters.businessArea) {
      url += `&businessArea=${filters.businessArea}`;
    }

    // console.log(url)

    const response = await instance.get(url);

    const { users, total_results, total_pages } = response.data;
    return { users, total_results, total_pages };
  } catch (error) {
    console.error("Error fetching users based on search term:", error);
    throw error;
  }
};

export const getInternalUsersBasedOnSearchTerm = async (
  searchTerm: string,
  onlyInternal: boolean,
  projectPk?: number,
) => {
  try {
    let url = `users/smallsearch`;

    if (searchTerm !== "") {
      url += `?searchTerm=${searchTerm}`;
    }

    url += `${searchTerm ? "&" : "?"}onlyInternal=${onlyInternal === undefined || onlyInternal == false ? "False" : "True"}`;
    if (projectPk) {
      url += `${searchTerm || onlyInternal ? "&" : "?"}fromProject=${projectPk}`;
    }
    const response = await instance.get(url);

    const { users } = response.data;
    return { users };
  } catch (error) {
    console.error("Error fetching users based on search term:", error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await instance.get("users/");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// USER PROFILE ========================================================

export interface IProfileUpdateVariables {
  userPk: string;
  image?: File | string | null | undefined;
  about?: string;
  expertise?: string;
}
export interface IProfileUpdateSuccess {
  ok: string;
}

export interface IProfileUpdateError {
  error: string;
  response: {
    data: string;
  };
}
export interface IPIUpdateVariables {
  display_first_name: string;
  display_last_name: string;
  userPk: string;
  title: string;
  phone: string;
  fax: string;
}

export interface MutationSuccess {
  ok: string;
}

export interface ProjectCreationMutationSuccess {
  pk: number;
  kind: string;
}

interface IMutationResponse {
  data: Record<string, string>;
  headers: AxiosHeaders;
  request: XMLHttpRequest;
  status: number;
  statusText: string;
}

export interface MutationError {
  code: string;
  message: string;
  name: string;
  response: IMutationResponse;
}

export interface IPIUpdateSuccess {
  ok: string;
}

export interface IPIUpdateError {
  error: string;
}

export const getPersonalInformation = ({
  queryKey,
}: QueryFunctionContext): Promise<IPersonalInformation> => {
  const [_, userId] = queryKey;
  return instance.get(`users/${userId}/pi`).then((res) => res.data);
};

export const getProfile = ({
  queryKey,
}: QueryFunctionContext): Promise<IProfile> => {
  const [_, userId] = queryKey;
  // console.log(userId)
  return instance.get(`users/${userId}/profile`).then((res) => res.data);
};

export interface IFullUserUpdateVariables {
  display_first_name?: string;
  display_last_name?: string;
  userPk: string | number;
  title?: string;
  phone?: string;
  fax?: string;
  branch?: number | string;
  business_area?: number | string;
  image?: File | string | null | undefined;
  about?: string;
  expertise?: string;
  affiliation?: IAffiliation | number;
}

export const adminUpdateUser = async ({
  display_first_name,
  display_last_name,
  userPk,
  title,
  phone,
  fax,
  branch,
  business_area,
  image,
  about,
  expertise,
  affiliation,
}: IFullUserUpdateVariables) => {
  console.log({
    display_first_name,
    display_last_name,
    userPk,
    title,
    phone,
    fax,
    branch,
    business_area,
    image,
    about,
    expertise,
    affiliation,
  });

  try {
    // console.log(branch)
    // console.log(business_area)
    console.log("ADMIN UPDATE USER");
    console.log({
      display_first_name,
      display_last_name,
      userPk,
      title,
      phone,
      fax,
      branch,
      business_area,
      image,
      about,
      expertise,
      affiliation,
    });
    //     if req.data.get("display_first_name"):
    //     display_first_name = req.data.get("display_first_name")
    //     data_obj["display_first_name"] = display_first_name
    // if req.data.get("display_last_name"):
    //     display_last_name = req.data.get("display_last_name")
    //     data_obj["display_last_name"] = display_last_name

    const handleAffiliation = (affiliation) => {
      if (typeof affiliation === "string") {
        return Number(affiliation); // Convert string to number
      } else if (typeof affiliation === "number") {
        return affiliation; // Return the number as-is
      } else if (affiliation === undefined) {
        return affiliation; // Return undefined as-is
      }
      return (affiliation as IAffiliation)?.pk; // Return pk if affiliation is an object
    };
    const membershipData = {
      affiliation: handleAffiliation(affiliation),
      userPk: userPk,
      branch: branch !== null && branch !== "" ? Number(branch) : 0,
      business_area:
        business_area !== null && business_area !== ""
          ? Number(business_area)
          : 0,
    };
    console.log(membershipData);
    await updateMembership(membershipData);

    if (image !== undefined && image !== null) {
      const profileData = {
        userPk: userPk.toString(),
        image: image !== undefined && image !== null ? image : "",
        about: about !== undefined && about !== "" ? about : "",
        expertise: expertise !== undefined && expertise !== "" ? expertise : "",
      };
      await updateProfile(profileData);
    } else {
      const profileData = {
        userPk: userPk.toString(),
        about: about !== undefined && about !== "" ? about : "",
        expertise: expertise !== undefined && expertise !== "" ? expertise : "",
      };
      await updateProfile(profileData);
    }
    console.log({ display_first_name, display_last_name });
    const piData = {
      userPk: userPk.toString(),
      display_first_name:
        display_first_name !== undefined && display_first_name !== ""
          ? display_first_name
          : "",
      display_last_name:
        display_last_name !== undefined && display_last_name !== ""
          ? display_last_name
          : "",
      title: title !== undefined && title !== "" ? title : "",
      phone: phone !== undefined && phone !== "" ? phone : "",
      fax: fax !== undefined && fax !== "" ? fax : "",
    };
    console.log("PIDATA", piData);
    await updatePersonalInformation(piData);

    return { ok: "Update successful" };
  } catch (error: any) {
    throw new Error(error.message || "An unknown error occurred");
  }
};

export const removeUserAvatar = async ({ pk }: ISimplePkProp) => {
  const userPk = pk;
  return instance.post(`users/${userPk}/remove_avatar`).then((res) => res.data);
};

export interface IMembershipUpdateVariables {
  userPk: string | number;
  branch: number;
  business_area: number;
  affiliation?: number;
}

export const updateMembership = async ({
  userPk,
  branch,
  business_area,
  affiliation,
}: IMembershipUpdateVariables) => {
  // console.log(userPk, branch, business_area, affiliation)
  const response = await instance.put(`users/${userPk}/membership`, {
    user_pk: userPk,
    branch_pk: branch,
    business_area: business_area,
    affiliation: affiliation,
  });
  return response.data;
};

export const updatePersonalInformation = async ({
  display_first_name,
  display_last_name,
  userPk,
  title,
  phone,
  fax,
}: IPIUpdateVariables) => {
  console.log("DATA", {
    userPk,
    title,
    phone,
    fax,
    display_first_name,
    display_last_name,
  });
  return instance
    .put(`users/${userPk}/pi`, {
      display_first_name,
      display_last_name,
      title,
      phone,
      fax,
    })
    .then((res) => res.data);
};

// export const updateTeamMemberPosition = async (user_id: number, project_id: number, newPosition: number) => {
//     const data = {
//         user_id: user_id,
//         new_position: newPosition,
//     };

//     const response = await instance.put(`projects/${project_id}/team`, data);
//     return response.data; // Assuming your backend returns updated data
// };

export interface IMyBAUpdateSubmissionData {
  pk: number;
  introduction: string;
  image: File | null;
}

export const updateMyBa = async ({
  pk,
  introduction,
  image,
}: IMyBAUpdateSubmissionData) => {
  const formData = new FormData();

  if (image instanceof File) {
    formData.append("image", image);
  } else if (typeof image === "string") {
    formData.append("image", image);
  }

  if (introduction !== null) {
    formData.append("introduction", introduction);
  }

  const response = await instance.put(
    `agencies/business_areas/${pk}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data; // Assuming your response structure is similar to IProfileUpdateSuccess
};

export const updateProfile = async ({
  userPk,
  image,
  about,
  expertise,
}: IProfileUpdateVariables) => {
  // console.log(userPk, image, about, expertise);

  const formData = new FormData();
  formData.append("userPk", userPk);

  if (about !== undefined) {
    formData.append("about", about);
  }

  if (expertise !== undefined) {
    formData.append("expertise", expertise);
  }

  if (image !== null) {
    if (image instanceof File) {
      formData.append("image", image);
    } else if (typeof image === "string") {
      formData.append("image", image);
    }
  }

  // console.log(formData);

  const response = await instance.put(`users/${userPk}/profile`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data; // Assuming your response structure is similar to IProfileUpdateSuccess
};

// return instance.put(
//     `users/${userPk}/profile`,
//     { image, about, expertise }).then(res => res.data);

export interface IUpdateStaffOverviewSection {
  pk: number;
  about?: string;
  expertise?: string;
}

export const updateStaffProfileOverviewSection = async ({
  pk,
  about,
  expertise,
}: IUpdateStaffOverviewSection) => {
  const res = instance
    .put(`users/staffprofiles/${pk}`, {
      about,
      expertise,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export const checkUserActiveAndGetStaffProfileData = async ({
  queryKey,
}: {
  queryKey: (string | number)[];
}) => {
  const [_, pk] = queryKey; // Destructure the queryKey to extract `pk`

  const res = instance.get(`users/${pk}/check_staff_profile`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export interface IUpdateStaffHeroSection {
  pk: number;
  keyword_tags?: KeywordTag[];
}

export const updateStaffHeroSection = async ({
  pk,
  keyword_tags,
}: IUpdateStaffHeroSection) => {
  const res = instance
    .put(`users/staffprofiles/${pk}`, {
      keyword_tags,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export interface IStaffPublicEmail {
  pk: number;
  senderEmail: string;
  message: string;
}

export const publicEmailStaffMember = async ({
  pk,
  senderEmail,
  message,
}: IStaffPublicEmail) => {
  const res = instance
    .post(`users/${pk}/public_email_staff_member`, {
      senderEmail,
      message,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export const createEmployment = async ({
  // pk,
  public_profile,
  position_title,
  start_year,
  end_year,
  section,
  employer,
}: IStaffEmploymentEntry) => {
  const res = instance
    .post(`users/employment_entries/`, {
      // pk,
      public_profile,
      position_title,
      start_year,
      end_year: end_year === "" ? null : end_year,
      section,
      employer,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export const createEducation = async ({
  // pk,
  public_profile,
  // qualification_kind,
  // qualification_field,
  qualification_name,
  start_year,
  end_year,
  institution,
  location,
}: IStaffEducationEntry) => {
  const res = instance
    .post(`users/education_entries/`, {
      // pk,
      public_profile,
      // qualification_kind,
      // qualification_field,
      qualification_name,

      start_year,
      end_year,
      institution,
      location,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export interface IUpdatePublicEmail {
  staff_profile_pk: number;
  public_email: string;
}

export const updatePublicEmail = async ({
  staff_profile_pk,
  public_email,
}: IUpdatePublicEmail) => {
  const res = instance
    .put(`users/staffprofiles/${staff_profile_pk}`, {
      public_email,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export const editEmployment = async ({
  pk,
  // public_profile,
  position_title,
  start_year,
  end_year,
  section,
  employer,
}: IStaffEmploymentEntry) => {
  const res = instance
    .put(`users/employment_entries/${pk}`, {
      // pk,
      // public_profile,
      position_title,
      start_year,
      end_year: end_year === "" ? null : end_year,
      section,
      employer,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export const editEducation = async ({
  pk,
  // public_profile,
  // qualification_kind,
  // qualification_field,
  qualification_name,
  start_year,
  end_year,
  institution,
  location,
}: IStaffEducationEntry) => {
  const res = instance
    .put(`users/education_entries/${pk}`, {
      // pk,
      // public_profile,
      // qualification_kind,
      // qualification_field,
      qualification_name,

      start_year,
      end_year,
      institution,
      location,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export const deleteEmployment = async ({ pk }: ISimplePkProp) => {
  const res = instance.delete(`users/employment_entries/${pk}`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const deleteEducation = async ({ pk }: ISimplePkProp) => {
  const res = instance.delete(`users/education_entries/${pk}`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const getFullStaffProfile = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/${pk}/staffprofiles`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const getPublicProfileHeroData = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/staffprofiles/${pk}/hero`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const getPublicProfileOverviewData = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/staffprofiles/${pk}/overview`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const getPublicProfileCVData = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/staffprofiles/${pk}/cv`).then((res) => {
    // console.log(res.data)
    return res.data;
  });
  return res;
};

export const getStaffProfiles = async ({ searchTerm, page }) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append("searchTerm", searchTerm);
  params.append("page", page.toString());

  const res = await instance
    .get(`users/staffprofiles?${params}`)
    .then((res) => {
      return res.data;
    });
  return res;
};

// export const getStaffProfiles = async () => {
//   const res = instance.get(`users/staffprofiles`).then((res) => {
//     return res.data;
//   });
//   return res;
// };
