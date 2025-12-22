// Delete User Modal - for removing users from the system all together. Admin only.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { batchApproveProgressAndStudentReports } from "@/features/users/services/users.service";
import { AxiosError } from "axios";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchApproveModal = ({ isOpen, onClose }: IModalProps) => {
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

  const batchApproveMutation = useMutation({
    // Start of mutation handling
    mutationFn: batchApproveProgressAndStudentReports,
    onMutate: () => {
      toast.loading("Batch Approving Progress and Student Reports...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Docs awaiting final approval belonging to most recent financial year have been batch approved.`,
      });
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
      <DialogContent className={`max-w-lg ${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"}`}>
        <DialogHeader>
          <DialogTitle>Batch Approve For Latest Report?</DialogTitle>
        </DialogHeader>

        <div>
          <div className="text-center">
            <p className="font-bold text-xl">
              Are you sure you want to batch approve reports (with status
              "awaiting approval")?
            </p>
          </div>
          <p className="mt-4">
            Any progress reports and student reports which meet these
            conditions, will get final approval:
          </p>
          <div className="mt-4">
            <ul className="list-disc list-inside space-y-1">
              <li>Belongs to most recent annual report</li>
              <li>Is approved by Project Lead</li>
              <li>Is approved by Business Area Lead</li>
              <li>Is yet to be approved by Directorate</li>
              <li>
                Belongs to an active project with the status "awaiting
                approval"
              </li>
            </ul>
          </div>

          <p className="mt-4">
            If you would still like to proceed, press "Batch Approve".
          </p>
        </div>
        <DialogFooter>
          <div className="grid grid-cols-2 gap-4">
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
              Batch Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
