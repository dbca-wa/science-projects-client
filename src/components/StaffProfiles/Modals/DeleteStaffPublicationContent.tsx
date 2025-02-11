import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { deletePublication } from "@/lib/api";
import { ISimplePkProp, IStaffPublicationEntry } from "@/types";
import { useToast } from "@chakra-ui/react";
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
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deletePublication,
    onSuccess: async () => {
      toast({
        status: "success",
        title: "Deleted",
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
            <DrawerClose asChild className="mr-3 mt-8">
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
