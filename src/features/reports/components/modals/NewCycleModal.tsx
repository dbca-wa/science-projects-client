// Delete User Modal - for removing users from the system all together. Admin only.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { INewCycle, openNewCycle } from "@/features/users/services/users.service";
import type { MutationError, MutationSuccess } from "@/shared/services/api";
import { useLatestReportYear } from "@/features/reports/hooks/useLatestReportYear";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useColorMode } from "@/shared/utils/theme.utils";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCycleModal = ({ isOpen, onClose }: IModalProps) => {
  const { colorMode } = useColorMode();
  const [isToastOpen, setIsToastOpen] = useState(false);

  const { latestYear } = useLatestReportYear();

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    setIsToastOpen(false);
    onClose();
  };

  const [shouldIncludeUpdate, setShouldIncludeUpdate] = useState(true);
  const [shouldSendEmails, setShouldSendEmails] = useState(false);
  const [shouldPrepopulate, setShouldPrepopulate] = useState(false);

  const queryClient = useQueryClient();

  const newCycleMutation = useMutation<
    MutationSuccess,
    MutationError,
    INewCycle
  >({
    // Start of mutation handling
    mutationFn: openNewCycle,
    onMutate: () => {
      toast.loading("Batch Creating Progress Reports...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      toast.success("Success", {
        description: `Active projects have new progress reports!`,
      });
      queryClient.invalidateQueries({
        queryKey: ["latestUnapprovedProgressReports"],
      });
      queryClient.invalidateQueries({ queryKey: ["latestProgressReports"] });
      queryClient.invalidateQueries({ queryKey: ["latestStudentReports"] });
      onClose?.();
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while opening the new cycle"; // Default error message

      const collectErrors = (data, prefix = "") => {
        if (typeof data === "string") {
          return [data];
        }

        const errorMessages = [];

        for (const key in data) {
          if (Array.isArray(data[key])) {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else if (typeof data[key] === "object") {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else {
            errorMessages.push(`${prefix}${key}: ${data[key]}`);
          }
        }

        return errorMessages;
      };

      if (error.response && error.response.data) {
        const errorMessages = collectErrors(error.response.data);
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join("\n"); // Join errors with new lines
        }
      } else if (error.message) {
        errorMessage = error.message; // Use the error message from the caught exception
      }

      toast.error("Update failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async (formData: INewCycle) => {
    formData.shouldSendEmails = shouldSendEmails;
    formData.shouldPrepopulate = shouldPrepopulate;

    await newCycleMutation.mutateAsync(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleToastClose}>
      <DialogContent 
        className={`max-w-lg ${
          colorMode === "dark" 
            ? "bg-gray-800 text-gray-400 border-gray-700" 
            : "bg-white text-gray-900 border-gray-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle>Open New Report Cycle?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="flex justify-center">
                <p className="font-bold text-xl">
                  Are you sure you want to open a new reporting cycle for FY{" "}
                  {`${latestYear - 1}-${String(latestYear).substring(2)}`}?
                </p>
              </div>
              <p>
                Any projects with the status "active and approved" will get new
                progress reports for the latest financial year (if they dont
                already exist).
              </p>

              <div className="my-8 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-update"
                      checked={shouldIncludeUpdate}
                      onCheckedChange={(checked) => setShouldIncludeUpdate(!!checked)}
                    />
                    <label htmlFor="include-update" className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Also include projects with statuses "Update Requested" and "Suspended"?
                    </label>
                  </div>
                  <p className="text-xs ml-6">
                    If this is selected, projects which have the status "Update
                    Requested" or "Suspended" will also get new progress reports for
                    the latest financial year's report, and be set to "Update
                    Requested".
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-emails"
                      checked={shouldSendEmails}
                      onCheckedChange={(checked) => setShouldSendEmails(!!checked)}
                    />
                    <label htmlFor="send-emails" className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Also send emails?
                    </label>
                  </div>
                  <p className="text-xs ml-6">
                    If this is selected, all active business area leads will receive
                    an email alerting them the new cycle is open for FY{" "}
                    {`${latestYear - 1}-${String(latestYear).substring(2)}`}. You
                    may opt to open the cycle first and send these emails later by
                    leaving this unchecked for now, and checking/opening the cycle
                    again later.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="prepopulate"
                      checked={shouldPrepopulate}
                      onCheckedChange={(checked) => setShouldPrepopulate(!!checked)}
                    />
                    <label htmlFor="prepopulate" className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Prepopulate?
                    </label>
                  </div>
                  <p className="text-xs ml-6">
                    If this is selected, the progress reports will be prepopulated
                    with data from the last reported year (if one exists).
                  </p>
                </div>
              </div>

              <p>
                If you would still like to proceed, press "Open Cycle".
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-green-500 hover:bg-green-400" 
                  : "bg-green-600 hover:bg-green-500"
              }`}
              disabled={newCycleMutation.isPending}
              onClick={() =>
                onSubmit({
                  alsoUpdate: shouldIncludeUpdate,
                  shouldSendEmails: shouldSendEmails,
                  shouldPrepopulate: shouldPrepopulate,
                })
              }
            >
              {newCycleMutation.isPending ? "Loading..." : "Open Cycle"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
