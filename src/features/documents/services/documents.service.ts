import type {
  EditorSections,
  EditorSubsections,
  EditorType,
  IApproveDocument,
  ISimplePkProp,
  IStaffPublicationEntry,
} from "@/shared/types/index.d";
import instance from "@/shared/lib/api/axiosInstance";
import type { QueryFunctionContext } from "@tanstack/react-query";

// ============================================================================
// Publications
// ============================================================================

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

// ============================================================================
// Student Reports
// ============================================================================

export interface ISaveStudentReport {
  mainDocumentId: number;
  progressReportHtml: string;
}

export const updateStudentReportProgress = async ({
  mainDocumentId,
  progressReportHtml,
}: ISaveStudentReport) => {
  return instance.post(`documents/student_reports/update_progress`, {
    main_document_pk: mainDocumentId,
    html: progressReportHtml,
  });
};

export const getLatestActiveStudentReports = async () => {
  return instance.get(`documents/latest_active_student_reports`).then((res) => {
    return res.data;
  });
};

export const getStudentReportForYear = async (
  year: number,
  project: number,
) => {
  const url = `documents/studentreports/${project}/${year}`;
  const studentReportData = await instance.get(url).then((res) => res.data);
  return studentReportData;
};

// ============================================================================
// Progress Reports
// ============================================================================

export interface ISaveProgressReportSection {
  section: "context" | "aims" | "progress" | "implications" | "future";
  mainDocumentId: number;
  htmlData: string;
}

export const updateProgressReportSection = async ({
  mainDocumentId,
  htmlData,
  section,
}: ISaveProgressReportSection) => {
  return instance.post(`documents/progress_reports/update`, {
    section: section,
    main_document_pk: mainDocumentId,
    html: htmlData,
  });
};

export const getLatestActiveProgressReports = async () => {
  return instance
    .get(`documents/latest_active_progress_reports`)
    .then((res) => {
      return res.data;
    });
};

export const getProgressReportForYear = async (
  year: number,
  project: number,
) => {
  const url = `documents/progressreports/${project}/${year}`;
  const progressReportData = await instance.get(url).then((res) => res.data);
  return progressReportData;
};

// ============================================================================
// Reports (General)
// ============================================================================

export const getLatestUnapprovedReports = async () => {
  return instance.get(`documents/latest_inactive_reports`).then((res) => {
    return res.data;
  });
};

export interface IUserAuthCheckVariables {
  userID: number;
}

export const downloadReportPDF = ({ userID }: IUserAuthCheckVariables) => {
  return instance.post(`reports/download`, { userID }).then((res) => {
    return res.data;
  });
};

// ============================================================================
// Annual Report PDFs
// ============================================================================

export const getArarsWithPDFs = async () => {
  try {
    const response = await instance.get(`documents/reports/withPDF`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports with pdfs:", error);
    throw error;
  }
};

export const getLegacyArarPDFs = async () => {
  try {
    const response = await instance.get(`documents/reports/legacyPDF`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports with pdfs:", error);
    throw error;
  }
};

export const getArarsWithoutPDFs = async () => {
  try {
    const response = await instance.get(`documents/reports/withoutPDF`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports without pdfs:", error);
    throw error;
  }
};

export interface IAddPDF {
  reportId: number;
  userId: number;
  pdfFile: File;
}

export interface IUpdatePDF {
  reportMediaId: number;
  pdfFile: File;
}

interface IAddLegacyPDF {
  pdfFile: File;
  reportYear: number;
  userId: number;
}

export const addPDFToReport = async ({
  reportId,
  userId,
  pdfFile,
}: IAddPDF) => {
  const formData = new FormData();
  function isFileArray(obj: any): obj is File[] {
    return Array.isArray(obj) && obj.length > 0 && obj[0] instanceof File;
  }

  if (pdfFile instanceof File) {
    formData.append("file", pdfFile);
  } else if (isFileArray(pdfFile)) {
    const firstFile = pdfFile[0];
    formData.append("file", firstFile);
  } else {
    console.error(
      "pdfFile is not a valid File object or array. Type:",
      typeof pdfFile,
    );
  }

  formData.append("user", userId.toString());
  formData.append("report", reportId.toString());

  const res = await instance.post("medias/report_pdfs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const addLegacyPDF = async ({
  reportYear,
  userId,
  pdfFile,
}: IAddLegacyPDF) => {
  const formData = new FormData();
  function isFileArray(obj: any): obj is File[] {
    return Array.isArray(obj) && obj.length > 0 && obj[0] instanceof File;
  }

  if (pdfFile instanceof File) {
    formData.append("file", pdfFile);
  } else if (isFileArray(pdfFile)) {
    const firstFile = pdfFile[0];
    formData.append("file", firstFile);
  } else {
    console.error(
      "pdfFile is not a valid File object or array. Type:",
      typeof pdfFile,
    );
  }

  formData.append("user", userId.toString());
  formData.append("year", reportYear.toString());

  const res = await instance.post("medias/legacy_report_pdfs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateReportPDF = async ({
  reportMediaId,
  pdfFile,
}: IUpdatePDF) => {
  const formData = new FormData();
  function isFileArray(obj: any): obj is File[] {
    return Array.isArray(obj) && obj.length > 0 && obj[0] instanceof File;
  }

  if (pdfFile instanceof File) {
    formData.append("file", pdfFile);
  } else if (isFileArray(pdfFile)) {
    const firstFile = pdfFile[0];
    formData.append("file", firstFile);
  } else {
    console.error(
      "pdfFile is not a valid File object or array. Type:",
      typeof pdfFile,
    );
  }

  const res = await instance.put(
    `medias/report_pdfs/${reportMediaId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

export const updateLegacyReportPDF = async ({
  reportMediaId,
  pdfFile,
}: IUpdatePDF) => {
  const formData = new FormData();
  function isFileArray(obj: any): obj is File[] {
    return Array.isArray(obj) && obj.length > 0 && obj[0] instanceof File;
  }

  if (pdfFile instanceof File) {
    formData.append("file", pdfFile);
  } else if (isFileArray(pdfFile)) {
    const firstFile = pdfFile[0];
    formData.append("file", firstFile);
  } else {
    console.error(
      "pdfFile is not a valid File object or array. Type:",
      typeof pdfFile,
    );
  }

  const res = await instance.put(
    `medias/legacy_report_pdfs/${reportMediaId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

export const deleteFinalAnnualReportPDF = async (annualReportPDFPk: number) => {
  const res = await instance.delete(`medias/report_pdfs/${annualReportPDFPk}`);
  return res.data;
};

export const deleteLegacyFinalAnnualReportPDF = async (
  annualReportPDFPk: number,
) => {
  const res = await instance.delete(
    `medias/legacy_report_pdfs/${annualReportPDFPk}`,
  );
  return res.data;
};

// ============================================================================
// Document Creation & Management
// ============================================================================

export interface ISpawnDocument {
  projectPk: number;
  year?: number;
  report_id?: number;
  kind:
    | "concept"
    | "projectplan"
    | "progressreport"
    | "studentreport"
    | "projectclosure"
    | string;
}

export const spawnNewEmptyDocument = async ({
  projectPk,
  kind,
  year,
  report_id,
}: ISpawnDocument) => {
  const choices = [
    "concept",
    "projectplan",
    "progressreport",
    "studentreport",
    "projectclosure",
  ];
  if (!choices.includes(kind)) {
    return;
  }

  const yearAsNumber = Number(year);
  const url = `documents/projectdocuments`;
  const project_id = Number(projectPk);
  let params;

  if (kind === "concept") {
    params = {
      kind: "concept",
      project: project_id,
      aims: "<p></p>",
      outcome: "<p></p>",
      collaborations: "<p></p>",
      strategic_context: "<p></p>",
    };
  } else if (kind === "projectplan") {
    params = {
      kind: "projectplan",
      project: project_id,
      background: "<p></p>",
      aims: "<p></p>",
      outcome: "<p></p>",
      knowledge_transfer: "<p></p>",
      project_tasks: "<p></p>",
      listed_references: "<p></p>",
      methodology: "<p></p>",
      related_projects: "<p></p>",
    };
  } else if (kind === "studentreport") {
    params = {
      kind: "studentreport",
      report: report_id,
      project: project_id,
      year: yearAsNumber,
      progress_report: "<p></p>",
    };
  } else if (kind === "progressreport") {
    params = {
      kind: "progressreport",
      report: report_id,
      project: project_id,
      year: yearAsNumber,
      is_final_report: false,
      context: "<p></p>",
      aims: "<p></p>",
      progress: "<p></p>",
      implications: "<p></p>",
      future: "<p></p>",
    };
  } else if (kind === "projectclosure") {
    params = {
      kind: "projectclosure",
      project: project_id,
      intended_outcome: "<p></p>",
      reason: "<p></p>",
      scientific_outputs: "<p></p>",
      knowledge_transfer: "<p></p>",
      data_location: "<p></p>",
      hardcopy_location: "<p></p>",
      backup_location: "<p></p>",
    };
  }

  return instance
    .post(url, params, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export interface IDeleteDocument {
  projectPk: number | string;
  documentPk: number | string;
  documentKind:
    | "conceptplan"
    | "projectplan"
    | "progressreport"
    | "studentreport"
    | "projectclosure";
}

export const deleteDocumentCall = async ({
  projectPk,
  documentPk,
  documentKind,
}: IDeleteDocument) => {
  if (documentPk !== undefined) {
    const url = `documents/projectdocuments/${documentPk}`;
    return instance.delete(url).then((res) => res.data);
  }
};

export interface IHTMLSave {
  editorType: EditorType;
  htmlData: string;
  isUpdate: boolean;
  project_pk: null | number;
  document_pk: null | number;
  writeable_document_kind: null | EditorSections;
  writeable_document_pk: null | number;
  details_pk: number | null;
  section: null | EditorSubsections;
  softRefetch?: () => void;
  setIsEditorOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  canSave: boolean;
}

export const saveHtmlToDB = async ({
  editorType,
  htmlData,
  details_pk,
  project_pk,
  document_pk,
  writeable_document_kind,
  writeable_document_pk,
  section,
  isUpdate,
  canSave,
}: IHTMLSave) => {
  const urlType = isUpdate ? instance.put : instance.post;

  if (editorType === "ProjectDetail") {
    let params;
    if (section === "description") {
      params = {
        description: htmlData,
      };
      return urlType(`projects/${project_pk}`, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((res) => res.data);
    } else if (section === "externalAims") {
      params = {
        aims: htmlData,
      };
      return urlType(
        `projects/external_project_details/${details_pk}`,
        params,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      ).then((res) => res.data);
    } else if (section === "externalDescription") {
      params = {
        description: htmlData,
      };
      return urlType(
        `projects/external_project_details/${details_pk}`,
        params,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      ).then((res) => res.data);
    }
  } else if (editorType === "ProjectDocument") {
    const params = {
      [section ?? ""]: htmlData,
    };
    const formatDocumentKind = (writeable_document_kind: string) => {
      return writeable_document_kind.replace(/\s/g, "").toLowerCase() + "s";
    };
    const formattedKind = formatDocumentKind(writeable_document_kind ?? "");

    return urlType(
      `documents/${formattedKind}/${writeable_document_pk}`,
      params,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    ).then((res) => res.data);
  } else if (editorType === "AnnualReport") {
    const url = `documents/reports/${writeable_document_pk}`;
    const payload = {
      [section ?? ""]: htmlData,
    };
    return urlType(url, payload).then((res) => res.data);
  }
};

export interface IDocGenerationProps {
  docPk: number | string;
  kind: string;
}

export const downloadProjectDocument = async ({
  docPk,
}: IDocGenerationProps) => {
  if (docPk === undefined) return;
  const pk = Number(docPk);

  const url = "documents/downloadProjectDocument";
  const params = {
    document_id: pk,
  };

  return instance
    .post(url, params, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

// ============================================================================
// Document Workflow & Actions
// ============================================================================

export interface ISendBumpEmails {
  documentsRequiringAction: Array<{
    documentId: number;
    documentKind: string;
    projectId: number;
    projectTitle: string;
    userToTakeAction: number;
    actionCapacity: string;
    requestingUser: number;
  }>;
}

export const sendBumpEmails = async ({
  documentsRequiringAction,
}: ISendBumpEmails) => {
  const url = `documents/sendbumpemails`;

  const params = {
    documentsRequiringAction,
  };

  console.log({ ...params, url });

  return instance
    .post(url, params, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

export const handleDocumentAction = async ({
  action,
  stage,
  documentPk,
  shouldSendEmail = false,
  feedbackHTML,
}: IApproveDocument) => {
  const url = `documents/actions/${action}`;

  const params = {
    action,
    stage,
    documentPk,
    shouldSendEmail,
  };

  if (shouldSendEmail && feedbackHTML) {
    params["feedbackHTML"] = feedbackHTML;
  }

  console.log({ ...params, url });

  return instance
    .post(url, params, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);
};

// ============================================================================
// Comments & Reactions
// ============================================================================

import type { ICommentReaction } from "@/shared/types/index.d";

export const createCommentReaction = ({
  reaction,
  comment,
  user,
}: ICommentReaction) => {
  const res = instance
    .post("communications/reactions", {
      user: user,
      comment: comment,
      reaction: reaction,
      direct_message: null,
    })
    .then((res) => {
      return res;
    });
  return res;
};

export const getDocumentComments = async ({
  queryKey,
}: QueryFunctionContext) => {
  const [_, pk] = queryKey;
  const res = instance
    .get(`documents/projectdocuments/${pk}/comments`)
    .then((res) => res.data);
  return res;
};

export interface DocumentCommentCreationProps {
  documentId: number;
  payload: string;
  user: number;
}

export const createDocumentComment = async ({
  documentId,
  payload,
  user,
}: DocumentCommentCreationProps) => {
  const postContent = {
    user,
    payload,
  };
  const res = instance
    .post(`documents/projectdocuments/${documentId}/comments`, postContent)
    .then((res) => res.data);
  return res;
};

export interface MentionedUser {
  id: number;
  name: string;
  email: string;
}

export interface Commenter {
  id: number;
  name: string;
  email: string;
}

interface NotificationData {
  documentId: number;
  projectId: number;
  commenter: {
    id: number;
    name: string;
    email: string;
  };
  mentionedUsers: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  documentKind?: string;
  commentContent: string;
}

export const sendMentionNotifications = async (data: NotificationData) => {
  console.log("Sending notification", data);
  const response = await instance.post(
    "documents/notifications/mentions",
    data,
  );
  return response.data;
};

export interface IDeleteComment {
  commentPk: number | string;
  documentPk: number | string;
}

export const deleteCommentCall = async ({
  commentPk,
  documentPk,
}: IDeleteComment) => {
  if (documentPk !== undefined) {
    const url = `communications/comments/${commentPk}`;
    return instance.delete(url).then((res) => res.data);
  }
};

// ============================================================================
// Email Notifications
// ============================================================================

export interface IEmailRecipientsString {
  fromUserEmail: string;
  toUserEmail: string;
}

export const sendSPMSLinkEmail = async ({
  toUserEmail,
  fromUserEmail,
}: IEmailRecipientsString) => {
  return instance
    .post(`documents/spms_link_email`, {
      invitor: fromUserEmail,
      invitee: toUserEmail,
    })
    .then((res) => {
      return res.data;
    });
};

export interface INewCycleEmail {
  financial_year: number;
  include_projects_with_status_updating?: boolean;
}

export const sendNewReportingCycleOpenEmail = async ({
  financial_year,
  include_projects_with_status_updating,
}) => {
  return instance
    .post(`documents/new_cycle_email`, {
      financial_year: financial_year,
      include_projects_with_status_updating:
        include_projects_with_status_updating,
    })
    .then((res) => {
      return res.data;
    });
};
