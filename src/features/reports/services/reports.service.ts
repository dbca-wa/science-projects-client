import type {
  EditorSections,
  EditorSubsections,
  EditorType,
} from "@/shared/types/index.d";
import instance from "@/shared/lib/api/axiosInstance";

// ============================================================================
// Types
// ============================================================================

export interface ISaveStudentReport {
  mainDocumentId: number;
  progressReportHtml: string;
}

export interface ISaveProgressReportSection {
  section: "context" | "aims" | "progress" | "implications" | "future";
  mainDocumentId: number;
  htmlData: string;
}

export interface IUserAuthCheckVariables {
  userID: number;
}

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

export interface IAddLegacyPDF {
  pdfFile: File;
  reportYear: number;
  userId: number;
}

export interface IAddPDF {
  reportId: number;
  userId: number;
  pdfFile: File;
}

export interface IUpdatePDF {
  reportMediaId: number;
  pdfFile: File;
}

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

// ============================================================================
// Student Reports
// ============================================================================

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
// Annual Reports
// ============================================================================

export const getLatestUnapprovedReports = async () => {
  return instance.get(`documents/latest_inactive_reports`).then((res) => {
    return res.data;
  });
};

export const downloadReportPDF = ({ userID }: IUserAuthCheckVariables) => {
  return instance.post(`reports/download`, { userID }).then((res) => {
    return res.data;
  });
};

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

// ============================================================================
// Report Document Creation
// ============================================================================

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

// ============================================================================
// Report HTML Saving
// ============================================================================

export const saveReportHtmlToDB = async ({
  editorType,
  htmlData,
  writeable_document_pk,
  section,
  isUpdate,
}: IHTMLSave) => {
  const urlType = isUpdate ? instance.put : instance.post;

  if (editorType === "AnnualReport") {
    const url = `documents/reports/${writeable_document_pk}`;
    const payload = {
      [section ?? ""]: htmlData,
    };
    return urlType(url, payload).then((res) => res.data);
  }
};

// ============================================================================
// Report PDF Management
// ============================================================================

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
