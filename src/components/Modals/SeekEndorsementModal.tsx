// Modal designed to send out emails seeking endorsement on the project plan where required
// Will send an email out to users marked as is_biometrician, is_herb_curator, or is_aec

import {
  Text,
  Image,
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
  UnorderedList,
  useToast,
  ToastId,
  useColorMode,
  Checkbox,
  Box,
  UseToastOptions,
} from "@chakra-ui/react";
import { ISpecialEndorsement, seekEndorsementAndSave } from "../../lib/api";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface Props {
  projectPlanPk: number;
  aecEndorsementRequired: boolean;
  aecEndorsementProvided: boolean;
  aecPDFFile: File;
  isOpen: boolean;
  onClose: () => void;
  refetchEndorsements: () => void;
}

export const SeekEndorsementModal = ({
  projectPlanPk,
  aecEndorsementRequired,
  aecEndorsementProvided,
  aecPDFFile,
  isOpen,
  onClose,
  refetchEndorsements,
}: Props) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const [shouldSendEmails, setShouldSendEmails] = useState(false);
  // Mutation, query client, onsubmit, and api function

  const seekEndorsementAndSaveMutation = useMutation({
    mutationFn: seekEndorsementAndSave,
    onMutate: () => {
      addToast({
        status: "loading",
        title: shouldSendEmails ? `Sending Emails` : `Updating Endorsements`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: shouldSendEmails
            ? `Emails Sent`
            : `Updated Endorsements`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        refetchEndorsements();
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: shouldSendEmails
            ? `Could Not Send Emails`
            : `Could Not Update Endorsements`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const seekEndorsementAndSaveFunc = (formData: ISpecialEndorsement) => {
    seekEndorsementAndSaveMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
      <ModalOverlay />
      <Flex>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Save Endorsements</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box mt={2}>
              <Text fontWeight={"semibold"} fontSize={"lg"}>
                {
                  // AEC not required or AEC required and given
                  aecEndorsementRequired === false ||
                  (aecEndorsementRequired === true &&
                    aecEndorsementProvided === true)
                    ? "As all required endorsements have been provided, no emails are necessary. You may still save."
                    : "Also send notifications?"
                }
              </Text>
              <Flex>
                <Checkbox
                  mt={4}
                  isChecked={shouldSendEmails}
                  onChange={() => setShouldSendEmails(!shouldSendEmails)}
                  isDisabled={
                    !aecEndorsementRequired ||
                    (aecEndorsementRequired && aecEndorsementProvided)
                  }
                >
                  Send Notifications
                </Checkbox>
              </Flex>
            </Box>
            {shouldSendEmails ? (
              <Center mt={8}>
                <UnorderedList>
                  {/* IF involves animals */}
                  {/* AND AEC endorsement required and not provided */}
                  {aecEndorsementRequired === true &&
                    aecEndorsementProvided === false && (
                      <ListItem color={"blue.400"}>
                        As Animal Ethics Committee endorsement is marked as
                        required but it has yet to be provided, an email will be
                        sent to Animal Ethics Committee approvers to approve or
                        reject this plan
                      </ListItem>
                    )}
                  {/* ELSE where AEC endorsement not required */}
                  {aecEndorsementRequired === false && (
                    <ListItem color={"gray.400"}>
                      As Animal Ethics Committee endorsement is marked as not
                      required, no email will be sent to Animal Ethics Committee
                      approvers
                    </ListItem>
                  )}
                </UnorderedList>
              </Center>
            ) : null}

            {aecPDFFile ? (
              <Box mt={8}>
                <Text color={"green.500"}>
                  You are uploading the following file to provide AEC approval:
                </Text>
                <Flex mt={6} minH={"40px"} alignItems="center">
                  <Box>
                    <Image maxH={"40px"} src={"/pdf2.png"} />
                  </Box>
                  <Box
                    ml={4}
                    display="flex"
                    flex={1}
                    minH={"40px"}
                    alignItems="center"
                  >
                    <Text
                      color={colorMode === "light" ? "gray.800" : "gray.300"}
                    >
                      {aecPDFFile.name}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>

              <Button
                color={"white"}
                background={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  background: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                isLoading={seekEndorsementAndSaveMutation.isPending}
                // type="submit"
                ml={3}
                isDisabled={
                  shouldSendEmails &&
                  (aecEndorsementRequired === false ||
                    (aecEndorsementRequired === true &&
                      aecEndorsementProvided === true))
                }
                onClick={() => {
                  if (aecPDFFile !== undefined) {
                    seekEndorsementAndSaveFunc({
                      aecEndorsementRequired,
                      aecEndorsementProvided,
                      aecPDFFile,
                      shouldSendEmails,
                      projectPlanPk,
                    });
                  } else {
                    seekEndorsementAndSaveFunc({
                      aecEndorsementRequired,
                      aecEndorsementProvided,
                      shouldSendEmails,
                      projectPlanPk,
                    });
                  }
                }}
              >
                {shouldSendEmails ? `Save and Send Emails` : `Save`}
              </Button>
            </Grid>
            {}
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
