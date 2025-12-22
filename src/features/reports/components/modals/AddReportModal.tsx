import { createReport } from "@/features/admin/services/admin.service";
import type { IReportCreation } from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddReportModal = ({ isOpen, onClose }: Props) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const { register, watch, reset } = useForm<IReportCreation>();

  const [thisYear, setThisYear] = useState(new Date().getFullYear());

  const yearData = watch("year");

  const mutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      toast.success("Created");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["latestReport"] });
      reset();
      onClose();
    },
    onError: (e: AxiosError) => {
      let errorDescription = "";

      // Check if e.response.data is an object
      if (typeof e.response.data === "object" && e.response.data !== null) {
        // Iterate over the properties of the object
        Object.keys(e.response.data).forEach((key) => {
          // Assert the type of e.response.data[key] as string
          errorDescription += `${key}: ${String(e.response.data[key])}\n`;
        });
      } else {
        // If not an object, use the original data
        errorDescription = String(e.response.data);
      }

      console.log("error");
      toast.error(`Failed: ${errorDescription}`);
    },
    onMutate: () => {
      console.log("mutation");
    },
  });

  const onSubmit = (formData: IReportCreation) => {
    console.log(formData);
    mutation.mutate(formData);
  };

  return thisYear ? (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-white"} max-w-lg`}>
        <DialogHeader>
          <DialogTitle>Create Annual Report Info</DialogTitle>
        </DialogHeader>

        <div className="space-y-10 py-4">
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <div className="relative">
              <Input
                id="year"
                autoFocus
                autoComplete="off"
                defaultValue={thisYear}
                onChange={(e) => setThisYear(Number(e.target.value))}
                {...register("year", { required: true, value: thisYear })}
                required
                type="number"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              The year for the report. e.g. Type 2023 for financial year
              2022-23.
            </p>
          </div>

          {mutation.isError ? (
            <div className="mt-4">
              {Object.keys((mutation.error as AxiosError).response.data).map(
                (key) => (
                  <div key={key}>
                    {(
                      (mutation.error as AxiosError).response.data[
                        key
                      ] as string[]
                    ).map((errorMessage, index) => (
                      <p key={`${key}-${index}`} className="text-red-500">
                        {`${key}: ${errorMessage}`}
                      </p>
                    ))}
                  </div>
                ),
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={mutation.isPending || !yearData}
              className={`${
                colorMode === "light" 
                  ? "bg-blue-500 hover:bg-blue-400" 
                  : "bg-blue-600 hover:bg-blue-500"
              } text-white`}
              onClick={() => {
                onSubmit({
                  old_id: 1,
                  year: yearData,
                  //   date_open: new Date,
                  //   date_closed: endDate,
                  dm: "<p></p>",
                  publications: "<p></p>",
                  research_intro: "<p></p>",
                  service_delivery_intro: "<p></p>",
                  student_intro: "<p></p>",
                  seek_update: false,
                });
              }}
            >
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
};
