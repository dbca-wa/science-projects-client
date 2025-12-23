// Delete User Modal - for removing users from the system all together. Admin only.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  becomeCaretaker,
  type MutationError,
  type MutationSuccess,
  removeCaretaker,
} from "@/features/users/services/users.service";
import {
  type ICaretakerEntry,
  type ICaretakerObject,
  type ISimpleIdProp,
  type IUserData,
} from "@/shared/types";
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
  myPk: number;
  onClose: () => void;
  user: IUserData;
  refetch: () => void;
}

export const BecomeCaretakerModal = ({
  isOpen,
  myPk,
  user,
  onClose,
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

  const becomeCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    ICaretakerEntry
  >({
    // Start of mutation handling
    mutationFn: becomeCaretaker,
    onMutate: () => {
      toast.loading("Requesting Caretaker...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Request made.`,
      });
      queryClient
        .invalidateQueries({
          queryKey: ["caretakers"],
        })
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: ["pendingAdminTasks"],
          }),
        )
        .then(() => refetch())
        .then(() => onClose());
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage =
        "An error occurred while requesting to become caretaker"; // Default error message

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
    // console.log(formData);
    await becomeCaretakerMutation.mutateAsync({
      userPk: user?.pk,
      caretakerPk: myPk,
      reason: "other",
      endDate: null,
    });
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
          <DialogTitle>Become Caretaker?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex justify-center">
                <p className="font-bold text-xl">
                  Are you sure you want to become {user?.display_first_name}{" "}
                  {user?.display_last_name}&apos;s caretaker?
                </p>
              </div>
              <p>
                A request will be made to admins to approve your request.
              </p>
              <p>
                If you would still like to proceed, press "Become Caretaker".
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
                  ? "bg-green-500 hover:bg-green-400" 
                  : "bg-green-600 hover:bg-green-500"
              }`}
              disabled={becomeCaretakerMutation.isPending}
              onClick={() => onSubmit()}
            >
              {becomeCaretakerMutation.isPending ? "Loading..." : "Become Caretaker"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
