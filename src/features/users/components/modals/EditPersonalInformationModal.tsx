// Modal component for editing a user's personal information

import { usePersonalInfo } from "@/features/users/hooks/usePersonalInfo";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillPhone } from "react-icons/ai";
import { GiGraduateCap } from "react-icons/gi";
import { GrMail } from "react-icons/gr";
import { MdFax } from "react-icons/md";
import { RiNumber1, RiNumber2 } from "react-icons/ri";
import {
  type IPIUpdateError,
  type IPIUpdateSuccess,
  type IPIUpdateVariables,
  updatePersonalInformation,
} from "@/features/users/services/users.service";

interface IEditPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const EditPersonalInformationModal = ({
  isOpen,
  onClose,
  userId,
}: IEditPIModalProps) => {
  const { isLoading, personalData: data } = usePersonalInfo(userId);

  const { colorMode } = useColorMode();

  const [hoveredTitle, setHoveredTitle] = useState(false);
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  const handleCloseModal = () => {
    reset();
    onClose();
  };

  // // Regex for validity of phone variable
  const phoneValidationPattern = /^(\+)?[\d\s]+$/;

  // React Hook Form
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IPIUpdateVariables>();

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const mutation = useMutation<
    IPIUpdateSuccess,
    IPIUpdateError,
    IPIUpdateVariables
  >({
    // Start of mutation handling
    mutationFn: updatePersonalInformation,
    onMutate: () => {
      const toastId = toast.loading("Updating personal information...");
      setLoadingToastId(toastId);
    },
    // Success handling based on API-file-declared interface
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`personalInfo`, userId] });
      queryClient.refetchQueries({ queryKey: [`me`] });

      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.success("Information Updated");
      onClose?.();
    },
    // Error handling based on API-file-declared interface
    onError: (error) => {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error(`Update failed: ${error}`);
    },
  });

  // When submitting form - starts the mutation
  const onSubmit = ({
    userPk,
    title,
    phone,
    fax,
    display_first_name,
    display_last_name,
  }: IPIUpdateVariables) => {
    mutation.mutate({
      userPk,
      title,
      phone,
      fax,
      display_first_name,
      display_last_name,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Personal Information</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className={`p-6 ${colorMode === "dark" ? "bg-gray-800 text-gray-400" : "bg-white"}`}>
          {!isLoading && (
            <div className="grid grid-cols-2 gap-8">
              {/* Title */}
              <div className="my-2 mb-4 select-none">
                <Label
                  onMouseEnter={() => setHoveredTitle(true)}
                  onMouseLeave={() => setHoveredTitle(false)}
                >
                  Title
                </Label>

                <div className="flex">
                  <div className="flex items-center px-2 border border-r-0 rounded-l-md bg-transparent">
                    <GiGraduateCap className="h-4 w-4" />
                  </div>
                  <Select {...register("title", { value: data?.title })}>
                    <SelectTrigger className="rounded-l-none border-l-0">
                      <SelectValue placeholder="Select a title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr">Dr</SelectItem>
                      <SelectItem value="mr">Mr</SelectItem>
                      <SelectItem value="mrs">Mrs</SelectItem>
                      <SelectItem value="ms">Ms</SelectItem>
                      <SelectItem value="aprof">A/Prof</SelectItem>
                      <SelectItem value="prof">Prof</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="my-2 mb-4 select-none">
                <Label>Phone</Label>
                <div className="relative">
                  <AiFillPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    autoComplete="off"
                    type="text"
                    placeholder="Enter a phone number"
                    className="pl-10"
                    {...register("phone", {
                      pattern: {
                        value: phoneValidationPattern,
                        message: "Invalid phone number",
                      },
                      value: data?.phone,
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Fax */}
              <div className="my-2 mb-4 select-none">
                <Label>Fax</Label>
                <div className="relative">
                  <MdFax className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    autoComplete="off"
                    type="text"
                    placeholder="Enter a fax number"
                    className="pl-10"
                    {...register("fax", {
                      pattern: {
                        value: phoneValidationPattern,
                        message: "Invalid fax number",
                      },
                      value: data?.fax,
                    })}
                  />
                </div>
                {errors.fax && (
                  <p className="text-sm text-red-500 mt-1">{errors.fax.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="my-2 mb-4 select-none">
                <Label>Email</Label>
                <div className="relative">
                  <GrMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    autoComplete="off"
                    type="email"
                    placeholder={data?.email}
                    value={data?.email}
                    disabled={true}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* First Name */}
              <div className="my-2 mb-4 select-none">
                <Label>First Name</Label>
                <div className="relative">
                  <RiNumber1 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    autoComplete="off"
                    type="text"
                    placeholder={data?.display_first_name ?? data?.first_name}
                    className="pl-10"
                    {...register("display_first_name", {
                      value: data?.display_first_name ?? data?.first_name,
                    })}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="my-2 mb-4 select-none">
                <Label>Last Name</Label>
                <div className="relative">
                  <RiNumber2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    autoComplete="off"
                    type="text"
                    placeholder={data?.display_last_name ?? data?.last_name}
                    className="pl-10"
                    {...register("display_last_name", {
                      value: data?.display_last_name ?? data?.last_name,
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* UserPk */}
          {/* Prefilled and hidden */}
          <div className="my-2 mb-4 select-none hidden">
            <Input
              type="hidden"
              {...register("userPk", {
                required: true,
                value: userId,
              })}
              readOnly
            />
          </div>

          <DialogFooter>
            <Button
              disabled={mutation.isPending}
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white ml-3"
            >
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
