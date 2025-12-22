import { remedyExternallyLedProjects } from "@/features/admin/services/admin.service";
import type { IProjectData } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";

interface Props {
  projects: IProjectData[];
  refreshDataFn: () => void;
  onClose: () => void;
}

export const RemedyExternallyLedProjectsModalContent = ({
  projects,
  refreshDataFn,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();
  const ToastIdRef = useRef<string | number | undefined>(undefined);

  const mutation = useMutation({
    mutationFn: remedyExternallyLedProjects,
    onMutate: () => {
      ToastIdRef.current = toast.loading("Attempting to remedy externally led Projects");
    },
    onSuccess: async () => {
      if (ToastIdRef.current) {
        toast.success("Success", {
          description: "Complete",
          id: ToastIdRef.current,
        });
      }
      refreshDataFn?.();
      onClose();
    },
    onError: (error: AxiosError) => {
      if (ToastIdRef.current) {
        toast.error("Encountered an error", {
          description: error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Error",
          id: ToastIdRef.current,
        });
      }
    },
  });

  const onRemedy = () => {
    mutation.mutate({ projects: projects?.map((p) => p.pk) });
  };

  return (
    <>
      <div>
        <ul className="list-disc ml-4">
          <li>- All externally led projects will be affected</li>
          <li>
            - The function will check memberships where an external leader is
            set
          </li>
          <li>
            - The dbca staff member who created the first document will get the
            leader status (if a staff member exists/if they belong to the
            project/if a document exists)
          </li>
          <li>
            - This will weed out the remaining external projects as they will
            have only external members of their documents created by a member
            outside of the project
          </li>
        </ul>
        <p className={`my-2 ${colorMode === "light" ? "text-blue-500" : "text-blue-300"}`}>
          Caution: This will update all externally led projects.
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
