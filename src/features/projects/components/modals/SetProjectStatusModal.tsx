import type { ProjectStatus } from "@/shared/types";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoIosCreate } from "react-icons/io";
import { cn } from "@/shared/utils";
import { type ISetProjectStatusProps, setProjectStatus } from "@/features/projects/services/projects.service";

interface Props {
  projectPk: string | number;
  refetchData?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onFunctionSuccess?: () => void;
}

export const SetProjectStatusModal = ({
  projectPk,
  refetchData,
  isOpen,
  onClose,
  onFunctionSuccess,
}: Props) => {
  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const setProjectStatusMutation = useMutation({
    mutationFn: setProjectStatus,
    onMutate: () => {
      toast.loading("Setting Project Status...");
    },
    onSuccess: async () => {
      toast.dismiss();
      toast.success("Project status updated");
      onFunctionSuccess?.();

      setTimeout(async () => {
        queryClient.invalidateQueries({
          queryKey: ["projects", projectPk],
        });
        queryClient.refetchQueries({ queryKey: ["projects", projectPk] });
        await refetchData?.();

        onClose();
      }, 350);
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Could not set project status: ${error}`);
    },
  });

  const onSetProjectStatus = (formData: ISetProjectStatusProps) => {
    setProjectStatusMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const [statusData, setStatusData] = useState<ProjectStatus>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-2xl",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <DialogHeader>
          <DialogTitle>Set Project Status</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <Label className="required">Status</Label>
            <Select
              value={statusData || ""}
              onValueChange={(value) => setStatusData(value as ProjectStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="updating">Update Requested</SelectItem>
                <SelectItem value="closure_requested">Closure Requested</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={cn(
                "text-white",
                colorMode === "light" 
                  ? "bg-blue-500 hover:bg-blue-400" 
                  : "bg-blue-600 hover:bg-blue-500"
              )}
              disabled={!projectPk || !statusData}
              onClick={() =>
                onSetProjectStatus({
                  projectId: Number(projectPk),
                  status: statusData,
                })
              }
            >
              <IoIosCreate className="mr-2 h-4 w-4" />
              Set Status
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
