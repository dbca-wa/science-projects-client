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
import { deleteBranch, updateBranch } from "@/features/admin/services/admin.service";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import type { IBranch } from "@/shared/types";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { TextButtonFlex } from "@/shared/components/TextButtonFlex";
import { UserProfile } from "@/features/users/components/UserProfile";

export const BranchItemDisplay = ({ pk, name, manager }: IBranch) => {
  const { register, handleSubmit, watch, reset } = useForm<IBranch>();

  // State for all modals (replacing useDisclosure hooks)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Modal control functions
  const onDeleteModalOpen = () => setIsDeleteModalOpen(true);
  const onDeleteModalClose = () => setIsDeleteModalOpen(false);
  const onUpdateModalOpen = () => setIsUpdateModalOpen(true);
  const onUpdateModalClose = () => setIsUpdateModalOpen(false);
  const onManagerOpen = () => setIsManagerOpen(true);
  const onManagerClose = () => setIsManagerOpen(false);

  const queryClient = useQueryClient();

  const { userLoading: managerLoading, userData: managerData } =
    useFullUserByPk(manager);

  const nameData = watch("name");
  const [selectedUser, setSelectedUser] = useState<number>(manager);

  const updateMutation = useMutation({
    mutationFn: updateBranch,
    onSuccess: () => {
      toast.success("Updated");
      onUpdateModalClose();
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      reset();
    },
    onError: () => {
      toast.error("Failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      toast.success("Deleted");
      onDeleteModalClose();
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onSubmitBranchUpdate = (formData: IBranch) => {
    updateMutation.mutate(formData);
  };

  const managerDrawerFunction = () => {
    console.log(`${managerData?.first_name} clicked`);
    onManagerOpen();
  };

  const { colorMode } = useColorMode();

  return !managerLoading && managerData ? (
    <>
      <Sheet open={isManagerOpen} onOpenChange={setIsManagerOpen}>
        <SheetContent side="right" className="w-96">
          <UserProfile pk={manager} />
        </SheetContent>
      </Sheet>

      <div className="grid grid-cols-[6fr_3fr_3fr] w-full p-3 border border-border">
        <TextButtonFlex name={name} onClick={onUpdateModalOpen} />
        <TextButtonFlex
          name={
            managerData?.first_name
              ? `${managerData?.first_name} ${managerData?.last_name}`
              : `${managerData?.username}`
          }
          onClick={managerDrawerFunction}
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
            <DialogTitle>Delete Branch</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-lg font-semibold">
              Are you sure you want to delete this branch?
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
            <DialogTitle>Update Branch</DialogTitle>
          </DialogHeader>
          
          <div>
            {/* Hidden input to capture the pk */}
            <input
              type="hidden"
              {...register("pk")}
              defaultValue={pk} // Prefill with the 'pk' prop
            />
          </div>

          <div
            className="space-y-10"
            onSubmit={handleSubmit(onSubmitBranchUpdate)}
          >
            <Input
              {...register("agency", { required: true })}
              value={1}
              required
              type="hidden"
            />
            <div>
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                defaultValue={name}
              />
            </div>
            <div>
              <UserSearchDropdown
                {...register("manager", { required: true })}
                onlyInternal={false}
                isRequired={true}
                setUserFunction={setSelectedUser}
                preselectedUserPk={manager}
                isEditable
                label="Manager"
                placeholder="Search for a user"
                helperText={"The manager of the branch."}
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
              onClick={() => {
                onSubmitBranchUpdate({
                  // "old_id": 1, //default
                  pk: pk,
                  agency: 1, // dbca
                  name: nameData,
                  manager: selectedUser,
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
        </DialogContent>
      </Dialog>
    </>
  ) : null;
};
