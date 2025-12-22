import {
  toggleProjectVisibilityOnStaffProfile,
  toggleStaffProfileVisibility,
} from "@/features/staff-profiles/services/staff-profiles.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
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

interface HideProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPk: number;
  projectPk: number;
  projectIsHiddenFromStaffProfile: boolean;
  refetch: () => void;
}

const HideProjectModal = ({
  isOpen,
  onClose,
  userPk,
  projectPk,
  projectIsHiddenFromStaffProfile,
  refetch,
}: HideProjectModalProps) => {
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
  const toggleVisibilityMutation = useMutation({
    // Start of mutation handling
    mutationFn: toggleProjectVisibilityOnStaffProfile,
    onMutate: () => {
      toast.loading("Changing Project Visibility...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `This project is now ${
          !projectIsHiddenFromStaffProfile ? "hidden" : "visible"
        } from your staff profile.`,
      });
      //  Close the modal
      queryClient.invalidateQueries({
        queryKey: ["hiddenProjects", userPk],
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
      let errorMessage = "An error occurred while setting project visibility"; // Default error message

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

  const onSubmit = async ({
    userPk,
    projectPk,
  }: {
    userPk: number;
    projectPk: number;
  }) => {
    await toggleVisibilityMutation.mutateAsync({
      userPk,
      projectPk,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleToastClose}>
      <DialogContent className={`max-w-lg ${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"}`}>
        <DialogHeader>
          <DialogTitle>
            {!projectIsHiddenFromStaffProfile ? "Hide" : "Show"} Project From
            Staff Profile
          </DialogTitle>
        </DialogHeader>

        <div>
          <p className="font-bold text-xl">
            Are you sure you want to{" "}
            {!projectIsHiddenFromStaffProfile
              ? "hide this project from your staff profile"
              : "show this project on your staff profile"}
            ?
          </p>
          <p className="mt-4">
            This project{" "}
            {!projectIsHiddenFromStaffProfile ? " will no longer " : " will "}
            appear on your projects tab in the science profiles public
            directory. You can change this setting at any time.
          </p>

          <p className="mt-4">
            If you would still like to proceed, press "
            {!projectIsHiddenFromStaffProfile ? "Hide" : "Show"}".
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
              disabled={toggleVisibilityMutation.isPending}
              onClick={() =>
                onSubmit({
                  userPk,
                  projectPk,
                })
              }
            >
              {!projectIsHiddenFromStaffProfile ? "Hide" : "Show"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HideProjectModal;
