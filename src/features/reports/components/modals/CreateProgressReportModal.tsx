// Modal for creating progress reports

import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Loader2 } from "lucide-react";
import { type ISpawnDocument, spawnNewEmptyDocument } from "@/features/reports/services/reports.service";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useGetProgressReportAvailableReportYears } from "@/features/reports/hooks/useGetProgressReportAvailableReportYears";

interface Props {
  projectPk: string | number;
  documentKind: "progressreport";
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProgressReportModal = ({
  projectPk,
  documentKind,
  refetchData,
  isOpen,
  onClose,
}: Props) => {
  const {
    availableProgressReportYearsLoading,
    availableProgressReportYearsData,
    refetchProgressYears,
  } = useGetProgressReportAvailableReportYears(Number(projectPk));

  const { register, handleSubmit, reset, watch } = useForm<ISpawnDocument>();

  const yearValue = watch("year");
  const projPk = watch("projectPk");

  const [selectedReportId, setSelectedReportId] = useState<number>();
  const reportValue = watch("report_id");

  useEffect(() => {
    if (
      !availableProgressReportYearsLoading &&
      availableProgressReportYearsData &&
      yearValue
    ) {
      const obj = availableProgressReportYearsData.find(
        (item) => Number(item.year) === Number(yearValue),
      );
      setSelectedReportId(obj.pk);
    }
  }, [
    yearValue,
    reportValue,
    availableProgressReportYearsData,
    availableProgressReportYearsLoading,
  ]);

  useEffect(() => {
    refetchProgressYears();
  }, [selectedReportId]);

  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const createProgressReportMutation = useMutation({
    mutationFn: spawnNewEmptyDocument,
    onMutate: () => {
      const toastId = toast.loading("Creating Progress Report");
      setLoadingToastId(toastId);
    },
    onSuccess: async () => {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.success("Progress Report Created");
      refetchProgressYears(() => {
        reset();
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        refetchData();
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error(`Could not create progress report: ${error}`);
    },
  });

  const createProgressReportFunc = (formData: ISpawnDocument) => {
    const newFormData = {
      report_id: selectedReportId,
      year: formData.year,
      kind: formData.kind,
      projectPk: formData.projectPk,
    };

    console.log(newFormData);

    createProgressReportMutation.mutate(newFormData);
  };

  const { colorMode } = useColorMode();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit(createProgressReportFunc)} className={colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-white"}>
          <DialogHeader>
            <DialogTitle>Create Progress Report?</DialogTitle>
          </DialogHeader>
          {!availableProgressReportYearsLoading ? (
            <>
              <div className="p-6">
                {availableProgressReportYearsData.length < 1 ? (
                  <div className="mt-6">
                    <p>
                      A progress report cannot be created for this project as it
                      already has reports for each available year. Please either
                      create a new annual report for the year you wish to create
                      a progress report or delete the current one occupying the
                      year you wish to create for.
                    </p>
                    <p className="mt-8 text-red-500">
                      Note: Creating a new progress report will send out updates
                      and spawn progress/student reports for the year
                      automatically.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-8 flex justify-center">
                      <ul className="list-disc list-inside space-y-2">
                        <li>
                          This will create a progress report for the selected
                          year.
                        </li>
                        <li>
                          Years will only appear based on whether an annual
                          report exists for that year
                        </li>
                        <li>
                          Years which already have progress reports for this
                          project will not be selectable
                        </li>
                      </ul>
                    </div>
                    
                    <div className="hidden">
                      <Input
                        type="hidden"
                        {...register("projectPk", {
                          required: true,
                          value: Number(projectPk),
                        })}
                        readOnly
                      />
                    </div>

                    <div className="mt-6">
                      <Select {...register("year", { required: true })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a report year" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProgressReportYearsData
                            ?.sort((a, b) => b.year - a.year) // Sort years in descending order
                            .map((freeReportYear, index: number) => {
                              return (
                                <SelectItem key={index} value={String(freeReportYear.year)}>
                                  {`FY ${freeReportYear.year - 1} - ${String(
                                    freeReportYear.year,
                                  ).slice(2)}`}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select an annual report for this progress report
                      </p>
                    </div>

                    <div className="hidden">
                      <Input
                        type="hidden"
                        {...register("kind", {
                          required: true,
                          value: documentKind,
                        })}
                        readOnly
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                {availableProgressReportYearsData.length >= 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!yearValue || !selectedReportId || !projPk || createProgressReportMutation.isPending}
                      className="ml-3"
                    >
                      Create
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          ) : (
            <div className="flex justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
