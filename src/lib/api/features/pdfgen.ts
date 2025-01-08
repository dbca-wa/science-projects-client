import { IConceptPlanGenerationData } from "@/types";
import instance from "../axiosInstance";

export interface IDocGen {
  document_pk: number;
}

export const generateAnnualReportPDF = async ({ document_pk }: IDocGen) => {
  //   // Use import.meta.url directly to get the base URL
  //   const cssFileURL = "/texteditor.css";

  //   // Import the CSS file using Vite's import function
  //   const cssFileContents = await fetch(cssFileURL)
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch ${cssFileURL}`);
  //       }
  //       return response.text();
  //     })
  //     .then((cssFileContent) => {
  //       // console.log({ cssFileURL, cssFileContent });
  //       // Send the object as JSON
  //       const css_content = JSON.stringify(cssFileContent);
  //       // You can send jsonString to your server using an HTTP request (e.g., fetch or axios)
  //       // console.log(css_content); // Log the JSON string for verification
  //       return css_content;
  //     });

  const res = await instance.post(
    `documents/reports/${document_pk}/generate_pdf`,
    // { css_content: cssFileContents },
  );
  // console.log(res.data);
  return { res };
};

export const generateAnnualReportUnapprovedPDF = async ({
  document_pk,
}: IDocGen) => {
  const res = await instance.post(
    `documents/reports/${document_pk}/unapproved_generate_pdf`,
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
  // Use import.meta.url directly to get the base URL
  //   const cssFileURL = "/texteditor.css";

  //   // Import the CSS file using Vite's import function
  //   const cssFileContents = await fetch(cssFileURL)
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch ${cssFileURL}`);
  //       }
  //       return response.text();
  //     })
  //     .then((cssFileContent) => {
  //       // console.log({ cssFileURL, cssFileContent });
  //       // Send the object as JSON
  //       const css_content = JSON.stringify(cssFileContent);
  //       // You can send jsonString to your server using an HTTP request (e.g., fetch or axios)
  //       // console.log(css_content); // Log the JSON string for verification
  //       return css_content;
  //     });

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
