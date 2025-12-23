// Delete User Modal - for removing users from the system all together. Admin only.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type MutationError,
  type MutationSuccess,
  requestCaretaker,
} from "@/features/users/services/users.service";
import type { ICaretakerEntry } from "@/shared/types";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";
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
  userPk: number;
  caretakerPk: number;
  // startDate: Date | null;
  endDate: Date | null;
  reason: "leave" | "resignation" | "other" | null;
  notes: string | undefined;
  refetch: () => void;
}

export const CaretakerModeConfirmModal = ({
  isOpen,
  onClose,
  userPk,
  caretakerPk,
  // startDate,
  endDate,
  reason,
  notes,
  refetch,
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

  const setCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    ICaretakerEntry
  >({
    // Start of mutation handling
    mutationFn: requestCaretaker,
    onMutate: () => {
      toast.loading("Requesting caretaker...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Your request has been made.`,
      });
      queryClient
        .invalidateQueries({
          queryKey: ["pendingAdminTasks"],
        })
        .then(() => refetch())
        .then(() => onClose());
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while requesting a caretaker"; // Default error message

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

  const onSubmit = async (formData: ICaretakerEntry) => {
    console.log(formData);
    await setCaretakerMutation.mutateAsync({
      userPk: formData.userPk,
      caretakerPk: formData.caretakerPk,
      // startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      notes: formData.notes,
    });
  };

  // const formattedStart = useFormattedDate(startDate);
  const formattedEnd = useFormattedDate(endDate);

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
          <DialogTitle>Request Caretaker?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex justify-center">
                <p className="font-bold text-xl">
                  Are you sure you want to request a caretaker?
                </p>
              </div>
              <p>
                A request will be made to admins to set the selected user as
                caretaker for your projects:
              </p>
              <div>
                <ul className="list-disc list-inside space-y-1">
                  {/* <li>From {formattedStart.split("@")[0]}</li> */}
                  {formattedEnd !== "" && (
                    <li>Until {formattedEnd.split("@")[0]}</li>
                  )}
                  <li>
                    They will be able to perform actions on your behalf
                  </li>
                  <li>
                    If you return early, you can manually remove caretaker
                  </li>
                </ul>
              </div>
              <p>
                If you would still like to proceed, press "Request Caretaker".
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
              disabled={setCaretakerMutation.isPending}
              onClick={() =>
                onSubmit({
                  userPk: userPk,
                  caretakerPk: caretakerPk,
                  // startDate: startDate,
                  endDate: endDate,
                  reason: reason,
                  notes: notes,
                })
              }
            >
              {setCaretakerMutation.isPending ? "Loading..." : "Request Caretaker"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
