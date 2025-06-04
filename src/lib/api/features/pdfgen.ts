import { IConceptPlanGenerationData } from "@/types";
import instance from "../axiosInstance";

export interface IDocGen {
  document_pk: number;
  genkind?: "all" | "approved"; // Optional, defaults to 'all'
}

export const generateAnnualReportPDF = async ({
  document_pk,
  genkind = "all", // Default to 'all' if not specified
}: IDocGen) => {
  const res = await instance.post(
    `documents/reports/${document_pk}/generate_pdf`,
    { genkind },
  );
  return { res };
};
export const cancelAnnualReportPDF = async ({ document_pk }: IDocGen) => {
  const res = await instance.post(
    `documents/reports/${document_pk}/cancel_doc_gen`,
  );
  // console.log(res.data);
  return { res };
};

export const generateProjectDocument = async ({ document_pk }: IDocGen) => {
  const res = await instance.post(
    `documents/generate_project_document/${document_pk}`,
    // { css_content: cssFileContents },
  );
  // console.log(res.data);
  return { res };
};

export const cancelProjectDocumentGeneration = async ({
  document_pk,
}: IDocGen) => {
  const res = await instance.post(`documents/cancel_doc_gen/${document_pk}`);
  // console.log(res.data);
  return { res };
};

export interface IConceptGenerationProps {
  concept_plan_pk: number;
  renderedHtmlString?: string;
}

export const getDataForConceptPlanGeneration = async (
  concept_plan_pk: number,
): Promise<IConceptPlanGenerationData> => {
  return instance
    .post(`documents/conceptplans/${concept_plan_pk}/get_concept_plan_data`, {
      concept_plan_pk: concept_plan_pk,
    })
    .then((res) => {
      return res.data;
    });
};

export interface IGeneratePDFProps {
  reportId: number;
  section: string;
  businessArea?: number;
}

export const generateReportPDF = async ({
  reportId,
  section,
  businessArea,
}: IGeneratePDFProps) => {
  const options = {
    section: section,
    business_area: businessArea,
  };

  return instance.post(`documents/reports/${reportId}/generate_pdf`, options);
};
