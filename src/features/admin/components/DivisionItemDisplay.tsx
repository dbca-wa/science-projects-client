import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/shared/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdMoreVert } from "react-icons/md";
import { deleteDivision, updateDivision } from "@/features/admin/services/admin.service";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import type { IDivision } from "@/shared/types";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { TextButtonFlex } from "@/shared/components/TextButtonFlex";
import { UserProfile } from "@/features/users/components/UserProfile";

export const DivisionItemDisplay = ({
  pk,
  slug,
  name,
  director,
  approver,
  old_id,
}: IDivision) => {
  const { register, handleSubmit, watch } = useForm<IDivision>();

  // State for all modals (replacing useDisclosure hooks)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDirectorOpen, setIsDirectorOpen] = useState(false);
  const [isApproverOpen, setIsApproverOpen] = useState(false);

  // Modal control functions
  const onDeleteModalOpen = () => setIsDeleteModalOpen(true);
  const onDeleteModalClose = () => setIsDeleteModalOpen(false);
  const onUpdateModalOpen = () => setIsUpdateModalOpen(true);
  const onUpdateModalClose = () => setIsUpdateModalOpen(false);
  const onDirectorOpen = () => setIsDirectorOpen(true);
  const onDirectorClose = () => setIsDirectorOpen(false);
  const onApproverOpen = () => setIsApproverOpen(true);
  const onApproverClose = () => setIsApproverOpen(false);

  const queryClient = useQueryClient();

  const { userLoading: directorLoading, userData: directorData } =
    useFullUserByPk(director);
  const { userLoading: approverLoading, userData: approverData } =
    useFullUserByPk(approver);

  const [selectedDirector, setSelectedDirector] = useState<number>(director);
  const [selectedApprover, setSelectedApprover] = useState<number>(approver);
  const slugData = watch("slug");
  const nameData = watch("name");
  const updateMutation = useMutation({
    mutationFn: updateDivision,
    onSuccess: () => {
      toast.success("Updated");
      onUpdateModalClose();
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
    onError: () => {
      toast.error("Failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDivision,
    onSuccess: () => {
      toast.success("Deleted");
      onDeleteModalClose();
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onUpdateSubmit = (formData: IDivision) => {
    console.log(formData);
    updateMutation.mutate(formData);
  };

  const directorDrawerFunction = () => {
    console.log(`${directorData?.first_name} clicked`);
    onDirectorOpen();
  };
  const approverDrawerFunction = () => {
    console.log(`${approverData?.first_name} clicked`);
    onApproverOpen();
  };

  const { colorMode } = useColorMode();

  return !directorLoading &&
    directorData &&
    !approverLoading &&
    approverData ? (
    <>
      <Sheet open={isDirectorOpen} onOpenChange={setIsDirectorOpen}>
        <SheetContent side="right" className="w-96">
          <UserProfile pk={director} />
        </SheetContent>
      </Sheet>

      <Sheet open={isApproverOpen} onOpenChange={setIsApproverOpen}>
        <SheetContent side="right" className="w-96">
          <UserProfile pk={approver} />
        </SheetContent>
      </Sheet>

      <div className="grid grid-cols-[4fr_2fr_2fr_2fr_1fr] w-full p-3 border border-border">
        <TextButtonFlex name={name} onClick={onUpdateModalOpen} />

        <div className="flex items-center">
          <p className="font-semibold">{slug}</p>
        </div>
        <TextButtonFlex
          name={`${directorData.first_name} ${directorData.last_name}`}
          onClick={directorDrawerFunction}
        />
        <TextButtonFlex
          name={`${approverData.first_name} ${approverData.last_name}`}
          onClick={approverDrawerFunction}
        />
        <div className="flex justify-end mr-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="px-2 py-2 transition-all duration-200 rounded border hover:bg-gray-400 focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-center">
                  <MdMoreVert />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onUpdateModalOpen}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteModalOpen}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className={`${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"}`}>
          <DialogHeader>
            <DialogTitle>Delete Division</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-lg font-semibold">
              Are you sure you want to delete this division?
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
            <DialogTitle>Update Division</DialogTitle>
          </DialogHeader>
          
          <div>
            {/* Hidden input to capture the pk */}
            <input
              type="hidden"
              {...register("pk")}
              defaultValue={pk} // Prefill with the 'pk' prop
            />
          </div>
          <div>
            {/* Hidden input to capture the old_id */}
            <input
              type="hidden"
              {...register("old_id")}
              defaultValue={old_id} // Prefill with the 'pk' prop
            />
          </div>

          <div
            className="space-y-6"
            onSubmit={handleSubmit(onUpdateSubmit)}
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <div>
                <Input
                  id="name"
                  {...register("name", { required: true })}
                  required
                  type="text"
                  defaultValue={name} // Prefill with the 'name' prop
                />
              </div>
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              {/* Hidden input to capture the slug */}
              <Input
                id="slug"
                type="text"
                {...register("slug")}
                defaultValue={slug} // Prefill with the 'pk' prop
              />
            </div>
            <div>
              <UserSearchDropdown
                {...register("director", { required: true })}
                onlyInternal={false}
                isRequired={true}
                setUserFunction={setSelectedDirector}
                label="Director"
                placeholder="Search for a user..."
                preselectedUserPk={director}
                isEditable
                helperText={"The director of the Division"}
              />
            </div>
            <div>
              <UserSearchDropdown
                {...register("approver", { required: true })}
                onlyInternal={false}
                isRequired={true}
                setUserFunction={setSelectedApprover}
                label="Approver"
                placeholder="Search for a user..."
                preselectedUserPk={approver}
                isEditable
                helperText={"The approver of the Division"}
              />
            </div>
            {updateMutation.isError ? (
              <p className="text-red-500">Something went wrong</p>
            ) : null}
          </div>
          
          <div className="mt-10 w-full flex justify-end gap-4">
            <Button onClick={() => setIsUpdateModalOpen(false)} size="lg">
              Cancel
            </Button>
            <Button
              disabled={updateMutation.isPending}
              className={`text-white ${
                colorMode === "light" 
                  ? "bg-blue-500 hover:bg-blue-400" 
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
              size="lg"
              onClick={() => {
                console.log("clicked");
                onUpdateSubmit({
                  pk: pk,
                  name: nameData,
                  slug: slugData,
                  director: selectedDirector,
                  approver: selectedApprover,
                });
              }}
            >
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  ) : null;
};
