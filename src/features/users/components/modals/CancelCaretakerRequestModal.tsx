// Delete User Modal - for removing users from the system all together. Admin only.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type MutationError,
  type MutationSuccess,
  cancelCaretakerRequest,
} from "@/features/users/services/users.service";
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

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  refresh: () => void;
  taskPk: number;
}

export const CancelCaretakerRequestModal = ({
  isOpen,
  onClose,
  refresh,
  taskPk,
}: IModalProps) => {
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

  const cancelCaretakerRequestMutation = useMutation<
    MutationSuccess,
    MutationError,
    { taskPk: number }
  >({
    // Start of mutation handling
    mutationFn: cancelCaretakerRequest,
    onMutate: () => {
      toast.loading("Cancelling request...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Your request has been cancelled.`,
      });
      queryClient
        .invalidateQueries({
          queryKey: ["pendingAdminTasks"],
        })
        .then(() => refresh())
        .then(() => onClose());
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while cancelling your request"; // Default error message

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

  const onSubmit = async (formData: { taskPk: number }) => {
    console.log(formData);
    await cancelCaretakerRequestMutation.mutateAsync({
      taskPk: formData.taskPk,
    });
  };
  
  useEffect(() => {
    console.log({ taskPk: taskPk });
  }, [taskPk]);

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
          <DialogTitle>Cancel Request?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex justify-center">
                <p className="font-bold text-xl">
                  Are you sure you want to cancel your caretaker request?
                </p>
              </div>
              <p>Your request will be removed from the system.</p>
              <p>
                If you would still like to proceed, press "Cancel Request".
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
              disabled={cancelCaretakerRequestMutation.isPending}
              onClick={() =>
                onSubmit({
                  taskPk,
                })
              }
            >
              {cancelCaretakerRequestMutation.isPending ? "Loading..." : "Cancel Request"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
