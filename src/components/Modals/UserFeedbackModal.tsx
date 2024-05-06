// Modal for submission of user feedback

import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createFeedbackItem } from "../../lib/api";
import { IFeedback, IUserMe } from "../../types";
import { FeedbackRichTextEditor } from "../RichTextEditor/Editors/FeedbackRichTextEditor";

interface IUserInterface {
  userData: IUserMe;
  isLoggedIn: boolean;
  userLoading: boolean;
}

interface Props {
  user: IUserInterface;
  isFeedbackModalOpen: boolean;
  onCloseFeedbackModal: () => void;
}

export const UserFeedbackModal = ({
  user,
  isFeedbackModalOpen,
  onCloseFeedbackModal,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch } = useForm<IFeedback>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const feedbackCreationMutation = useMutation({
    mutationFn: createFeedbackItem,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Sending Feedback",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Feedback Sent`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      reset();
      onCloseFeedbackModal();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["feedback"] });
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Create Task",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmitFeedbackCreation = (formData: IFeedback) => {
    feedbackCreationMutation.mutate(formData);
  };

  const [text, setText] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    // console.log(text);
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    const content = doc.body.textContent;
    if (content.length > 0) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [text]);

  const kindValue = watch("kind");
  const statusValue = watch("status");
  const userValue = watch("user");

  return (
    <Modal
      isOpen={isFeedbackModalOpen}
      onClose={onCloseFeedbackModal}
      size={"3xl"}
      // scrollBehavior="inside"
      // isCentered={true}
    >
      <ModalOverlay />
      <ModalContent
        color={colorMode === "light" ? "black" : "white"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>Send Feedback</ModalHeader>
        <ModalCloseButton />

        <ModalBody
          as="form"
          id="feedback-form"
          onSubmit={handleSubmit(onSubmitFeedbackCreation)}
        >
          {user.userLoading === false && (
            <>
              <Input
                {...register("user", { required: true })}
                type="hidden"
                defaultValue={user.userData.pk}
              />
              <Input
                {...register("status", { required: true })}
                type="hidden"
                defaultValue={"new"}
              />
            </>
          )}

          <FormControl pb={6}>
            <FormLabel>Kind</FormLabel>
            <InputGroup>
              <Select {...register("kind", { required: true })}>
                <option value={"feedback"}>Feedback</option>
                <option value={"request"}>Suggestion or Request</option>
              </Select>
            </InputGroup>
          </FormControl>

          <FormControl>
            <FeedbackRichTextEditor
              userData={user?.userData}
              setText={setText}
            />
            {/* <Textarea
                mt={2}
                placeholder="What would you like to say..."
                {...register("text", { required: true })}
              /> */}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            // variant="ghost"
            mr={3}
            onClick={onCloseFeedbackModal}
          >
            Cancel
          </Button>
          <Button
            // form="feedback-form"
            // type="submit"
            // isDisabled={!isDirty || !isValid}

            isLoading={feedbackCreationMutation.isPending}
            isDisabled={!canSubmit}
            bg={colorMode === "dark" ? "green.500" : "green.400"}
            color={"white"}
            _hover={{
              bg: colorMode === "dark" ? "green.400" : "green.300",
            }}
            onClick={() => {
              onSubmitFeedbackCreation({
                user: userValue,
                kind: kindValue,
                status: statusValue,
                text: text,
              });
            }}
          >
            Send Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
