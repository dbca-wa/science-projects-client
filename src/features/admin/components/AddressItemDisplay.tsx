import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdMoreVert } from "react-icons/md";
import { deleteAddress, updateAddress } from "@/features/admin/services/admin.service";
import type { IAddress, IBranch } from "@/shared/types";
import { BranchSearchDropdown } from "@/features/admin/components/BranchSearchDropdown";
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

export const AddressItemDisplay = ({
  pk,
  street,
  city,
  zipcode,
  state,
  country,
  branch,
  pobox,
}: IAddress) => {
  const { register, handleSubmit, watch } = useForm<IAddress>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { colorMode } = useColorMode();

  const branchObj = typeof branch === "object" ? (branch as IBranch) : null;
  const streetData = watch("street");
  const cityData = watch("city");
  const zipcodeData = watch("zipcode");
  const stateData = watch("state");
  const countryData = watch("country");
  const poboxData = watch("pobox");

  const updateMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      toast.success("Updated");
      setIsUpdateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => {
      toast.error("Failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      toast.success("Deleted");
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };
  const onUpdateSubmit = (formData: IAddress) => {
    updateMutation.mutate(formData);
  };

  const [selectedBranch, setSelectedBranch] = useState<number>();

  return (
    <>
      <div className="grid grid-cols-[2fr_4fr_2fr_2fr_1fr_1fr] w-full p-3 border">
        <TextButtonFlex
          name={branchObj?.name ?? ""}
          onClick={() => setIsUpdateModalOpen(true)}
        />
        <div className="flex items-center">
          <p>{street}</p>
        </div>
        <div className="flex items-center">
          <p>{city}</p>
        </div>
        <div className="flex items-center">
          <p>{country}</p>
        </div>
        <div className="flex items-center">
          <p>{pobox ? pobox : "-"}</p>
        </div>

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
            <DialogTitle>Delete Address</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-lg font-semibold">
              Are you sure you want to delete the address for this branch?
            </p>

            <p className="text-lg font-semibold text-blue-500 mt-4">
              "{branchObj?.name}"
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
        <DialogContent className={`max-w-2xl ${colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"} p-4 px-6`}>
          <DialogHeader>
            <DialogTitle>Update Address</DialogTitle>
          </DialogHeader>
          <div>
            {/* Hidden input to capture the pk */}
            <input
              type="hidden"
              {...register("pk")}
              defaultValue={pk} // Prefill with the 'pk' prop
            />
            <input
              {...register("agency", { required: true })}
              type="hidden"
              defaultValue={1} // Prefill with the 'name' prop
            />
            <div
              className="space-y-6"
              onSubmit={handleSubmit(onUpdateSubmit)}
            >
              <BranchSearchDropdown
                {...register("branch", { required: true })}
                isRequired={true}
                setBranchFunction={setSelectedBranch}
                preselectedBranchPk={branchObj.pk}
                // isEditable
                label="Branch"
                placeholder="Search for a Branch"
                helperText={"The branch the address belongs to."}
              />
              <div>
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  {...register("street", { required: true })}
                  defaultValue={street} // Prefill
                />
              </div>

              <div>
                <Label htmlFor="zipcode">Zip Code</Label>
                <Input
                  id="zipcode"
                  {...register("zipcode", { required: true })}
                  defaultValue={zipcode}
                  type="number"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register("city", { required: true })}
                  defaultValue={city}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register("state", { required: true })}
                  defaultValue={state}
                />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register("country", { required: true })}
                  defaultValue={country}
                />
              </div>

              <div>
                <Label htmlFor="pobox">PO Box</Label>
                <Input
                  id="pobox"
                  {...register("pobox", { required: true })}
                  defaultValue={pobox}
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
                  onUpdateSubmit({
                    pk: pk,
                    street: streetData,
                    city: cityData,
                    zipcode: zipcodeData,
                    state: stateData,
                    country: countryData,
                    pobox: poboxData,
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
