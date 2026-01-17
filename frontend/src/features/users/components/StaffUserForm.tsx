import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Loader2, AlertCircle, Mail, AlertTriangle } from "lucide-react";
import { useCreateStaffUser } from "../hooks/useCreateStaffUser";
import { staffUserCreateSchema, type StaffUserCreateFormData } from "../schemas/staffUserCreate.schema";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useBranches } from "@/shared/hooks/queries/useBranches";
import { apiClient } from "@/shared/services/api/client.service";
import type { IUserData } from "@/shared/types/user.types";

interface StaffUserFormProps {
  onSuccess?: (user: IUserData) => void;
  onCancel?: () => void;
}

/**
 * StaffUserForm component
 * Form for creating DBCA staff users (admin only)
 */
export const StaffUserForm = ({ onSuccess, onCancel }: StaffUserFormProps) => {
  const navigate = useNavigate();
  const createMutation = useCreateStaffUser();
  const { data: businessAreas, isLoading: isLoadingBusinessAreas } = useBusinessAreas();
  const { data: branches, isLoading: isLoadingBranches } = useBranches();

  // Duplicate checking states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameExists, setNameExists] = useState(false);

  const form = useForm<StaffUserCreateFormData>({
    resolver: zodResolver(staffUserCreateSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
      branch: undefined,
      businessArea: undefined,
    },
  });

  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const email = form.watch("email");
  const confirmEmail = form.watch("confirmEmail");

  // Memoize sorted data
  const sortedBranches = useMemo(() => {
    if (!branches) return [];
    return [...branches].sort((a, b) => a.name.localeCompare(b.name));
  }, [branches]);

  const sortedBusinessAreas = useMemo(() => {
    if (!businessAreas) return [];
    return [...businessAreas].sort((a, b) => {
      if (a.is_active && !b.is_active) return -1;
      if (!a.is_active && b.is_active) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [businessAreas]);

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
    const isDbcaEmail = email.endsWith("@dbca.wa.gov.au");

    if (emailsMatch && isValidEmail && isDbcaEmail) {
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

  const onSubmit = async (data: StaffUserCreateFormData) => {
    if (emailExists) {
      form.setError("email", { message: "User with this email already exists" });
      return;
    }

    if (nameExists) {
      form.setError("lastName", { message: "User with this name already exists" });
      return;
    }

    try {
      const newUser = await createMutation.mutateAsync(data);
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

        {/* Helper text about OIM */}
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            Ideally, users should visit the SPMS with their DBCA account for an account to be 
            automatically created using OIM's data. In situations where this is not possible, 
            please use this form to manually create users. To avoid data inconsistencies with OIM, 
            please use this form sparingly.
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
                    placeholder="John"
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
                    placeholder="Doe"
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
                  <p className="text-sm text-red-500">
                    User with this name already exists.
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
                      placeholder="john.doe@dbca.wa.gov.au"
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
                      placeholder="john.doe@dbca.wa.gov.au"
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
                  !nameExists &&
                  email.length >= 5 &&
                  email === confirmEmail &&
                  firstName.length > 1 &&
                  lastName.length > 1 &&
                  email.endsWith("@dbca.wa.gov.au") && (
                    <p className="text-sm text-green-500">
                      All fields complete. Press Create.
                    </p>
                  )}
              </FormItem>
            )}
          />
        </div>

        {/* OIM Warning */}
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            NOTE: If the information provided above does not match OIM's data, the user will be 
            unable to log in. Instead, when they visit the site, a fresh account will be created 
            with OIM's data. That account will NOT be connected to the account created here. 
            You will have to merge the users.
          </AlertDescription>
        </Alert>

        {/* Branch */}
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch *</FormLabel>
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={isLoadingBranches || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sortedBranches.map((branch) => (
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
              <FormLabel>Business Area *</FormLabel>
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={isLoadingBusinessAreas || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business area" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sortedBusinessAreas.map((ba) => (
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
            disabled={isSubmitting || isCheckingEmail || isCheckingName || emailExists || nameExists}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
};
