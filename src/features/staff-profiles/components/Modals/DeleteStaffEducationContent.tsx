import { Button } from "@/shared/components/ui/button";
import { DrawerClose } from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import { deleteEducation } from "@/features/staff-profiles/services/staff-profiles.service";
import type { ISimplePkProp, IStaffEducationEntry } from "@/shared/types";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

const DeleteStaffEducationContent = ({
  educationItem,
  usersPk,
  refetch,
  kind,
  onClose,
}: {
  educationItem: IStaffEducationEntry;
  usersPk: number;
  refetch: () => void;
  onClose: () => void;
  kind: "drawer" | "dialog";
}) => {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<ISimplePkProp>({
    mode: "onChange", // or "onBlur"
  });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: async () => {
      toast.success("Deleted", {
        description: "Education entry deleted successfully",
      });
      await queryClient.invalidateQueries({
        queryKey: ["education", usersPk],
      });
      await refetch();
      onClose();
    },
    onError: () => {
      console.log("error");
      toast.error("Failed", {
        description: "Could not delete education entry",
      });
    },
    // onMutate: () => {
    //   console.log("mutation");
    // },
  });
  const onSubmit = (formData: ISimplePkProp) => {
    mutation.mutate(formData);
  };

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

        <div>
          <p>
            Are you sure you want to delete this entry? It will be gone for
            good.
          </p>
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
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
};
export default DeleteStaffEducationContent;
