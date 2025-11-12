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
import { batchApproveProgressAndStudentReports } from "@/lib/api";
import { AxiosError } from "axios";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchApproveModal = ({ isOpen, onClose }: IModalProps) => {
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
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const queryClient = useQueryClient();

  const batchApproveMutation = useMutation({
    // Start of mutation handling
    mutationFn: batchApproveProgressAndStudentReports,
    onMutate: () => {
      addToast({
        title: "Batch Approving Progress and Student Reports...",
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
          description: `Docs awaiting final approval belonging to most recent financial year have been batch approved.`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      //  Close the modal
      queryClient.invalidateQueries({
        queryKey: ["latestUnapprovedProgressReports"],
      });
      queryClient.invalidateQueries({ queryKey: ["latestProgressReports"] });
      queryClient.invalidateQueries({ queryKey: ["latestStudentReports"] });

      if (onClose) {
        onClose();
      }
    },
    // Error handling based on API - file - declared interface
    onError: (error: AxiosError) => {
      console.log(error);
      let errorMessage = "An error occurred while batch approving"; // Default error message

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

  const onSubmit = async () => {
    await batchApproveMutation.mutateAsync();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex
      // as={"form"} onSubmit={handleSubmit(onSubmit)}
      >
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Batch Approve For Latest Report?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"bold"} fontSize={"xl"}>
                Are you sure you want to batch approve reports (with status
                "awaiting approval")?
              </Text>
            </Center>
            <Text mt={4}>
              Any progress reports and student reports which meet these
              conditions, will get final approval:
            </Text>
            <Box mt={4}>
              <UnorderedList>
                <ListItem>Belongs to most recent annual report</ListItem>
                <ListItem>Is approved by Project Lead</ListItem>
                <ListItem>Is approved by Business Area Lead</ListItem>
                <ListItem>Is yet to be approved by Directorate</ListItem>
                <ListItem>
                  Belongs to an active project with the status "awaiting
                  approval"
                </ListItem>
              </UnorderedList>
            </Box>

            <Text mt={4}>
              If you would still like to proceed, press "Batch Approve".
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
                isLoading={batchApproveMutation.isPending}
                onClick={() => onSubmit()}
                ml={3}
              >
                Batch Approve
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
