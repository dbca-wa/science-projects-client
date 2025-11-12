import type { QueryFunctionContext } from "@tanstack/react-query";
import instance from "../axiosInstance";
import type { ICommentReaction } from "@/shared/types/index.d";

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

// Interface for mentioned user
export interface MentionedUser {
  id: number;
  name: string;
  email: string;
}

// Interface for commenter
export interface Commenter {
  id: number;
  name: string;
  email: string;
}

/**
 * Send email notifications to mentioned users
 */
// Interface for notification data - matching the Django view's expected format

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

// Updated API function
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

//#endregion
