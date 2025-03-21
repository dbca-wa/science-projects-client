// Modal for handling Concept Plan Actions

import {
  Button,
  Text,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ToastId,
  useColorMode,
  useToast,
  Box,
  Checkbox,
  Grid,
  Center,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  IApproveDocument,
  IBusinessArea,
  IProjectData,
  IUserMe,
} from "../../../types";
import { handleDocumentAction } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/tanstack/useFullUserByPk";
import { useDirectorateMembers } from "../../../lib/hooks/tanstack/useDirectorateMembers";
import { useDivisionDirectorateMembers } from "@/lib/hooks/tanstack/useDivisionDirectorateMembers";

interface Props {
  userData: IUserMe;
  directorateData: any;
  isDirectorateLoading: boolean;
  action: "approve" | "recall" | "send_back" | "reopen";
  stage: number;
  documentPk: number;
  conceptPlanPk: number;
  projectData: IProjectData;
  baData: IBusinessArea;
  isOpen: boolean;
  refetchData: () => void;
  onClose: () => void;
}

export const ConceptPlanActionModal = ({
  userData,
  stage,
  documentPk,
  directorateData,
  isDirectorateLoading,
  // conceptPlanPk,
  action,
  onClose,
  isOpen,
  projectData,
  baData,
  refetchData,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const { register, handleSubmit, reset } = useForm<IApproveDocument>();

  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const [shouldSendEmail, setShouldSendEmail] = useState(true);
  const { userData: baLead, userLoading: baLeadLoading } = useFullUserByPk(
    baData?.leader,
  );

  const sendEmail = async () => {
    if (!baLeadLoading && baLead !== undefined && baData !== undefined) {
      if (shouldSendEmail) {
        console.log(
          `Sending Email to ${baLead?.first_name} ${baLead?.last_name}`,
        );
      } else {
        console.log("No email sent");
      }
    }
  };

  const approveConceptPlanMutation = useMutation({
    mutationFn: handleDocumentAction,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `${
          action === "approve"
            ? "Approving"
            : action === "recall"
              ? "Recalling"
              : "Sending Back"
        }`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Document ${
            action === "approve"
              ? "Approved"
              : action === "recall"
                ? "Recalled"
                : "Sent Back"
          }`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      reset();
      await refetchData();
      await sendEmail();

      onClose();

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["projects", projectData?.pk],
        });
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could Not ${
            action === "approve"
              ? "Approve"
              : action === "recall"
                ? "Recall"
                : "Send Back"
          } Concept Plan`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onApprove = (formData: IApproveDocument) => {
    console.log(formData);
    formData.shouldSendEmail = shouldSendEmail;
    approveConceptPlanMutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={"lg"}
      scrollBehavior="inside"
      // isCentered={true}
    >
      <ModalOverlay />
      <ModalContent
        color={colorMode === "light" ? "black" : "white"}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>
          {action === "approve"
            ? stage === 1
              ? "Submit"
              : "Approve"
            : action === "recall"
              ? "Recall"
              : action === "reopen"
                ? "Reopen"
                : "Send Back"}{" "}
          Document?
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody
          as="form"
          id="approval-form"
          onSubmit={handleSubmit(onApprove)}
        >
          {!baLead ? null : ( // || isDirectorateLoading || directorateData?.length < 1
            <>
              <Input
                type="hidden"
                {...register("stage", { required: true, value: stage })}
                readOnly
              />
              <Input
                type="hidden"
                {...register("action", { required: true, value: action })}
                readOnly
              />
              <Input
                type="hidden"
                {...register("documentPk", {
                  required: true,
                  value: documentPk,
                })}
                readOnly
              />
              {stage === 1 ? (
                <Box>
                  <Text fontWeight={"bold"}>Stage 1</Text>
                  <br />
                  <Text>
                    {action === "approve"
                      ? `In your capacity as Project Lead, would you like to submit this concept plan to the business area lead?`
                      : `In your capacity as Project Lead, would you like to ${action} this concept plan?`}
                  </Text>
                  <br />
                  <Text>
                    {action === "approve"
                      ? "This will send an email to the Business Area Lead for approval."
                      : "This will return the approval status from 'Granted' to 'Required' and send an email to the Business Area Lead letting them know the document has been recalled from your approval."}
                  </Text>

                  <Checkbox
                    isDisabled={!userData?.is_superuser}
                    mt={8}
                    isChecked={shouldSendEmail}
                    onChange={() => setShouldSendEmail(!shouldSendEmail)}
                  >
                    Send an email to the business area lead{" "}
                    {baLead && (
                      <>
                        <strong>
                          ({baLead.first_name} {baLead.last_name} -{" "}
                          {baLead.email})
                        </strong>{" "}
                      </>
                    )}
                    alerting them that you have{" "}
                    {action === "approve" ? "submitted" : "recalled"} this
                    document?
                  </Checkbox>
                </Box>
              ) : stage === 2 ? (
                <Box>
                  <Text fontWeight={"bold"}>Stage 2</Text>
                  <br />
                  <Text>
                    In your capacity as Business Area Lead, would you like to{" "}
                    {action === "send_back" ? "send back" : action} this concept
                    plan?
                  </Text>
                  <br />
                  {directorateData?.length < 1 ? null : (
                    <>
                      <Text>
                        {action === "approve"
                          ? "This will send an email to members of the Directorate for approval."
                          : action === "recall"
                            ? "This will return the approval status from 'Granted' to 'Required' and send an email to the Directorate letting them know that you recalled your approval."
                            : "This will return the approval status from 'Granted' to 'Required' and send an email to the Project Lead letting them know the document has been sent back for revision."}
                      </Text>

                      {(action === "recall" || action === "approve") && (
                        <Box
                          pt={4}
                          border={"1px solid"}
                          borderColor={"gray.500"}
                          rounded={"2xl"}
                          p={4}
                          mt={4}
                        >
                          <Text fontWeight={"semibold"}>
                            Directorate Members
                          </Text>
                          <Grid pt={2} gridTemplateColumns={"repeat(2, 1fr)"}>
                            {!isDirectorateLoading &&
                              directorateData?.map((member, index) => (
                                <Center key={index}>
                                  <Box px={2} w={"100%"}>
                                    <Text>{`${member.name}`}</Text>
                                  </Box>
                                </Center>
                              ))}
                          </Grid>
                        </Box>
                      )}
                    </>
                  )}

                  <Checkbox
                    isDisabled={!userData?.is_superuser}
                    mt={directorateData?.length < 1 ? 0 : 8}
                    isChecked={shouldSendEmail}
                    onChange={() => setShouldSendEmail(!shouldSendEmail)}
                  >
                    Send emails to
                    {action === "send_back"
                      ? stage === 2
                        ? ` Project lead `
                        : ` Business Area Lead (${baLead?.first_name} ${baLead?.last_name}) `
                      : " members of the Directorate "}
                    alerting them that you have{" "}
                    {action === "approve"
                      ? "approved"
                      : action === "send_back"
                        ? "sent back"
                        : "reopened"}{" "}
                    this {action === "reopen" ? "project" : "document"}?{" "}
                  </Checkbox>
                </Box>
              ) : (
                <Box>
                  <Text fontWeight={"bold"}>Stage 3</Text>
                  <br />
                  <Text>
                    In your capacity as Directorate, would you like to {action}{" "}
                    this concept plan?
                  </Text>
                  <br />
                  <Text>
                    {action === "approve"
                      ? "This will provide final approval for this concept plan, creating a project plan."
                      : action === "recall"
                        ? "This will return the approval status from 'Granted' to 'Required'."
                        : "This will return the approval status from 'Granted' to 'Required' and send an email to the Business Area Lead letting them know the document has been sent back for revision."}
                  </Text>

                  {action === "send_back" && (
                    <>
                      <Box
                        pt={4}
                        border={"1px solid"}
                        borderColor={"gray.500"}
                        rounded={"2xl"}
                        p={4}
                        mt={4}
                      >
                        <Text
                          // px={1}
                          fontWeight={"semibold"}
                        >
                          Business Area Lead
                        </Text>
                        <Box pt={2}>
                          {baLead?.first_name} {baLead?.last_name}
                        </Box>
                      </Box>
                      <Checkbox
                        isDisabled={!userData?.is_superuser}
                        mt={8}
                        isChecked={shouldSendEmail}
                        onChange={() => setShouldSendEmail(!shouldSendEmail)}
                      >
                        Send an email to Business Area Lead alerting them that
                        you have sent this document back?
                      </Checkbox>
                    </>
                  )}
                </Box>
              )}
            </>
          )}
        </ModalBody>
        {!baLead ? (
          <Center p={4} flexDir={"column"}>
            <Text>No business area leader has been set for {baData.name}.</Text>
            <Text>
              Contact an admin to set the leader for this business area.
            </Text>
          </Center>
        ) : (
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>

            <Button
              form="approval-form"
              type="submit"
              isLoading={approveConceptPlanMutation.isPending}
              bg={colorMode === "dark" ? "green.500" : "green.400"}
              color={"white"}
              _hover={{
                bg: colorMode === "dark" ? "green.400" : "green.300",
              }}
            >
              {action === "approve"
                ? "Submit"
                : action === "recall"
                  ? "Recall"
                  : "Send Back"}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
