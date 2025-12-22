// Delete User Modal - for removing users from the system all together. Admin only.

import type { IProjectLeadsEmail } from "@/shared/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getEmailProjectList } from "@/features/users/services/users.service";
import { AxiosError } from "axios";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useColorMode } from "@/shared/utils/theme.utils";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectLeadEmailModal = ({ isOpen, onClose }: IModalProps) => {
  const { colorMode } = useColorMode();
  const [isToastOpen, setIsToastOpen] = useState(false);

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    setIsToastOpen(false);
    onClose();
  };

  const [shouldDownloadList, setShouldDownloadList] = useState(false);

  const projectLeadEmailMutation = useMutation({
    // Start of mutation handling
    mutationFn: getEmailProjectList,
    onMutate: () => {
      toast.loading("Getting Email List...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: (resdata) => {
      toast.success("Success", {
        description: `Opening Mail${
          shouldDownloadList === true ? " and downloading file" : ""
        }.`,
      });

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
        const mailToLink = `mailto:${emailString}?subject=SPMS:`;
        const link = document.createElement("a");
        link.href = mailToLink;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      onClose?.();
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

      toast.error("Could not get emails", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async (formData: IProjectLeadsEmail) => {
    await projectLeadEmailMutation.mutateAsync(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleToastClose}>
      <DialogContent 
        className={`max-w-lg ${
          colorMode === "dark" 
            ? "bg-gray-800 text-gray-400 border-gray-700" 
            : "bg-white text-gray-900 border-gray-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle>Get Email of Project Leads?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <p>
                Click 'Get Emails' to open your mail app and write a message to
                project leads. This will send to users who meet these conditions:
              </p>
              <div>
                <ul className="list-disc list-inside space-y-1">
                  <li>User is active</li>
                  <li>
                    User is staff, with an @dbca.wa.gov.au email
                  </li>
                  <li>User is a project lead</li>
                  <li>
                    Project led is in the "active", "suspended", or "update
                    requested" state
                  </li>
                </ul>
              </div>

              <p>
                To fetch users and proceed to your mail app, press "Send Emails".
              </p>
              <p className="font-bold">
                If the list is too long, your browser/mail client may not create
                the email. In which case, you should download the list and copy
                paste it into your mail client. Any project leads without a DBCA
                email will be shown in this list.
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="download-list"
                  checked={shouldDownloadList}
                  onCheckedChange={(checked) => setShouldDownloadList(!!checked)}
                />
                <label htmlFor="download-list" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Also download the list of emails?
                </label>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-green-500 hover:bg-green-400" 
                  : "bg-green-600 hover:bg-green-500"
              }`}
              disabled={projectLeadEmailMutation.isPending}
              onClick={() =>
                onSubmit({
                  shouldDownloadList: shouldDownloadList,
                })
              }
            >
              {projectLeadEmailMutation.isPending ? "Loading..." : "Get Emails"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
