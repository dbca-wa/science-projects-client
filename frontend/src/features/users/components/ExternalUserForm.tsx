import { useCallback } from "react";
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
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, AlertCircle, Mail, Check, X } from "lucide-react";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
import { useCreateExternalUser } from "../hooks/useCreateExternalUser";
import { useUserExistenceCheck } from "../hooks/useUserExistenceCheck";
import {
	externalUserCreateSchema,
	type ExternalUserCreateFormData,
} from "../schemas/externalUserCreate.schema";
import { sanitiseFormData } from "@/shared/utils";
import type { IUserData } from "@/shared/types/user.types";

interface ExternalUserFormProps {
	onSuccess?: (user: IUserData) => void;
	onCancel?: () => void;
}

/** Section card with validation state indicator */
const FormSection = ({
	title,
	isComplete,
	isInvalid,
	children,
}: {
	title: string;
	isComplete: boolean;
	isInvalid?: boolean;
	children: React.ReactNode;
}) => (
	<div
		className={`rounded-lg border shadow-sm p-6 transition-colors ${
			isInvalid
				? "bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-700"
				: isComplete
					? "bg-emerald-50/50 dark:bg-emerald-950/20"
					: ""
		}`}
	>
		<div className="flex items-center justify-between mb-4">
			<h3 className="text-base font-semibold">{title}</h3>
			{isInvalid && (
				<div className="animate-in zoom-in-50 fade-in duration-300 flex items-center justify-center size-6 rounded-full bg-red-100 dark:bg-red-900/40">
					<X className="size-4 text-red-600 dark:text-red-400" />
				</div>
			)}
			{isComplete && !isInvalid && (
				<div className="animate-in zoom-in-50 fade-in duration-300 flex items-center justify-center size-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
					<Check className="size-4 text-emerald-600 dark:text-emerald-400" />
				</div>
			)}
		</div>
		{children}
	</div>
);

/**
 * ExternalUserForm component
 * Form for creating external (non-DBCA) users
 */
export const ExternalUserForm = ({
	onSuccess,
	onCancel,
}: ExternalUserFormProps) => {
	const navigate = useNavigate();
	const createMutation = useCreateExternalUser();

	const form = useForm<ExternalUserCreateFormData>({
		resolver: zodResolver(externalUserCreateSchema),
		mode: "onChange",
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			confirmEmail: "",
			affiliation: undefined,
		},
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const firstName = form.watch("firstName");
	const lastName = form.watch("lastName");
	const email = form.watch("email");
	const confirmEmail = form.watch("confirmEmail");

	// Stable email validator for external users (must NOT be @dbca.wa.gov.au)
	const emailValidator = useCallback(
		(e: string) => !e.endsWith("@dbca.wa.gov.au"),
		[]
	);

	// Debounced duplicate checking via shared hook
	const { isCheckingName, nameExists, isCheckingEmail, emailExists } =
		useUserExistenceCheck({
			firstName,
			lastName,
			email,
			confirmEmail,
			emailValidator,
		});

	// Section validation states
	const nameErrors =
		form.formState.errors.firstName || form.formState.errors.lastName;
	const isNameComplete =
		firstName.length >= 2 && lastName.length >= 2 && !nameErrors;
	const isNameInvalid =
		(form.formState.touchedFields.firstName ||
			form.formState.touchedFields.lastName) &&
		!!nameErrors;

	const emailErrors =
		form.formState.errors.email || form.formState.errors.confirmEmail;
	const isEmailComplete =
		email.length >= 5 &&
		email === confirmEmail &&
		!email.endsWith("@dbca.wa.gov.au") &&
		!emailErrors &&
		!emailExists;
	const isEmailInvalid =
		(form.formState.touchedFields.email ||
			form.formState.touchedFields.confirmEmail) &&
		(!!emailErrors || emailExists);

	const onSubmit = async (data: ExternalUserCreateFormData) => {
		if (emailExists) {
			form.setError("email", {
				message: "User with this email already exists",
			});
			return;
		}

		try {
			const sanitisedData = sanitiseFormData(data, []);
			const newUser = await createMutation.mutateAsync(sanitisedData);
			if (onSuccess) {
				onSuccess(newUser);
			} else {
				navigate("/users");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";
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
						This is for adding external users only. If you are trying to add a
						DBCA staff member, please send them a link to this website and an
						account will be created when they visit. All existing users can be
						found on the users page.
					</AlertDescription>
				</Alert>

				{/* Name Section */}
				<FormSection
					title="Name"
					isComplete={isNameComplete}
					isInvalid={isNameInvalid}
				>
					<div className="grid gap-4 md:grid-cols-2 items-start">
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
									<div className="h-5">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
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
									<div className="h-5">
										<FormMessage />
									</div>
									{isCheckingName && (
										<p className="text-sm text-blue-500 flex items-center gap-2">
											<Loader2 className="size-3 animate-spin" /> Checking
											name...
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
				</FormSection>

				{/* Email Section */}
				<FormSection
					title="Email"
					isComplete={isEmailComplete}
					isInvalid={isEmailInvalid}
				>
					<div className="grid gap-4 md:grid-cols-2 items-start">
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
									<div className="h-5">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
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
									<div className="h-5">
										<FormMessage />
									</div>
									{isCheckingEmail && (
										<p className="text-sm text-blue-500 flex items-center gap-2">
											<Loader2 className="size-3 animate-spin" /> Checking
											email...
										</p>
									)}
									{emailExists && (
										<p className="text-sm text-red-500">
											User with this email already exists.
										</p>
									)}
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				{/* Affiliation Section (optional) */}
				<FormSection title="Affiliation" isComplete={false}>
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
				</FormSection>

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
						disabled={
							isSubmitting ||
							isCheckingEmail ||
							isCheckingName ||
							emailExists ||
							!form.formState.isValid
						}
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
