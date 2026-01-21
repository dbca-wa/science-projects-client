import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { AccountFields } from "./AccountFields";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ProfileFields } from "./ProfileFields";
import { MembershipFields } from "./MembershipFields";
import { ImageUpload } from "@/shared/components/media/ImageUpload";
import { useCreateUser } from "../hooks/useCreateUser";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useUserDetail } from "../hooks/useUserDetail";
import { userCreateSchema, type UserCreateFormData } from "../schemas/userCreate.schema";
import { userEditSchema, type UserEditFormData } from "../schemas/userEdit.schema";
import type { IUserData } from "@/shared/types/user.types";

interface UserFormProps {
  mode: "create" | "edit";
  userId?: number;
  onSuccess?: (user: IUserData) => void;
  onCancel?: () => void;
}

/**
 * UserForm component
 * Unified form for creating and editing users
 * 
 * Features:
 * - Create mode: Empty form with all fields
 * - Edit mode: Pre-populated form with user data
 * - React Hook Form + Zod validation
 * - TanStack Query mutations
 * - Automatic cache invalidation
 * - Success/error handling
 * 
 * @param mode - "create" or "edit"
 * @param userId - User ID (required for edit mode)
 * @param onSuccess - Callback on successful submission
 * @param onCancel - Callback on cancel
 */
export const UserForm = ({ mode, userId, onSuccess, onCancel }: UserFormProps) => {
  const navigate = useNavigate();
  
  // Always call hooks (React rules of hooks)
  // useUserDetail already has enabled: !!userId internally
  const { data: user, isLoading: isLoadingUser } = useUserDetail(
    mode === "edit" && userId ? userId : 0
  );
  
  // Mutations
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  
  // Loading state for edit mode
  if (mode === "edit" && isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  
  // Render create form
  if (mode === "create") {
    return <CreateForm 
      createMutation={createMutation}
      isSubmitting={isSubmitting}
      onSuccess={onSuccess}
      onCancel={onCancel}
      navigate={navigate}
    />;
  }
  
  // Render edit form
  return <EditForm
    user={user}
    userId={userId!}
    updateMutation={updateMutation}
    isSubmitting={isSubmitting}
    onSuccess={onSuccess}
    onCancel={onCancel}
    navigate={navigate}
  />;
};

// Create Form Component
interface CreateFormProps {
  createMutation: ReturnType<typeof useCreateUser>;
  isSubmitting: boolean;
  onSuccess?: (user: IUserData) => void;
  onCancel?: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

const CreateForm = ({ createMutation, isSubmitting, onSuccess, onCancel, navigate }: CreateFormProps) => {
  const form = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      displayFirstName: "",
      displayLastName: "",
      title: "",
      phone: "",
      fax: "",
      about: "",
      expertise: "",
      isStaff: false,
      branch: undefined,
      businessArea: undefined,
      affiliation: undefined,
      image: null,
    },
  });

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty && !form.formState.isSubmitting) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty, form.formState.isSubmitting]);
  
  const onSubmit = async (data: UserCreateFormData) => {
    try {
      const newUser = await createMutation.mutateAsync(data);
      if (onSuccess) {
        onSuccess(newUser);
      } else {
        navigate(`/users/${newUser.id}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      form.setError("root", { message: errorMessage });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Form-level error */}
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Account Information</h3>
          <AccountFields control={form.control} disabled={isSubmitting} />
        </div>
        
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <PersonalInfoFields control={form.control} disabled={isSubmitting} />
        </div>
        
        {/* Profile */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Profile</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        variant="avatar"
                        allowUrl={true}
                        disabled={isSubmitting}
                        helperText="Upload an image that represents you"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <ProfileFields control={form.control} disabled={isSubmitting} />
            </div>
          </div>
        </div>
        
        {/* Membership */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Membership</h3>
          <MembershipFields control={form.control} disabled={isSubmitting} />
        </div>
        
        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => navigate(-1))}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            Create User
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Edit Form Component
interface EditFormProps {
  user?: IUserData;
  userId: number;
  updateMutation: ReturnType<typeof useUpdateUser>;
  isSubmitting: boolean;
  onSuccess?: (user: IUserData) => void;
  onCancel?: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

const EditForm = ({ user, userId, updateMutation, isSubmitting, onSuccess, onCancel, navigate }: EditFormProps) => {
  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    mode: "onBlur",
    defaultValues: {
      displayFirstName: "",
      displayLastName: "",
      title: "",
      phone: "",
      fax: "",
      about: "",
      expertise: "",
      branch: undefined,
      businessArea: undefined,
      affiliation: undefined,
      image: null,
    },
  });

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty && !form.formState.isSubmitting) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty, form.formState.isSubmitting]);
  
  // Pre-populate form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        displayFirstName: user.display_first_name || "",
        displayLastName: user.display_last_name || "",
        title: user.title || "",
        phone: user.phone || "",
        fax: user.fax || "",
        about: user.about || "",
        expertise: user.expertise || "",
        branch: user.branch?.id,
        businessArea: user.business_area?.id,
        affiliation: user.affiliation?.id,
        image: user.image?.file || null,
      });
    }
  }, [user, form]);
  
  const onSubmit = async (data: UserEditFormData) => {
    try {
      const updatedUser = await updateMutation.mutateAsync({
        id: userId,
        data,
      });
      if (onSuccess) {
        onSuccess(updatedUser);
      } else {
        navigate(`/users/${userId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      form.setError("root", { message: errorMessage });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Form-level error */}
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <PersonalInfoFields control={form.control} disabled={isSubmitting} />
        </div>
        
        {/* Profile */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Profile</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        variant="avatar"
                        allowUrl={true}
                        disabled={isSubmitting}
                        helperText="Upload an image that represents you"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <ProfileFields control={form.control} disabled={isSubmitting} />
            </div>
          </div>
        </div>
        
        {/* Membership */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Membership</h3>
          <MembershipFields control={form.control} disabled={isSubmitting} />
        </div>
        
        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => navigate(-1))}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};
