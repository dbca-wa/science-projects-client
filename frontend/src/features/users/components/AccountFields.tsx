import type { Control } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import type { UserCreateFormData } from "../schemas/userCreate.schema";

interface AccountFieldsProps {
	control: Control<UserCreateFormData>;
	disabled?: boolean;
}

/**
 * AccountFields component
 * Username, first name, last name, and email fields for user creation
 *
 * Features:
 * - Username field (unique, validated)
 * - First name field (required)
 * - Last name field (required)
 * - Email field (unique, validated)
 *
 * @param control - React Hook Form control
 * @param disabled - Whether fields should be disabled
 */
export const AccountFields = ({ control, disabled }: AccountFieldsProps) => {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			{/* Username */}
			<FormField
				control={control}
				name="username"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Username *</FormLabel>
						<FormControl>
							<Input
								{...field}
								placeholder="john.doe"
								autoComplete="username"
								disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* Email */}
			<FormField
				control={control}
				name="email"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Email *</FormLabel>
						<FormControl>
							<Input
								{...field}
								type="email"
								placeholder="john.doe@example.com"
								autoComplete="email"
								disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* First Name */}
			<FormField
				control={control}
				name="firstName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>First Name *</FormLabel>
						<FormControl>
							<Input
								{...field}
								placeholder="John"
								autoComplete="given-name"
								disabled={disabled}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{/* Last Name */}
			<FormField
				control={control}
				name="lastName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Last Name *</FormLabel>
						<FormControl>
							<Input
								{...field}
								placeholder="Doe"
								autoComplete="family-name"
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
