import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { type ICloseProjectProps, closeProjectCall } from "@/features/projects/services/projects.service";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { cn } from "@/shared/utils/component.utils";

interface Props {
  projectKind: string;
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
  refetchData: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const ProjectClosureModal = ({
  projectKind,
  projectPk,
  isOpen,
  onClose,
  refetchData,
  setToLastTab,
}: Props) => {
  const { register, handleSubmit, watch, setValue } = useForm<ICloseProjectProps>();
  const [closureReason, setClosureReason] = useState("");
  const reasonValue = watch("reason");
  const outcomeValue = watch("outcome");
  const projPk = watch("projectPk");

  const toastIdRef = useRef<string | number | undefined>(undefined);

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const closureMutation = useMutation({
    mutationFn: closeProjectCall,
    onMutate: () => {
      toastIdRef.current = toast.loading("Closing");
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.success("Closure Requested", {
          id: toastIdRef.current,
        });
      }

      setTimeout(async () => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        await refetchData();
        setToLastTab(-1);
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.error(`Could Not Request Closure: ${error}`, {
          id: toastIdRef.current,
        });
      }
    },
  });

  const closeProject = () => {
    const newForm = {
      projectKind: projectKind,
      reason: reasonValue,
      projectPk: projPk,
      outcome: outcomeValue,
    };
    closureMutation.mutate(newForm);
  };

  const { colorMode } = useColorMode();

  useEffect(() => {
    let prefillText = "";
    let prefillHtml;
    if (outcomeValue === "completed") {
      prefillText = "The project has run its course and was completed";
    } else if (outcomeValue === "forcecompleted") {
      prefillText = "The project needed to be forcefully closed";
    } else if (outcomeValue === "suspended") {
      prefillText = "The project needs to be put on hold";
    } else if (outcomeValue === "terminated") {
      prefillText = "The project has not been completed, but is terminated.";
    }
    if (colorMode === "light") {
      prefillHtml = `<p class='editor-p-light'>${prefillText}</p>`;
    } else {
      prefillHtml = `<p class='editor-p-dark'>${prefillText}</p>`;
    }
    setClosureReason(prefillHtml);
  }, [colorMode, outcomeValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <form
          onSubmit={handleSubmit(closeProject)}
          className={cn(
            colorMode === "light" ? "bg-white" : "bg-gray-800"
          )}
        >
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to close this project?
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-10">
              <div className={cn(
                "rounded-2xl p-2",
                colorMode === "light" ? "bg-white" : "bg-gray-800"
              )}>
                <div className="px-4">
                  <h3 className="font-semibold text-xl">Info</h3>
                </div>

                <div className="mt-8">
                  <div className="px-4">
                    <p>
                      The project will remain in the system, however, the
                      following will occur:
                    </p>
                  </div>
                  <ul className="px-10 pt-4 list-disc list-inside space-y-1">
                    <li>Spawns a project closure document</li>
                    <li>Prevents any further reports</li>
                    <li>
                      Sets the status of the project to closure requested, until
                      the closure document is approved
                    </li>
                  </ul>
                </div>

                <div className="mt-2 p-5 pb-3 flex justify-center">
                  <p className="font-bold text-red-400 underline text-center">
                    You can re-open the project at any time and the closure form
                    will be deleted.
                  </p>
                </div>
                <div className="p-5 flex justify-center">
                  <p className="font-semibold text-blue-500 text-center">
                    If instead you wish to permanently delete this project,
                    please press cancel and select 'Delete' from the menu.
                  </p>
                </div>

                <div className="w-full">
                  <Input
                    type="hidden"
                    {...register("projectPk", {
                      required: true,
                      value: Number(projectPk),
                    })}
                    readOnly
                  />
                </div>

                <div className="p-5 flex justify-center">
                  <div className="space-y-2 w-full max-w-md">
                    <Label className="required">Outcome</Label>
                    <Select
                      onValueChange={(value) => {
                        setValue("outcome", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Closure Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completion</SelectItem>
                        <SelectItem value="terminated">Termination</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select an intended outcome for this project on closure.
                    </p>
                  </div>
                </div>

                <div className="w-full">
                  <Input
                    type="hidden"
                    value={closureReason}
                    {...register("reason", { required: true })}
                  />
                </div>

                <div className="p-5 flex justify-center">
                  <p className="font-semibold underline text-center">
                    Once created, please fill out the scientific outputs,
                    knowledge transfer and data location sections on the closure
                    form.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="grid grid-cols-2 gap-4">
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
                type="submit"
                disabled={!closureReason || !outcomeValue || !projPk}
              >
                Request Closure
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
