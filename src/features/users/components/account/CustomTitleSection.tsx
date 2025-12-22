import { type IUpdateCustomTitle, updateCustomTitle } from "@/features/users/services/users.service";
import type { IUserMe } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosSave } from "react-icons/io";

const CustomTitleSection = ({ me }: { me: IUserMe }) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const [isEnabled, setIsEnabled] = useState(me?.custom_title_on || false);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<IUpdateCustomTitle>({
    mode: "onChange",
    defaultValues: {
      custom_title: me?.custom_title || "",
      custom_title_on: me?.custom_title_on,
      staff_profile_pk: me?.staff_profile_pk,
    },
  });

  const updateCustomTitleMutation = useMutation({
    mutationFn: updateCustomTitle,
    onMutate: () => {
      toast.loading("Updating Title");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Title Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["customTitle", me?.staff_profile_pk],
      });
    },
    onError: (error: AxiosError) => {
      toast.dismiss();
      toast.error(
        error?.response?.data
          ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
          : "An error occurred while updating the title"
      );
    },
  });

  const toggleTitleMutation = useMutation({
    mutationFn: updateCustomTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customTitle", me?.staff_profile_pk],
      });
    },
    onError: (error: AxiosError) => {
      setIsEnabled(!isEnabled); // Revert toggle on error
      toast.error(
        error?.response?.data
          ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
          : "An error occurred while updating the title status"
      );
    },
  });

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    toggleTitleMutation.mutate({
      custom_title: me?.custom_title || "",
      custom_title_on: checked,
      staff_profile_pk: me?.staff_profile_pk,
    });
  };

  const onSubmit = (formData: IUpdateCustomTitle) => {
    updateCustomTitleMutation.mutate({
      ...formData,
      custom_title_on: isEnabled,
    });
  };

  return (
    <form
      className="w-full flex flex-col gap-4"
      id="update-custom-title-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <div className="mb-2 w-full flex items-center justify-between gap-4">
          <Label htmlFor="custom-title-input">
            Custom Position Title
          </Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={toggleTitleMutation.isPending}
            />
            <Label htmlFor="custom-title-toggle" className="mb-0">
              {isEnabled ? "Custom Title Enabled" : "Enable Custom Title"}
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Input
            id="custom-title-input"
            placeholder={me?.custom_title || "Enter custom title"}
            className="flex-1"
            autoComplete="off"
            type="text"
            disabled={!isEnabled}
            {...register("custom_title", {
              required: "Custom Title is required",
              minLength: {
                value: 5,
                message: "Title must be at least 5 characters long",
              },
              pattern: {
                value: /^(?=.*[a-zA-Z])[a-zA-Z\s]+$/,
                message: "Only letters and spaces are allowed",
              },
              maxLength: {
                value: 50,
                message: "Title cannot exceed 50 characters",
              },
            })}
            aria-describedby="custom-title-helper-text"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`${
                    colorMode === "light" 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                  disabled={
                    updateCustomTitleMutation.isPending || !isValid || !isEnabled
                  }
                  type="submit"
                  form="update-custom-title-form"
                >
                  <IoIosSave className="mr-2 h-4 w-4" />
                  {updateCustomTitleMutation.isPending ? "Updating..." : "Update Custom Title"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Update how your title appears to the public</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <p
          id="custom-title-helper-text"
          className={`text-sm ${colorMode === "light" ? "text-gray-500" : "text-gray-500"}`}
        >
          A custom title displayed to the public. Enable this to overwrite the
          HR system title. Only letters and spaces are allowed. Alternatively,{" "}
          <a
            href="mailto:Establishment@dbca.wa.gov.au?subject=Update%20My%20Details"
            style={{ textDecoration: "underline" }}
            className="text-blue-500"
          >
            contact HR
          </a>{" "}
          to update your HR details (recommended). This process may take some
          time.
        </p>
      </div>
    </form>
  );
};

export default CustomTitleSection;
