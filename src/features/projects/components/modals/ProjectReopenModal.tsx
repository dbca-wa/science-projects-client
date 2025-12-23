import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { openProjectCall } from "@/features/projects/services/projects.service";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { ISimplePkProp } from "@/shared/types";
import { cn } from "@/shared/utils";

interface Props {
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
  refetchData: () => void;
}

export const ProjectReopenModal = ({
  projectPk,
  isOpen,
  onClose,
  refetchData,
}: Props) => {
  const { register, handleSubmit, watch } = useForm<ISimplePkProp>();
  const projPk = watch("pk");

  const ToastIdRef = useRef<string | number | undefined>(undefined);
  const addToast = (data: { title: string; description?: string }) => {
    ToastIdRef.current = toast(data.title, { description: data.description });
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const reopenMutation = useMutation({
    mutationFn: openProjectCall,
    onMutate: () => {
      addToast({
        title: `Reopening Project`,
      });
    },
    onSuccess: async () => {
      toast.success("Project has been reopened");

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        refetchData();
        onClose();
      }, 350);
    },
    onError: (error) => {
      toast.error(`Could not reopen project: ${error}`);
    },
  });

  const openProject = (formData: ISimplePkProp) => {
    const newForm = {
      pk: projPk,
    };
    reopenMutation.mutate(newForm);
  };

  const { colorMode } = useColorMode();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-md",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <form onSubmit={handleSubmit(openProject)}>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to reopen this project?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-10">
              <div className={cn(
                "rounded-2xl p-2",
                colorMode === "light" ? "bg-gray-50" : "bg-gray-700"
              )}>
                <div className="px-4">
                  <p className="font-semibold text-xl">Info</p>
                </div>

                <div className="mt-8">
                  <div className="px-4">
                    <p>The following will occur:</p>
                  </div>
                  <ul className="list-disc px-10 pt-4 space-y-2">
                    <li>
                      The project will become active, with the status set to
                      'updating'
                    </li>
                    <li>
                      The project closure document will be deleted
                    </li>
                    <li>Progress Reports can be created again</li>
                  </ul>
                </div>

                <div className="flex justify-center mt-2 p-5 pb-3">
                  <p className="font-bold text-blue-400 underline">
                    You can close the project again at any time.
                  </p>
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
              </div>
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
                    ? "bg-green-500 hover:bg-green-400" 
                    : "bg-green-600 hover:bg-green-500"
                )}
                disabled={reopenMutation.isPending}
                type="submit"
              >
                {reopenMutation.isPending ? "Opening..." : "Open Project"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
