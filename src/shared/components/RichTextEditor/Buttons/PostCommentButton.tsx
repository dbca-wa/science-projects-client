import {
  createDocumentComment,
  sendMentionNotifications,
} from "@/features/documents/services/documents.service";
import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CLEAR_EDITOR_COMMAND } from "lexical";
import { useRef, useEffect } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { extractMentionedUsers } from "../Plugins/MentionsPlugin";

export const PostCommentButton = ({
  distilled,
  documentId,
  documentKind,
  userData,
  comment,
  refetchComments,
  project,
}) => {
  const [editor] = useLexicalComposerContext();
  const { colorMode } = useColorMode();

  const postComment = () => {
    if (distilled.length > 1) {
      console.log("Posting comment with content:", comment);

      const data = {
        user: userData.pk,
        documentId,
        payload: comment,
      };

      postCommentMutation.mutate(data);
    }
  };

  const sendNotificationsMutation = useMutation({
    mutationFn: sendMentionNotifications,
    onSuccess: (data) => {
      console.log("Notification sent successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to send notifications:", error);
    },
  });

  const queryClient = useQueryClient();
  const postCommentMutation = useMutation({
    mutationFn: createDocumentComment,
    onMutate: () => {
      toast.loading("Posting Comment");
    },
    onSuccess: async (data) => {
      toast.dismiss();
      toast.success("Comment Posted");

      console.log("Comment posted successfully:", data);

      // Store the original comment content
      const originalComment = comment;

      // Extract mentioned users from the comment HTML
      const mentionedUsers = extractMentionedUsers(originalComment);
      console.log("Extracted mentioned users:", mentionedUsers);

      // Always send notifications - either to mentioned users or default recipients
      const formattedMentionedUsers = mentionedUsers.map((user) => ({
        id: user.id,
        name: user.name || "User",
        email: user.email,
      }));

      const commenter = {
        id: userData.pk,
        name: `${userData.first_name} ${userData.last_name}`.trim(),
        email: userData.email,
      };

      // Send notification with comment content
      const notificationData = {
        documentId,
        projectId: project?.pk,
        commenter,
        mentionedUsers: formattedMentionedUsers,
        documentKind: documentKind || "document",
        commentContent: originalComment, // Include the full comment content
      };

      console.log("Sending notification with data:", notificationData);
      sendNotificationsMutation.mutate(notificationData);

      queryClient.invalidateQueries({
        queryKey: ["documentComments", documentId],
      });

      setTimeout(async () => {
        await refetchComments();
        console.log("Fetched updated comments");
      }, 150);

      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      editor.focus();
    },
    onError: (error) => {
      console.error("Error posting comment:", error);
      toast.dismiss();
      toast.error(`Could not post comment: ${error}`);
    },
  });

  return (
    <Button
      className={`rounded-full w-10 h-10 w-full ${
        colorMode === "light" 
          ? "bg-blue-500 text-white/90 hover:bg-blue-400 hover:text-white" 
          : "bg-blue-600 text-white/80 hover:bg-blue-500 hover:text-white"
      }`}
      disabled={distilled.length < 1}
      onClick={postComment}
    >
      <BsFillSendFill />
    </Button>
  );
};
