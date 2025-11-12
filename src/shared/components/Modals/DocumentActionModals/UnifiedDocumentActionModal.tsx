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
  type ToastId,
  useColorMode,
  useToast,
  Box,
  Checkbox,
  Grid,
  Center,
  type UseToastOptions,
  Textarea,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  IApproveDocument,
  IBusinessArea,
  IProjectData,
  IUserMe,
} from "@/shared/types/index.d";
import { handleDocumentAction } from "@/shared/lib/api";
import { useFullUserByPk } from "@/shared/hooks/tanstack/useFullUserByPk";
import EmailFeedbackRTE from "./EmailFeedbackRTE";

export type DocumentType =
  | "concept"
  | "projectplan"
  | "progressreport"
  | "studentreport"
  | "projectclosure";
export type ActionType = "approve" | "recall" | "send_back" | "reopen";

interface UnifiedDocumentActionModalProps {
  userData: IUserMe;
  action: ActionType;
  stage: number;
  documentPk: number;
  documentType: DocumentType;
  projectData: IProjectData;
  baData: IBusinessArea;
  isOpen: boolean;
  refetchData?: () => void;
  callSameData?: () => void; // Alternative refresh function used in some components
  onClose: () => void;
  directorateData: any;
  isDirectorateLoading: boolean;
}

export const UnifiedDocumentActionModal = ({
  userData,
  stage,
  documentPk,
  documentType,
  action,
  onClose,
  isOpen,
  projectData,
  baData,
  refetchData,
  callSameData,
  directorateData,
  isDirectorateLoading,
}: UnifiedDocumentActionModalProps) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const { register, handleSubmit, reset } = useForm<IApproveDocument>();

  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const [shouldSendEmail, setShouldSendEmail] = useState(true);
  const [feedbackHtml, setFeedbackHtml] = useState("");
  const [feedbackIsEmpty, setFeedbackIsEmpty] = useState(true);
  const [feedbackLimitExceeded, setFeedbackLimitExceeded] = useState(false);

  const { userData: baLead, userLoading: baLeadLoading } = useFullUserByPk(
    baData?.leader,
  );

  // Get proper document type name for display
  const getDocumentTypeName = () => {
    switch (documentType) {
      case "concept":
        return "Concept Plan";
      case "projectplan":
        return "Project Plan";
      case "progressreport":
        return "Progress Report";
      case "studentreport":
        return "Student Report";
      case "projectclosure":
        return "Project Closure";
      default:
        return "Document";
    }
  };

  const documentTypeName = getDocumentTypeName();

  // Get description of what happens on approval (stage 3)
  const getFinalApprovalDescription = () => {
    switch (documentType) {
      case "concept":
        return "This will provide final approval for this concept plan, creating a project plan.";
      case "projectplan":
        return "This will provide final approval for this project plan, enabling creation of progress reports.";
      case "progressreport":
        return "This will provide final approval for this progress report, adding it to the projects in the Annual Report.";
      case "studentreport":
        return "This will provide final approval for this student report, adding it to the Annual Report.";
      case "projectclosure":
        return "This will provide final approval for this project closure, closing the project.";
      default:
        return "This will provide final approval for this document.";
    }
  };

  const documentActionMutation = useMutation({
    mutationFn: handleDocumentAction,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `${
          action === "approve"
            ? "Approving"
            : action === "recall"
              ? "Recalling"
              : action === "reopen"
                ? "Reopening"
                : "Sending Back"
        }`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `${documentTypeName} ${
            action === "approve"
              ? "Approved"
              : action === "recall"
                ? "Recalled"
                : action === "reopen"
                  ? "Reopened"
                  : "Sent Back"
          }`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      reset();

      // Call the appropriate refresh function
      if (refetchData) await refetchData();
      if (callSameData) callSameData();

      onClose();

      // Invalidate project query to refresh data
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["projects", projectData?.pk],
        });
      }, 350);
    },
    onError: (error) => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: `Could Not ${
            action === "approve"
              ? "Approve"
              : action === "recall"
                ? "Recall"
                : action === "reopen"
                  ? "Reopen"
                  : "Send Back"
          } ${documentTypeName}`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmit = (formData: IApproveDocument) => {
    // Update form data with checkbox state and feedback
    formData.shouldSendEmail = shouldSendEmail;

    // Only Add comment if sending email and there's feedback to send
    if (
      shouldSendEmail &&
      !feedbackIsEmpty &&
      feedbackHtml.trim() &&
      (action === "send_back" || action === "recall")
    ) {
      formData.feedbackHTML = feedbackHtml;
    }

    documentActionMutation.mutate(formData);
  };

  const getActionButtonText = () => {
    if (action === "approve") {
      return stage === 1 ? "Submit" : "Approve";
    } else if (action === "recall") {
      return "Recall";
    } else if (action === "reopen") {
      return "Reopen";
    } else {
      return "Send Back";
    }
  };

  const showFeedbackField =
    (action === "send_back" || action === "recall") && shouldSendEmail;

  // Get appropriate modal header text
  const getModalHeaderText = () => {
    const actionText = getActionButtonText();
    const documentText = action === "reopen" ? "Project" : "Document";
    return `${actionText} ${documentText}?`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent
        color={colorMode === "dark" ? "gray.400" : null}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalHeader>{getModalHeaderText()}</ModalHeader>
        <ModalCloseButton />

        <ModalBody
          as="form"
          id="approval-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {!baLead ? null : (
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
                      ? `In your capacity as Project Lead, would you like to submit this ${documentTypeName.toLowerCase()} to the business area lead?`
                      : `In your capacity as Project Lead, would you like to ${action} this ${documentTypeName.toLowerCase()}?`}
                  </Text>
                  <br />
                  <Text>
                    {action === "approve"
                      ? "This will send an email to the Business Area Lead for approval."
                      : action === "reopen"
                        ? "This will delete the project closure document and set the status of the project to 'update requested'."
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
                    {action === "approve"
                      ? "submitted "
                      : action === "reopen"
                        ? "reopened "
                        : "recalled "}
                    this {action === "reopen" ? "project" : "document"}?
                  </Checkbox>

                  {showFeedbackField && (
                    <Box mt={4}>
                      <Text mb={2}>Add comment (optional):</Text>

                      <EmailFeedbackRTE
                        onChange={(fcd) => {
                          setFeedbackHtml(fcd.feedbackHtml);
                          setFeedbackIsEmpty(fcd.isEmpty);
                          setFeedbackLimitExceeded(fcd.exceedsLimit);
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : stage === 2 ? (
                <Box>
                  <Text fontWeight={"bold"}>Stage 2</Text>
                  <br />
                  <Text>
                    In your capacity as Business Area Lead, would you like to{" "}
                    {action === "send_back" ? "send back" : action} this{" "}
                    {documentTypeName.toLowerCase()}?
                  </Text>
                  <br />
                  {directorateData?.length < 1 ? null : (
                    <>
                      <Text>
                        {action === "approve"
                          ? "This will send an email to members of the Directorate for approval."
                          : action === "recall"
                            ? "This will return the approval status from 'Granted' to 'Required' and send an email to the Directorate letting them know that you recalled your approval."
                            : action === "reopen"
                              ? "This will delete the project closure document and set the status of the project to 'update requested'."
                              : "This will return the approval status from 'Granted' to 'Required' and send an email to the Project Lead letting them know the document has been sent back for revision."}
                      </Text>

                      {(action === "recall" || action === "approve") &&
                        stage === 2 && (
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
                        : action === "reopen"
                          ? "reopened"
                          : "recalled"}{" "}
                    this {action === "reopen" ? "project" : "document"}?
                  </Checkbox>

                  {showFeedbackField && (
                    <Box mt={4}>
                      <Text mb={2}>Add comment (optional):</Text>
                      <EmailFeedbackRTE
                        onChange={(fcd) => {
                          setFeedbackHtml(fcd.feedbackHtml);
                          setFeedbackIsEmpty(fcd.isEmpty);
                          setFeedbackLimitExceeded(fcd.exceedsLimit);
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  <Text fontWeight={"bold"}>Stage 3</Text>
                  <br />
                  <Text>
                    In your capacity as Directorate, would you like to{" "}
                    {action === "send_back" ? "send back" : action} this{" "}
                    {documentTypeName.toLowerCase()}?
                  </Text>
                  <br />
                  <Text>
                    {action === "approve"
                      ? getFinalApprovalDescription()
                      : action === "recall"
                        ? documentType === "projectclosure"
                          ? "This will return the directorate approval status from 'Granted' to 'Required'. The project will also be reopened."
                          : "This will return the approval status from 'Granted' to 'Required'."
                        : action === "reopen"
                          ? "This will delete the project closure document and set the status of the project to 'update requested'."
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
                        <Text fontWeight={"semibold"}>Business Area Lead</Text>
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

                      {showFeedbackField && (
                        <Box mt={4}>
                          <Text mb={2}>Add comment (optional):</Text>
                          <EmailFeedbackRTE
                            onChange={(fcd) => {
                              setFeedbackHtml(fcd.feedbackHtml);
                              setFeedbackIsEmpty(fcd.isEmpty);
                              setFeedbackLimitExceeded(fcd.exceedsLimit);
                            }}
                          />
                        </Box>
                      )}
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
              isLoading={documentActionMutation.isPending}
              disabled={feedbackLimitExceeded}
              bg={colorMode === "dark" ? "green.500" : "green.400"}
              color={"white"}
              _hover={{
                bg: colorMode === "dark" ? "green.400" : "green.300",
              }}
            >
              {getActionButtonText()}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
