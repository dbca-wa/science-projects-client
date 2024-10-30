// Delete User Modal - for removing users from the system all together. Admin only.

import {
  Button,
  Center,
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  ToastId,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  MutationError,
  MutationSuccess,
  cancelCaretakerRequest,
} from "../../lib/api";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  refresh: () => void;
  taskPk: number;
}

export const CancelCaretakerRequestModal = ({
  isOpen,
  onClose,
  refresh,
  taskPk,
}: IModalProps) => {
  const { colorMode } = useColorMode();
  const { isOpen: isToastOpen, onClose: closeToast } = useDisclosure();

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    closeToast();
    onClose();
  };

  // Toast
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const queryClient = useQueryClient();

  const cancelCaretakerRequestMutation = useMutation<
    MutationSuccess,
    MutationError,
    { taskPk: number }
  >({
    // Start of mutation handling
    mutationFn: cancelCaretakerRequest,
    onMutate: () => {
      addToast({
        title: "Cancelling request...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Your request has been cancelled.`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient
        .invalidateQueries({
          queryKey: ["pendingAdminTasks"],
        })
        .then(() => refresh())
        .then(() => onClose());
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while cancelling your request"; // Default error message

      const collectErrors = (data, prefix = "") => {
        if (typeof data === "string") {
          return [data];
        }

        const errorMessages = [];

        for (const key in data) {
          if (Array.isArray(data[key])) {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else if (typeof data[key] === "object") {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else {
            errorMessages.push(`${prefix}${key}: ${data[key]}`);
          }
        }

        return errorMessages;
      };

      if (error.response && error.response.data) {
        const errorMessages = collectErrors(error.response.data);
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join("\n"); // Join errors with new lines
        }
      } else if (error.message) {
        errorMessage = error.message; // Use the error message from the caught exception
      }

      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Update failed",
          description: errorMessage,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmit = async (formData: { taskPk: number }) => {
    console.log(formData);
    await cancelCaretakerRequestMutation.mutateAsync({
      taskPk: formData.taskPk,
    });
  };
  useEffect(() => {
    console.log({ taskPk: taskPk });
  }, [taskPk]);

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Cancel Request?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"bold"} fontSize={"xl"}>
                Are you sure you want to cancel your caretaker request?
              </Text>
            </Center>
            <Text mt={4}>Your request will be removed from the system.</Text>
            <Text mt={4}>
              If you would still like to proceed, press "Cancel Request".
            </Text>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }} // isDisabled={!changesMade}
                isLoading={cancelCaretakerRequestMutation.isPending}
                onClick={() =>
                  onSubmit({
                    taskPk,
                  })
                }
                ml={3}
              >
                Cancel Request
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
