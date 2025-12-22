import { remedyOpenClosedProjects } from "@/features/admin/services/admin.service";
import type { IProjectData } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";

interface Props {
  projects: IProjectData[];
  refreshDataFn: () => void;
  onClose: () => void;
}

type StatusOption = "active" | "suspended" | "completed" | "terminated";

const statusOptions: Array<{ value: StatusOption; label: string }> = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "completed", label: "Completed" },
  { value: "terminated", label: "Terminated" },
];

export const RemedyOpenClosedModalContent = ({
  projects,
  refreshDataFn,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>("active");

  const mutation = useMutation({
    mutationFn: remedyOpenClosedProjects,
    onMutate: () => {
      toast.loading(`Attempting to remedy open closed projects to ${selectedStatus} status`);
    },
    onSuccess: async (data) => {
      toast.success("Success", {
        description: `Successfully updated ${data.successful} project(s) to ${selectedStatus} status`,
      });
      refreshDataFn?.();
      onClose();
    },
    onError: (error: AxiosError) => {
      toast.error("Encountered an error", {
        description: error?.response?.data
          ? `${error.response.status}: ${
              Object.values(error.response.data)[0]
            }`
          : "Error",
      });
    },
  });

  const onRemedy = () => {
    mutation.mutate({
      projects: projects?.map((p) => p.pk),
      status: selectedStatus,
    });
  };

  // Get description text based on selected status
  const getActionDescription = () => {
    if (selectedStatus === "active" || selectedStatus === "suspended") {
      return "The project closure documents will be deleted and projects will be set to the selected status";
    } else {
      return "The project closure documents will be kept and their intended outcome will be updated to match the selected status";
    }
  };

  const getClosureAction = () => {
    if (selectedStatus === "active" || selectedStatus === "suspended") {
      return "delete the project closures";
    } else {
      return "update the project closure intended outcomes";
    }
  };

  return (
    <>
      <div>
        <div className="mb-4">
          <Label>Target Status</Label>
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as StatusOption)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div
          className={`p-3 mb-4 rounded-md border ${
            colorMode === "light" 
              ? "bg-blue-50 border-blue-200" 
              : "bg-blue-900 border-blue-700"
          }`}
        >
          <p
            className={`text-sm ${
              colorMode === "light" ? "text-blue-700" : "text-blue-200"
            }`}
          >
            <strong>
              Action for{" "}
              {statusOptions.find((opt) => opt.value === selectedStatus)?.label}{" "}
              status:
            </strong>
            <br />
            {getActionDescription()}
          </p>
        </div>

        <p className={`my-2 ${colorMode === "light" ? "text-red-500" : "text-red-300"}`}>
          Caution: All projects with an approved project closure that are in the
          open update requested state will be affected. This will set the
          project status to{" "}
          {statusOptions.find((opt) => opt.value === selectedStatus)?.label}{" "}
          status
        </p>

        <div className="flex justify-end py-4">
          <div>
            <Button
              className="bg-green-500 text-white hover:bg-green-400"
              onClick={onRemedy}
              disabled={!selectedStatus}
            >
              Remedy to{" "}
              {statusOptions.find((opt) => opt.value === selectedStatus)?.label}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
