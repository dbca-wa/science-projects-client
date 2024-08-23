import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmployment } from "@/lib/api";
import { IStaffEmploymentEntry } from "@/types";
import { useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

const AddStaffEmploymentContent = ({
  staffProfilePk,
  usersPk,
  refetch,
  kind,
  onClose,
}: {
  staffProfilePk: number;
  usersPk: number;
  refetch: () => void;
  onClose: () => void;
  kind: "drawer" | "dialog";
}) => {
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    getValues,
  } = useForm<IStaffEmploymentEntry>({
    mode: "onChange", // or "onBlur"
  });

  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createEmployment,
    onSuccess: async () => {
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      await queryClient.invalidateQueries({
        queryKey: ["employment", usersPk],
      });
      await refetch();
      onClose();
    },
    onError: () => {
      console.log("error");
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
    // onMutate: () => {
    //   console.log("mutation");
    // },
  });

  const onSubmit = (formData: IStaffEmploymentEntry) => {
    mutation.mutate(formData);
  };

  return (
    <div className="px-3 py-4">
      <form onSubmit={handleSubmit(onSubmit)} className="text-slate-800">
        <Input
          type="hidden"
          {...register("public_profile", {
            required: true,
            value: staffProfilePk,
          })}
          readOnly
        />
        <Label htmlFor="position_title">Position Title</Label>
        <Input
          type="text"
          id="position_title"
          placeholder="Enter the title of the position"
          className="my-1"
          {...register("position_title", { required: true })}
        />
        <Label htmlFor="position_title" className="">
          Department (Optional)
        </Label>
        <Input
          type="text"
          id="section"
          placeholder="Enter the department this position belongs to (optional)"
          className="my-1"
          {...register("section", { required: false })}
        />
        <div className="mt-1 flex flex-col">
          <Label htmlFor="employer" className="my-2">
            Employer
          </Label>

          <Input
            type="text"
            id="employer"
            placeholder="Enter the employer"
            className="w-full"
            {...register("employer", { required: true })}
          />
        </div>

        <div className="mt-1 flex flex-col">
          <Label htmlFor="start_year" className="my-2">
            Start Year
          </Label>

          <Input
            type="number"
            id="start_year"
            placeholder="Enter the start year"
            className="w-full"
            {...register("start_year", {
              required: true,
              validate: (value) => {
                const endYear = getValues("end_year");
                return (
                  !endYear ||
                  value <= endYear ||
                  "Start year cannot be after end year"
                );
              },
            })}
          />
          {errors.start_year && (
            <p className="text-sm text-red-600">{errors.start_year.message}</p>
          )}
        </div>

        <div className="mt-1 flex flex-col">
          <Label htmlFor="end_year" className="my-2">
            End Year
          </Label>

          <Input
            type="number"
            id="end_year"
            placeholder="Enter the end year"
            className="w-full"
            {...register("end_year", {
              required: true,
              validate: (value) => {
                const startYear = getValues("start_year");
                return (
                  !startYear ||
                  value >= startYear ||
                  "End year cannot be before start year"
                );
              },
            })}
          />
          {errors.end_year && (
            <p className="text-sm text-red-600">{errors.end_year.message}</p>
          )}
        </div>

        <div className="flex w-full justify-end">
          {kind === "drawer" && (
            <DrawerClose asChild className="mr-3 mt-8">
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          )}

          <Button
            type="submit"
            disabled={!isValid || mutation.isPending}
            className="mt-8"
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};
export default AddStaffEmploymentContent;
