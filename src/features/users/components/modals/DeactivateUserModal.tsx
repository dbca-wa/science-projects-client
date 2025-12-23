// WIP: Delete User Modal - for removing users from the system all together. Admin only.

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AdminSwitchVar,
  MutationError,
  MutationSuccess,
  deactivateUserAdmin,
} from "@/features/users/services/users.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserSearchContext } from "@/features/users/hooks/useUserSearch";
import type { IUserData } from "@/shared/types";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
  userIsSuper: boolean;
  user: IUserData;
}

export const DeactivateUserModal = ({
  isOpen,
  onClose,
  userIsSuper,
  user,
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

  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm<AdminSwitchVar>();

  const deactivationMutation = useMutation<
    MutationSuccess,
    MutationError,
    AdminSwitchVar
  >({
    // Start of mutation handling
    mutationFn: deactivateUserAdmin,
    onMutate: () => {
      toast.loading("Deactivating Account...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: (data) => {
      console.log(data);

      toast.success("Success", {
        description: `User Deactivated`,
      });
      //  Close the modal
      if (onClose) {
        onClose();
      }
      queryClient.invalidateQueries({ queryKey: ["users", user?.pk] });
      reFetch();
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while deactivating"; // Default error message

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

      toast.error("Deactivation failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async ({ userPk }: AdminSwitchVar) => {
    await deactivationMutation.mutateAsync({ userPk });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleToastClose}>
      <DialogContent 
        className={`max-w-sm ${
          colorMode === "dark" 
            ? "bg-gray-800 text-gray-400 border-gray-700" 
            : "bg-white text-gray-900 border-gray-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle>
            {user?.is_active ? "Deactivate" : "Reactivate"} User?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex justify-center">
                <p className="font-bold text-xl">
                  Are you sure you want to{" "}
                  {user?.is_active ? "deactivate" : "reactivate"} this user?
                </p>
              </div>
              <p>
                They will{" "}
                {user?.is_active
                  ? "lose access to SPMS but their data will be retained"
                  : "regain access to SPMS"}
                .
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mt-0 mb-4 select-none">
                  <Input
                    type="hidden"
                    {...register("userPk", { required: true, value: user?.pk })}
                    readOnly
                  />
                </div>
              </form>
              <div className="mt-6">
                <p>If this is okay, please proceed.</p>
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
              disabled={userIsSuper || deactivationMutation.isPending}
              type="submit"
              className={`text-white ${
                colorMode === "light"
                  ? user?.is_active
                    ? "bg-red-500 hover:bg-red-400"
                    : "bg-green-500 hover:bg-green-400"
                  : user?.is_active
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-green-500 hover:bg-green-400"
              }`}
              onClick={handleSubmit(onSubmit)}
            >
              {deactivationMutation.isPending 
                ? "Loading..." 
                : (user?.is_active ? "Deactivate" : "Reactivate")
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
