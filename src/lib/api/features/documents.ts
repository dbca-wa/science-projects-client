import {
  EditorSections,
  EditorSubsections,
  EditorType,
  IApproveDocument,
  ISimplePkProp,
  IStaffPublicationEntry,
} from "@/types";
import instance from "../axiosInstance";
import { QueryFunctionContext } from "@tanstack/react-query";

// export interface IUserPublicationGet {
//   employee_id: number;
// }

export const createPublication = async ({
  // pk,
  public_profile,
  title,
  year,
}: IStaffPublicationEntry) => {
  const res = instance
    .post(`documents/custompublications`, {
      // pk,
      public_profile,
      title,
      year,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export const editPublication = async ({
  pk,
  // public_profile,
  title,
  year,
}: IStaffPublicationEntry) => {
  const res = instance
    .put(`documents/custompublications/${pk}`, {
      // pk,
      // public_profile,
      title,
      year,
    })
    .then((res) => {
      // console.log(res.data)
      return res.data;
    });
  return res;
};

export const deletePublication = async ({ pk }: ISimplePkProp) => {
  const res = instance
    .delete(`documents/custompublications/${pk}`)
    .then((res) => {
      // console.log(res.data)
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

export const getLatestActiveStudentReports = async () => {
  return instance.get(`documents/latest_active_student_reports`).then((res) => {
    return res.data;
  });
};

export const getLatestActiveProgressReports = async () => {
  return instance
    .get(`documents/latest_active_progress_reports`)
    .then((res) => {
      return res.data;
    });
};

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

export const getStudentReportForYear = async (
  year: number,
  project: number,
) => {
  const url = `documents/studentreports/${project}/${year}`;
  const studentReportData = await instance.get(url).then((res) => res.data);
  // console.log(studentReportData);
  return studentReportData;
};

export interface ISpawnDocument {
  projectPk: number;
  year?: number;
  report_id?: number;
  kind:
    | "concept"
    | "projectplan"
    | "progressreport"
    | "studentreport"
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
  // console.log(projectPk, kind, year, report_id);

  const choices = [
    "concept",
    "projectplan",
    "progressreport",
    "studentreport",
    "projectclosure",
  ];
  if (!choices.includes(kind)) {
    // console.log(`returning as choice is ${kind}`)
    return;
  }
  // else {
  //     console.log(
  //         "valid choice"
  //     )
  // }
  const yearAsNumber = Number(year);

  // Create the document first (as a document object)
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
      // table sections ommitted as on db
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
      // table sections ommitted as on db
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
  // }
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
  // console.log(
  //     {
  //         projectPk,
  //         documentPk,
  //         documentKind,
  //     }
  // );
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

// Also have this handle directors message, research intro etc. (annual report)
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
    // Null document is okay - that will be handled on the backend (as the description)
    // if document is None and section is not None, make changes to the projects title or description
    // based on section
    // const data = {
    //     "html": htmlData,
    //     "project": project_pk,
    //     "section": section,
    // }
    // console.log(data)
    // GO to project endpoint
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

      // EXTERNAL PROJECTS
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
    const data = {
      html: htmlData,
      project: project_pk,
      document: document_pk,
      section: section,
      kind: writeable_document_kind,
      kind_pk: writeable_document_pk,
    };
    // console.log(data)
    const params = {
      [section]: htmlData,
    };
    // if (section === "description") {
    //     params = {
    //         "description": htmlData,
    //     }
    // }
    const formatDocumentKind = (writeable_document_kind) => {
      // Remove spaces and convert the string to lowercase, then add 's' to the end
      return writeable_document_kind.replace(/\s/g, "").toLowerCase() + "s";
    };
    const formattedKind = formatDocumentKind(writeable_document_kind);

    // console.log(`documents/${formattedKind}/${writeable_document_pk}`)
    // console.log(params)

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
      [section]: htmlData,
    };
    return urlType(url, payload).then((res) => res.data);
  }
};

export const getArarsWithPDFs = async () => {
  try {
    const response = await instance.get(`documents/reports/withPDF`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports with pdfs:", error);
    throw error;
  }
};

export const getLegacyArarPDFs = async () => {
  try {
    const response = await instance.get(`documents/reports/legacyPDF`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports with pdfs:", error);
    throw error;
  }
};

export const getArarsWithoutPDFs = async () => {
  try {
    const response = await instance.get(`documents/reports/withoutPDF`);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports without pdfs:", error);
    throw error;
  }
};

interface IAddLegacyPDF {
  pdfFile;
  reportYear;
  userId;
}

export interface IAddPDF {
  reportId: number;
  userId: number;
  pdfFile: File;
}

export interface IUpdatePDF {
  reportMediaId: number;
  // userId: number;
  pdfFile: File;
}

export const addPDFToReport = async ({
  reportId,
  userId,
  pdfFile,
}: IAddPDF) => {
  // console.log({
  //     userId,
  //     reportId,
  //     pdfFile
  // })

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
    // Handle the error or log additional information as needed
  }

  // formData.append('file', pdfFile, pdfFile.name); // Make sure pdfFile is a File object
  formData.append("user", userId.toString());
  formData.append("report", reportId.toString());

  // console.log(';formdata is')
  // console.log(formData)

  const res = await instance.post("medias/report_pdfs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  // console.log(res);
  return res.data;
};

export interface IDocGenerationProps {
  docPk: number | string;
  kind: string;
}

export const downloadProjectDocument = async ({
  docPk,
}: IDocGenerationProps) => {
  if (docPk === undefined) return;
  // console.log(docPk);
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

export const getProgressReportForYear = async (
  year: number,
  project: number,
) => {
  const url = `documents/progressreports/${project}/${year}`;
  const progressReportData = await instance.get(url).then((res) => res.data);
  // console.log(progressReportData);
  return progressReportData;
};

export const deleteLegacyFinalAnnualReportPDF = async (
  annualReportPDFPk: number,
) => {
  // console.log(annualReportPDFPk);

  const res = await instance.delete(
    `medias/legacy_report_pdfs/${annualReportPDFPk}`,
  );
  // console.log(res);
  return res.data;
};

export const deleteFinalAnnualReportPDF = async (annualReportPDFPk: number) => {
  // console.log(annualReportPDFPk);

  const res = await instance.delete(`medias/report_pdfs/${annualReportPDFPk}`);
  // console.log(res);
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
    // Handle the error or log additional information as needed
  }

  // formData.append('file', pdfFile, pdfFile.name); // Make sure pdfFile is a File object
  formData.append("user", userId.toString());
  formData.append("year", reportYear.toString());

  // console.log(';formdata is')
  // console.log(formData)

  const res = await instance.post("medias/legacy_report_pdfs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  // console.log(res);
  return res.data;
};
