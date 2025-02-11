import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmployment, createPublication } from "@/lib/api";
import { IStaffEmploymentEntry, IStaffPublicationEntry } from "@/types";
import { Textarea, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import DatabaseRichTextEditor from "../Editor/DatabaseRichTextEditor";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";

const AddStaffPublicationContent = ({
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
    control,
  } = useForm<IStaffPublicationEntry>({
    mode: "onChange", // or "onBlur"
  });

  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createPublication,
    onSuccess: async () => {
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      await queryClient.invalidateQueries({
        queryKey: ["publications", usersPk],
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

  const onSubmit = (formData: IStaffPublicationEntry) => {
    mutation.mutate(formData);
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");

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
        <Label htmlFor="position_title">Publication</Label>
        {/* <Textarea
          // type="text"
          id="position_title"
          placeholder="Enter the publication"
          className="my-1"
          {...register("title", { required: true })}
        /> */}

        <Controller
          name="title"
          control={control}
          defaultValue={""}
          render={({ field }) => (
            <DatabaseRichTextEditor
              populationData={""}
              label="Title"
              hideLabel
              htmlFor="title"
              isEdit
              field={field}
              registerFn={register}
              isMobile={!isDesktop}
            />
          )}
        />

        <div className="mt-1 flex flex-col">
          <Label htmlFor="year" className="my-2">
            Year
          </Label>

          <Input
            type="number"
            id="year"
            placeholder="Enter the year"
            className="w-full"
            {...register("year", {
              required: "Year is required", // Make sure this field is required
              validate: (value) => {
                // Check if year is a valid 4-digit number
                const isValidYear = /^[12]\d{3}$/.test(String(value));
                if (!isValidYear) {
                  return "Year must be a valid 4-digit year";
                }
                return true; // All validations passed
              },
            })}
          />
          {errors.year && (
            <p className="text-sm text-red-600">{errors.year.message}</p>
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
export default AddStaffPublicationContent;
