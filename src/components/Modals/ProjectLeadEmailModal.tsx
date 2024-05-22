// Delete User Modal - for removing users from the system all together. Admin only.

import { IProjectLeadsEmail } from "@/types";
import {
  Box,
  Button,
  Checkbox,
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
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { sendEmailToProjectLeads } from "../../lib/api";
import { AxiosError } from "axios";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectLeadEmailModal = ({ isOpen, onClose }: IModalProps) => {
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

  //   const queryClient = useQueryClient();
  const [shouldDownloadList, setShouldDownloadList] = useState(false);

  const projectLeadEmailMutation = useMutation({
    // Start of mutation handling
    mutationFn: sendEmailToProjectLeads,
    onMutate: () => {
      addToast({
        title: "Getting Email LIst...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: (resdata) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Opening Mail${
            shouldDownloadList === true ? " and downloading file" : ""
          }.`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      const emailList = resdata["unique_dbca_emails_list"];
      const fileContent = resdata["file_content"];

      if (shouldDownloadList) {
        // Convert fileContent dictionary into a string
        const contentString = Object.values(fileContent).join("");

        // Create a Blob from the string
        const blob = new Blob([contentString], { type: "text/plain" });

        // Generate a URL for the Blob
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "project_leads_list.txt";
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Open the file in a new tab
        const openLink = document.createElement("a");
        openLink.href = url;
        openLink.target = "_blank";
        document.body.appendChild(openLink);
        openLink.click();

        // Cleanup: remove the link elements and revoke the object URL
        document.body.removeChild(downloadLink);
        document.body.removeChild(openLink);
      }

      if (emailList.length > 0) {
        const emailString = emailList.join(",");
        // const mailToLink = `mailto:${emailString}&subject=${subject}`;
        // console.log(emailList);
        // console.log("EMAIL STRING: ", emailString);
        const mailToLink = `mailto:${emailString}&subject=SPMS:`;
        // const mailToLink = `mailto:jarid.prince@dbca.wa.gov.au,rory.mcauley@dbca.wa.gov.au&subject=SPMS:`;

        // jarid.prince@dbca.wa.gov.au
        const link = document.createElement("a");
        link.href = mailToLink;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      //  Close the modal
      if (onClose) {
        onClose();
      }
    },
    // Error handling based on API - file - declared interface
    onError: (error: AxiosError) => {
      console.log(error);
      let errorMessage = "Could not get emails"; // Default error message

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
          title: "Could not get emails",
          description: errorMessage,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmit = async (formData: IProjectLeadsEmail) => {
    await projectLeadEmailMutation.mutateAsync(formData);
  };

  //   const { register, handleSubmit, watch, reset } =
  //     useForm<IProjectLeadsEmail>();

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex
      //   as={"form"} onSubmit={handleSubmit(onSubmit)}
      >
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Get Email of Project Leads?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Text mt={4}>
              Click 'Get Emails' to open your mail app and write a message to
              project leads. This will send to users who meet these conditions:
            </Text>
            <Box mt={4}>
              <UnorderedList>
                <ListItem>User is active</ListItem>
                <ListItem>
                  User is staff, with an @dbca.wa.gov.au email
                </ListItem>
                <ListItem>User is a project lead</ListItem>
                <ListItem>
                  Project led is in the "active", "suspended", or "update
                  requested" state
                </ListItem>
              </UnorderedList>
            </Box>

            {/* <FormControl my={2} mb={4} userSelect="none">
                  <InputGroup>
                    <Input
                      type="hidden"
                      {...register("userPk", { required: true, value: userPk })}
                      readOnly
                    />
                  </InputGroup>
                </FormControl> */}
            <Text mt={4}>
              To fetch users and proceed to your mail app, press "Send Emails".
            </Text>
            <Text mt={4} fontWeight={"bold"}>
              If the list is too long, your browser/mail client may not create
              the email. In which case, you should download the list and copy
              paste it into your mail client. Any project leads without a DBCA
              email will be shown in this list.
            </Text>
            <Checkbox
              mt={4}
              isChecked={shouldDownloadList}
              onChange={() => setShouldDownloadList((prev) => !prev)}
            >
              Also download the list of emails?
            </Checkbox>
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
                isLoading={projectLeadEmailMutation.isPending}
                onClick={() =>
                  onSubmit({
                    shouldDownloadList: shouldDownloadList,
                  })
                }
                ml={3}
              >
                Get Emails
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
