import { TextButtonFlex } from "@/shared/components/TextButtonFlex";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { MdMoreVert } from "react-icons/md";
import { deleteLocation, updateLocation } from "@/features/admin/services/admin.service";
import type { IAddLocationForm, ISimpleLocationData } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
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

export const LocationItemDisplay = ({
  pk,
  name,
  area_type,
}: ISimpleLocationData) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const { register, handleSubmit } = useForm<IAddLocationForm>();

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateLocation,
    onSuccess: () => {
      toast.success("Updated");
      setIsUpdateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: () => {
      toast.error("Failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      toast.success("Deleted");
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const deleteBtnClicked = () => {
    deleteMutation.mutate(pk);
  };

  const onUpdateSubmit = (formData: IAddLocationForm) => {
    updateMutation.mutate(formData);
  };

  const areaTypeMap: { [key: string]: string } = {
    dbcaregion: "DBCA Region",
    dbcadistrict: "DBCA District",
    ibra: "IBRA",
    imcra: "IMCRA",
    nrm: "NRM",
  };

  const { colorMode } = useColorMode();

  return (
    <>
      <div className="grid grid-cols-[1fr_3fr] border p-3">
        <div className="flex items-center">
          <TextButtonFlex name={name} onClick={() => setIsUpdateModalOpen(true)} />
        </div>
        <div className="flex justify-between items-center">
          <p>{areaTypeMap[area_type]}</p>

          <div className="flex flex-col items-center">
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
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className={colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"}>
          <DialogHeader>
            <DialogTitle>Delete Business Area</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-lg font-semibold">
              Are you sure you want to delete this business area?
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
            <DialogTitle>Update Location</DialogTitle>
          </DialogHeader>
          <div>
            {/* Hidden input to capture the pk */}
            <input
              type="hidden"
              {...register("pk")}
              defaultValue={pk} // Prefill with the 'pk' prop
            />
            <form
              className="space-y-10"
              id="update-form"
              onSubmit={handleSubmit(onUpdateSubmit)}
            >
              <div>
                <Label htmlFor="name">Name</Label>
                <div>
                  <Input
                    id="name"
                    {...register("name", { required: true })}
                    autoFocus
                    autoComplete="off"
                    required
                    type="text"
                    defaultValue={name} // Prefill with the 'name' prop
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="area_type">Area Type</Label>
                <select
                  {...register("area_type", { required: true })}
                  defaultValue={area_type} // Prefill with the 'area_type' prop
                  className="w-full p-2 border rounded-md"
                >
                  <option value={"dbcaregion"}>DBCA Region</option>
                  <option value={"dbcadistrict"}>DBCA District</option>
                  <option value={"ibra"}>
                    Interim Biogeographic Regionalisation of Australia
                  </option>
                  <option value={"imcra"}>
                    Integrated Marine and Coastal Regionisation of Australia
                  </option>
                  <option value={"nrm"}>
                    Natural Resource Management Region
                  </option>
                </select>
              </div>
              {updateMutation.isError ? (
                <div className="mt-4">
                  {Object.keys(
                    (updateMutation.error as AxiosError).response.data,
                  ).map((key) => (
                    <div key={key}>
                      {(
                        (updateMutation.error as AxiosError).response.data[
                          key
                        ] as string[]
                      ).map((errorMessage, index) => (
                        <p key={`${key}-${index}`} className="text-red-500">
                          {`${key}: ${errorMessage}`}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}
            </form>
            <div className="mt-10 w-full flex justify-end grid grid-cols-2 gap-4">
              <Button onClick={() => setIsUpdateModalOpen(false)} size="lg">
                Cancel
              </Button>
              <Button
                form="update-form"
                type="submit"
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
