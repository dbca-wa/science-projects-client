import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import { type IProgressReportDisplayData } from "@/shared/components/RichTextEditor/Editors/ARProgressReportHandler";
import { type IStudentReportDisplayData } from "@/shared/components/RichTextEditor/Editors/ARStudentReportHandler";
import {
  type IApproveProgressReport,
  approveProgressReport,
} from "@/features/users/services/users.service";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  report: IProgressReportDisplayData | IStudentReportDisplayData;
  isActive: boolean;
  isOpen: boolean;
  onClose: () => void;
  isAnimating?: boolean;
  setIsAnimating?: (state: boolean) => void;
}

export const ApproveProgressReportModal = ({
  report,
  isActive,
  setIsAnimating,
  isOpen,
  onClose,
}: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<IApproveProgressReport>();
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  const approveProgressReportMutation = useMutation({
    mutationFn: approveProgressReport,
    onMutate: () => {
      const toastId = toast.loading(
        isActive
          ? "Setting Progress Report to Pending"
          : "Approving Progress Report"
      );
      setLoadingToastId(toastId);
    },
    onSuccess: () => {
      if (setIsAnimating) {
        setIsAnimating(true);
      }

      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.success(isActive ? "Set to Pending" : "Approved");
      
      reset();
      queryClient.invalidateQueries({
        queryKey: ["latestUnapprovedProgressReports"],
      });
      queryClient.invalidateQueries({ queryKey: ["latestProgressReports"] });
      queryClient.invalidateQueries({ queryKey: ["latestStudentReports"] });
      onClose();

      setTimeout(() => {
        if (setIsAnimating) {
          setIsAnimating(false);
        }
      }, 350);
    },
    onError: (error) => {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error(
        `${isActive ? "Could Not Set to Pending" : "Could Not Approve"}: ${error}`
      );
    },
  });

  const onBeginApprovalMutation = (formData: IApproveProgressReport) => {
    approveProgressReportMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isActive ? "Return" : "Approve"} Progress Report?
          </DialogTitle>
        </DialogHeader>

        <form
          id="progressreportapprove-form"
          onSubmit={handleSubmit(onBeginApprovalMutation)}
          className={`p-6 ${colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-white"}`}
        >
          <div className="pb-6 hidden">
            <Input
              {...register("kind", { required: true })}
              type="hidden"
              defaultValue={report.document.kind}
            />
            <Input
              {...register("reportPk", { required: true })}
              type="hidden"
              defaultValue={report.pk}
            />
            <Input
              {...register("documentPk", { required: true })}
              type="hidden"
              defaultValue={report.document.pk}
            />
            <Input
              {...register("isActive", { required: true })}
              type="hidden"
              defaultValue={isActive ? 1 : 0}
            />
          </div>

          <div>
            <p className="font-bold">
              {isActive
                ? "Set this progress report to pending"
                : "Provide final sign off for this progress report"}
              ?
            </p>
            <p>
              {isActive
                ? "Note: this will set the project back to update requested and set the document's directorate approval to Required"
                : "Note: If not already approved by project lead and business area lead, the report will be fast-tracked and provided with all approvals"}
            </p>
            <div className="grid grid-cols-1 mt-2">
              <div className="mb-4 mt-2 flex">
                <div>
                  <ExtractedHTMLTitle
                    htmlContent={report?.document?.project?.title}
                    color={"green.400"}
                  />
                </div>
              </div>
              
              <div className="flex justify-center text-center -ml-[10%]">
                <div className="w-1/2 flex">
                  <div className="flex-1 text-end mr-4">
                    <p className="font-bold">Kind:</p>
                  </div>
                  <div className="min-w-[120px] text-start">
                    <p>{report?.document?.kind}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center text-center -ml-[10%]">
                <div className="w-1/2 flex">
                  <div className="flex-1 text-end mr-4">
                    <p className="font-bold">Year:</p>
                  </div>
                  <div className="min-w-[120px] text-start">
                    <p>{report?.year}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center text-center -ml-[10%]">
                <div className="w-1/2 flex">
                  <div className="flex-1 text-end mr-4">
                    <p className="font-bold">Report PK:</p>
                  </div>
                  <div className="min-w-[120px] text-start">
                    <p>{report?.pk}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center text-center -ml-[10%]">
                <div className="w-1/2 flex">
                  <div className="flex-1 text-end mr-4">
                    <p className="font-bold">Document PK:</p>
                  </div>
                  <div className="min-w-[120px] text-start">
                    <p>{report?.document?.pk}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center text-center -ml-[10%]">
                <div className="w-1/2 flex">
                  <div className="flex-1 text-end mr-4">
                    <p className="font-bold">Action:</p>
                  </div>
                  <div className="min-w-[120px] text-start">
                    <p>{isActive ? "Set to Pending" : "Approve"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-3">
            Cancel
          </Button>
          <Button
            form="progressreportapprove-form"
            type="submit"
            disabled={approveProgressReportMutation.isPending}
            className="bg-green-500 hover:bg-green-400 text-white"
          >
            {isActive ? "Set to Pending" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
