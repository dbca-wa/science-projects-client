// Delete User Modal - for removing users from the system all together. Admin only.

import {
  Box,
  Button,
  Center,
  Checkbox,
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
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  INewCycle,
  MutationError,
  MutationSuccess,
  openNewCycle,
} from "../../lib/api";
import { useLatestReportYear } from "@/lib/hooks/tanstack/useLatestReportYear";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCycleModal = ({ isOpen, onClose }: IModalProps) => {
  const { colorMode } = useColorMode();
  const { isOpen: isToastOpen, onClose: closeToast } = useDisclosure();

  const { latestYear } = useLatestReportYear();

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    closeToast();
    onClose();
  };

  const [shouldIncludeUpdate, setShouldIncludeUpdate] = useState(true);
  const [shouldSendEmails, setShouldSendEmails] = useState(false);

  // Toast
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };
  const queryClient = useQueryClient();

  const newCycleMutation = useMutation<
    MutationSuccess,
    MutationError,
    INewCycle
  >({
    // Start of mutation handling
    mutationFn: openNewCycle,
    onMutate: () => {
      addToast({
        title: "Batch Creating Progress Reports...",
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
          description: `Active projects have new progress reports!`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["latestUnapprovedProgressReports"],
      });
      queryClient.invalidateQueries({ queryKey: ["latestProgressReports"] });
      queryClient.invalidateQueries({ queryKey: ["latestStudentReports"] });
      onClose?.();
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while opening the new cycle"; // Default error message

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

  const [shouldPrepopulate, setShouldPrepopulate] = useState(false);

  const onSubmit = async (formData: INewCycle) => {
    formData.shouldSendEmails = shouldSendEmails;
    formData.shouldPrepopulate = shouldPrepopulate;

    await newCycleMutation.mutateAsync(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex
      // as={"form"} onSubmit={handleSubmit(onSubmit)}
      >
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Open New Report Cycle?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"bold"} fontSize={"xl"}>
                Are you sure you want to open a new reporting cycle for FY{" "}
                {`${latestYear - 1}-${String(latestYear).substring(2)}`}?
              </Text>
            </Center>
            <Text mt={4}>
              Any projects with the status "active and approved" will get new
              progress reports for the latest financial year (if they dont
              already exist).
            </Text>

            <Box my={8}>
              <Checkbox
                fontWeight={"semibold"}
                isChecked={shouldIncludeUpdate}
                onChange={() => setShouldIncludeUpdate(!shouldIncludeUpdate)}
              >
                Also include projects with statuses "Update Requested" and
                "Supsended"?
              </Checkbox>
              <Text fontSize={"xs"} mx={6}>
                If this is selected, projects which have the status "Update
                Requested" or "Suspended" will also get new progress reports for
                the latest financial year's report, and be set to "Update
                Requested".
              </Text>
              <Checkbox
                mt={4}
                fontWeight={"semibold"}
                isChecked={shouldSendEmails}
                onChange={() => setShouldSendEmails(!shouldSendEmails)}
              >
                Also send emails?
              </Checkbox>
              <Text fontSize={"xs"} mx={6}>
                If this is selected, all active business area leads will receive
                an email alerting them the new cycle is open for FY{" "}
                {`${latestYear - 1}-${String(latestYear).substring(2)}`}. You
                may opt to open the cycle first and send these emails later by
                leaving this unchecked for now, and checking/opening the cycle
                again later.
              </Text>
              <Checkbox
                mt={4}
                fontWeight={"semibold"}
                defaultChecked={shouldPrepopulate}
                onChange={() => setShouldPrepopulate((prev) => !prev)}
              >
                Prepopulate?
              </Checkbox>
              <Text fontSize={"xs"} mx={6}>
                If this is selected, the progress reports will be prepopulated
                with data from the last reported year (if one exists).
              </Text>
            </Box>
            <Text mt={4}>
              If you would still like to proceed, press "Open Cycle".
            </Text>
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
                isLoading={newCycleMutation.isPending}
                onClick={() =>
                  onSubmit({
                    alsoUpdate: shouldIncludeUpdate,
                    shouldSendEmails: shouldSendEmails,
                    shouldPrepopulate: shouldPrepopulate,
                  })
                }
                ml={3}
              >
                Open Cycle
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
