// Modal for promoting or demoting users

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type MutationError,
  type PRPopulationVar,
  getPreviousDataForProgressReportPopulation,
} from "@/features/users/services/users.service";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
  functionToRun: (dataToPaste: string) => void;
  writeable_document_kind: string;
  section: string;
  project_pk: number;
}

export const RTEPriorReportPopulationModal = ({
  isOpen,
  onClose,
  functionToRun,
  writeable_document_kind,
  section,
  project_pk,
}: IModalProps) => {
  const { colorMode } = useColorMode();

  const handleToastClose = () => {
    onClose();
  };

  const populationMutation = useMutation<
    string,
    MutationError,
    PRPopulationVar
  >({
    // Start of mutation handling
    mutationFn: getPreviousDataForProgressReportPopulation,
    onMutate: () => {
      toast.loading("Getting Previous Data...", {
        description: "One moment!",
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: (data) => {
      console.log(data);
      functionToRun(data);
      toast.success("Success", {
        description: `Populated`,
      });
      //  Close the modal
      if (onClose) {
        onClose();
      }
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while populating"; // Default error message

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

      toast.error("Population failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async ({
    writeable_document_kind,
    section,
    project_pk,
  }: PRPopulationVar) => {
    await populationMutation.mutateAsync({
      writeable_document_kind,
      section,
      project_pk,
    });
    onClose();
  };

  const { register, handleSubmit } = useForm<PRPopulationVar>();

  return (
    <Dialog open={isOpen} onOpenChange={handleToastClose}>
      <DialogContent 
        className={`max-w-md ${
          colorMode === "dark" 
            ? "bg-gray-800 text-gray-400 border-gray-700" 
            : "bg-white text-gray-900 border-gray-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle>Populate With Prior Data?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <p>
                Would you like to populate this section with the previous progress
                report's data?
              </p>
              <p className="text-sm text-blue-500">
                Keep in mind that you will still need to update your report with
                data for the latest this Financial Year.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <form id="promotion-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="hidden">
            <Input
              type="hidden"
              {...register("project_pk", {
                required: true,
                value: project_pk,
              })}
              readOnly
            />
            <Input
              type="hidden"
              {...register("section", { required: true, value: section })}
              readOnly
            />
            <Input
              type="hidden"
              {...register("writeable_document_kind", {
                required: true,
                value: writeable_document_kind,
              })}
              readOnly
            />
          </div>
        </form>
        
        <DialogFooter>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              form="promotion-form"
              type="submit"
              disabled={populationMutation.isPending}
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-green-600 hover:bg-green-400"
              }`}
            >
              {populationMutation.isPending ? "Loading..." : "Yes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
