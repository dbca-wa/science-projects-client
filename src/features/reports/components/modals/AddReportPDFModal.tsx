import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@/features/users/hooks/useUser";
import { addPDFToReport } from "@/features/reports/services/reports.service";
import { useGetARARsWithoputPDF } from "@/features/reports/hooks/useGetARARsWithoputPDF";
import { SingleFileStateUpload } from "@/shared/components/SingleFileStateUpload";
import { toast } from "sonner";

interface Props {
  isAddPDFOpen: boolean;
  onAddPDFClose: () => void;
  refetchPDFs: () => void;
}

export const AddReportPDFModal = ({
  isAddPDFOpen,
  onAddPDFClose,
  refetchPDFs,
}: Props) => {
  const queryClient = useQueryClient();

  const [uploadedPDF, setUploadedPDF] = useState<File>();
  const [reportId, setReportId] = useState<string>("");
  const [isError, setIsError] = useState(false);

  const { userData } = useUser();
  const {
    reportsWithoutPDFLoading,
    reportsWithoutPDFData,
    refetchReportsWithoutPDFs,
  } = useGetARARsWithoputPDF();

  useEffect(() => {
    if (!reportsWithoutPDFLoading && reportsWithoutPDFData) {
      setReportId(
        reportsWithoutPDFData.length > 0 ? String(reportsWithoutPDFData[0]?.pk) : "",
      );
    }
  }, [reportsWithoutPDFLoading, reportsWithoutPDFData]);

  const ararPDFAdditionMutation = useMutation({
    mutationFn: addPDFToReport,
    onMutate: () => {
      toast.loading("Adding PDF...");
    },
    onSuccess: () => {
      toast.success("PDF Added");
      onAddPDFClose();

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["ararsWithoutPDFs"] });
        queryClient.invalidateQueries({ queryKey: ["ararsWithPDFs"] });
        refetchPDFs();
        refetchReportsWithoutPDFs();
      }, 350);
    },
    onError: (error) => {
      toast.error(`Could Not Add PDF: ${error}`);
    },
  });

  const onSubmitPDFAdd = () => {
    const formData = {
      userId: userData?.pk ? userData.pk : userData.id,
      reportId: Number(reportId),
      pdfFile: uploadedPDF,
    };
    ararPDFAdditionMutation.mutate(formData);
  };

  return (
    <Dialog open={isAddPDFOpen} onOpenChange={onAddPDFClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add PDF to Report</DialogTitle>
          <DialogDescription>
            Use this form to add the finalised pdf to the report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!reportsWithoutPDFLoading && reportsWithoutPDFData ? (
            <div className="space-y-2">
              <Label htmlFor="report-select">Selected Report</Label>
              <Select value={reportId} onValueChange={setReportId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a report" />
                </SelectTrigger>
                <SelectContent>
                  {!reportsWithoutPDFLoading &&
                    reportsWithoutPDFData.map((report, index) => (
                      <SelectItem key={index} value={String(report?.pk)}>
                        {report?.year}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>PDF File</Label>
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
          <Button variant="outline" onClick={onAddPDFClose}>
            Cancel
          </Button>
          <Button
            disabled={!uploadedPDF || !reportId || reportId === "" || isError || ararPDFAdditionMutation.isPending}
            onClick={onSubmitPDFAdd}
            className="bg-green-500 hover:bg-green-400 text-white dark:bg-green-500 dark:hover:bg-green-400"
          >
            {ararPDFAdditionMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
