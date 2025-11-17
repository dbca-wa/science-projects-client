import { Button } from "@/shared/components/ui/button";
import { DrawerClose } from "@/shared/components/ui/drawer";
import { Input } from "@/shared/components/ui/input";
import {
  type IUpdateStaffOverviewSection,
  updateStaffProfileOverviewSection,
} from "@/shared/lib/api";
import type { IStaffOverviewData } from "@/shared/types/index.d";
import { useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import DatabaseRichTextEditor from "../Editor/DatabaseRichTextEditor";
import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import StaffKeywordManager from "../Staff/Detail/StaffKeywordManager";

export interface EditOverviewProps {
  usersPk: number;
  refetch: () => void;
  // staffProfilePk: number;
  sectionKind: "about" | "expertise" | "keyword_tags";
  staffOverviewData: IStaffOverviewData;
  kind: "drawer" | "dialog";
  onClose: () => void;
}

const EditStaffOverviewContent = ({
  usersPk,
  refetch,
  kind,
  staffOverviewData,
  onClose,
  sectionKind,
}: EditOverviewProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
    // watch,
  } = useForm<IUpdateStaffOverviewSection>({
    mode: "onChange",
    defaultValues: {
      pk: staffOverviewData?.pk,
      expertise: staffOverviewData?.expertise,
      about: staffOverviewData?.about,
    },
  });
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateStaffProfileOverviewSection,
    onSuccess: async () => {
      toast({
        status: "success",
        title: "Updated",
        position: "top-right",
      });
      await queryClient.invalidateQueries({
        queryKey: ["staffOverview", usersPk],
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
  const onSubmit = (formData: IUpdateStaffOverviewSection) => {
    mutation.mutate(formData);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="text-slate-800">
        <div className="">
          <Input
            type="hidden"
            {...register("pk", {
              required: true,
              value: staffOverviewData?.pk,
            })}
            readOnly
          />

          {sectionKind === "about" && (
            <Controller
              name="about"
              control={control}
              defaultValue={staffOverviewData?.about}
              render={({ field }) => (
                <DatabaseRichTextEditor
                  populationData={staffOverviewData?.about}
                  label="About"
                  hideLabel
                  htmlFor="about"
                  isEdit
                  field={field}
                  registerFn={register}
                  isMobile={!isDesktop}
                />
              )}
            />
          )}

          {sectionKind === "expertise" && (
            <Controller
              name="expertise"
              control={control}
              defaultValue={staffOverviewData?.expertise}
              render={({ field }) => (
                <DatabaseRichTextEditor
                  populationData={staffOverviewData?.expertise}
                  label="Expertise"
                  hideLabel
                  htmlFor="expertise"
                  isEdit
                  field={field}
                  registerFn={register}
                  isMobile={!isDesktop}
                />
              )}
            />
          )}

          {sectionKind === "keyword_tags" && (
            <Controller
              name="keyword_tags"
              control={control}
              defaultValue={staffOverviewData?.keyword_tags}
              render={({ field }) => (
                <StaffKeywordManager registerFn={register} field={field} />
              )}
            />
          )}
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
export default EditStaffOverviewContent;
