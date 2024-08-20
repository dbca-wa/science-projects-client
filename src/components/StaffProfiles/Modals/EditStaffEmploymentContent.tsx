import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editEmployment } from "@/lib/api";
import { IStaffEmploymentEntry } from "@/types";
import { useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export interface EditEmploymentProps {
  employmentItem: IStaffEmploymentEntry;
  usersPk: number;
  refetch: () => void;
  //   staffProfilePk: number;
  kind: "drawer" | "dialog";
  onClose: () => void;
}

const EditStaffEmploymentContent = ({
  employmentItem,
  usersPk,
  refetch,
  kind,
  //   staffProfilePk,
  onClose,
}: EditEmploymentProps) => {
  const {
    register,
    handleSubmit,
    formState: { isValid },
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
    onMutate: () => {
      console.log("mutation");
    },
  });
  const onSubmit = (formData: IStaffEmploymentEntry) => {
    mutation.mutate(formData);
  };

  return (
    <div>
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
        {/* <p className="mb-2 p-1 text-xs text-muted-foreground">
          You should verify that you have typed your email address correctly
          before sending the message, otherwise we cannot reply.
        </p> */}
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
            {...register("start_year", { required: true })}
          />
        </div>

        <div className="mt-1 flex flex-col">
          <Label htmlFor="start_year" className="my-2">
            End Year
          </Label>

          <Input
            type="number"
            id="end_year"
            placeholder="Enter the end year"
            className="w-full"
            {...register("end_year", { required: true })}
          />
        </div>

        <div className="flex w-full justify-end">
          {kind === "drawer" && (
            <DrawerClose asChild className="mr-3 mt-8">
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          )}

          <Button type="submit" disabled={!isValid} className="mt-8">
            Update
          </Button>
        </div>
      </form>
    </div>
  );
};
export default EditStaffEmploymentContent;
