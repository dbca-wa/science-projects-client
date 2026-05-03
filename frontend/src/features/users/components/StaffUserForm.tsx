import { useMemo, useCallback } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import {
	Loader2,
	AlertCircle,
	Mail,
	AlertTriangle,
	Check,
	X,
} from "lucide-react";
import { BusinessAreaSelectItems } from "@/shared/components/BusinessAreaSelectItems";
import { useCreateStaffUser } from "../hooks/useCreateStaffUser";
import { useUserExistenceCheck } from "../hooks/useUserExistenceCheck";
import {
	staffUserCreateSchema,
	type StaffUserCreateFormData,
} from "../schemas/staffUserCreate.schema";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useBranches } from "@/shared/hooks/queries/useBranches";
import { sanitiseFormData } from "@/shared/utils";
import type { IUserData } from "@/shared/types/user.types";

interface StaffUserFormProps {
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
 * StaffUserForm component
 * Form for creating DBCA staff users (admin only)
 */
export const StaffUserForm = ({ onSuccess, onCancel }: StaffUserFormProps) => {
	const navigate = useNavigate();
	const createMutation = useCreateStaffUser();
	const { data: businessAreas, isLoading: isLoadingBusinessAreas } =
		useBusinessAreas();
	const { data: branches, isLoading: isLoadingBranches } = useBranches();

	const form = useForm<StaffUserCreateFormData>({
		resolver: zodResolver(staffUserCreateSchema),
		mode: "onChange",
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			confirmEmail: "",
			branch: undefined,
			businessArea: undefined,
		},
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const firstName = form.watch("firstName");
	const lastName = form.watch("lastName");
	const email = form.watch("email");
	const confirmEmail = form.watch("confirmEmail");
	const branch = form.watch("branch");
	const businessArea = form.watch("businessArea");

	// Stable email validator for staff users (must be @dbca.wa.gov.au)
	const emailValidator = useCallback(
		(e: string) => e.endsWith("@dbca.wa.gov.au"),
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

	// Memoize sorted data
	const sortedBranches = useMemo(() => {
		if (!branches) return [];
		return [...branches].sort((a, b) => a.name.localeCompare(b.name));
	}, [branches]);

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
		email.endsWith("@dbca.wa.gov.au") &&
		!emailErrors &&
		!emailExists;
	const isEmailInvalid =
		(form.formState.touchedFields.email ||
			form.formState.touchedFields.confirmEmail) &&
		(!!emailErrors || emailExists);

	const isOrgComplete = !!branch && !!businessArea;

	const onSubmit = async (data: StaffUserCreateFormData) => {
		if (emailExists) {
			form.setError("email", {
				message: "User with this email already exists",
			});
			return;
		}

		if (nameExists) {
			form.setError("lastName", {
				message: "User with this name already exists",
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

				{/* Helper text about OIM */}
				<Alert>
					<AlertCircle className="size-4" />
					<AlertDescription>
						Ideally, users should visit the SPMS with their DBCA account for an
						account to be automatically created using OIM's data. In situations
						where this is not possible, please use this form to manually create
						users. To avoid data inconsistencies with OIM, please use this form
						sparingly.
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
											placeholder="John"
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
											placeholder="Doe"
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
										<p className="text-sm text-red-500">
											User with this name already exists.
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
												placeholder="john.doe@dbca.wa.gov.au"
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
												placeholder="john.doe@dbca.wa.gov.au"
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

				{/* OIM Warning */}
				<Alert variant="destructive">
					<AlertTriangle className="size-4" />
					<AlertDescription>
						NOTE: If the information provided above does not match OIM's data,
						the user will be unable to log in. Instead, when they visit the
						site, a fresh account will be created with OIM's data. That account
						will NOT be connected to the account created here. You will have to
						merge the users.
					</AlertDescription>
				</Alert>

				{/* Organisation Section — Branch and Business Area side by side */}
				<FormSection title="Organisation" isComplete={isOrgComplete}>
					<div className="grid gap-4 md:grid-cols-2 items-start">
						<FormField
							control={form.control}
							name="branch"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Branch *</FormLabel>
									<Select
										value={
											field.value !== undefined && field.value !== null
												? field.value.toString()
												: ""
										}
										onValueChange={(value) => field.onChange(Number(value))}
										disabled={isLoadingBranches || isSubmitting}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a branch" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{sortedBranches.map((b) => (
												<SelectItem key={b.id} value={b.id!.toString()}>
													{b.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<div className="h-5">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="businessArea"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Business Area *</FormLabel>
									<Select
										value={
											field.value !== undefined && field.value !== null
												? field.value.toString()
												: ""
										}
										onValueChange={(value) => field.onChange(Number(value))}
										disabled={isLoadingBusinessAreas || isSubmitting}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a business area" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<BusinessAreaSelectItems
												businessAreas={businessAreas || []}
											/>
										</SelectContent>
									</Select>
									<div className="h-5">
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
					</div>
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
							nameExists ||
							!form.formState.isValid
						}
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
