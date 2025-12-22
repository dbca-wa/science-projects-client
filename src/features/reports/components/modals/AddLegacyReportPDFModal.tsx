import type { ILegacyPDF } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
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
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addLegacyPDF } from "@/features/reports/services/reports.service";
import { useUser } from "@/features/users/hooks/useUser";
import { SingleFileStateUpload } from "@/shared/components/SingleFileStateUpload";

interface Props {
  isAddLegacyPDFOpen: boolean;
  onAddLegacyPDFClose: () => void;
  refetchLegacyPDFs: () => void;
  legacyPDFData: ILegacyPDF[];
}

export const AddLegacyReportPDFModal = ({
  isAddLegacyPDFOpen,
  onAddLegacyPDFClose,
  legacyPDFData,
  refetchLegacyPDFs,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  const [uploadedPDF, setUploadedPDF] = useState<File>();
  const [reportYear, setReportYear] = useState<number>();
  const [isError, setIsError] = useState(false);

  const { userData } = useUser();

  const ararPDFAdditionMutation = useMutation({
    mutationFn: addLegacyPDF,
    onMutate: () => {
      toast.loading("Adding PDF...");
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "PDF Added",
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["legacyARPDFs"] });
        refetchLegacyPDFs();
      }, 350);

      onAddLegacyPDFClose();
    },
    onError: (error) => {
      toast.error("Could Not Add PDF", {
        description: `${error}`,
      });
    },
  });

  const onSubmitPDFAdd = () => {
    const formData = {
      userId: userData?.pk ? userData.pk : userData.id,
      reportYear,
      pdfFile: uploadedPDF,
    };
    ararPDFAdditionMutation.mutate(formData);
  };

  const availableYears = Array.from({ length: 9 }, (_, i) => 2005 + i).filter(
    (year) => !legacyPDFData.some((report) => report.year === year),
  );

  return (
    <Dialog open={isAddLegacyPDFOpen} onOpenChange={onAddLegacyPDFClose}>
      <DialogContent className={`${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "bg-white"}`}>
        <DialogHeader>
          <DialogTitle>Add Legacy PDF</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="mb-4">
            Use this form to add the finalised pdf of ancient reports.
          </p>
          {legacyPDFData ? (
            <div className="pb-6">
              <Label htmlFor="report-year">Report Year</Label>
              <Select onValueChange={(value) => setReportYear(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year, index) => (
                    <SelectItem key={index} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div>
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
          <Button variant="outline" onClick={onAddLegacyPDFClose}>
            Cancel
          </Button>
          <Button
            disabled={ararPDFAdditionMutation.isPending || !uploadedPDF || !reportYear || isError}
            className={`text-white ${
              colorMode === "dark" 
                ? "bg-green-500 hover:bg-green-400" 
                : "bg-green-400 hover:bg-green-300"
            }`}
            onClick={() => {
              onSubmitPDFAdd();
            }}
          >
            {ararPDFAdditionMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
