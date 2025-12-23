// Delete User Modal - for removing users from the system all together. Admin only.

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  type AdminSwitchVar,
  type MutationError,
  type MutationSuccess,
  deleteUserAdmin,
} from "@/features/users/services/users.service";
import { useUserSearchContext } from "@/features/users/hooks/useUserSearch";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIsSuper: boolean;
  userPk: string | number;
}

export const DeleteUserModal = ({
  isOpen,
  onClose,
  userIsSuper,
  userPk,
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

  const { reFetch } = useUserSearchContext();

  const {
    register,
    handleSubmit,
  } = useForm<AdminSwitchVar>();

  const deletionMutation = useMutation<
    MutationSuccess,
    MutationError,
    AdminSwitchVar
  >({
    // Start of mutation handling
    mutationFn: deleteUserAdmin,
    onMutate: () => {
      toast.loading("Deleting...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: "User Deleted",
      });
      //  Close the modal
      onClose?.();

      reFetch();
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while updating"; // Default error message

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

  const onSubmit = async ({ userPk }: AdminSwitchVar) => {
    await deletionMutation.mutateAsync({ userPk });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleToastClose}>
      <DialogContent className={`sm:max-w-md ${colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-white"}`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Delete User?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <p className="font-bold text-xl">
                Are you sure you want to delete this user?
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <ul className="list-disc list-inside space-y-1">
                <li>They will be removed from all projects</li>
                <li>
                  Any projects they were leading will require a new project lead
                </li>
                <li>Their comments will be deleted</li>
              </ul>
            </div>
            <div className="my-2 mb-4">
              <Input
                type="hidden"
                {...register("userPk", { required: true, value: userPk })}
                readOnly
              />
            </div>
            <div className="flex justify-center mt-6 p-5">
              <p>
                If this is okay or this is a duplicate account, please proceed.
              </p>
            </div>
          </div>
          
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
                disabled={userIsSuper || deletionMutation.isPending}
                type="submit"
              >
                {deletionMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
