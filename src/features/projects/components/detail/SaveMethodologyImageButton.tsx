// A template for a RTE toggalable button - props fill out its icons, colorSchemes, states and functionality

import {
  type IHandleMethodologyImage,
  handleMethodologyImage,
} from "@/features/projects/services/projects.service";
import type { IProjectPlan } from "@/shared/types";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { FaSave, FaTrash } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import "@/styles/texteditor.css";

interface Props {
  buttonType: "post" | "update" | "delete";
  document: IProjectPlan;
  canSave: boolean;
  projectPlanPk: number;
  file?: File | string;
  refetch: () => void;
  onDeleteEntry?: () => void;
}

export const SaveMethodologyImageButton = ({
  canSave,
  projectPlanPk,
  file,
  buttonType,
  document,
  refetch,
  onDeleteEntry,
}: Props) => {
  const { colorMode } = useColorMode();
  const toolTipText = `${buttonType === "post" ? "Save" : buttonType === "update" ? "Update" : "Delete"} Methodology Image`;

  const toastIdRef = useRef<string | number | undefined>(undefined);
  const addToast = (message: string, type: "loading" | "success" | "error") => {
    if (type === "loading") {
      toastIdRef.current = toast.loading(message);
    } else {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      if (type === "success") {
        toast.success(message);
      } else {
        toast.error(message);
      }
    }
  };

  // const { register, handleSubmit, watch } = useForm<IHandleMethodologyImage>();
  // const ppPkWatch = watch("project_plan_pk");
  // const kindWatch = watch("kind");
  // const fileWatch = watch("file");

  const handleMethImageMutation = useMutation({
    mutationFn: handleMethodologyImage,
    onMutate: () => {
      addToast(
        buttonType === "update"
          ? "Updating..."
          : buttonType === "delete"
            ? "Deleting..."
            : "Saving...",
        "loading"
      );
    },
    onSuccess: () => {
      addToast(
        `${buttonType === "update" ? "Updated" : buttonType === "delete" ? "Deleted" : "Saved"} Methodology Image`,
        "success"
      );
      if (buttonType === "delete") {
        onDeleteEntry?.();
      }
      refetch();
    },
    onError: (error) => {
      addToast(
        `Could Not ${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)}: ${error}`,
        "error"
      );
    },
  });

  const saveToDB = (formData: IHandleMethodologyImage) => {
    handleMethImageMutation.mutate(formData);
  };

  return (
    <div className="tooltip-container">
      <Button
        className={`rounded-full p-0 m-0 max-w-[35px] max-h-[40px] text-white ${
          buttonType === "delete"
            ? colorMode === "light"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-red-600 hover:bg-red-700"
            : colorMode === "light"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={
          handleMethImageMutation.isPending || buttonType === "delete"
            ? !document?.methodology_image
            : !canSave || !file
        }
        onClick={() => {
          console.log(buttonType);
          saveToDB({
            kind: buttonType,
            project_plan_pk: projectPlanPk,
            file: file,
          });
        }}
      >
        {handleMethImageMutation.isPending ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            {buttonType === "delete" ? (
              <FaTrash className="w-5 h-5 lg:w-6 lg:h-6" />
            ) : (
              <FaSave className="w-5 h-5 lg:w-6 lg:h-6" />
            )}
          </div>
        )}
      </Button>
      {toolTipText && <span className="tooltip-text">{toolTipText}</span>}
    </div>
  );
};
