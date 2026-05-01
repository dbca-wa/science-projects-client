import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useBlocker } from "react-router";
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
	User,
	Phone,
	Printer,
	Mail,
	Award,
} from "lucide-react";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
import { ImageUpload } from "@/shared/components/media";
import { FormRichTextEditor } from "@/shared/components/editor";
import { UnsavedChangesDialog } from "@/shared/components/editor/UnsavedChangesDialog";
import { getImageUrl } from "@/shared/utils/image.utils";
import { BusinessAreaSelectItems } from "@/shared/components/BusinessAreaSelectItems";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useUserDetail } from "../hooks/useUserDetail";
import {
	type UserEditFormData,
	userEditSchema,
} from "../schemas/userEdit.schema";
import { sanitiseFormData } from "@/shared/utils";
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
export const UserEditForm = ({
	userId,
	onSuccess,
	onCancel,
}: UserEditFormProps) => {
	const navigate = useNavigate();
	const { data: user, isLoading: isLoadingUser } = useUserDetail(userId);
	const updateMutation = useUpdateUser();
	const { data: businessAreas, isLoading: isLoadingBusinessAreas } =
		useBusinessAreas();
	const { data: branches, isLoading: isLoadingBranches } = useBranches();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Initialise form
	const form = useForm<UserEditFormData>({
		resolver: zodResolver(userEditSchema),
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
			image: "",
		},
	});

	// Block navigation when form has unsaved changes
	const blocker = useBlocker(({ currentLocation, nextLocation }) => {
		const isDirty = form.formState.isDirty;
		const pathChanged = currentLocation.pathname !== nextLocation.pathname;

		return isDirty && pathChanged && !updateMutation.isSuccess;
	});

	// Handle blocker state changes - synchronizing with React Router blocker
	// This is necessary to show the unsaved changes dialog when navigation is blocked
	useEffect(() => {
		if (blocker.state === "blocked") {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizing with React Router blocker state
			setIsDialogOpen(true);
		}
	}, [blocker.state]);

	// Block browser-level navigation (tab close, refresh, back button)
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (form.formState.isDirty && !updateMutation.isSuccess) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [form.formState.isDirty, updateMutation.isSuccess]);

	// Dialog handlers
	const handleProceed = () => {
		setIsDialogOpen(false);
		form.reset(); // Reset form to mark as not dirty
		if (blocker.state === "blocked") {
			blocker.proceed?.();
		}
	};

	const handleCancelDialog = () => {
		setIsDialogOpen(false);
		if (blocker.state === "blocked") {
			blocker.reset?.();
		}
	};

	// Pre-populate form when user data loads AND dropdown data has loaded
	useEffect(() => {
		if (user && branches && businessAreas) {
			const resetValues = {
				displayFirstName: user.display_first_name || "",
				displayLastName: user.display_last_name || "",
				title: user.title || "",
				phone: user.phone || "",
				fax: user.fax || "",
				about: user.about || "",
				expertise: user.expertise || "",
				branch:
					user.branch?.id !== undefined && user.branch?.id !== null
						? user.branch.id
						: undefined,
				businessArea:
					user.business_area?.id !== undefined &&
					user.business_area?.id !== null
						? user.business_area.id
						: undefined,
				affiliation: user.affiliation?.id ?? undefined,
				image: getImageUrl(user.image),
			};

			form.reset(resetValues, {
				keepDefaultValues: false,
			});
		}
	}, [user, branches, businessAreas, form]);

	const onSubmit = async (data: UserEditFormData) => {
		try {
			// Sanitise form data before submission
			const sanitisedData = sanitiseFormData(data, ["about", "expertise"]);

			const updatedUser = await updateMutation.mutateAsync({
				id: userId,
				data: sanitisedData,
			});
			if (onSuccess) {
				onSuccess(updatedUser);
			} else {
				navigate(`/users/${userId}`);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";
			form.setError("root", { message: errorMessage });
		}
	};

	// Loading state
	if (isLoadingUser) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="size-8 animate-spin text-blue-600" />
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
										<FormRichTextEditor
											value={field.value || ""}
											onChange={field.onChange}
											placeholder="Tell us about this user..."
											toolbar="full"
											disabled={isSubmitting}
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
							control={form.control}
							name="expertise"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Expertise</FormLabel>
									<FormControl>
										<FormRichTextEditor
											value={field.value || ""}
											onChange={field.onChange}
											placeholder="List areas of expertise..."
											toolbar="full"
											disabled={isSubmitting}
											wordLimit={500}
											aria-label="Expertise"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

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
											onValueChange={(value) =>
												field.onChange(value === "none" ? "" : value)
											}
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
									<p className="text-xs text-muted-foreground mt-1.5 invisible">
										Placeholder
									</p>
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
							<p className="text-xs text-muted-foreground mt-1.5">
								Email cannot be changed
							</p>
						</FormItem>
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
								render={({ field }) => {
									const currentValue =
										field.value !== undefined && field.value !== null
											? field.value.toString()
											: "none";
									const matchingBranch = branches?.find(
										(b) => b.id?.toString() === currentValue
									);

									// Only show the actual value if we have a matching branch OR if it's "none"
									// This prevents Select from showing invalid values that would trigger onChange("")
									const displayValue = matchingBranch ? currentValue : "none";

									return (
										<FormItem>
											<FormLabel>Branch</FormLabel>
											<Select
												value={displayValue}
												onValueChange={(value) => {
													// Ignore empty string changes and invalid values
													if (!value || value === "") {
														return;
													}

													let newValue: number | undefined;

													if (value === "none") {
														newValue = undefined;
													} else {
														const numValue = Number(value);
														// Only accept the value if it corresponds to an actual branch
														const isValidBranch = branches?.some(
															(b) => b.id === numValue
														);
														if (isValidBranch) {
															newValue = numValue;
														} else {
															return; // Ignore invalid values
														}
													}

													// Only update if the value actually changed
													if (newValue !== field.value) {
														field.onChange(newValue);
													}
												}}
												disabled={isLoadingBranches || isSubmitting}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a branch" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													{branches
														?.sort((a, b) => a.name.localeCompare(b.name))
														.map((branch) => (
															<SelectItem
																key={branch.id}
																value={branch.id!.toString()}
															>
																{branch.name}
															</SelectItem>
														))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									);
								}}
							/>

							{/* Business Area */}
							<FormField
								control={form.control}
								name="businessArea"
								render={({ field }) => {
									const currentValue =
										field.value !== undefined && field.value !== null
											? field.value.toString()
											: "none";
									const matchingBusinessArea = businessAreas?.find(
										(ba) => ba.id?.toString() === currentValue
									);

									// Only show the actual value if we have a matching business area OR if it's "none"
									const displayValue = matchingBusinessArea
										? currentValue
										: "none";

									return (
										<FormItem>
											<FormLabel>Business Area</FormLabel>
											<Select
												value={displayValue}
												onValueChange={(value) => {
													// Ignore empty string changes and invalid values
													if (!value || value === "") {
														return;
													}

													let newValue: number | undefined;

													if (value === "none") {
														newValue = undefined;
													} else {
														const numValue = Number(value);
														// Only accept the value if it corresponds to an actual business area
														const isValidBusinessArea = businessAreas?.some(
															(ba) => ba.id === numValue
														);
														if (isValidBusinessArea) {
															newValue = numValue;
														} else {
															return; // Ignore invalid values
														}
													}

													// Only update if the value actually changed
													if (newValue !== field.value) {
														field.onChange(newValue);
													}
												}}
												disabled={isLoadingBusinessAreas || isSubmitting}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a business area" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													<BusinessAreaSelectItems
														businessAreas={businessAreas || []}
													/>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									);
								}}
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

			<UnsavedChangesDialog
				isOpen={isDialogOpen}
				onProceed={handleProceed}
				onCancel={handleCancelDialog}
			/>
		</Form>
	);
};
