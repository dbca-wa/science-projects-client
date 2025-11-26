import {
  createDocumentComment,
  sendMentionNotifications,
} from "@/features/documents/services/documents.service";
import {
  Button,
  type ToastId,
  useColorMode,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
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

  // Mutation for email notifications
  const sendNotificationsMutation = useMutation({
    mutationFn: sendMentionNotifications,
    onSuccess: (data) => {
      console.log("Notification sent successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to send notifications:", error);
    },
  });

  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const queryClient = useQueryClient();
  const postCommentMutation = useMutation({
    mutationFn: createDocumentComment,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Posting Comment`,
        position: "top-right",
      });
    },
    onSuccess: async (data) => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `Comment Posted`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

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
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: `Could not post comment`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <Button
      bg={colorMode === "light" ? "blue.500" : "blue.600"}
      color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.800"}
      _hover={
        colorMode === "light"
          ? {
              color: "white",
              bg: "blue.400",
            }
          : {
              color: "white",
              bg: "blue.500",
            }
      }
      isDisabled={distilled.length < 1}
      onClick={postComment}
      rounded={"full"}
      boxSize={"40px"}
      w={"100%"}
    >
      <BsFillSendFill />
    </Button>
  );
};
