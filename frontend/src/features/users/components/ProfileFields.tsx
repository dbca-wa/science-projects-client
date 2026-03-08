import type { Control, FieldValues, Path } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { FormRichTextEditor } from "@/shared/components/editor";

// Type constraint for forms that have profile fields
type ProfileFieldsType = {
	about?: string;
	expertise?: string;
};

interface ProfileFieldsProps<T extends FieldValues & ProfileFieldsType> {
	control: Control<T>;
	disabled?: boolean;
}

/**
 * ProfileFields component
 * Form fields for profile information (about, expertise)
 *
 * @param control - React Hook Form control
 * @param disabled - Whether fields should be disabled
 */
export const ProfileFields = <T extends FieldValues & ProfileFieldsType>({
	control,
	disabled,
}: ProfileFieldsProps<T>) => {
	return (
		<div className="space-y-4">
			{/* About */}
			<FormField
				control={control}
				name={"about" as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>About</FormLabel>
						<FormControl>
							<FormRichTextEditor
								value={field.value || ""}
								onChange={field.onChange}
								placeholder="Tell us about this user..."
								disabled={disabled}
								toolbar="profile"
								wordLimit={500}
								aria-label="About"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* Expertise */}
			<FormField
				control={control}
				name={"expertise" as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Expertise</FormLabel>
						<FormControl>
							<FormRichTextEditor
								value={field.value || ""}
								onChange={field.onChange}
								placeholder="List areas of expertise..."
								disabled={disabled}
								toolbar="profile"
								wordLimit={500}
								aria-label="Expertise"
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
};
