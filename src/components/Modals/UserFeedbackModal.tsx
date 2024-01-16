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
  Textarea,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { IFeedback, IUserData } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import { createFeedbackItem } from "../../lib/api";

interface IUserInterface {
  userData: IUserData;
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<IFeedback>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const feedbackCreationMutation = useMutation(createFeedbackItem, {
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
        queryClient.invalidateQueries(["feedback"]);
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

  return (
    <Modal
      isOpen={isFeedbackModalOpen}
      onClose={onCloseFeedbackModal}
      size={"xl"}
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
            <FormLabel>Feedback/Request</FormLabel>
            <InputGroup>
              <Textarea
                mt={2}
                placeholder="What would you like to say..."
                {...register("text", { required: true })}
              />
            </InputGroup>
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
            form="feedback-form"
            type="submit"
            isLoading={feedbackCreationMutation.isLoading}
            isDisabled={!isDirty || !isValid}
            bg={colorMode === "dark" ? "green.500" : "green.400"}
            color={"white"}
            _hover={{
              bg: colorMode === "dark" ? "green.400" : "green.300",
            }}
          >
            Send Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
