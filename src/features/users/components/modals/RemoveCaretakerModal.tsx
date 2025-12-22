// Delete User Modal - for removing users from the system all together. Admin only.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  MutationError,
  MutationSuccess,
  removeCaretaker,
} from "@/features/users/services/users.service";
import type { ICaretakerEntry, ICaretakerObject, ISimpleIdProp } from "@/shared/types";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";
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

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  caretakerObject: ICaretakerObject | null;
  refetch: () => void;
}

export const RemoveCaretakerModal = ({
  isOpen,
  onClose,
  caretakerObject,
  refetch,
}: IModalProps) => {
  const { colorMode } = useColorMode();
  const [isToastOpen, setIsToastOpen] = useState(false);
  console.log(caretakerObject);
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

  const removeCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    ISimpleIdProp
  >({
    // Start of mutation handling
    mutationFn: removeCaretaker,
    onMutate: () => {
      console.log("onMutate");
      toast.loading("Removing Caretaker...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Caretaker removed.`,
      });

      // Explicitly call refetch after invalidating queries
      queryClient
        .invalidateQueries({
          queryKey: ["caretakers"],
        })
        .then((r) =>
          queryClient.invalidateQueries({
            queryKey: ["myCaretakerStatus"],
          }),
        )
        .then((r) => refetch()) // Explicit call to refetch
        .then((r) => onClose());
    },

    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while removing a caretaker"; // Default error message

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

  const onSubmit = async (formData: ISimpleIdProp) => {
    // console.log(formData);
    await removeCaretakerMutation.mutateAsync({
      id: caretakerObject?.caretaker_obj_id
        ? caretakerObject.caretaker_obj_id
        : caretakerObject?.id,
    });
  };

  // const formattedStart = useFormattedDate(startDate);
  const formattedEnd = useFormattedDate(caretakerObject?.end_date);

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
          <DialogTitle>Remove Caretaker?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex justify-center">
                <p className="font-bold text-xl">
                  Are you sure you want to remove{" "}
                  {caretakerObject?.caretaker?.display_first_name}{" "}
                  {caretakerObject?.caretaker?.display_last_name} as caretaker?
                </p>
              </div>
              <p>
                They will immedediately lose permissions to act on the user's
                behalf.
              </p>
              <p>
                If you would still like to proceed, press "Remove Caretaker".
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
              disabled={removeCaretakerMutation.isPending}
              onClick={() =>
                onSubmit({
                  id:
                    caretakerObject?.id !== undefined
                      ? caretakerObject.id
                      : caretakerObject?.caretaker_obj_id,
                })
              }
            >
              {removeCaretakerMutation.isPending ? "Loading..." : "Remove Caretaker"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
