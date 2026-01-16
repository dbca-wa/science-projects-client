import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

// Type constraint for forms that have personal info fields
type PersonalInfoFields = {
  displayFirstName?: string;
  displayLastName?: string;
  title?: string;
  phone?: string;
  fax?: string;
};

interface PersonalInfoFieldsProps<T extends FieldValues & PersonalInfoFields> {
  control: Control<T>;
  disabled?: boolean;
}

/**
 * PersonalInfoFields component
 * Form fields for personal information (display name, title, phone, fax)
 * @param control - React Hook Form control
 * @param disabled - Whether fields should be disabled
 */
export const PersonalInfoFields = <T extends FieldValues>({ control, disabled }: PersonalInfoFieldsProps<T>) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>

      {/* Display First Name */}
      <FormField
        control={control}
        name={"displayFirstName" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display First Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter display first name"
                {...field}
                value={field.value || ""}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Display Last Name */}
      <FormField
        control={control}
        name={"displayLastName" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display Last Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter display last name"
                {...field}
                value={field.value || ""}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Title */}
      <FormField
        control={control}
        name={"title" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter job title"
                {...field}
                value={field.value || ""}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Phone */}
      <FormField
        control={control}
        name={"phone" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="Enter phone number"
                {...field}
                value={field.value || ""}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Fax */}
      <FormField
        control={control}
        name={"fax" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fax</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="Enter fax number"
                {...field}
                value={field.value || ""}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
