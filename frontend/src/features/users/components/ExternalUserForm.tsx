import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, AlertCircle, Mail } from "lucide-react";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
import { useCreateExternalUser } from "../hooks/useCreateExternalUser";
import { externalUserCreateSchema, type ExternalUserCreateFormData } from "../schemas/externalUserCreate.schema";
import { apiClient } from "@/shared/services/api/client.service";
import { sanitizeFormData } from "@/shared/utils";
import type { IUserData } from "@/shared/types/user.types";

interface ExternalUserFormProps {
  onSuccess?: (user: IUserData) => void;
  onCancel?: () => void;
}

/**
 * ExternalUserForm component
 * Form for creating external (non-DBCA) users
 */
export const ExternalUserForm = ({ onSuccess, onCancel }: ExternalUserFormProps) => {
  const navigate = useNavigate();
  const createMutation = useCreateExternalUser();

  // Duplicate checking states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameExists, setNameExists] = useState(false);

  const form = useForm<ExternalUserCreateFormData>({
    resolver: zodResolver(externalUserCreateSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
      affiliation: undefined,
    },
  });

  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const email = form.watch("email");
  const confirmEmail = form.watch("confirmEmail");

  // Debounced name checking
  useEffect(() => {
    const isFirstNameValid = firstName.length >= 2 && /^[A-Za-z\- ]+$/.test(firstName);
    const isLastNameValid = lastName.length >= 2 && /^[A-Za-z\- ]+$/.test(lastName);

    if (isFirstNameValid && isLastNameValid) {
      setIsCheckingName(true);
      const timer = setTimeout(async () => {
        try {
          const response = await apiClient.post<{ exists: boolean }>("users/check-name-exists", {
            first_name: firstName,
            last_name: lastName,
          });
          setNameExists(response.exists);
        } catch (error) {
          console.error("Error checking name:", error);
        } finally {
          setIsCheckingName(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsCheckingName(false);
      setNameExists(false);
    }
  }, [firstName, lastName]);

  // Debounced email checking
  useEffect(() => {
    const emailsMatch = email === confirmEmail;
    const isValidEmail = email.length >= 5 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isNotDbcaEmail = !email.endsWith("@dbca.wa.gov.au");

    if (emailsMatch && isValidEmail && isNotDbcaEmail) {
      setIsCheckingEmail(true);
      const timer = setTimeout(async () => {
        try {
          const response = await apiClient.post<{ exists: boolean }>("users/check-email-exists", {
            email,
          });
          setEmailExists(response.exists);
        } catch (error) {
          console.error("Error checking email:", error);
        } finally {
          setIsCheckingEmail(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsCheckingEmail(false);
      setEmailExists(false);
    }
  }, [email, confirmEmail]);

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

  const onSubmit = async (data: ExternalUserCreateFormData) => {
    if (emailExists) {
      form.setError("email", { message: "User with this email already exists" });
      return;
    }

    try {
      // Sanitize form data before submission
      const sanitizedData = sanitizeFormData(data, []);
      
      const newUser = await createMutation.mutateAsync(sanitizedData);
      if (onSuccess) {
        onSuccess(newUser);
      } else {
        navigate("/users");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      form.setError("root", { message: errorMessage });
    }
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form-level error */}
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Helper text about external users */}
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            This is for adding external users only. If you are trying to add a DBCA staff member, 
            please send them a link to this website and an account will be created when they visit. 
            All existing users can be found on the users page.
          </AlertDescription>
        </Alert>

        {/* Name fields */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="First Name"
                    maxLength={30}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Last Name"
                    maxLength={30}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
                {isCheckingName && (
                  <p className="text-sm text-blue-500 flex items-center gap-2">
                    <Loader2 className="size-3 animate-spin" />
                    Checking name...
                  </p>
                )}
                {nameExists && (
                  <p className="text-sm text-orange-500">
                    Warning: User with this name already exists.
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* Email fields */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Email"
                      maxLength={50}
                      disabled={isSubmitting}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Email */}
          <FormField
            control={form.control}
            name="confirmEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Email *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Confirm Email"
                      maxLength={50}
                      disabled={isSubmitting}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
                {isCheckingEmail && (
                  <p className="text-sm text-blue-500 flex items-center gap-2">
                    <Loader2 className="size-3 animate-spin" />
                    Checking email...
                  </p>
                )}
                {emailExists && (
                  <p className="text-sm text-red-500">
                    User with this email already exists.
                  </p>
                )}
                {!emailExists &&
                  email.length >= 5 &&
                  email === confirmEmail &&
                  firstName.length > 1 &&
                  lastName.length > 1 &&
                  !email.endsWith("@dbca.wa.gov.au") && (
                    <p className="text-sm text-green-500">
                      All fields complete. Press Add User.
                    </p>
                  )}
              </FormItem>
            )}
          />
        </div>

        {/* Affiliation (optional) */}
        <FormField
          control={form.control}
          name="affiliation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliation (Optional)</FormLabel>
              <FormControl>
                <AffiliationCombobox
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Search for an affiliation..."
                  helperText="Optionally select an affiliation for this user"
                  isEditable={true}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => navigate("/users"))}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isCheckingEmail || isCheckingName || emailExists}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            Add User
          </Button>
        </div>
      </form>
    </Form>
  );
};
