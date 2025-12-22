import { remedyMemberlessProjects } from "@/features/admin/services/admin.service";
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

export const RemedyMemberlessProjectsModalContent = ({
  projects,
  refreshDataFn,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();

  const mutation = useMutation({
    mutationFn: remedyMemberlessProjects,
    onMutate: () => {
      toast.loading("Attempting to remedy memberless to Projects");
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
          <li>- All memberless projects will be affected</li>
          <li>
            - The function will check the creator of the first document (if one
            exists) and add them to the project as the leader
          </li>
          <li>
            - If the leader cannot be set because a document doesnt exist,
            membership will remain unchanged.
          </li>
          <li>
            - This will weed out the remaining memberless projects as they have
            no documents/data
          </li>
        </ul>
        <p className={`my-2 ${colorMode === "light" ? "text-blue-500" : "text-blue-300"}`}>
          Caution: This will update all projects without members.
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
