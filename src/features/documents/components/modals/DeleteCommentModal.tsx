import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { IDeleteComment, deleteCommentCall } from "@/features/documents/services/documents.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface Props {
  commentPk: string | number;
  documentPk: string | number;
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

export const DeleteCommentModal = ({
  commentPk,
  documentPk,
  refetchData,
  isOpen,
  onClose,
  onDeleteSuccess,
}: Props) => {
  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: deleteCommentCall,
    onMutate: () => {
      toast.loading("Removing Comment...");
    },
    onSuccess: async () => {
      toast.success("Success", {
        description: "Comment Removed",
      });
      onDeleteSuccess?.();
      
      queryClient.invalidateQueries({
        queryKey: ["documentComments", documentPk],
      });

      setTimeout(async () => {
        await refetchData();
        onClose();
      }, 150);
    },
    onError: (error) => {
      toast.error("Could not remove comment", {
        description: `${error}`,
      });
    },
  });

  const deleteComment = (formData: IDeleteComment) => {
    deleteCommentMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const { register, handleSubmit } = useForm<IDeleteComment>();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "bg-white"}`}>
        <form onSubmit={handleSubmit(deleteComment)}>
          <DialogHeader>
            <DialogTitle>Delete Comment?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <p className="font-semibold text-xl text-center">
                Are you sure you want to delete this comment? There's no turning
                back.
              </p>
            </div>
            
            <Input
              type="hidden"
              {...register("commentPk", {
                required: true,
                value: Number(commentPk),
              })}
              readOnly
            />
            
            <Input
              type="hidden"
              {...register("documentPk", {
                required: true,
                value: Number(documentPk),
              })}
              readOnly
            />
            
            <div className="flex justify-center mt-2 p-5 pb-3">
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
                disabled={deleteCommentMutation.isPending}
                className={`text-white ${
                  colorMode === "light" 
                    ? "bg-red-500 hover:bg-red-400" 
                    : "bg-red-600 hover:bg-red-500"
                }`}
                type="submit"
              >
                {deleteCommentMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
