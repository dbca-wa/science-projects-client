import { remedyMultipleLeaderProjects } from "@/features/admin/services/admin.service";
import type { IProjectData } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface Props {
  projects: IProjectData[];
  refreshDataFn: () => void;
  onClose: () => void;
}

export const RemedyMultipleLeaderProjectsModalContent = ({
  projects,
  refreshDataFn,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();

  const mutation = useMutation({
    mutationFn: remedyMultipleLeaderProjects,
    onMutate: () => {
      toast.loading("Attempting to remedy externally led Projects");
    },
    onSuccess: async () => {
      toast.success("Success", {
        description: "Complete",
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
    mutation.mutate({ projects: projects?.map((p) => p.pk) });
  };

  return (
    <>
      <div>
        <ul className="list-disc ml-6">
          <li>
            - All projects with multiple "Project Lead" roles will be affected
          </li>
          <li>
            - The function will check which member has the is_leader property
            set to true
          </li>
          <li>- This user will get the Project Lead tag</li>
          <li>
            - Other users will either get student, academic supervisor, science
            support or external collaborator roles, depending on the project
            type and whether they are staff
          </li>
        </ul>
        <p className={`my-2 ${colorMode === "light" ? "text-blue-500" : "text-blue-300"}`}>
          Caution: This will update all projects with multiple leader roles.
        </p>
        <div className="flex justify-end py-4">
          <div>
            <Button
              className="bg-green-500 text-white hover:bg-green-400"
              onClick={onRemedy}
            >
              Remedy
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
