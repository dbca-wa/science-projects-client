// Delete User Modal - for removing users from the system all together. Admin only.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useColorMode } from "@/shared/utils/theme.utils";
import { batchApproveOLDProgressAndStudentReports } from "@/features/users/services/users.service";
import type { MutationSuccess, MutationError } from "@/shared/services/api";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchApproveOldModal = ({ isOpen, onClose }: IModalProps) => {
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

  const queryClient = useQueryClient();

  const batchApproveMutation = useMutation<MutationSuccess, MutationError>({
    // Start of mutation handling
    mutationFn: batchApproveOLDProgressAndStudentReports,
    onMutate: () => {
      toast.loading("Batch Approving Old Progress and Student Reports...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Docs awaiting final approval belonging to previous reports have been approved.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["latestUnapprovedProgressReports"],
      });
      queryClient.invalidateQueries({ queryKey: ["latestProgressReports"] });
      queryClient.invalidateQueries({ queryKey: ["latestStudentReports"] });

      //  Close the modal
      if (onClose) {
        onClose();
      }
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while batch approving old reports"; // Default error message

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

      toast.error("Update failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async () => {
    await batchApproveMutation.mutateAsync();
    onClose();
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
          <DialogTitle>Batch Approve Older Reports?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex justify-center">
                <p className="font-bold text-xl">
                  Are you sure you want to batch approve older reports?
                </p>
              </div>
              <p>
                Any progress reports and student reports which meet these
                conditions, will get project lead, business area lead and final
                approval:
              </p>
              <div>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Belongs to any annual report which is not the most recent one
                  </li>
                  <li>Belongs to an active project</li>
                  <li>Is yet to be approved by Directorate</li>
                </ul>
              </div>
              <p>
                If you would still like to proceed, press "Batch Approve".
              </p>
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
                  ? "bg-red-500 hover:bg-red-400" 
                  : "bg-red-600 hover:bg-red-500"
              }`}
              disabled={batchApproveMutation.isPending}
              onClick={() => onSubmit()}
            >
              {batchApproveMutation.isPending ? "Loading..." : "Batch Approve"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
