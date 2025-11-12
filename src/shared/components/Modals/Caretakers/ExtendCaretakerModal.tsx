// Delete User Modal - for removing users from the system all together. Admin only.

import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  InputGroup,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  type ToastId,
  UnorderedList,
  useColorMode,
  useDisclosure,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  extendCaretaker,
  MutationError,
  MutationSuccess,
  IExtendCaretakerProps,
} from "@/shared/lib/api";
import type { ICaretakerEntry, ICaretakerObject, ISimpleIdProp } from "@/shared/types/index.d";
import { useFormattedDate } from "@/shared/hooks/helper/useFormattedDate";
import { type FC } from "react";
import { ShadcnDatePicker } from "../../Pages/Account/ShadcnDatePicker";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  caretakerObject: ICaretakerObject | null;
  refetch: () => void;
}

export const ExtendCaretakerModal = ({
  isOpen,
  onClose,
  caretakerObject,
  refetch,
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
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const queryClient = useQueryClient();

  const extendCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    IExtendCaretakerProps
  >({
    // Start of mutation handling
    mutationFn: extendCaretaker,
    onMutate: () => {
      addToast({
        title: "Extending Caretaker...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `Caretaker extended.`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient
        .invalidateQueries({
          queryKey: ["caretakers"],
        })
        .then(() => refetch())
        .then(() => onClose());
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while extending a caretaker"; // Default error message

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

      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
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

  // const formattedStart = useFormattedDate(startDate);
  const formattedEnd = useFormattedDate(caretakerObject?.end_date);

  const [newEndDate, setNewEndDate] = React.useState<Date | null>(
    caretakerObject?.end_date,
  );

  const [error, setError] = React.useState<string | null>(null);
  useEffect(() => {
    if (
      newEndDate &&
      caretakerObject?.end_date &&
      newEndDate <= new Date(caretakerObject.end_date)
    ) {
      console.log("Bad date");
      setError("The new end date must be after the current end date.");
    } else {
      setError(null);
    }
  }, [newEndDate, caretakerObject]);

  const onSubmit = async (formData: IExtendCaretakerProps) => {
    console.log(formData);
    await extendCaretakerMutation.mutateAsync({
      id: formData?.id,
      newEndDate: formData?.newEndDate,
      currentEndDate: formData?.currentEndDate,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Extend Caretaker?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"bold"} fontSize={"xl"}>
                Are you sure you want to extend{" "}
                {caretakerObject?.caretaker?.display_first_name}{" "}
                {caretakerObject?.caretaker?.display_last_name} as caretaker?
              </Text>
            </Center>
            <Text mt={4}>
              The period they are currently assigned to ends on {formattedEnd}
            </Text>

            <Flex flexDir={"row"} gap={4} mt={4} pos={"relative"}>
              <FormControl my={2} mb={4} userSelect={"none"}>
                <FormLabel>New End Date</FormLabel>
                <InputGroup flexDir={"column"}>
                  <ShadcnDatePicker
                    placeholder={"Enter end date"}
                    date={newEndDate}
                    setDate={(date) => {
                      setNewEndDate(date);
                    }}
                  />
                  <Box mt={2}>
                    {error ? (
                      <Text
                        fontSize={"sm"}
                        color={colorMode === "light" ? "red.600" : "red.400"}
                      >
                        {error}
                      </Text>
                    ) : (
                      <Text
                        fontSize={"sm"}
                        color={colorMode === "light" ? "gray.600" : "gray.400"}
                      >
                        Set a date beyond the current end date.
                      </Text>
                    )}
                  </Box>
                  {/* <FormErrorMessage>{error}</FormErrorMessage> */}
                </InputGroup>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color={"white"}
                background={colorMode === "light" ? "green.500" : "green.600"}
                _hover={{
                  background: colorMode === "light" ? "green.400" : "green.500",
                }} // isDisabled={!changesMade}
                isLoading={extendCaretakerMutation.isPending}
                onClick={() =>
                  onSubmit({
                    id: caretakerObject?.id,
                    newEndDate: newEndDate,
                    currentEndDate: caretakerObject?.end_date,
                  })
                }
                isDisabled={error !== null}
                ml={3}
              >
                Extend Date
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
