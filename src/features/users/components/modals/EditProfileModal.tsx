import { useProfile } from "@/features/users/hooks/useProfile";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  IProfileUpdateError,
  IProfileUpdateSuccess,
  IProfileUpdateVariables,
  removeUserAvatar,
  updateProfile,
} from "@/features/users/services/users.service";
import { useNoImage } from "@/shared/hooks/useNoImage";
import useServerImageUrl from "@/shared/hooks/useServerImageUrl";
import type { IProfile } from "@/shared/types";
import { StatefulMediaChangerAvatar } from "@/features/admin/components/StatefulMediaChangerAvatar";
import DatabaseRichTextEditor from "@/features/staff-profiles/components/Editor/DatabaseRichTextEditor";
import { cn } from "@/shared/utils";

interface IEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentImage: string;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  userId,
  currentImage,
}: IEditProfileModalProps) => {
  const initialFocusRef = useRef(null);
  const modalBodyRef = useRef(null);

  const imageUrl = useServerImageUrl(currentImage);
  const noImageLink = useNoImage();
  const { isLoading, profileData: data } = useProfile(userId);
  const { colorMode } = useColorMode();

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    currentImage,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Effect to create object URL when file is selected
  useEffect(() => {
    if (selectedFile) {
      setSelectedImageUrl(URL.createObjectURL(selectedFile));
    }
  }, [selectedFile]);

  const initialData: IProfile = data || {
    image: null,
    about: "",
    expertise: "",
    // Initialize other properties with default values
  };

  const isFieldChanged = (fieldName: keyof IProfile, fieldValue: string) => {
    return data ? data[fieldName] !== fieldValue : false;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
  } = useForm<IProfileUpdateVariables>();

  // Toast management
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const addToast = (message: string) => {
    toastIdRef.current = toast.loading(message);
  };

  // Query client and mutation setup
  const queryClient = useQueryClient();

  const mutation = useMutation<
    IProfileUpdateSuccess,
    IProfileUpdateError,
    IProfileUpdateVariables
  >({
    mutationFn: updateProfile,
    onMutate: () => {
      addToast("Updating profile...");
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`profile`, userId] });
      queryClient.refetchQueries({ queryKey: [`me`] });

      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.success("Information Updated");
      onClose?.();
    },
    onError: (error) => {
      console.log(error);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      toast.error(`Update failed: ${error?.response?.data ? error.response.data : error}`);
    },
  });

  const onSubmit = async ({
    userPk,
    about,
    expertise,
  }: IProfileUpdateVariables) => {
    const image = selectedFile;
    // Check if fields have changed
    const aboutChanged = about !== undefined && isFieldChanged("about", about);
    const expertiseChanged =
      expertise !== undefined && isFieldChanged("expertise", expertise);

    const updateData: IProfileUpdateVariables = {
      userPk: userPk,
      about: aboutChanged ? about : undefined,
      expertise: expertiseChanged ? expertise : undefined,
    };
    if (image) {
      updateData.image = image;
    }

    await mutation.mutateAsync(updateData);
  };

  useEffect(() => {
    if (selectedFile) {
      const objectURL = URL.createObjectURL(selectedFile);
      setSelectedImageUrl(objectURL);
      return () => URL.revokeObjectURL(objectURL);
    }
  }, [selectedFile]);

  // Reset scroll position and focus on modal open
  useEffect(() => {
    if (isOpen) {
      // Add small delay to ensure modal is fully rendered before scrolling
      setTimeout(() => {
        if (modalBodyRef.current) {
          // Reset scroll position to top
          modalBodyRef.current.scrollTop = 0;

          // Set focus to the image label
          if (initialFocusRef.current) {
            initialFocusRef.current.focus();
            initialFocusRef.current.blur();
          }
        }
      }, 50);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-3xl max-h-[80vh] overflow-y-auto",
          colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
        )}
      >
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        {!isLoading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex-1 relative" ref={modalBodyRef}>
              <div className="select-none">
                <Input
                  type="hidden"
                  {...register("userPk", { required: true, value: userId })}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div id="image-section">
                  <Label tabIndex={-1} ref={initialFocusRef}>
                    Image
                  </Label>

                  <StatefulMediaChangerAvatar
                    helperText={"Upload an image that represents you."}
                    selectedImageUrl={selectedImageUrl}
                    setSelectedImageUrl={setSelectedImageUrl}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    clearImageAddedFunctionality={async () => {
                      const data = await removeUserAvatar({
                        pk: Number(userId),
                      });
                      queryClient.refetchQueries();
                    }}
                  />
                </div>

                <div className="my-2">
                  <Controller
                    name="about"
                    control={control}
                    defaultValue={initialData?.about || ""}
                    render={({ field }) => (
                      <DatabaseRichTextEditor
                        populationData={initialData?.about || ""}
                        label="About"
                        htmlFor="about"
                        isEdit
                        field={field}
                        registerFn={register}
                        autoFocus={false}
                      />
                    )}
                  />
                </div>
                <div className="my-2">
                  <Controller
                    name="expertise"
                    control={control}
                    defaultValue={initialData?.expertise || ""}
                    render={({ field }) => (
                      <DatabaseRichTextEditor
                        populationData={initialData?.expertise || ""}
                        label="Expertise"
                        htmlFor="expertise"
                        isEdit
                        field={field}
                        registerFn={register}
                        autoFocus={false}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={mutation.isPending || !isValid}
                type="submit"
                className={cn(
                  "ml-3 text-white",
                  colorMode === "light" 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-green-600 hover:bg-green-400"
                )}
              >
                {mutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
