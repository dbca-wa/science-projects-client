import {
  IDocGen,
  cancelProjectDocumentGeneration,
  generateProjectDocument,
} from "@/features/reports/services/reports.service";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import {
  IConceptPlan,
  IProgressReport,
  IProjectClosure,
  IProjectPlan,
  IStudentReport,
} from "@/shared/types";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { BsStars } from "react-icons/bs";
import { FaFileDownload } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { cn } from "@/shared/utils";

interface IPDFSectionProps {
  data_document:
    | IConceptPlan
    | IProjectPlan
    | IProgressReport
    | IStudentReport
    | IProjectClosure;
  refetchData: () => void;
}

export const ProjectDocumentPDFSection = ({
  data_document,
  refetchData,
}: IPDFSectionProps) => {
  const { register: genRegister, handleSubmit: handleGenSubmit } =
    useForm<IDocGen>();
  const { register: cancelGenRegister, handleSubmit: handleCancelGenSubmit } =
    useForm<IDocGen>();
  // const docPk = genWatch("document_pk");
  // const cancelDocPk = cancelGenWatch("document_pk");
  const apiEndpoint = useApiEndpoint();
  const queryClient = useQueryClient();

  const toastIdRef = useRef<string | number | undefined>(undefined);
  const addToast = (message: string) => {
    toastIdRef.current = toast.loading(message);
  };

  const projectDocPDFGenerationMutation = useMutation({
    mutationFn: generateProjectDocument,
    onMutate: () => {
      addToast("Generating PDF");
    },
    onSuccess: (response: { res: AxiosResponse<any, any> }) => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.success("PDF Generated");
      
      const fileUrl = `${apiEndpoint}${response?.res?.data?.file}`;

      if (fileUrl) {
        window.open(fileUrl, "_blank");
      }

      queryClient.invalidateQueries({
        queryKey: ["projects", data_document?.document?.project?.pk],
      });
      setTimeout(() => {
        refetchData();
      }, 1000);
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.error(
        error?.response?.data
          ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
          : "Could Not Generate PDF"
      );
    },
  });

  const cancelDocGenerationMutation = useMutation({
    mutationFn: cancelProjectDocumentGeneration,
    onMutate: () => {
      addToast("Canceling Generation");
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.success("Canceled");
      
      queryClient.invalidateQueries({
        queryKey: ["projects", data_document.document.project.pk],
      });
      setTimeout(() => {
        refetchData();
      }, 1000);
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.error(
        error?.response?.data
          ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
          : "Could Not Cancel"
      );
    },
  });

  const beginCancelDocGen = (formData: IDocGen) => {
    // console.log(formData);
    cancelDocGenerationMutation.mutate(formData);
  };

  const beginProjectDocPDFGeneration = (formData: IDocGen) => {
    // console.log(formData);
    projectDocPDFGenerationMutation.mutate(formData);
  };

  // useEffect(() => console.log(data_document), [data_document])

  const downloadPDF = () => {
    {
      let file = data_document?.document?.pdf?.file;

      try {
        if (file?.startsWith("http")) {
          const parts = file.split("/");
          // Join the parts from the fourth element onwards, including the leading slash
          const extractedText = "/" + parts.slice(3).join("/");
          file = extractedText;
        }
        window.open(`${apiEndpoint}${file}`, "_blank");
      } catch (error) {
        if (error instanceof DOMException) {
          window.open(`${data_document?.document?.pdf?.file}`, "_blank");
        } else {
          // Handle other exceptions
          console.error("An error occurred while opening the window:", error);
        }
      }
    }
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <form
        id="cancel-pdf-generation-form"
        onSubmit={handleCancelGenSubmit(beginCancelDocGen)}
      >
        <Input
          type="hidden"
          {...cancelGenRegister("document_pk", {
            required: true,
            value: data_document.document.pk,
          })}
        />
      </form>

      <form
        id="pdf-generation-form"
        onSubmit={handleGenSubmit(beginProjectDocPDFGeneration)}
      >
        <Input
          type="hidden"
          {...genRegister("document_pk", {
            required: true,
            value: data_document.document.pk,
          })}
        />
      </form>
      <div
        className={cn(
          "rounded-2xl p-4 w-full border border-gray-300 my-2 flex",
          colorMode === "light" ? "bg-gray-100" : "bg-gray-700"
        )}
      >
        <div className="self-center">
          <p className="font-semibold">PDF</p>
        </div>

        <div className="flex flex-1 justify-end w-full">
          {data_document?.document?.pdf?.file &&
          !projectDocPDFGenerationMutation.isPending &&
          !data_document?.document?.pdf_generation_in_progress ? (
            <Button
              asChild
              size={"sm"}
              className={cn(
                "ml-2 text-white",
                colorMode === "light" ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-500"
              )}
              onClick={() => downloadPDF()}
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                style={{ transitionDuration: "0.7s", animationDelay: "1s" }}
              >
                <div className="mr-2">
                  <FaFileDownload />
                </div>
                Download PDF
              </motion.div>
            </Button>
          ) : projectDocPDFGenerationMutation.isPending ||
            data_document?.document?.pdf_generation_in_progress ? (
            <Button
              size={"sm"}
              className={cn(
                "ml-2 text-white",
                colorMode === "light" ? "bg-gray-400 hover:bg-gray-300" : "bg-gray-500 hover:bg-gray-400"
              )}
              disabled={cancelDocGenerationMutation.isPending}
              type="submit"
              form="cancel-pdf-generation-form"
            >
              <div className="mr-2">
                <FcCancel />
              </div>
              {cancelDocGenerationMutation.isPending ? "Canceling" : "Cancel"}
            </Button>
          ) : null}

          <Button
            size={"sm"}
            className={cn(
              "ml-2 text-white",
              colorMode === "light" ? "bg-green-500 hover:bg-green-400" : "bg-green-600 hover:bg-green-500"
            )}
            disabled={
              projectDocPDFGenerationMutation.isPending ||
              data_document?.document?.pdf_generation_in_progress
            }
            type="submit"
            form="pdf-generation-form"
          >
            <div className="mr-2">
              <BsStars />
            </div>
            {projectDocPDFGenerationMutation.isPending ||
            data_document?.document?.pdf_generation_in_progress
              ? "Generation In Progress"
              : data_document?.document?.pdf?.file
                ? "Generate New"
                : "Generate PDF"}
          </Button>
        </div>
      </div>
    </>
  );
};
