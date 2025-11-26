import { Button } from "@/shared/components/ui/button";
import { DrawerClose } from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { editEmployment } from "@/features/staff-profiles/services/staff-profiles.service";
import type { IStaffEmploymentEntry } from "@/shared/types";
import { useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export interface EditEmploymentProps {
  employmentItem: IStaffEmploymentEntry;
  usersPk: number;
  refetch: () => void;
  kind: "drawer" | "dialog";
  onClose: () => void;
}

const EditStaffEmploymentContent = ({
  employmentItem,
  usersPk,
  refetch,
  kind,
  onClose,
}: EditEmploymentProps) => {
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    getValues,
  } = useForm<IStaffEmploymentEntry>({
    mode: "onChange",
    defaultValues: {
      pk: employmentItem?.pk,
      public_profile: employmentItem?.public_profile,
      position_title: employmentItem?.position_title,
      start_year: employmentItem?.start_year,
      end_year: employmentItem?.end_year,
      section: employmentItem?.section,
      employer: employmentItem?.employer,
    },
  });

  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: editEmployment,
    onSuccess: async () => {
      toast({
        status: "success",
        title: "Updated",
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
          {...register("pk", {
            required: true,
            value: employmentItem?.pk,
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
              required: "Start year is required", // Make sure this field is required
              validate: (value) => {
                const endYear = getValues("end_year");
                // Check if start year is a valid 4-digit number
                const isValidYear = /^[12]\d{3}$/.test(value);
                if (!isValidYear) {
                  return "Start year must be a valid 4-digit year";
                }
                // Check if start year is less than or equal to end year (if end year exists)
                if (endYear && value > endYear) {
                  return "Start year cannot be after end year";
                }
                return true; // All validations passed
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
              required: false, // Optional field
              validate: (value) => {
                if (!value) return true; // Allow empty end_year
                const startYear = getValues("start_year");
                return (
                  (/^[12]\d{3}$/.test(value) && value >= startYear) || // Ensure value is a 4-digit year and after start_year
                  "End year must be a valid 4-digit year and not before start year"
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
            <DrawerClose asChild className="mt-8 mr-3">
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          )}

          <Button
            type="submit"
            disabled={!isValid || mutation.isPending}
            className="mt-8"
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
};
export default EditStaffEmploymentContent;
