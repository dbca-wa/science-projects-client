import { observer } from "mobx-react-lite";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../../services/user.service";
import { authKeys } from "@/features/auth/hooks/useAuth";
import { getImageUrl } from "@/shared/utils/image.utils";
import { sanitizeFormData } from "@/shared/utils";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { ImageUpload } from "@/shared/components/media";
import { RichTextEditor } from "@/shared/components/editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  image: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
  about: z.string().optional(),
  expertise: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUserData | IUserMe;
  onSuccess: () => void;
}

export const EditProfileModal = observer(
  ({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) => {
    const queryClient = useQueryClient();
    
    const form = useForm<ProfileFormData>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        image: getImageUrl(user.image),
        about: user.about || "",
        expertise: user.expertise || "",
      },
    });

    // Reset form when user data changes or modal opens
    React.useEffect(() => {
      if (isOpen) {
        form.reset({
          image: getImageUrl(user.image),
          about: user.about || "",
          expertise: user.expertise || "",
        });
      }
    }, [isOpen, user.image?.file, user.about, user.expertise, form]);

    const updateMutation = useMutation({
      mutationFn: (data: ProfileFormData) => updateProfile(user.id!, data),
      onSuccess: async () => {
        // Invalidate and refetch current user query to update Navitar
        await queryClient.invalidateQueries({ 
          queryKey: authKeys.user(),
          exact: true
        });
        
        // Also invalidate user detail if viewing own profile
        await queryClient.invalidateQueries({
          queryKey: ["users", "detail", user.id],
        });
        
        toast.success("Profile updated successfully");
        onSuccess();
        onClose();
      },
      onError: (error: Error) => {
        const message = error.message || "Failed to update profile";
        toast.error(message);
      },
    });

    const handleSubmit = (data: ProfileFormData) => {
      // Sanitize form data before submission
      const sanitizedData = sanitizeFormData(data, ["about", "expertise"]);
      updateMutation.mutate(sanitizedData);
    };

    const handleClose = () => {
      form.reset();
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile image, about section, and expertise. This
              information will be displayed in-app and on your public profile.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Image */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        variant="avatar"
                        allowUrl={true}
                        disabled={updateMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* About */}
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Tell us about yourself..."
                        toolbar="full"
                        disabled={updateMutation.isPending}
                        minHeight="150px"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expertise */}
              <FormField
                control={form.control}
                name="expertise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expertise</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Describe your areas of expertise..."
                        toolbar="full"
                        disabled={updateMutation.isPending}
                        minHeight="150px"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);
