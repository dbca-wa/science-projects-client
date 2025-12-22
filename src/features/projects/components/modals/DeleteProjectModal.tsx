import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { deleteProjectCall } from "@/features/projects/services/projects.service";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { ISimplePkProp } from "@/shared/types";
import { cn } from "@/shared/utils/component.utils";

interface Props {
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteProjectModal = ({ projectPk, isOpen, onClose }: Props) => {
  const navigate = useNavigate();

  const ToastIdRef = useRef<string | number | undefined>(undefined);
  const addToast = (data: { title: string; description?: string }) => {
    ToastIdRef.current = toast(data.title, { description: data.description });
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectCall,
    onMutate: () => {
      addToast({
        title: `Deleting`,
      });
    },
    onSuccess: async () => {
      toast.success("Project Deleted");

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        navigate("/projects");
      }, 350);
    },
    onError: (error) => {
      toast.error(`Could Not delete project: ${error}`);
    },
  });

  const deleteProject = (formData: ISimplePkProp) => {
    deleteProjectMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const { register, handleSubmit } = useForm<ISimplePkProp>();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-md",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <form onSubmit={handleSubmit(deleteProject)}>
          <DialogHeader>
            <DialogTitle>Delete Project?</DialogTitle>
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
                {...register("pk", {
                  required: true,
                  value: Number(projectPk),
                })}
                readOnly
              />
            </div>
            
            <div className="flex justify-center mt-2 p-5 pb-3">
              <p className="font-bold text-red-400 underline">
                This is permanent.
              </p>
            </div>
            
            <div className="flex justify-center p-5">
              <p className="font-semibold text-blue-500 text-center">
                If instead you wish to create a project closure, please press
                cancel and select 'Create Closure' from the vertical ellipsis.
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
                disabled={deleteProjectMutation.isPending}
                type="submit"
              >
                {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
