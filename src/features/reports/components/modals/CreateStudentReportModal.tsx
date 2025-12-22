// Modal for handling creation of student reports

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
import { useGetStudentReportAvailableReportYears } from "@/features/reports/hooks/useGetStudentReportAvailableReportYears";

interface Props {
  projectPk: string | number;
  documentKind: "studentreport";
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStudentReportModal = ({
  projectPk,
  documentKind,
  refetchData,
  isOpen,
  onClose,
}: Props) => {
  const {
    availableStudentYearsLoading,
    availableStudentYearsData,
    refetchStudentYears,
  } = useGetStudentReportAvailableReportYears(Number(projectPk));

  const { register, handleSubmit, reset, watch } = useForm<ISpawnDocument>();

  const yearValue = watch("year");

  const projPk = watch("projectPk");

  const [selectedReportId, setSelectedReportId] = useState<number>();
  const reportValue = watch("report_id");

  useEffect(() => {
    if (
      !availableStudentYearsLoading &&
      availableStudentYearsData &&
      yearValue
    ) {
      const obj = availableStudentYearsData.find(
        (item) => Number(item.year) === Number(yearValue),
      );
      setSelectedReportId(obj.pk);
    }
  }, [
    yearValue,
    reportValue,
    availableStudentYearsData,
    availableStudentYearsLoading,
  ]);

  useEffect(() => {
    refetchStudentYears();
  }, [selectedReportId]);

  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const createStudentReportMutation = useMutation({
    mutationFn: spawnNewEmptyDocument,
    onMutate: () => {
      const toastId = toast.loading("Creating Student Report");
      setLoadingToastId(toastId);
    },
    onSuccess: async () => {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.success("Student Report Created");
      refetchStudentYears(() => {
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
      toast.error(`Could not create student report: ${error}`);
    },
  });

  const createStudentReportFunc = (formData: ISpawnDocument) => {
    const newFormData = {
      report_id: selectedReportId,
      year: formData.year,
      kind: formData.kind,
      projectPk: formData.projectPk,
    };

    createStudentReportMutation.mutate(newFormData);
  };

  const { colorMode } = useColorMode();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit(createStudentReportFunc)} className={colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-white"}>
          <DialogHeader>
            <DialogTitle>Create Student Report?</DialogTitle>
          </DialogHeader>
          {!availableStudentYearsLoading ? (
            <>
              <div className="p-6">
                {availableStudentYearsData.length < 1 ? (
                  <div className="mt-6">
                    <p>
                      A student report cannot be created for this project as it
                      already has reports for each available year
                      {/* since its creation - potentially adjust hook and api to only get available reports since its creation*/}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-8 flex justify-center">
                      <ul className="list-disc list-inside space-y-2">
                        <li>
                          This will create a student report for the selected
                          year.
                        </li>
                        <li>
                          Years will only appear based on whether an annual
                          report exists for that year
                        </li>
                        <li>
                          Years which already have student reports for this
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
                          {availableStudentYearsData
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
                {availableStudentYearsData.length >= 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!yearValue || !selectedReportId || !projPk || createStudentReportMutation.isPending}
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
