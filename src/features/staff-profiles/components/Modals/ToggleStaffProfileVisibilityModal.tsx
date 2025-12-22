import { toggleStaffProfileVisibility } from "@/features/staff-profiles/services/staff-profiles.service";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface IToggleStaffProfileVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffProfilePk: number;
  profileIsHidden: boolean;
  userPk: number;
  refetch: () => void;
}

const ToggleStaffProfileVisibilityModal = ({
  isOpen,
  onClose,
  staffProfilePk,
  profileIsHidden,
  userPk,
  refetch,
}: IToggleStaffProfileVisibilityModalProps) => {
  const queryClient = useQueryClient();
  const toggleVisibilityMutation = useMutation({
    // Start of mutation handling
    mutationFn: toggleStaffProfileVisibility,
    onMutate: () => {
      toast.loading("Changing Profile Visibility...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Your profile is now ${
          !profileIsHidden ? "hidden" : "visible"
        }.`,
      });
      //  Close the modal
      // queryClient.invalidateQueries({
      //   queryKey: ["latestUnapprovedProgressReports"],
      // });
      // invalidate that user profile
      queryClient.invalidateQueries({
        queryKey: ["staffProfile", staffProfilePk],
      });
      queryClient.invalidateQueries({
        queryKey: ["baseStaffProfile", userPk],
      });

      queryClient.invalidateQueries({ queryKey: ["me"] }).then(() => {
        refetch();
      });

      if (onClose) {
        onClose();
      }
    },
    // Error handling based on API - file - declared interface
    onError: (error: AxiosError) => {
      console.log(error);
      let errorMessage = "An error occurred while setting profile visibility"; // Default error message

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

  const onSubmit = async ({ staffProfilePk }: { staffProfilePk: number }) => {
    await toggleVisibilityMutation.mutateAsync({
      staffProfilePk,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {!profileIsHidden ? "Hide" : "Show"} Staff Profile
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {!profileIsHidden ? "hide" : "show"} your
            staff profile?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Your account {!profileIsHidden ? " will no longer " : " will "}
            appear in the science profiles public directory. You can change
            this setting at any time.
          </p>

          <p className="text-sm text-muted-foreground">
            If you would still like to proceed, press "
            {!profileIsHidden ? "Hide" : "Show"}".
          </p>
        </div>
        <DialogFooter>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={toggleVisibilityMutation.isPending}
              className="bg-red-500 hover:bg-red-400 dark:bg-red-600 dark:hover:bg-red-500 text-white"
              onClick={() =>
                onSubmit({
                  staffProfilePk,
                })
              }
            >
              {toggleVisibilityMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {!profileIsHidden ? "Hide" : "Show"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ToggleStaffProfileVisibilityModal;
