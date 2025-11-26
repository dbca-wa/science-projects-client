import type {
  ISimplePkProp,
  IStaffEducationEntry,
  IStaffEmploymentEntry,
  IStaffPublicationEntry,
  KeywordTag,
} from "@/shared/types";
import instance from "@/shared/lib/api/axiosInstance";
import { type QueryFunctionContext } from "@tanstack/react-query";

// ============================================================
// STAFF PROFILE QUERIES
// ============================================================

export const getFullStaffProfile = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/${pk}/staffprofiles`).then((res) => {
    return res.data;
  });
  return res;
};

export const getPublicProfileHeroData = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/staffprofiles/${pk}/hero`).then((res) => {
    return res.data;
  });
  return res;
};

export const getPublicProfileOverviewData = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/staffprofiles/${pk}/overview`).then((res) => {
    return res.data;
  });
  return res;
};

export const getPublicProfileCVData = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/staffprofiles/${pk}/cv`).then((res) => {
    return res.data;
  });
  return res;
};

export const getStaffProfiles = async ({
  searchTerm,
  page,
  showHidden,
}: {
  searchTerm: string;
  page: number;
  showHidden: boolean;
}) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append("searchTerm", searchTerm);
  params.append("page", page.toString());
  if (showHidden) params.append("showHidden", "true");

  const res = await instance
    .get(`users/staffprofiles?${params}`)
    .then((res) => {
      return res.data;
    });
  return res;
};

export const checkUserActiveAndGetStaffProfileData = async ({
  queryKey,
}: {
  queryKey: (string | number)[];
}) => {
  const [_, pk] = queryKey;
  const res = instance.get(`users/${pk}/check_staff_profile`).then((res) => {
    return res.data;
  });
  return res;
};

export const getTeamLead = async ({ queryKey }: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance
    .get(`projects/project_members/${pk}/leader`)
    .then((res) => {
      return res.data;
    });
  return res;
};

// ============================================================
// STAFF PROFILE MUTATIONS
// ============================================================

export const toggleStaffProfileVisibility = async ({
  staffProfilePk,
}: {
  staffProfilePk: number;
}) => {
  const res = instance
    .post(`users/staffprofiles/${staffProfilePk}/toggle_visibility`)
    .then((res) => {
      return res.data;
    });
  return res;
};

export const toggleProjectVisibilityOnStaffProfile = async ({
  userPk,
  projectPk,
}: {
  userPk: number;
  projectPk: number;
}) => {
  const res = instance
    .post(`projects/${projectPk}/toggle_user_profile_visibility`, {
      user_pk: userPk,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

// ============================================================
// STAFF PROFILE OVERVIEW & HERO UPDATES
// ============================================================

export interface IUpdateStaffOverviewSection {
  pk: number;
  about?: string;
  expertise?: string;
  keyword_tags?: KeywordTag[];
}

export const updateStaffProfileOverviewSection = async ({
  pk,
  about,
  expertise,
  keyword_tags,
}: IUpdateStaffOverviewSection) => {
  const res = instance
    .put(`users/staffprofiles/${pk}`, {
      about,
      expertise,
      keyword_tags,
    })
    .then((res) => {
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
      return res.data;
    });
  return res;
};

export interface IUpdateCustomTitle {
  staff_profile_pk: number;
  custom_title: string;
  custom_title_on: boolean;
}

export const updateCustomTitle = async ({
  staff_profile_pk,
  custom_title,
  custom_title_on,
}: IUpdateCustomTitle) => {
  const res = instance
    .put(`users/staffprofiles/${staff_profile_pk}`, {
      custom_title,
      custom_title_on,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

// ============================================================
// EMPLOYMENT ENTRIES
// ============================================================

export const createEmployment = async ({
  public_profile,
  position_title,
  start_year,
  end_year,
  section,
  employer,
}: IStaffEmploymentEntry) => {
  const res = instance
    .post(`users/employment_entries/`, {
      public_profile,
      position_title,
      start_year,
      end_year: end_year === "" ? null : end_year,
      section,
      employer,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const editEmployment = async ({
  pk,
  position_title,
  start_year,
  end_year,
  section,
  employer,
}: IStaffEmploymentEntry) => {
  const res = instance
    .put(`users/employment_entries/${pk}`, {
      position_title,
      start_year,
      end_year: end_year === "" ? null : end_year,
      section,
      employer,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const deleteEmployment = async ({ pk }: ISimplePkProp) => {
  const res = instance.delete(`users/employment_entries/${pk}`).then((res) => {
    return res.data;
  });
  return res;
};

// ============================================================
// EDUCATION ENTRIES
// ============================================================

export const createEducation = async ({
  public_profile,
  qualification_name,
  end_year,
  institution,
  location,
}: IStaffEducationEntry) => {
  const res = instance
    .post(`users/education_entries/`, {
      public_profile,
      qualification_name,
      end_year,
      institution,
      location,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const editEducation = async ({
  pk,
  qualification_name,
  end_year,
  institution,
  location,
}: IStaffEducationEntry) => {
  const res = instance
    .put(`users/education_entries/${pk}`, {
      qualification_name,
      end_year,
      institution,
      location,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const deleteEducation = async ({ pk }: ISimplePkProp) => {
  const res = instance.delete(`users/education_entries/${pk}`).then((res) => {
    return res.data;
  });
  return res;
};

// ============================================================
// PUBLICATIONS
// ============================================================

export const createPublication = async ({
  public_profile,
  title,
  year,
}: IStaffPublicationEntry) => {
  const res = instance
    .post(`documents/custompublications`, {
      public_profile,
      title,
      year,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const editPublication = async ({
  pk,
  title,
  year,
}: IStaffPublicationEntry) => {
  const res = instance
    .put(`documents/custompublications/${pk}`, {
      title,
      year,
    })
    .then((res) => {
      return res.data;
    });
  return res;
};

export const deletePublication = async ({ pk }: ISimplePkProp) => {
  const res = instance
    .delete(`documents/custompublications/${pk}`)
    .then((res) => {
      return res.data;
    });
};

export const getPublicationsForUser = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, employee_id] = queryKey;
  return instance.get(`documents/publications/${employee_id}`).then((res) => {
    return res.data;
  });
};

// ============================================================
// EMAIL
// ============================================================

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
      return res.data;
    });
  return res;
};
