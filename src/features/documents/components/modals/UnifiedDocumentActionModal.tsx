import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  type IApproveDocument,
  type IBusinessArea,
  type IProjectData,
  type IUserMe,
} from "@/shared/types";
import { handleDocumentAction } from "@/features/documents/services/documents.service";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import EmailFeedbackRTE from "./EmailFeedbackRTE";
import { cn } from "@/shared/utils";

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
  const { register, handleSubmit, reset } = useForm<IApproveDocument>();

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
      toast.loading(`${
        action === "approve"
          ? "Approving"
          : action === "recall"
            ? "Recalling"
            : action === "reopen"
              ? "Reopening"
              : "Sending Back"
      }`);
    },
    onSuccess: async () => {
      toast.success(`${documentTypeName} ${
        action === "approve"
          ? "Approved"
          : action === "recall"
            ? "Recalled"
            : action === "reopen"
              ? "Reopened"
              : "Sent Back"
      }`);
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
      toast.error(`Could Not ${
        action === "approve"
          ? "Approve"
          : action === "recall"
            ? "Recall"
            : action === "reopen"
              ? "Reopen"
              : "Send Back"
      } ${documentTypeName}: ${error}`);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-lg max-h-[80vh] overflow-y-auto",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <DialogHeader>
          <DialogTitle>{getModalHeaderText()}</DialogTitle>
        </DialogHeader>

        <form
          id="approval-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
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
                <div>
                  <p className="font-bold">Stage 1</p>
                  <br />
                  <p>
                    {action === "approve"
                      ? `In your capacity as Project Lead, would you like to submit this ${documentTypeName.toLowerCase()} to the business area lead?`
                      : `In your capacity as Project Lead, would you like to ${action} this ${documentTypeName.toLowerCase()}?`}
                  </p>
                  <br />
                  <p>
                    {action === "approve"
                      ? "This will send an email to the Business Area Lead for approval."
                      : action === "reopen"
                        ? "This will delete the project closure document and set the status of the project to 'update requested'."
                        : "This will return the approval status from 'Granted' to 'Required' and send an email to the Business Area Lead letting them know the document has been recalled from your approval."}
                  </p>

                  <div className="flex items-start space-x-2 mt-8">
                    <Checkbox
                      disabled={!userData?.is_superuser}
                      checked={shouldSendEmail}
                      onCheckedChange={() => setShouldSendEmail(!shouldSendEmail)}
                      id="send-email"
                    />
                    <Label htmlFor="send-email" className="text-sm leading-relaxed">
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
                    </Label>
                  </div>

                  {showFeedbackField && (
                    <div className="mt-4">
                      <p className="mb-2">Add comment (optional):</p>

                      <EmailFeedbackRTE
                        onChange={(fcd) => {
                          setFeedbackHtml(fcd.feedbackHtml);
                          setFeedbackIsEmpty(fcd.isEmpty);
                          setFeedbackLimitExceeded(fcd.exceedsLimit);
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : stage === 2 ? (
                <div>
                  <p className="font-bold">Stage 2</p>
                  <br />
                  <p>
                    In your capacity as Business Area Lead, would you like to{" "}
                    {action === "send_back" ? "send back" : action} this{" "}
                    {documentTypeName.toLowerCase()}?
                  </p>
                  <br />
                  {directorateData?.length < 1 ? null : (
                    <>
                      <p>
                        {action === "approve"
                          ? "This will send an email to members of the Directorate for approval."
                          : action === "recall"
                            ? "This will return the approval status from 'Granted' to 'Required' and send an email to the Directorate letting them know that you recalled your approval."
                            : action === "reopen"
                              ? "This will delete the project closure document and set the status of the project to 'update requested'."
                              : "This will return the approval status from 'Granted' to 'Required' and send an email to the Project Lead letting them know the document has been sent back for revision."}
                      </p>

                      {(action === "recall" || action === "approve") &&
                        stage === 2 && (
                          <div className="pt-4 border border-gray-500 rounded-2xl p-4 mt-4">
                            <p className="font-semibold">
                              Directorate Members
                            </p>
                            <div className="pt-2 grid grid-cols-2 gap-2">
                              {!isDirectorateLoading &&
                                directorateData?.map((member, index) => (
                                  <div key={index} className="flex justify-center">
                                    <div className="px-2 w-full">
                                      <p>{`${member.name}`}</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </>
                  )}

                  <div className={cn(
                    "flex items-start space-x-2",
                    directorateData?.length < 1 ? "mt-0" : "mt-8"
                  )}>
                    <Checkbox
                      disabled={!userData?.is_superuser}
                      checked={shouldSendEmail}
                      onCheckedChange={() => setShouldSendEmail(!shouldSendEmail)}
                      id="send-email-stage2"
                    />
                    <Label htmlFor="send-email-stage2" className="text-sm leading-relaxed">
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
                    </Label>
                  </div>

                  {showFeedbackField && (
                    <div className="mt-4">
                      <p className="mb-2">Add comment (optional):</p>
                      <EmailFeedbackRTE
                        onChange={(fcd) => {
                          setFeedbackHtml(fcd.feedbackHtml);
                          setFeedbackIsEmpty(fcd.isEmpty);
                          setFeedbackLimitExceeded(fcd.exceedsLimit);
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-bold">Stage 3</p>
                  <br />
                  <p>
                    In your capacity as Directorate, would you like to{" "}
                    {action === "send_back" ? "send back" : action} this{" "}
                    {documentTypeName.toLowerCase()}?
                  </p>
                  <br />
                  <p>
                    {action === "approve"
                      ? getFinalApprovalDescription()
                      : action === "recall"
                        ? documentType === "projectclosure"
                          ? "This will return the directorate approval status from 'Granted' to 'Required'. The project will also be reopened."
                          : "This will return the approval status from 'Granted' to 'Required'."
                        : action === "reopen"
                          ? "This will delete the project closure document and set the status of the project to 'update requested'."
                          : "This will return the approval status from 'Granted' to 'Required' and send an email to the Business Area Lead letting them know the document has been sent back for revision."}
                  </p>

                  {action === "send_back" && (
                    <>
                      <div className="pt-4 border border-gray-500 rounded-2xl p-4 mt-4">
                        <p className="font-semibold">Business Area Lead</p>
                        <div className="pt-2">
                          {baLead?.first_name} {baLead?.last_name}
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 mt-8">
                        <Checkbox
                          disabled={!userData?.is_superuser}
                          checked={shouldSendEmail}
                          onCheckedChange={() => setShouldSendEmail(!shouldSendEmail)}
                          id="send-email-stage3"
                        />
                        <Label htmlFor="send-email-stage3" className="text-sm leading-relaxed">
                          Send an email to Business Area Lead alerting them that
                          you have sent this document back?
                        </Label>
                      </div>

                      {showFeedbackField && (
                        <div className="mt-4">
                          <p className="mb-2">Add comment (optional):</p>
                          <EmailFeedbackRTE
                            onChange={(fcd) => {
                              setFeedbackHtml(fcd.feedbackHtml);
                              setFeedbackIsEmpty(fcd.isEmpty);
                              setFeedbackLimitExceeded(fcd.exceedsLimit);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </form>
        {!baLead ? (
          <div className="p-4 flex flex-col items-center">
            <p>No business area leader has been set for {baData.name}.</p>
            <p>
              Contact an admin to set the leader for this business area.
            </p>
          </div>
        ) : (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              form="approval-form"
              type="submit"
              disabled={feedbackLimitExceeded}
              className={cn(
                "text-white",
                colorMode === "dark" 
                  ? "bg-green-500 hover:bg-green-400" 
                  : "bg-green-400 hover:bg-green-300"
              )}
            >
              {getActionButtonText()}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
