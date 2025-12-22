import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { IDeleteDocument, deleteDocumentCall } from "@/features/documents/services/documents.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useGetStudentReportAvailableReportYears } from "@/features/reports/hooks/useGetStudentReportAvailableReportYears";
import { useGetProgressReportAvailableReportYears } from "@/features/reports/hooks/useGetProgressReportAvailableReportYears";

interface Props {
  projectPk: string | number;
  documentPk: string | number;
  documentKind:
    | "conceptplan"
    | "projectplan"
    | "progressreport"
    | "studentreport"
    | "projectclosure";
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const DeleteDocumentModal = ({
  projectPk,
  documentPk,
  documentKind,
  refetchData,
  isOpen,
  onClose,
  onDeleteSuccess,
  setToLastTab,
}: Props) => {
  const { refetchProgressYears } = useGetProgressReportAvailableReportYears(
    Number(projectPk),
  );
  const { refetchStudentYears } = useGetStudentReportAvailableReportYears(
    Number(projectPk),
  );

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const deleteDocumentMutation = useMutation({
    mutationFn: deleteDocumentCall,
    onMutate: () => {
      toast.loading("Deleting Document");
    },
    onSuccess: async () => {
      setToLastTab(-1);
      toast.success("Success", {
        description: "Document Deleted",
      });
      refetchStudentYears(() => {
        reset();
      });
      refetchProgressYears(() => {
        reset();
      });
      onDeleteSuccess?.();

      setTimeout(async () => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        await refetchData();
        onClose();
        console.log("deleting");
      }, 350);
    },
    onError: (error) => {
      toast.error("Could not delete document", {
        description: `${error}`,
      });
    },
  });

  const deleteDocument = (formData: IDeleteDocument) => {
    deleteDocumentMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const { register, handleSubmit, reset } = useForm<IDeleteDocument>();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-black bg-white"
        }`}
      >
        <form onSubmit={handleSubmit(deleteDocument)}>
          <DialogHeader>
            <DialogTitle>Delete Document?</DialogTitle>
          </DialogHeader>

          <div className="p-6">
            <div className="text-center">
              <p className="font-semibold text-xl">
                Are you sure you want to delete this document? There's no
                turning back.
              </p>
            </div>
            <div className="text-center mt-8">
              <ul className="list-disc text-left inline-block">
                <li>
                  All fields for this document will be cleared
                </li>
                <li>The data will no longer be on the system</li>
                <li>
                  If you are recreating the document, you will need to go
                  through the approvals process again
                </li>
              </ul>
            </div>
            <div>
              <Input
                type="hidden"
                {...register("projectPk", {
                  required: true,
                  value: Number(projectPk),
                })}
                readOnly
              />
            </div>
            <div>
              <Input
                type="hidden"
                {...register("documentPk", {
                  required: true,
                  value: Number(documentPk),
                })}
                readOnly
              />
            </div>
            <div>
              <Input
                type="hidden"
                {...register("documentKind", {
                  required: true,
                  value: documentKind,
                })}
                readOnly
              />
            </div>
            <div className="text-center mt-2 p-5 pb-3">
              <p className="font-bold text-red-400 underline">
                This is irreversible.
              </p>
            </div>
          </div>
          <DialogFooter>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className={`text-white ml-3 ${
                  colorMode === "light" 
                    ? "bg-red-500 hover:bg-red-400" 
                    : "bg-red-600 hover:bg-red-500"
                }`}
                disabled={deleteDocumentMutation.isPending}
                type="submit"
              >
                Delete
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
