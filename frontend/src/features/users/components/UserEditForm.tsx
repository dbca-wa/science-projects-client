import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Loader2, AlertCircle, User, Phone, Printer, Mail, Award } from "lucide-react";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
import { ImageUpload } from "@/shared/components/media";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useUserDetail } from "../hooks/useUserDetail";
import { userEditSchema, type UserEditFormData } from "../schemas/userEdit.schema";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useBranches } from "@/shared/hooks/queries/useBranches";
import type { IUserData } from "@/shared/types/user.types";

interface UserEditFormProps {
  userId: number;
  onSuccess?: (user: IUserData) => void;
  onCancel?: () => void;
}

/**
 * UserEditForm component
 * Form for editing existing users
 * 
 * Sections:
 * - Personal Information: Title, Phone, Fax, Email (disabled), First Name, Last Name
 * - Profile: Image, About, Expertise
 * - Membership: Branch, Business Area, Affiliation (staff) or just Affiliation (external)
 */
export const UserEditForm = ({ userId, onSuccess, onCancel }: UserEditFormProps) => {
  const navigate = useNavigate();
  const { data: user, isLoading: isLoadingUser } = useUserDetail(userId);
  const updateMutation = useUpdateUser();
  const { data: businessAreas, isLoading: isLoadingBusinessAreas } = useBusinessAreas();
  const { data: branches, isLoading: isLoadingBranches } = useBranches();

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
        branch: user.branch?.pk,
        businessArea: user.business_area?.pk,
        affiliation: user.affiliation?.pk,
        image: user.image?.file || null,
      });
    }
  }, [user, form]);

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

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>User not found</AlertDescription>
      </Alert>
    );
  }

  const isSubmitting = updateMutation.isPending;

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
        <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Display First Name */}
            <FormField
              control={form.control}
              name="displayFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter first name"
                        {...field}
                        value={field.value || ""}
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Last Name */}
            <FormField
              control={form.control}
              name="displayLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter last name"
                        {...field}
                        value={field.value || ""}
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full pl-10">
                          <SelectValue placeholder="Select a title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="dr">Dr</SelectItem>
                        <SelectItem value="mr">Mr</SelectItem>
                        <SelectItem value="mrs">Mrs</SelectItem>
                        <SelectItem value="ms">Ms</SelectItem>
                        <SelectItem value="aprof">A/Prof</SelectItem>
                        <SelectItem value="prof">Prof</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        {...field}
                        value={field.value || ""}
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fax */}
            <FormField
              control={form.control}
              name="fax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fax</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Printer className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="Enter fax number"
                        {...field}
                        value={field.value || ""}
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1.5 invisible">Placeholder</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email (disabled) */}
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Email cannot be changed</p>
            </FormItem>
          </div>
        </div>

        {/* Profile */}
        <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Profile</h3>
          
          {/* Image Upload */}
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
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* About and Expertise */}
          <div className="space-y-4">
            {/* About */}
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about this user..."
                      className="min-h-[120px] resize-none"
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
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
                    <Textarea
                      placeholder="List areas of expertise..."
                      className="min-h-[120px] resize-none"
                      {...field}
                      value={field.value || ""}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Membership */}
        <div className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Membership</h3>
          
          {user.is_staff ? (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Branch */}
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      value={field.value?.toString() || "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))}
                      disabled={isLoadingBranches || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {branches?.sort((a, b) => a.name.localeCompare(b.name)).map((branch) => (
                          <SelectItem key={branch.pk} value={branch.pk!.toString()}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Area */}
              <FormField
                control={form.control}
                name="businessArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Area</FormLabel>
                    <Select
                      value={field.value?.toString() || "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))}
                      disabled={isLoadingBusinessAreas || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a business area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {businessAreas?.sort((a, b) => a.name.localeCompare(b.name)).map((ba) => (
                          <SelectItem key={ba.pk} value={ba.pk!.toString()}>
                            {ba.is_active ? ba.name : `[INACTIVE] ${ba.name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Affiliation */}
              <FormField
                control={form.control}
                name="affiliation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliation</FormLabel>
                    <FormControl>
                      <AffiliationCombobox
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search for an affiliation..."
                        isEditable={true}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                This user is external. You may only set their affiliation.
              </p>

              {/* Affiliation (external users) */}
              <FormField
                control={form.control}
                name="affiliation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliation</FormLabel>
                    <FormControl>
                      <AffiliationCombobox
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search for an affiliation..."
                        isEditable={true}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => navigate(`/users/${userId}`))}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
};
