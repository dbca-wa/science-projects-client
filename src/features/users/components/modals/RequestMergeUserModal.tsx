import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { requestMergeUserCall } from "@/features/admin/services/admin.service";
import type { IMakeRequestToAdmins } from "@/shared/types";
import { cn } from "@/shared/utils";

interface Props {
  primaryUserPk: number;
  secondaryUserPks: number[];
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const RequestMergeUserModal = ({
  primaryUserPk,
  secondaryUserPks,
  isOpen,
  onClose,
  refetch,
}: Props) => {
  const ToastIdRef = useRef<string | number | undefined>(undefined);
  const addToast = (data: { title: string; description?: string }) => {
    ToastIdRef.current = toast(data.title, { description: data.description });
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const requestMergeUserMutation = useMutation({
    mutationFn: requestMergeUserCall,
    onMutate: () => {
      addToast({
        title: `Requesting Merge`,
      });
    },
    onSuccess: async () => {
      toast.success("Request Made");

      setTimeout(() => {
        queryClient
          .invalidateQueries({ queryKey: ["pendingAdminTasks"] })
          .then(() => refetch?.())
          .then(() => onClose());
      }, 350);
    },
    onError: (error: AxiosError) => {
      toast.error(`Could not request deletion: ${error.response?.data}`);
      
      if (
        error.response?.data ===
          "A request for this project's deletion has already been made!" ||
        error.response?.data === "Project already has a pending deletion request"
      ) {
        onClose();
      }
    },
  });

  const requestUserMerge = (formData: IMakeRequestToAdmins) => {
    console.log(formData);
    requestMergeUserMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<IMakeRequestToAdmins>();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-2xl",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <form onSubmit={handleSubmit(requestUserMerge)}>
          <DialogHeader>
            <DialogTitle>Request Merge?</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <p className={cn(
                colorMode === "light" ? "text-blue-500" : "text-blue-400"
              )}>
                This form is for merging duplicate users. Please ensure that the
                user you merge has the correct information.
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  The primary user (you) will receive any projects belonging to
                  the secondary user (account you merge with)
                </li>
                <li>
                  The primary user (you) will receive any comments belonging to
                  the secondary user (account you merge with)
                </li>
                <li>
                  The primary user (you) will receive any documents and roles
                  belonging to the secondary user (account you merge with) on
                  projects, where applicable (if primary user is already on the
                  project and has a higher role, they will maintain the higher
                  role)
                </li>
                <li className={cn(
                  "underline",
                  colorMode === "light" ? "text-red-500" : "text-red-400"
                )}>
                  The secondary user (account you merge with) will be deleted
                  from the system. This is permanent.
                </li>
              </ul>
            </div>

            <div>
              <Input
                type="hidden"
                {...register("action", {
                  required: true,
                  value: "mergeuser",
                })}
                readOnly
              />
            </div>
            
            <div>
              <Input
                type="hidden"
                {...register("primaryUserPk", {
                  required: true,
                  value: Number(primaryUserPk),
                })}
                readOnly
              />
              <Input
                type="hidden"
                {...register("secondaryUserPks", {
                  required: true,
                  value: secondaryUserPks,
                })}
                readOnly
              />
            </div>
            
            <div className="flex justify-center mt-2 p-5 pb-3">
              <p className="font-bold text-red-400 underline">
                Once approved by admins, this is permanent.
              </p>
            </div>
            
            <div className="flex justify-center p-5">
              <p className="font-semibold text-blue-500 text-center">
                If you wish to proceed, click "Request Merge". Clicking the
                button will send a request to the admins, so the process may
                take time.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className={cn(
                  "text-white ml-3",
                  colorMode === "light" 
                    ? "bg-red-500 hover:bg-red-400" 
                    : "bg-red-600 hover:bg-red-500"
                )}
                disabled={
                  requestMergeUserMutation.isPending || !isValid || isSubmitting
                }
                type="submit"
              >
                {requestMergeUserMutation.isPending ? "Requesting..." : "Request Merge"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
