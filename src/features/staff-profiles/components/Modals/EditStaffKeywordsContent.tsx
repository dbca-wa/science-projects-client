import { Button } from "@/shared/components/ui/button";
import { DrawerClose } from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import {
  type IUpdateStaffHeroSection,
  updateStaffHeroSection,
} from "@/shared/lib/api";
// import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import type { IStaffOverviewData, IStaffProfileHeroData } from "@/shared/types/index.d";
import { useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import StaffKeywordManager from "../Staff/Detail/StaffKeywordManager";

export interface EditStaffKeywordsProps {
  staffOverviewData: IStaffOverviewData;
  usersPk: number;
  refetch: () => void;
  onClose: () => void;
  kind: "drawer" | "dialog";
}

const EditStaffKeywordsContent = ({
  usersPk,
  refetch,
  kind,
  staffOverviewData,
  onClose,
}: EditStaffKeywordsProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
    watch,
  } = useForm<IUpdateStaffHeroSection>({
    mode: "onChange",
    defaultValues: {
      pk: staffOverviewData?.pk,
      keyword_tags: staffOverviewData?.keyword_tags,
    },
  });

  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateStaffHeroSection,
    onSuccess: async () => {
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      await queryClient.invalidateQueries({
        queryKey: ["staffHero", usersPk],
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
  const onSubmit = (formData: IUpdateStaffHeroSection) => {
    mutation.mutate(formData);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="text-slate-800">
        <div className="px-4">
          <Input
            type="hidden"
            {...register("pk", {
              required: true,
              value: staffOverviewData?.pk,
            })}
            readOnly
          />

          <Controller
            name="keyword_tags"
            control={control}
            defaultValue={staffOverviewData?.keyword_tags}
            render={({ field }) => (
              <StaffKeywordManager registerFn={register} field={field} />
            )}
          />
        </div>

        <div className="flex w-full justify-end">
          {kind === "drawer" && (
            <DrawerClose asChild className="mt-3 mr-3 mb-8">
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          )}

          <Button
            type="submit"
            disabled={!isValid || mutation.isPending}
            className="mt-3"
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
};
export default EditStaffKeywordsContent;
