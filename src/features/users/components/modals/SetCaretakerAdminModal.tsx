// Delete User Modal - for removing users from the system all together. Admin only.

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  type AdminSwitchVar,
  type MutationError,
  type MutationSuccess,
  adminSetCaretaker,
  deleteUserAdmin,
  requestCaretaker,
} from "@/features/users/services/users.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserSearchContext } from "@/features/users/hooks/useUserSearch";
import type { ICaretakerEntry, IUserMe } from "@/shared/types";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";
import { ShadcnDatePicker } from "@/features/users/components/account/ShadcnDatePicker";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import useCaretakingChain from "@/features/users/hooks/useCaretakingChain";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
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
  refetch: () => void;
  userIsSuper: boolean;
  userPk: string | number;
  userData: IUserMe;
}

export const SetCaretakerAdminModal = ({
  isOpen,
  onClose,
  userIsSuper,
  userPk,
  refetch,
  userData,
}: IModalProps) => {
  const [caretakerPk, setCaretakerPk] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reason, setReason] = useState<
    "leave" | "resignation" | "other" | null
  >(null);
  const [notes, setNotes] = useState<string | undefined>(undefined);

  // useEffect(() => {
  //   console.log({
  //     userPk,
  //     caretakerPk,
  //     endDate,
  //     reason,
  //     notes,
  //   });
  // }, [userPk, caretakerPk, endDate, reason, notes]);

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

  const { reFetch } = useUserSearchContext();

  const adminSetCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    ICaretakerEntry
  >({
    // Start of mutation handling
    mutationFn: adminSetCaretaker,
    onMutate: () => {
      toast.loading("Setting caretaker...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Caretaker set.`,
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
      let errorMessage = "An error occurred while setting a caretaker"; // Default error message

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
    await adminSetCaretakerMutation.mutateAsync({
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

  const ignoreArray = useCaretakingChain(userData);

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
          <DialogTitle>Set a Caretaker?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex justify-center mb-8 mt-2">
                <p className="text-lg">
                  Are you sure you want to set a caretaker?
                </p>
              </div>
              <div className="space-y-4">
                <div className="my-2 mb-4 select-none">
                  <Label>Reason</Label>
                  <Select
                    disabled={false}
                    onValueChange={(value) =>
                      setReason(
                        value as
                          | "leave"
                          | "resignation"
                          | "other"
                          | null,
                      )
                    }
                    value={reason ?? undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the reason for their absence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leave">On Leave</SelectItem>
                      <SelectItem value="resignation">Leaving the Department</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(reason === "other" ||
                  reason === "resignation" ||
                  reason === "leave") && (
                  <>
                    {reason === "other" && (
                      <div className="my-2 mb-4 select-none">
                        <Label>Notes</Label>
                        <Textarea
                          placeholder="Enter the reason"
                          onChange={(e) => setNotes(e.target.value)}
                          value={notes}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Please provide a reason for this user's absence.
                        </p>
                      </div>
                    )}

                    {reason !== "resignation" && (
                      <div className="flex flex-row gap-4">
                        <div className="my-2 mb-4 select-none flex-1">
                          <Label>End Date</Label>
                          <div className="flex flex-col">
                            <ShadcnDatePicker
                              placeholder={"Enter end date"}
                              date={endDate}
                              setDate={setEndDate}
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              When will the user return to the office?
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <UserSearchDropdown
                      isRequired={false}
                      onlyInternal
                      setUserFunction={setCaretakerPk}
                      label={"Caretaker"}
                      placeholder={"Enter a caretaker"}
                      helperText={
                        "Who will look after their projects while they are gone?"
                      }
                      ignoreArray={ignoreArray}
                    />
                  </>
                )}
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
              disabled={
                !userPk ||
                !caretakerPk ||
                (reason !== "resignation" && !endDate) ||
                !reason ||
                (reason === "other" && !notes) ||
                adminSetCaretakerMutation.isPending
              }
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-green-500 hover:bg-green-400" 
                  : "bg-green-600 hover:bg-green-500"
              }`}
              onClick={() =>
                onSubmit({
                  userPk: userPk as number,
                  caretakerPk: caretakerPk,
                  // startDate: startDate,
                  endDate: endDate,
                  reason: reason,
                  notes: notes,
                })
              }
            >
              {adminSetCaretakerMutation.isPending ? "Loading..." : "Set Caretaker"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
