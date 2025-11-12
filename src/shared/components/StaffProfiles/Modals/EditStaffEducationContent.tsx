import { Button } from "@/shared/components/ui/button";
import { DrawerClose } from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { editEducation } from "@/shared/lib/api";
import type { IStaffEducationEntry } from "@/shared/types/index.d";
import { useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";

export interface EditEducationProps {
  educationItem: IStaffEducationEntry;
  usersPk: number;
  refetch: () => void;
  kind: "drawer" | "dialog";
  onClose: () => void;
}

const EditStaffEducationContent = ({
  usersPk,
  refetch,
  kind,
  onClose,
  educationItem,
}: EditEducationProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, errors },
    getValues,
  } = useForm<IStaffEducationEntry>({
    mode: "onChange",
    defaultValues: {
      // qualification_field: educationItem?.qualification_field,
      // qualification_kind: educationItem?.qualification_kind,
      qualification_name: educationItem?.qualification_name,
      // start_year: educationItem?.start_year,
      end_year: educationItem?.end_year,
      institution: educationItem?.institution,
      location: educationItem?.location,
    },
  });

  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: editEducation,
    onSuccess: async () => {
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      await queryClient.invalidateQueries({
        queryKey: ["education", usersPk],
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

  const onSubmit = (formData: IStaffEducationEntry) => {
    mutation.mutate(formData);
  };

  // const qualificationKindOptions = [
  //   { value: "postdoc", label: "Postdoctoral in" },
  //   { value: "doc", label: "Doctor of" },
  //   { value: "master", label: "Master of" },
  //   { value: "graddip", label: "Graduate Diploma in" },
  //   { value: "bachelor", label: "Bachelor of" },
  //   { value: "assdegree", label: "Associate Degree in" },
  //   { value: "diploma", label: "Diploma in" },
  //   { value: "cert", label: "Certificate in" },
  //   { value: "nano", label: "Nanodegree in" },
  // ];

  return (
    <div className="px-3 py-4">
      <form onSubmit={handleSubmit(onSubmit)} className="text-slate-800">
        <Input
          type="hidden"
          {...register("pk", {
            required: true,
            value: educationItem?.pk,
          })}
          readOnly
        />
        {/* <Label htmlFor="qualification_kind" className="">
          Qualification Type
        </Label>
        <Controller
          name="qualification_kind"
          control={control}
          defaultValue="bachelor"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="my-1 w-full">
                <SelectValue placeholder="Enter the type of the qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualificationKindOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        /> */}

        <Label htmlFor="qualification_name" className="">
          Qualification
        </Label>
        <Input
          type="text"
          id="section"
          placeholder="Enter the name of the qualification"
          className="my-1"
          {...register("qualification_name", { required: false })}
        />

        {/* <Label htmlFor="qualification_field">Field</Label>
        <Input
          type="text"
          id="qualification_field"
          placeholder="Enter the subject matter of the qualification"
          className="my-1"
          {...register("qualification_field", { required: true })}
        /> */}

        <div className="mt-1 flex flex-col">
          <Label htmlFor="institution" className="my-2">
            Institution
          </Label>

          <Input
            type="text"
            id="institution"
            placeholder="Enter the institution"
            className="w-full"
            {...register("institution", { required: true })}
          />
        </div>
        <div className="mt-1 flex flex-col">
          <Label htmlFor="location" className="my-2">
            Location
          </Label>

          <Input
            type="text"
            id="location"
            placeholder="Enter the location"
            className="w-full"
            {...register("location", { required: true })}
          />
        </div>

        {/* <div className="mt-1 flex flex-col">
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
        </div> */}

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
              // validate: (value) => {
              //   const startYear = getValues("start_year");
              //   return (
              //     !startYear ||
              //     value >= startYear ||
              //     "End year cannot be before start year"
              //   );
              // },
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
export default EditStaffEducationContent;
