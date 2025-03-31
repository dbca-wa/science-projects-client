import { createDocumentComment, sendMentionNotifications } from "@/lib/api";
import {
  Button,
  ToastId,
  useColorMode,
  useToast,
  UseToastOptions,
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
  userData,
  comment,
  refetchComments,
  project,
}) => {
  const [editor] = useLexicalComposerContext();
  const { colorMode } = useColorMode();

  // Log the comment content for debugging
  // useEffect(() => {
  //   if (comment && comment.includes("@")) {
  //     console.log("Comment contains @:", comment);
  //     const debugMentions = extractMentionedUsers(comment);
  //     console.log("Debug extracted mentions:", debugMentions);
  //   }
  // }, [comment]);

  const postComment = () => {
    if (distilled.length > 1) {
      // Debug: Check if the comment contains mention spans
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
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
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
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Comment Posted`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      console.log("Comment posted successfully:", data);

      // Store a copy of the original comment for mention extraction
      const originalComment = comment;

      // Extract mentioned users from the comment HTML
      const mentionedUsers = extractMentionedUsers(originalComment);
      console.log("Extracted mentioned users:", mentionedUsers);

      // If there are mentioned users, send notifications
      if (mentionedUsers.length > 0) {
        // Format mentioned users according to the backend's expected format
        const formattedMentionedUsers = mentionedUsers.map((user) => ({
          id: user.id,
          name: user.name || "User",
          email: user.email,
        }));

        // Create commenter object
        const commenter = {
          id: userData.pk,
          name: `${userData.first_name} ${userData.last_name}`.trim(),
          email: userData.email,
        };

        console.log("Sending notification with data:", {
          documentId,
          projectId: project?.pk,
          commenter,
          mentionedUsers: formattedMentionedUsers,
        });

        sendNotificationsMutation.mutate({
          documentId,
          projectId: project?.pk,
          commenter,
          mentionedUsers: formattedMentionedUsers,
        });
      } else {
        console.log("No mentioned users found in the comment");
      }

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
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
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
