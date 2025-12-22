import { useBusinessAreas } from "@/features/business-areas/hooks/useBusinessAreas";
import type { IBusinessArea, IReport } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaFilePdf } from "react-icons/fa";
import { IGeneratePDFProps, generateReportPDF } from "@/features/reports/services/reports.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  thisReport: IReport;
}

export const GenerateARPDFModal = ({ isOpen, onClose, thisReport }: Props) => {
  console.log(thisReport);

  const [isGenerateReportButtonDisabled, setIsGenerateReportButtonDisabled] =
    useState(false);

  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  const generatePDFMutation = useMutation({
    mutationFn: generateReportPDF,
    onMutate: () => {
      setIsGenerateReportButtonDisabled(true);
      const toastId = toast.loading("Generating PDF...");
      setLoadingToastId(toastId);
    },
    onSuccess: () => {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.success("Generation Complete.");
      setIsGenerateReportButtonDisabled(false);

      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: () => {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error("Unable to generate PDF.");
      setTimeout(() => {
        setIsGenerateReportButtonDisabled(false);
      }, 1000);
    },
  });

  const generatePDF = (formData: IGeneratePDFProps) => {
    console.log("Generating...");
    console.log(formData);
    generatePDFMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();

  const sectionDictionary = {
    cover: "Cover Page",
    dm: "Director's Message",
    contents: "Contents", // table of contents
    sds: "Service Delivery Structure",
    progress: "Progress Reports", // subsections for each business area
    external_summary: "External Partnerships", //table with title
    student_summary: "Student Projects", // table with title
    student_progress: "Student Reports",
    publications: "Publications and Reports",
    summary: "Summary of Research Projects", // table with title
  };

  const { baData, baLoading } = useBusinessAreas();

  const { register, handleSubmit, watch } = useForm<IGeneratePDFProps>();

  const selectedSection = watch("section");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <form onSubmit={handleSubmit(generatePDF)} className={colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-white"}>
          <DialogHeader>
            <DialogTitle>Generate PDF?</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-10 p-6">
            <div className="mt-8 flex flex-col items-center">
              <div className="px-4 mb-4">
                <p className="font-semibold text-xl">
                  You are about to generate a pdf
                  {thisReport?.year &&
                    ` for Annual Report FY ${thisReport.year}-${
                      thisReport.year - 1
                    }`}
                  .{" "}
                </p>
              </div>

              <div className="hidden">
                <Input
                  type="hidden"
                  {...register("reportId", {
                    required: true,
                    value: Number(thisReport?.id),
                  })}
                  readOnly
                />
              </div>

              <div className="px-80 mt-8 w-full">
                <Label htmlFor="section">Section *</Label>
                <Select {...register("section", { required: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Section To Generate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">0. Full Report</SelectItem>
                    {Object.entries(sectionDictionary).map(
                      ([key, value], index) => (
                        <SelectItem key={key} value={key}>
                          {index + 1}. {value}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Select the section of the annual report you would like to
                  generate
                </p>
              </div>

              {!baLoading && selectedSection === "progress" && (
                <div className="px-80 mt-8 w-full">
                  <Label htmlFor="businessArea">Business Area</Label>
                  <Select {...register("businessArea", { required: false })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Business Area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All</SelectItem>
                      {baData?.map((ba: IBusinessArea) => (
                        <SelectItem key={ba.name} value={String(ba?.pk)}>
                          {ba.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is optional, but may save time. By default, all
                    business areas will be included.
                  </p>
                </div>
              )}

              <p className="font-semibold text-red-500 mt-8 mb-12 px-80">
                Note: Further PDF generations for this report will be disabled
                until this operation has completed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  generatePDFMutation.isPending ||
                  isGenerateReportButtonDisabled ||
                  !selectedSection
                }
                className="ml-3"
              >
                <FaFilePdf className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
