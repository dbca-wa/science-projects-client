import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { suspendProjectCall } from "@/features/projects/services/projects.service";
import type { ISimplePkProp } from "@/shared/types";
import { cn } from "@/shared/utils";

interface Props {
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
  refetchData: () => void;
  projectStatus: string;
}

export const ProjectSuspensionModal = ({
  projectPk,
  isOpen,
  onClose,
  refetchData,
  projectStatus,
}: Props) => {
  const { register, handleSubmit, watch } = useForm<ISimplePkProp>();
  const projPk = watch("pk");

  const ToastIdRef = useRef<string | number | undefined>(undefined);
  const addToast = (data: { title: string; description?: string }) => {
    ToastIdRef.current = toast(data.title, { description: data.description });
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const suspendMutation = useMutation({
    mutationFn: suspendProjectCall,
    onMutate: () => {
      addToast({
        title: `${
          projectStatus !== "suspended" ? "Suspending" : "Unsuspending "
        } Project`,
      });
    },
    onSuccess: async () => {
      toast.success(`Project has been ${
        projectStatus !== "suspended" ? "suspended" : "unsuspended"
      }`);

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        refetchData();
        onClose();
      }, 350);
    },
    onError: (error) => {
      toast.error(`Could not ${
        projectStatus !== "suspended" ? "suspend" : "unsuspend"
      } project: ${error}`);
    },
  });

  const suspendProject = (formData: ISimplePkProp) => {
    console.log(formData);
    const newForm = {
      pk: projPk,
    };
    suspendMutation.mutate(newForm);
  };

  const { colorMode } = useColorMode();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-md",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <form onSubmit={handleSubmit(suspendProject)}>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to{" "}
              {projectStatus !== "suspended" ? "suspend" : "unsuspend"} this
              project?
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
                      {projectStatus !== "suspended"
                        ? "The project will become inactive, with the status set to 'suspended'"
                        : "The project will become active, with the status set to 'active'"}
                    </li>
                    <li>
                      {projectStatus !== "suspended"
                        ? "The project will not be closed, but it's progress reports will not be included on the Annual Report."
                        : "The project's progress reports will be included on the Annual Report, if one exists/is created for that FY."}
                    </li>
                    {projectStatus !== "suspended" && (
                      <li>
                        When a new Annual Reporting cycle begins, you will be
                        sent a request to update your progress report. Either
                        update the report or re-suspend the project.
                      </li>
                    )}
                    <li>
                      This will not create or delete any Project Closures
                    </li>
                  </ul>
                </div>

                <div className="flex justify-center mt-2 p-5 pb-3">
                  <p className="font-bold text-blue-400 underline text-center">
                    {projectStatus !== "suspended"
                      ? "You can unsuspend the project again at any time, setting the status of the project to 'active'"
                      : "You can suspend the project again at any time, immediately setting the status of the project to 'suspended'"}
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
                disabled={suspendMutation.isPending}
                type="submit"
              >
                {suspendMutation.isPending 
                  ? "Processing..." 
                  : projectStatus !== "suspended"
                    ? "Suspend Project"
                    : "Unsuspend Project"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
