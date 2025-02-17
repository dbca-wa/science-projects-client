import { createDocumentComment } from "@/lib/api";
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
import { useRef } from "react";
import { BsFillSendFill } from "react-icons/bs";

export const PostCommentButton = ({
  distilled,
  documentId,
  userData,
  comment,
  refetchComments,
}) => {
  const [editor] = useLexicalComposerContext();
  const { colorMode } = useColorMode();

  const postComment = () => {
    if (distilled.length > 1) {
      const data = {
        user: userData.pk,
        documentId,
        payload: comment,
      };

      postCommentMutation.mutate(data);
    }
  };

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
    onSuccess: async () => {
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
      queryClient.invalidateQueries({
        queryKey: ["documentComments", documentId],
      });

      setTimeout(async () => {
        await refetchComments();
        console.log("posted");
      }, 150);

      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      editor.focus();
    },
    onError: (error) => {
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
