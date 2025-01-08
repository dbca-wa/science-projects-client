import { QueryFunctionContext } from "@tanstack/react-query";
import instance from "../axiosInstance";
import { ICommentReaction } from "@/types";

//#region REACTIONS =================================================================

export const createCommentReaction = ({
  reaction,
  comment,
  user,
}: ICommentReaction) => {
  // console.log({ reaction, comment, user })
  // return "hi"
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

//#endregion

//#region COMMENTS =================================================================
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
  // console.log("postContent", postContent)
  const res = instance
    .post(`documents/projectdocuments/${documentId}/comments`, postContent)
    .then((res) => res.data);
  return res;
};

export interface IDeleteComment {
  commentPk: number | string;
  documentPk: number | string;
}

export const deleteCommentCall = async ({
  commentPk,
  documentPk,
}: IDeleteComment) => {
  // console.log(
  //     {
  //         commentPk,
  //         documentPk,
  //     }
  // );
  if (documentPk !== undefined) {
    const url = `communications/comments/${commentPk}`;
    return instance.delete(url).then((res) => res.data);
  }
};

//#endregion

//#region EMAILS =================================================================
export interface IDocumentApproved {
  recipients_list: number[]; // array of pks
  project_pk: number;
  document_kind?: string; //concept, projectplan, progressreport, studentreport,projectclosur
}

export const sendDocumentApprovedEmail = async ({
  recipients_list,
  project_pk,
  document_kind,
}: IDocumentApproved) => {
  return instance
    .post(`documents/document_approved_email`, {
      recipients_list: recipients_list,
      project_pk: project_pk,
      document_kind: document_kind,
    })
    .then((res) => {
      return res.data;
    });
};

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

export interface IDocumentRecalled {
  stage: number;

  recipients_list: number[]; // array of pks
  project_pk: number;
  document_kind: string; //concept, projectplan, progressreport, studentreport,projectclosur
}

export const sendDocumentRecalledEmail = async ({
  recipients_list,
  project_pk,
  document_kind,
  stage,
}: IDocumentRecalled) => {
  return instance
    .post(`documents/document_recalled_email`, {
      stage: stage,
      recipients_list: recipients_list,
      project_pk: project_pk,
      document_kind: document_kind,
    })
    .then((res) => {
      return res.data;
    });
};

export interface IReviewDocumentEmail {
  recipients_list: number[]; // array of pks
  project_pk: number;
  document_kind: string; //concept, projectplan, progressreport, studentreport,projectclosure
}

export const sendReviewProjectDocumentEmail = async ({
  recipients_list,
  project_pk,
  document_kind,
}: IReviewDocumentEmail) => {
  return instance
    .post(`documents/review_document_email`, {
      recipients_list: recipients_list,
      project_pk: project_pk,
      document_kind: document_kind,
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

export interface IProjectClosureEmail {
  project_pk: number;
}

export const sendProjectClosureEmail = async ({
  project_pk,
}: IProjectClosureEmail) => {
  return instance
    .post(`documents/project_closure_email`, {
      project_pk: project_pk,
    })
    .then((res) => {
      return res.data;
    });
};

export interface IDocumentReadyEmail {
  recipients_list: number[]; // array of pks
  project_pk: number;
  document_kind: string; //concept, projectplan, progressreport, studentreport,projectclosur
}

export const sendDocumentReadyEmail = async ({
  recipients_list,
  project_pk,
  document_kind,
}: IDocumentReadyEmail) => {
  return instance
    .post(`documents/document_ready_email`, {
      recipients_list: recipients_list,
      project_pk: project_pk,
      document_kind: document_kind,
    })
    .then((res) => {
      return res.data;
    });
};

export interface IDocumentSentBack {
  stage: number;
  recipients_list: number[]; // array of pks
  project_pk: number;
  document_kind: string; //concept, projectplan, progressreport, studentreport,projectclosur
}

export const sendDocumentSentBackEmail = async ({
  recipients_list,
  project_pk,
  document_kind,
  stage,
}: IDocumentSentBack) => {
  return instance
    .post(
      `documents/document_sent_back_email`,

      {
        stage: stage,
        recipients_list: recipients_list,
        project_pk: project_pk,
        document_kind: document_kind,
      },
    )
    .then((res) => {
      return res.data;
    });
};

export const sendConceptPlanEmail = async ({
  recipients_list,
  project_pk,
  document_kind,
}: IDocumentApproved) => {
  return instance
    .post(`documents/concept_plan_email`, {
      recipients_list: recipients_list,
      project_pk: project_pk,
      document_kind: document_kind,
    })
    .then((res) => {
      return res.data;
    });
};

//#endregion
