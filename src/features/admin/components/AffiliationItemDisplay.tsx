import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { MdMoreVert } from "react-icons/md";
import { deleteAffiliation, updateAffiliation } from "@/features/admin/services/admin.service";
import type { IAffiliation } from "@/shared/types";
import { TextButtonFlex } from "@/shared/components/TextButtonFlex";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";

export const AffiliationItemDisplay = ({ pk, name }: IAffiliation) => {
  const { register, handleSubmit, watch, reset } = useForm<IAffiliation>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const nameData = watch("name");

  const updateMutation = useMutation({
    mutationFn: updateAffiliation,
    onSuccess: () => {
      toast.success("Updated");
      setIsUpdateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
      reset();
    },
    onError: () => {
      toast.error("Failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAffiliation,
    onSuccess: () => {
      toast.success("Deleted");
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["affiliations"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onSubmitBranchUpdate = (formData: IAffiliation) => {
    updateMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <div className="grid grid-cols-[9fr_3fr] w-full p-3 border">
        <TextButtonFlex name={name} onClick={() => setIsUpdateModalOpen(true)} />

        <div className="flex justify-end mr-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="px-2 py-2 rounded-md border"
              >
                <div className="flex items-center justify-center">
                  <MdMoreVert />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsUpdateModalOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className={colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"}>
          <DialogHeader>
            <DialogTitle>Delete Affiliation</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-lg font-semibold">
              Are you sure you want to delete this Affiliation?
            </p>

            <p className="text-lg font-semibold text-blue-500 mt-4">
              "{name}"
            </p>
          </div>
          <DialogFooter className="flex justify-end">
            <div className="flex gap-3">
              <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">
                No
              </Button>
              <Button
                onClick={deleteBtnClicked}
                className={`text-white ${
                  colorMode === "light" 
                    ? "bg-red-500 hover:bg-red-400" 
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                Yes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className={`${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"} p-4 px-6`}>
          <DialogHeader>
            <DialogTitle>Update Affiliation</DialogTitle>
          </DialogHeader>
          <div>
            {/* Hidden input to capture the pk */}
            <input
              type="hidden"
              {...register("pk")}
              defaultValue={pk} // Prefill with the 'pk' prop
            />

            <div
              className="space-y-10"
              onSubmit={handleSubmit(onSubmitBranchUpdate)}
            >
              <div>
                <Label htmlFor="name">Affiliation Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: true })}
                  defaultValue={name}
                />
              </div>
              {updateMutation.isError ? (
                <p className="text-red-500">Something went wrong</p>
              ) : null}
            </div>

            <div className="mt-10 w-full flex justify-end grid grid-cols-2 gap-4">
              <Button onClick={() => setIsUpdateModalOpen(false)} size="lg">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onSubmitBranchUpdate({
                    pk: pk,
                    name: nameData,
                  });
                }}
                disabled={updateMutation.isPending}
                className={`text-white ${
                  colorMode === "light" 
                    ? "bg-blue-500 hover:bg-blue-400" 
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
                size="lg"
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
