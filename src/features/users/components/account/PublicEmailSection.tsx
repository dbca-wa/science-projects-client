import { type IUpdatePublicEmail, updatePublicEmail } from "@/features/users/services/users.service";
import type { IUserMe } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { IoIosSave } from "react-icons/io";

const PublicEmailSection = ({ me }: { me: IUserMe }) => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();

  const {
    register: updatePublicEmailRegister,
    handleSubmit: handleUpdatePublicEmailSubmit,
    watch: watchUpdatePublicEmail,
    formState: { isValid },
  } = useForm<IUpdatePublicEmail>({
    mode: "onChange", // Validate on change
    defaultValues: {
      public_email: "",
    },
  });

  const beginUpdatePublicEmail = (formData: IUpdatePublicEmail) => {
    console.log(formData);
    updatePublicEmailMutation.mutate(formData);
  };

  const updatePublicEmailMutation = useMutation({
    mutationFn: updatePublicEmail,
    onMutate: () => {
      toast.loading("Updating Email");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Email Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["publicStaffEmail", me?.staff_profile_pk],
      });
    },
    onError: (error: AxiosError) => {
      toast.dismiss();
      toast.error(
        error?.response?.data
          ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
          : "Error updating email"
      );
    },
  });

  return (
    <form
      className="w-full mb-8 flex-grow"
      id="update-public-email-form"
      onSubmit={handleUpdatePublicEmailSubmit(beginUpdatePublicEmail)}
    >
      <div className="space-y-2">
        <Label>Public Email</Label>
        <div className="-mt-3 flex items-center gap-4">
          <Input
            className="hidden"
            autoComplete="off"
            type="hidden"
            {...updatePublicEmailRegister("staff_profile_pk", {
              required: true,
              value: me?.staff_profile_pk,
            })}
          />
          <Input
            placeholder={me?.public_email ?? me?.email ?? ""}
            className="flex-1"
            autoComplete="off"
            type="email"
            {...updatePublicEmailRegister("public_email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, // Basic email regex
                message: "Invalid email address",
              },
            })}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`${
                    colorMode === "light" 
                      ? "bg-green-500 hover:bg-green-500" 
                      : "bg-green-500 hover:bg-green-500"
                  } text-white`}
                  disabled={updatePublicEmailMutation.isPending || !isValid}
                  type="submit"
                  form="update-public-email-form"
                >
                  <IoIosSave className="mr-2 h-4 w-4" />
                  {updatePublicEmailMutation.isPending ? "Updating..." : "Update Public Email"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Update the address for receiving public emails</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p
          className={`-mt-1 text-sm ${colorMode === "light" ? "text-gray-500" : "text-gray-500"}`}
        >
          The email address used for receiving emails from the public. By
          default your DBCA email address is used.
        </p>
      </div>
    </form>
  );
};

export default PublicEmailSection;
