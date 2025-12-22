import { Button } from "@/shared/components/ui/button";
import { DrawerClose } from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import { deletePublication } from "@/features/staff-profiles/services/staff-profiles.service";
import type { ISimplePkProp, IStaffPublicationEntry } from "@/shared/types";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

const DeleteStaffPublicationContent = ({
  publicationItem,
  usersPk,
  refetch,
  kind,
  onClose,
}: {
  publicationItem: IStaffPublicationEntry;
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
    mutationFn: deletePublication,
    onSuccess: async () => {
      toast.success("Deleted", {
        description: "Publication deleted successfully",
      });
      await queryClient.invalidateQueries({
        queryKey: ["publications", usersPk],
      });
      await refetch();
      onClose();
    },
    onError: () => {
      console.log("error");
      toast.error("Failed", {
        description: "Could not delete publication",
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
            value: publicationItem?.pk,
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
export default DeleteStaffPublicationContent;
