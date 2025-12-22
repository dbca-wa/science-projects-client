// Modal for updating a report's pdf
import type { ISmallReport } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  deleteFinalAnnualReportPDF,
  deleteLegacyFinalAnnualReportPDF,
  updateLegacyReportPDF,
  updateReportPDF,
} from "@/features/reports/services/reports.service";
import { SingleFileStateUpload } from "@/shared/components/SingleFileStateUpload";
import { toast } from "sonner";

interface Props {
  isChangePDFOpen: boolean;
  report: ISmallReport;
  onChangePDFClose: () => void;
  refetchPDFs: () => void;
  isLegacy: boolean;
}

export const ChangeReportPDFModal = ({
  isChangePDFOpen,
  onChangePDFClose,
  refetchPDFs,
  isLegacy,
  report,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  const [uploadedPDF, setUploadedPDF] = useState<File>();
  const [reportMediaId, setReportMediaId] = useState<number>();
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // console.log(report);
    setReportMediaId(report && (!isLegacy ? report?.pdf?.pk : report?.pk));
  }, [report, isLegacy]);

  const ararPDFChangeMutation = useMutation({
    mutationFn: isLegacy ? updateLegacyReportPDF : updateReportPDF,
    onMutate: () => {
      toast.loading("Updating PDF");
    },
    onSuccess: () => {
      toast.success("PDF Updated");
      onChangePDFClose();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["ararsWithoutPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["ararsWithPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["legacyARPDFs"] });
        refetchPDFs();
      }, 350);
    },
    onError: (error) => {
      toast.error(`Could Not Update PDF: ${error}`);
    },
  });

  const deletePDFMutation = useMutation({
    mutationFn: isLegacy
      ? deleteLegacyFinalAnnualReportPDF
      : deleteFinalAnnualReportPDF,
    onMutate: () => {
      toast.loading("Deleting PDF");
    },
    onSuccess: () => {
      toast.success("PDF Deleted");
      // reset()
      onChangePDFClose();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["ararsWithoutPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["ararsWithPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["legacyARPDFs"] });
        refetchPDFs();
      }, 350);
    },
    onError: (error) => {
      toast.error(`Could Not Delete PDF: ${error}`);
    },
  });

  const deleteFile = () => {
    deletePDFMutation.mutate(!isLegacy ? report?.pdf?.pk : report?.pk);
  };

  const onSubmitPDFUpdate = () => {
    const formData = {
      reportMediaId,
      pdfFile: uploadedPDF,
    };
    ararPDFChangeMutation.mutate(formData);
  };

  return (
    <Dialog open={isChangePDFOpen} onOpenChange={onChangePDFClose}>
      <DialogContent className={`${colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-white"} max-w-lg`}>
        <DialogHeader>
          <DialogTitle>Change PDF of {report?.year}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            Use this form to change the finalised pdf of the report.
          </p>

          {report ? (
            <div className="space-y-2">
              <Label>Selected Report</Label>
              <Select value={String(report?.pdf?.pk)} disabled>
                <SelectTrigger>
                  <SelectValue placeholder={String(report?.year)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(report?.pdf?.pk)}>{report?.year}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={deleteFile}
              className={`${
                colorMode === "light" 
                  ? "bg-red-500 hover:bg-red-400" 
                  : "bg-red-600 hover:bg-red-500"
              } text-white`}
            >
              Remove Current PDF
            </Button>
          </div>

          <div className="relative py-4">
            <Separator />
            <div className={`absolute inset-0 flex items-center justify-center`}>
              <span className={`${colorMode === "light" ? "bg-white" : "bg-gray-800"} px-4 text-sm text-muted-foreground`}>
                OR
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Replace PDF File</Label>
            <SingleFileStateUpload
              fileType={"pdf"}
              uploadedFile={uploadedPDF}
              setUploadedFile={setUploadedPDF}
              isError={isError}
              setIsError={setIsError}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onChangePDFClose}>
            Cancel
          </Button>
          <Button
            disabled={
              ararPDFChangeMutation.isPending ||
              !uploadedPDF || 
              !reportMediaId || 
              reportMediaId === 0 || 
              isError
            }
            className={`${
              colorMode === "dark" 
                ? "bg-green-500 hover:bg-green-400" 
                : "bg-green-400 hover:bg-green-300"
            } text-white`}
            onClick={() => {
              onSubmitPDFUpdate();
            }}
          >
            {ararPDFChangeMutation.isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
