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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { IDepartmentalService } from "@/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import { UserProfile } from "@/features/users/components/UserProfile";
import {
  deleteDepartmentalService,
  updateDepartmentalService,
} from "@/features/admin/services/admin.service";
import { useState } from "react";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { TextButtonFlex } from "@/shared/components/TextButtonFlex";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
// import { UnboundStatefulEditor } from "@/shared/components/RichTextEditor/Editors/UnboundStatefulEditor";

export const ServiceItemDisplay = ({
  pk,
  name,
  director,
}: IDepartmentalService) => {
  const { register, handleSubmit } = useForm<IDepartmentalService>();
  const [selectedDirector, setSelectedDirector] = useState<number>();
  const [nameData, setNameData] = useState(name);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const queryClient = useQueryClient();
  const { userLoading, userData } = useFullUserByPk(director);

  const drawerFunction = () => {
    console.log(`${userData?.first_name} clicked`);
    setIsUserOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: updateDepartmentalService,
    onSuccess: () => {
      toast.success("Updated", {
        description: "Service updated successfully",
      });
      setIsUpdateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["departmentalServices"] });
    },
    onError: () => {
      toast.error("Failed", {
        description: "Failed to update service",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartmentalService,
    onSuccess: () => {
      toast.success("Deleted", {
        description: "Service deleted successfully",
      });
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["departmentalServices"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onUpdateSubmit = (formData: IDepartmentalService) => {
    updateMutation.mutate(formData);
  };

  return !userLoading && userData ? (
    <>
      <Sheet open={isUserOpen} onOpenChange={setIsUserOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>User Profile</SheetTitle>
            <SheetDescription>
              View user profile information
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <UserProfile pk={director} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid grid-cols-[5fr_4fr_1fr] w-full p-3 border border-t-0 first:border-t">
        <TextButtonFlex name={name} onClick={() => setIsUpdateModalOpen(true)} />
        <div className="flex">
          <TextButtonFlex
            name={`${userData.first_name} ${userData.last_name}`}
            onClick={drawerFunction}
          />
        </div>
        <div className="flex justify-end items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="px-2 py-2 mr-4 transition-all duration-200 rounded-md border hover:bg-gray-400 focus:ring-2 focus:ring-blue-400"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service?
            </DialogDescription>
          </DialogHeader>
          <div>
            <p className="text-lg font-semibold">
              Are you sure you want to delete this service?
            </p>
            <p className="text-lg font-semibold text-blue-500 mt-4">
              "{name}"
            </p>
          </div>
          <DialogFooter className="flex justify-end">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                No
              </Button>
              <Button
                onClick={deleteBtnClicked}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-400 dark:bg-red-600 dark:hover:bg-red-500 text-white"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Yes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Research Function</DialogTitle>
            <DialogDescription>
              Update the service information
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <form
              className="space-y-6"
              id="update-form"
              onSubmit={handleSubmit(onUpdateSubmit)}
            >
              {/* Hidden input to capture the pk */}
              <input
                type="hidden"
                {...register("pk")}
                defaultValue={pk} // Prefill with the 'pk' prop
              />

              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  autoFocus
                  autoComplete="off"
                  value={nameData}
                  onChange={(e) => setNameData(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <UserSearchDropdown
                  {...register("director", { required: true })}
                  onlyInternal={false}
                  isRequired={true}
                  setUserFunction={setSelectedDirector}
                  label="Director"
                  placeholder="Search for a user..."
                  preselectedUserPk={director}
                  isEditable
                  helperText={"The director of the Service"}
                />
              </div>

              {updateMutation.isError ? (
                <p className="text-red-500">Something went wrong</p>
              ) : null}
            </form>
          </div>
          <DialogFooter>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setIsUpdateModalOpen(false)}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                disabled={updateMutation.isPending}
                className="bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500 text-white"
                size="lg"
                onClick={() => {
                  console.log("clicked");
                  onUpdateSubmit({
                    pk: pk,
                    name: nameData,
                    director: selectedDirector,
                  });
                }}
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  ) : null;
};
