// Delete User Modal - for removing users from the system all together. Admin only.

import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  ToastId,
  UnorderedList,
  useColorMode,
  useDisclosure,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { MutationError, MutationSuccess, removeCaretaker } from "@/lib/api";
import { ICaretakerEntry, ICaretakerObject, ISimpleIdProp } from "@/types";
import { useFormattedDate } from "@/lib/hooks/helper/useFormattedDate";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  caretakerObject: ICaretakerObject | null;
  refetch: () => void;
}

export const RemoveCaretakerModal = ({
  isOpen,
  onClose,
  caretakerObject,
  refetch,
}: IModalProps) => {
  const { colorMode } = useColorMode();
  const { isOpen: isToastOpen, onClose: closeToast } = useDisclosure();
  console.log(caretakerObject);
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
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const queryClient = useQueryClient();

  const removeCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    ISimpleIdProp
  >({
    // Start of mutation handling
    mutationFn: removeCaretaker,
    onMutate: () => {
      console.log("onMutate");
      addToast({
        title: "Removing Caretaker...",
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
          description: `Caretaker removed.`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      // Explicitly call refetch after invalidating queries
      queryClient
        .invalidateQueries({
          queryKey: ["caretakers"],
        })
        .then((r) =>
          queryClient.invalidateQueries({
            queryKey: ["myCaretakerStatus"],
          }),
        )
        .then((r) => refetch()) // Explicit call to refetch
        .then((r) => onClose());
    },

    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while removing a caretaker"; // Default error message

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

  const onSubmit = async (formData: ISimpleIdProp) => {
    // console.log(formData);
    await removeCaretakerMutation.mutateAsync({
      id: caretakerObject?.caretaker_obj_id
        ? caretakerObject.caretaker_obj_id
        : caretakerObject?.id,
    });
  };

  // const formattedStart = useFormattedDate(startDate);
  const formattedEnd = useFormattedDate(caretakerObject?.end_date);

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Remove Caretaker?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"bold"} fontSize={"xl"}>
                Are you sure you want to remove{" "}
                {caretakerObject?.caretaker?.display_first_name}{" "}
                {caretakerObject?.caretaker?.display_last_name} as caretaker?
              </Text>
            </Center>
            <Text mt={4}>
              They will immedediately lose permissions to act on the user's
              behalf.
            </Text>

            <Text mt={4}>
              If you would still like to proceed, press "Remove Caretaker".
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
                isLoading={removeCaretakerMutation.isPending}
                onClick={() =>
                  onSubmit({
                    id:
                      caretakerObject?.id !== undefined
                        ? caretakerObject.id
                        : caretakerObject?.caretaker_obj_id,
                  })
                }
                ml={3}
              >
                Remove Caretaker
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
