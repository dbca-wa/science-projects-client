import {
  IDocGen,
  cancelAnnualReportPDF,
  generateAnnualReportPDF,
} from "@/features/reports/services/reports.service";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useGetAnnualReportPDF } from "@/features/reports/hooks/useGetAnnualReportPDF";
import type { IReport } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BsStars } from "react-icons/bs";
import { FaFileDownload } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { Loader2 } from "lucide-react";

interface Props {
  thisReport: IReport;
  // refetchData: () => void;
}

export const PDFViewer = ({
  thisReport,
}: // refetchData
Props) => {
  const { register: genRegister, handleSubmit: handleGenSubmit } =
    useForm<IDocGen>();
  const { register: cancelGenRegister, handleSubmit: handleCancelGenSubmit } =
    useForm<IDocGen>();

  const apiEndpoint = useApiEndpoint();
  const queryClient = useQueryClient();

  const annualReportPDFGenerationMutation = useMutation({
    mutationFn: generateAnnualReportPDF,
    onMutate: () => {
      toast.loading("Generating AR PDF...");
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Annual Report PDF Generated",
      });
      queryClient.invalidateQueries({
        queryKey: [
          "annualReportPDF",
          thisReport?.pk ? thisReport.pk : thisReport.id,
        ],
      });
    },
    onError: (error: AxiosError) => {
      toast.error("Could Not Generate AR PDF", {
        description: error?.response?.data
          ? `${error.response.status}: ${
              Object.values(error.response.data)[0]
            }`
          : "Error",
      });
    },
  });

  const beginApprovedProjectDocPDFGeneration = (formData: IDocGen) => {
    annualReportPDFGenerationMutation.mutate({
      ...formData,
      genkind: "approved",
    });
  };

  const beginUnapprovedProjectDocPDFGeneration = (formData: IDocGen) => {
    annualReportPDFGenerationMutation.mutate({
      ...formData,
      genkind: "all",
    });
  };

  const cancelDocGenerationMutation = useMutation({
    mutationFn: cancelAnnualReportPDF,
    onMutate: () => {
      toast.loading("Canceling Generation...");
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Canceled",
      });
      queryClient.cancelQueries({
        queryKey: [
          "annualReportPDF",
          thisReport?.pk ? thisReport.pk : thisReport.id,
        ],
      });
      pdfDocumentData.report.pdf_generation_in_progress = false;

      // queryClient.invalidateQueries({
      //   queryKey: [
      //     "annualReportPDF",
      //     thisReport?.pk ? thisReport.pk : thisReport.id,
      //   ],
      // });
      // Turn off the loading toast, set the pdfDocumentData?.report?.pdf_generation_in_progress to false
      // and set the pdfDocumentData to undefined
      // setPdfDocumentData(undefined);
    },
    onError: (error: AxiosError) => {
      toast.error("Could Not Cancel", {
        description: error?.response?.data
          ? `${error.response.status}: ${
              Object.values(error.response.data)[0]
            }`
          : "Error",
      });
    },
  });

  const beginCancelDocGen = (formData: IDocGen) => {
    console.log(formData);
    cancelDocGenerationMutation.mutate(formData);
  };

  const beginProjectDocPDFGeneration = beginApprovedProjectDocPDFGeneration;

  const { pdfDocumentData, pdfDocumentDataLoading } = useGetAnnualReportPDF(
    thisReport?.pk ? thisReport.pk : thisReport?.id,
  );
  const [binaryPdfData, setBinaryPdfData] = useState<string | null>(null);

  const { colorMode } = useColorMode();

  const [showRestartMessage, setShowRestartMessage] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);

  useEffect(() => {
    let timer;
    if (
      pdfDocumentData?.report?.pdf_generation_in_progress === true ||
      annualReportPDFGenerationMutation.isPending
    ) {
      timer = setInterval(() => {
        setGenerationTime((prevTime) => prevTime + 1000);
        if (generationTime >= 30000) {
          setShowRestartMessage(true);
        }
      }, 1000);
    } else {
      clearInterval(timer);
      setGenerationTime(0);
      setShowRestartMessage(false);
    }

    return () => clearInterval(timer);
  }, [pdfDocumentData, generationTime, annualReportPDFGenerationMutation]);

  useEffect(() => {
    if (!pdfDocumentDataLoading && pdfDocumentData !== undefined) {
      const binary = atob(pdfDocumentData?.pdf_data);
      const arrayBuffer = new ArrayBuffer(binary.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < binary.length; i++) {
        uint8Array[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const dataUrl = URL.createObjectURL(blob);

      setBinaryPdfData(dataUrl);
    }
  }, [pdfDocumentDataLoading, pdfDocumentData]);

  const determineDPI = () => {
    const dpi = 300;
    const heightMm = 297;
    const mmInInch = 25.4;
    // Pixels: Amount in mm divided by 25.4 (conv fact. for mm to inches) by dpi
    const pixels = (heightMm / mmInInch) * dpi;
    return pixels;
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <div className="flex">
          <p className="text-sm text-gray-500 mr-2">
            {showRestartMessage
              ? "Generation taking longer than expected. If generation time exceeds one minute, please try again."
              : null}
          </p>
          <p className="text-sm text-gray-500 mr-2">
            {generationTime > 0
              ? `Generation time: ${generationTime / 1000} seconds`
              : null}
          </p>
        </div>

        <div className="flex">
          <form
            id="cancel-pdf-generation-form"
            onSubmit={handleCancelGenSubmit(beginCancelDocGen)}
          >
            <Input
              type="hidden"
              {...cancelGenRegister("document_pk", {
                required: true,
                value: thisReport?.pk ? thisReport.pk : thisReport?.id,
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
                value: thisReport?.pk ? thisReport.pk : thisReport?.id,
              })}
            />
          </form>

          <form
            id="pdf-generation-form-unapproved"
            onSubmit={handleGenSubmit(beginUnapprovedProjectDocPDFGeneration)}
          >
            <Input
              type="hidden"
              {...genRegister("document_pk", {
                required: true,
                value: thisReport?.pk ? thisReport.pk : thisReport?.id,
              })}
            />
          </form>

          {/* If the generation mutation is still pending but has been cancelled 
            show the generate buttons, otherwise show the cancel button
          */}
          {(annualReportPDFGenerationMutation.isPending &&
            !cancelDocGenerationMutation.isSuccess) ||
          pdfDocumentData?.report?.pdf_generation_in_progress ? (
            <Button
              size="sm"
              className={`ml-2 text-white ${
                colorMode === "light" ? "bg-gray-400 hover:bg-gray-300" : "bg-gray-500 hover:bg-gray-400"
              }`}
              disabled={cancelDocGenerationMutation.isPending}
              type="submit"
              form="cancel-pdf-generation-form"
            >
              {cancelDocGenerationMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FcCancel className="mr-2" />
              )}
              {cancelDocGenerationMutation.isPending ? "Canceling" : "Cancel"}
            </Button>
          ) : pdfDocumentData?.pdf_data ? (
            <Button
              size="sm"
              className={`ml-2 text-white ${
                colorMode === "light" ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-500"
              }`}
              onClick={() => {
                window.open(`${apiEndpoint}${pdfDocumentData?.file}`, "_blank");
              }}
            >
              <FaFileDownload className="mr-2" />
              Download PDF
            </Button>
          ) : null}

          <Button
            size="sm"
            className={`ml-2 text-white ${
              colorMode === "light" ? "bg-green-500 hover:bg-green-400" : "bg-green-600 hover:bg-green-500"
            }`}
            type="submit"
            form="pdf-generation-form"
            disabled={
              annualReportPDFGenerationMutation.isPending &&
              !cancelDocGenerationMutation.isPending
            }
          >
            {annualReportPDFGenerationMutation.isPending &&
            !cancelDocGenerationMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BsStars className="mr-2" />
            )}
            {annualReportPDFGenerationMutation.isPending &&
            !cancelDocGenerationMutation.isPending
              ? "Generation In Progress"
              : "Generate New"}
          </Button>

          <Button
            size="sm"
            className={`ml-2 text-white ${
              colorMode === "light" ? "bg-orange-500 hover:bg-orange-400" : "bg-orange-600 hover:bg-orange-500"
            }`}
            disabled={
              pdfDocumentData?.report?.pdf_generation_in_progress ||
              (annualReportPDFGenerationMutation.isPending &&
                !cancelDocGenerationMutation.isSuccess)
            }
            type="submit"
            form="pdf-generation-form-unapproved"
          >
            {pdfDocumentData?.report?.pdf_generation_in_progress ||
            (annualReportPDFGenerationMutation.isPending &&
              !cancelDocGenerationMutation.isSuccess) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BsStars className="mr-2" />
            )}
            {pdfDocumentData?.report?.pdf_generation_in_progress ||
            (annualReportPDFGenerationMutation.isPending &&
              !cancelDocGenerationMutation.isSuccess)
              ? "Generation In Progress"
              : "Include Unapproved"}
          </Button>
        </div>
      </div>
      {!pdfDocumentDataLoading ? (
        pdfDocumentData !== undefined ? (
          (pdfDocumentData?.report?.pdf_generation_in_progress &&
            !cancelDocGenerationMutation.isSuccess) ||
          (annualReportPDFGenerationMutation.isPending &&
            !cancelDocGenerationMutation.isSuccess) ? (
            <div className="flex justify-center mt-24">
              <img
                src="/bouncing-ball.svg"
                alt="Loading..."
                width="20%"
                height="20%"
              />
            </div>
          ) : (
            <iframe
              title="Annual Report PDF Viewer"
              src={binaryPdfData}
              width="100%"
              height={`${determineDPI() / 3.9}px`}
              style={{
                // border: "1px solid black",
                borderRadius: "20px",
              }}
            />
          )
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-center">
                <p>There is no pdf.</p>
              </div>
              <div className="flex justify-center">
                <p>Click generate new to create one.</p>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="flex justify-center mt-4">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
};
