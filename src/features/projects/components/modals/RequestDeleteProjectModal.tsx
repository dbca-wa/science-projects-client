import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { requestDeleteProjectCall } from "@/features/admin/services/admin.service";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { IMakeRequestToAdmins } from "@/shared/types";
import { AxiosError } from "axios";
import { cn } from "@/shared/utils/component.utils";

interface Props {
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const RequestDeleteProjectModal = ({
  projectPk,
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

  const requestDeleteProjectMutation = useMutation({
    mutationFn: requestDeleteProjectCall,
    onMutate: () => {
      addToast({
        title: `Requesting Deletion`,
      });
    },
    onSuccess: async () => {
      toast.success("Request Made");

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["pendingAdminTasks"] });
        queryClient
          .invalidateQueries({ queryKey: ["project", projectPk] })
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

  const requestDeletion = (formData: IMakeRequestToAdmins) => {
    console.log(formData);
    requestDeleteProjectMutation.mutate(formData);
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
        "max-w-md",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <form onSubmit={handleSubmit(requestDeletion)}>
          <DialogHeader>
            <DialogTitle>Request Deletion?</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex justify-center">
              <p className="font-semibold text-xl text-center">
                Are you sure you want to delete this project? There's no turning
                back.
              </p>
            </div>
            
            <div className="flex justify-center mt-8">
              <ul className="list-disc list-inside space-y-1">
                <li>The Project team and area will be cleared</li>
                <li>The project photo will be deleted</li>
                <li>Any related comments will be deleted</li>
                <li>All related documents will be deleted</li>
              </ul>
            </div>

            <div>
              <Input
                type="hidden"
                {...register("action", {
                  required: true,
                  value: "deleteproject",
                })}
                readOnly
              />
            </div>
            
            <div>
              <Input
                type="hidden"
                {...register("project", {
                  required: true,
                  value: Number(projectPk),
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
                If you wish to proceed, select a deletion reason and click
                "Request Deletion". Clicking the button will send a request to
                the admins, so the process may take time.
              </p>
            </div>

            <div>
              <select 
                {...register("reason", { required: true })}
                className={cn(
                  "w-full px-3 py-2 border rounded-md",
                  colorMode === "dark" 
                    ? "bg-gray-700 border-gray-600 text-white" 
                    : "bg-white border-gray-300 text-gray-900"
                )}
              >
                <option value="duplicate">Duplicate</option>
                <option value="mistake">Made by Mistake</option>
                <option value="other">Other</option>
              </select>
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
                  requestDeleteProjectMutation.isPending ||
                  !isValid ||
                  isSubmitting
                }
                type="submit"
              >
                {requestDeleteProjectMutation.isPending ? "Requesting..." : "Request Deletion"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
