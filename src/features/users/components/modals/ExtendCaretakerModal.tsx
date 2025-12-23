// Delete User Modal - for removing users from the system all together. Admin only.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  extendCaretaker,
  type MutationError,
  type MutationSuccess,
  type IExtendCaretakerProps,
} from "@/features/users/services/users.service";
import type { ICaretakerEntry, ICaretakerObject, ISimpleIdProp } from "@/shared/types";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";
import { type FC } from "react";
import { ShadcnDatePicker } from "@/features/users/components/account/ShadcnDatePicker";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useColorMode } from "@/shared/utils/theme.utils";
import React from "react";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  caretakerObject: ICaretakerObject | null;
  refetch: () => void;
}

export const ExtendCaretakerModal = ({
  isOpen,
  onClose,
  caretakerObject,
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

  const extendCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    IExtendCaretakerProps
  >({
    // Start of mutation handling
    mutationFn: extendCaretaker,
    onMutate: () => {
      toast.loading("Extending Caretaker...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Caretaker extended.`,
      });
      queryClient
        .invalidateQueries({
          queryKey: ["caretakers"],
        })
        .then(() => refetch())
        .then(() => onClose());
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while extending a caretaker"; // Default error message

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

  // const formattedStart = useFormattedDate(startDate);
  const formattedEnd = useFormattedDate(caretakerObject?.end_date);

  const [newEndDate, setNewEndDate] = React.useState<Date | null>(
    caretakerObject?.end_date,
  );

  const [error, setError] = React.useState<string | null>(null);
  useEffect(() => {
    if (
      newEndDate &&
      caretakerObject?.end_date &&
      newEndDate <= new Date(caretakerObject.end_date)
    ) {
      console.log("Bad date");
      setError("The new end date must be after the current end date.");
    } else {
      setError(null);
    }
  }, [newEndDate, caretakerObject]);

  const onSubmit = async (formData: IExtendCaretakerProps) => {
    console.log(formData);
    await extendCaretakerMutation.mutateAsync({
      id: formData?.id,
      newEndDate: formData?.newEndDate,
      currentEndDate: formData?.currentEndDate,
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
          <DialogTitle>Extend Caretaker?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex justify-center">
                <p className="font-bold text-xl">
                  Are you sure you want to extend{" "}
                  {caretakerObject?.caretaker?.display_first_name}{" "}
                  {caretakerObject?.caretaker?.display_last_name} as caretaker?
                </p>
              </div>
              <p>
                The period they are currently assigned to ends on {formattedEnd}
              </p>

              <div className="flex flex-row gap-4 relative">
                <div className="my-2 mb-4 select-none flex-1">
                  <Label>New End Date</Label>
                  <div className="flex flex-col">
                    <ShadcnDatePicker
                      placeholder={"Enter end date"}
                      date={newEndDate}
                      setDate={(date) => {
                        setNewEndDate(date);
                      }}
                    />
                    <div className="mt-2">
                      {error ? (
                        <p
                          className={`text-sm ${
                            colorMode === "light" ? "text-red-600" : "text-red-400"
                          }`}
                        >
                          {error}
                        </p>
                      ) : (
                        <p
                          className={`text-sm ${
                            colorMode === "light" ? "text-gray-600" : "text-gray-400"
                          }`}
                        >
                          Set a date beyond the current end date.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
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
              disabled={extendCaretakerMutation.isPending || error !== null}
              onClick={() =>
                onSubmit({
                  id: caretakerObject?.id,
                  newEndDate: newEndDate,
                  currentEndDate: caretakerObject?.end_date,
                })
              }
            >
              {extendCaretakerMutation.isPending ? "Loading..." : "Extend Date"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
