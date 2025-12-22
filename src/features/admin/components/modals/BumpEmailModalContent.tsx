import { remedyExternallyLedProjects } from "@/features/admin/services/admin.service";
import { sendBumpEmails } from "@/features/documents/services/documents.service";
import type { BumpEmailData, IProjectData } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface BumpModalProps {
  documentsRequiringAction: BumpEmailData[];
  refreshDataFn: () => void;
  onClose: () => void;
  isSingleDocument?: boolean; // New prop to differentiate between single and bulk
}

export const BumpEmailModalContent = ({
  documentsRequiringAction,
  refreshDataFn,
  onClose,
  isSingleDocument = false,
}: BumpModalProps) => {
  const { colorMode } = useColorMode();

  const mutation = useMutation({
    mutationFn: sendBumpEmails,
    onMutate: () => {
      toast.loading(
        isSingleDocument
          ? "Sending bump email"
          : `Sending ${documentsRequiringAction.length} bump emails`
      );
    },
    onSuccess: async () => {
      toast.success("Success", {
        description: isSingleDocument
          ? "Bump email sent successfully"
          : `${documentsRequiringAction.length} bump emails sent successfully`,
      });
      refreshDataFn?.();
      onClose();
    },
    onError: (error: AxiosError) => {
      toast.error("Encountered an error", {
        description: error?.response?.data
          ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
          : "Error",
      });
    },
  });

  const onSend = () => {
    mutation.mutate({
      documentsRequiringAction: documentsRequiringAction,
    });
  };

  return (
    <>
      <div>
        <p className={`my-2 ${colorMode === "light" ? "text-blue-500" : "text-blue-300"}`}>
          {isSingleDocument
            ? "This will send an email to the person that needs to take action for this document. Are you sure?"
            : `This will send emails to ${documentsRequiringAction.length} people that need to take action. Are you sure?`}
        </p>

        {/* Show summary of documents being bumped */}
        {!isSingleDocument && documentsRequiringAction.length > 1 && (
          <div
            className={`my-3 p-3 rounded-md ${
              colorMode === "light" ? "bg-gray-50" : "bg-gray-700"
            }`}
          >
            <p className="text-sm font-medium mb-2">
              Documents to bump:
            </p>
            <ul className="space-y-1">
              {documentsRequiringAction.slice(0, 5).map((doc) => (
                <li key={doc.documentId} className="text-sm">
                  • {doc.projectTitle} ({doc.documentKind})
                </li>
              ))}
              {documentsRequiringAction.length > 5 && (
                <li className="text-sm text-gray-500">
                  ... and {documentsRequiringAction.length - 5} more
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex justify-end py-4">
          <div>
            <Button
              className="bg-green-500 text-white hover:bg-green-400"
              onClick={onSend}
              disabled={mutation.isPending}
            >
              {mutation.isPending 
                ? "Sending..." 
                : isSingleDocument
                  ? "Send Email"
                  : `Send ${documentsRequiringAction.length} Emails`
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
