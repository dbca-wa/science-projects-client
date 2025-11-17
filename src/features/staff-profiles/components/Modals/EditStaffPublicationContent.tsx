import { Button } from "@/shared/components/ui/button";
import { DrawerClose } from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { editPublication } from "@/shared/lib/api";
import type { IStaffPublicationEntry } from "@/shared/types/index.d";
import { Textarea, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import DatabaseRichTextEditor from "../Editor/DatabaseRichTextEditor";
import { useMediaQuery } from "@/shared/utils/useMediaQuery";

export interface EditPublicationProps {
  publicationItem: IStaffPublicationEntry;
  usersPk: number;
  refetch: () => void;
  kind: "drawer" | "dialog";
  onClose: () => void;
}

const EditStaffPublicationContent = ({
  publicationItem,
  usersPk,
  refetch,
  kind,
  onClose,
}: EditPublicationProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    control,
    getValues,
  } = useForm<IStaffPublicationEntry>({
    mode: "onChange",
    defaultValues: {
      pk: publicationItem?.pk,
      public_profile: publicationItem?.public_profile,
      title: publicationItem?.title,
      year: publicationItem?.year,
    },
  });

  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: editPublication,
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

  const onSubmit = (formData: IStaffPublicationEntry) => {
    mutation.mutate(formData);
  };

  return (
    <div className="px-3 py-4">
      <form onSubmit={handleSubmit(onSubmit)} className="text-slate-800">
        <Input
          type="hidden"
          {...register("pk", {
            required: true,
            value: publicationItem?.pk,
          })}
          readOnly
        />
        <Label htmlFor="title">Publication</Label>
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
              populationData={publicationItem?.title}
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
export default EditStaffPublicationContent;
