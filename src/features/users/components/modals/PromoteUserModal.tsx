// Modal for promoting or demoting users

import { useState } from "react";
import { useUserSearchContext } from "@/features/users/hooks/useUserSearch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AdminSwitchVar,
  MutationError,
  MutationSuccess,
  switchAdmin,
} from "@/features/users/services/users.service";
import { useForm } from "react-hook-form";
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
  userPk: string | number;
  userIsSuper: boolean;
  userIsExternal: boolean;
}

export const PromoteUserModal = ({
  isOpen,
  onClose,
  userPk,
  userIsSuper,
  userIsExternal,
}: IModalProps) => {
  const { colorMode } = useColorMode();

  const handleToastClose = () => {
    onClose();
  };

  const { reFetch } = useUserSearchContext();

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const promotionMutation = useMutation<
    MutationSuccess,
    MutationError,
    AdminSwitchVar
  >({
    // Start of mutation handling
    mutationFn: switchAdmin,
    onMutate: () => {
      toast.loading("Updating membership...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: (data) => {
      console.log(data);

      queryClient.refetchQueries({ queryKey: [`user`, userPk] });
      queryClient.refetchQueries({ queryKey: [`personalInfo`, userPk] });
      queryClient.refetchQueries({ queryKey: [`membership`, userPk] });
      queryClient.refetchQueries({ queryKey: [`profile`, userPk] });
      reFetch();
      toast.success("Success", {
        description: `Information Updated`,
      });
      //  Close the modal
      if (onClose) {
        onClose();
      }
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
    await promotionMutation.mutateAsync({ userPk });
    onClose();
  };

  const { register, handleSubmit } = useForm<AdminSwitchVar>();

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
          <DialogTitle>
            {!userIsSuper ? "Promote User" : "Demote User"}?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              {userIsExternal ? (
                <p>
                  This user is external and cannot be promoted to admin.
                </p>
              ) : (
                <div className="space-y-4">
                  <p>
                    Are you sure you want to {!userIsSuper ? "promote" : "demote"}{" "}
                    this user {!userIsSuper ? "to admin" : "from admin"}?
                  </p>
                  <form id="promotion-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="my-2 mb-4 select-none">
                      <Input
                        type="hidden"
                        {...register("userPk", { required: true, value: userPk })}
                        readOnly
                      />
                    </div>
                  </form>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={userIsExternal || promotionMutation.isPending}
              form="promotion-form"
              type="submit"
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-green-600 hover:bg-green-400"
              }`}
            >
              {promotionMutation.isPending 
                ? "Loading..." 
                : (userIsSuper ? "Demote" : "Promote")
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
