import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { observer } from "mobx-react-lite";
import { useEditProjectStore } from "@/app/stores/store-context";
import type {
	IProjectData,
	IExtendedProjectDetails,
} from "@/shared/types/project.types";
import { ImageUpload } from "@/shared/components/media";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Check, ChevronDown, AlertCircle } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { UserSearchDropdown } from "@/shared/components/user/UserSearchDropdown";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
import { FormRichTextEditor } from "@/shared/components/editor/FormRichTextEditor";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useServices } from "@/shared/hooks/queries/useServices";
import { useProjectAreas } from "@/shared/hooks/queries/useProjectAreas";
import type { IAffiliation } from "@/shared/types/org.types";
import { cn } from "@/shared/lib/utils";

// Form schema with validation
const editProjectSchema = z
	.object({
		title: z.string().min(1, "Title is required"),
		image: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
		business_area: z.number().min(1, "Business area is required"),
		service: z.number().nullable().optional(),
		start_date: z.string().min(1, "Start date is required"),
		end_date: z.string().nullable().optional(),
		data_custodian: z.number().nullable().optional(),
		project_areas: z.array(z.number()),
		// External project fields
		collaboration_with: z.string().optional(),
		budget: z.string().optional(),
		// Student project fields
		organisation: z.string().optional(),
		level: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.end_date && data.start_date) {
				return new Date(data.end_date) >= new Date(data.start_date);
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["end_date"],
		}
	);

type EditProjectFormData = z.infer<typeof editProjectSchema>;

interface EditProjectFormProps {
	project: IProjectData;
	details: IExtendedProjectDetails;
	onSubmit: (data: EditProjectFormData) => void;
	onCancel: () => void;
	isLoading?: boolean;
	onDirtyChange?: (isDirty: boolean) => void;
}

export const EditProjectForm = observer(function EditProjectForm({
	project,
	details,
	onSubmit,
	onCancel,
	isLoading = false,
	onDirtyChange,
}: EditProjectFormProps) {
	const editStore = useEditProjectStore();
	const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());

	// Fetch dropdown data
	const { data: businessAreas, isLoading: isLoadingBusinessAreas } =
		useBusinessAreas();
	const { data: services, isLoading: isLoadingServices } = useServices();
	const { data: projectAreas, isLoading: isLoadingProjectAreas } =
		useProjectAreas();

	// Determine project type
	const isExternalProject =
		details?.external &&
		!Array.isArray(details.external) &&
		details.external.project !== undefined;
	const isStudentProject =
		details?.student &&
		!Array.isArray(details.student) &&
		details.student.organisation !== undefined;

	const form = useForm<EditProjectFormData>({
		resolver: zodResolver(editProjectSchema),
		defaultValues: {
			title: "",
			image: null,
			business_area: 0,
			service: null,
			start_date: "",
			end_date: null,
			data_custodian: null,
			project_areas: [],
			collaboration_with: "",
			budget: "",
			organisation: "",
			level: "",
		},
	});

	// Load project data into MobX store and form on mount
	// Wait for dropdown data to load before resetting form to prevent value resets
	useEffect(() => {
		// Only load form data once all dropdown queries have finished loading
		if (isLoadingBusinessAreas || isLoadingServices || isLoadingProjectAreas) {
			return;
		}

		editStore.loadProject(project, details);
		form.reset(editStore.state.formData);

		// Cleanup on unmount
		return () => {
			editStore.reset();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		project.id,
		details,
		isLoadingBusinessAreas,
		isLoadingServices,
		isLoadingProjectAreas,
	]);

	// Watch for form changes and notify parent
	useEffect(() => {
		if (!onDirtyChange) return;

		const subscription = form.watch((data) => {
			// Compare current form data with original data
			// Special handling for image field (File objects don't serialize well)
			const currentData = { ...data };
			const originalData = { ...editStore.state.originalData };

			// Track which fields are dirty
			const newDirtyFields = new Set<string>();

			// Check each field
			Object.keys(currentData).forEach((key) => {
				const currentValue = currentData[key as keyof typeof currentData];
				const originalValue = originalData[key as keyof typeof originalData];

				// Special handling for image field
				if (key === "image") {
					if (currentValue !== originalValue) {
						newDirtyFields.add("image");
					}
				}
				// Special handling for arrays (project_areas)
				else if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
					if (
						JSON.stringify(currentValue.sort()) !==
						JSON.stringify(originalValue.sort())
					) {
						newDirtyFields.add(key);
					}
				}
				// Regular comparison
				else if (
					JSON.stringify(currentValue) !== JSON.stringify(originalValue)
				) {
					newDirtyFields.add(key);
				}
			});

			setDirtyFields(newDirtyFields);

			// Compare image separately
			const imageChanged = currentData.image !== originalData.image;

			// Remove image from comparison objects
			delete currentData.image;
			delete originalData.image;

			// Check if other fields changed
			const otherFieldsChanged =
				JSON.stringify(currentData) !== JSON.stringify(originalData);

			const hasChanges = imageChanged || otherFieldsChanged;
			onDirtyChange(hasChanges);
		});

		return () => subscription.unsubscribe();
	}, [form, editStore.state.originalData, onDirtyChange]);

	const handleSubmit = (data: EditProjectFormData) => {
		// Update store with final form data before submitting
		editStore.updateFormData(data);
		onSubmit(data);
	};

	const handleCancel = () => {
		// Check if form has unsaved changes by comparing form data with original
		const currentData = { ...form.getValues() };
		const originalData = { ...editStore.state.originalData };

		// Compare image separately
		const imageChanged = currentData.image !== originalData.image;

		// Remove image from comparison objects
		delete currentData.image;
		delete originalData.image;

		// Check if other fields changed
		const otherFieldsChanged =
			JSON.stringify(currentData) !== JSON.stringify(originalData);

		const hasChanges = imageChanged || otherFieldsChanged;

		if (hasChanges) {
			// Show confirmation if there are unsaved changes
			const confirmed = window.confirm(
				"You have unsaved changes. Are you sure you want to cancel?"
			);
			if (!confirmed) return;
		}
		editStore.reset();
		onCancel();
	};

	// Helper to check if a section has dirty fields
	const isSectionDirty = (sectionFields: string[]) => {
		return sectionFields.some((field) => dirtyFields.has(field));
	};

	// Helper to check if basic-info tab has dirty fields
	const isBasicInfoTabDirty = () => {
		const basicInfoFields = [
			"image",
			"title",
			"service",
			"business_area",
			"start_date",
			"end_date",
			"data_custodian",
			"collaboration_with",
			"budget",
			"organisation",
			"level",
		];
		return isSectionDirty(basicInfoFields);
	};

	// Helper to check if project-areas tab has dirty fields
	const isProjectAreasTabDirty = () => {
		return dirtyFields.has("project_areas");
	};

	// Helper to get section border class
	const getSectionBorderClass = (sectionFields: string[]) => {
		return isSectionDirty(sectionFields) ? "border-orange-500 border-2" : "";
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				<Tabs
					value={editStore.state.activeTab}
					onValueChange={(value) =>
						editStore.setActiveTab(value as "basic-info" | "project-areas")
					}
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2 mb-6">
						<TabsTrigger value="basic-info">
							<div className="inline-flex items-center gap-1.5">
								<span>Basic Info</span>
								{isBasicInfoTabDirty() && (
									<AlertCircle className="h-4 w-4 text-orange-500" />
								)}
							</div>
						</TabsTrigger>
						<TabsTrigger value="project-areas">
							<div className="inline-flex items-center gap-1.5">
								<span>Project Areas</span>
								{isProjectAreasTabDirty() && (
									<AlertCircle className="h-4 w-4 text-orange-500" />
								)}
							</div>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="basic-info" className="space-y-0">
						{/* Project Image Section */}
						<section
							className={cn(
								"bg-card rounded-lg border p-6",
								getSectionBorderClass(["image"])
							)}
						>
							<h2 className="text-xl font-semibold mb-4">Project Image</h2>
							<div className="max-w-2xl mx-auto">
								<FormField
									control={form.control}
									name="image"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<ImageUpload
													value={field.value}
													onChange={field.onChange}
													variant="project"
												/>
											</FormControl>
											<FormDescription>
												Upload an image for the project (optional)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>

						{/* Basic Information Section */}
						<section
							className={cn(
								"bg-card rounded-lg border p-6 mt-6",
								getSectionBorderClass([
									"title",
									"service",
									"business_area",
									"start_date",
									"end_date",
									"data_custodian",
								])
							)}
						>
							<h2 className="text-xl font-semibold mb-4">Basic Information</h2>
							<div className="space-y-6">
								{/* Title - RTE with projectTitle toolbar */}
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title *</FormLabel>
											<FormControl>
												<FormRichTextEditor
													value={field.value}
													onChange={field.onChange}
													placeholder="Enter project title..."
													toolbar="projectTitle"
													disabled={isLoading}
													minHeight="80px"
													aria-label="Project title"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Service */}
								<FormField
									control={form.control}
									name="service"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Service</FormLabel>
											<Select
												value={field.value?.toString() || "none"}
												onValueChange={(value) =>
													field.onChange(
														value === "none" ? null : Number(value)
													)
												}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select service (optional)" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="none">None</SelectItem>
													{services?.map((service) => (
														<SelectItem
															key={service.id}
															value={service.id!.toString()}
														>
															{service.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormDescription>
												The departmental service this project belongs to
												(optional)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Business Area */}
								<FormField
									control={form.control}
									name="business_area"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Business Area *</FormLabel>
											<Select
												value={field.value?.toString()}
												onValueChange={(value) => field.onChange(Number(value))}
											>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select business area" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{businessAreas?.map((ba) => {
														if (!ba.id) return null;
														return (
															<SelectItem key={ba.id} value={ba.id.toString()}>
																{ba.is_active
																	? ba.name
																	: `[INACTIVE] ${ba.name}`}
															</SelectItem>
														);
													})}
												</SelectContent>
											</Select>
											<FormDescription>
												The business area this project belongs to
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Start and End Date - side by side on larger screens */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Start Date */}
									<FormField
										control={form.control}
										name="start_date"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<DatePicker
														label="Start Date"
														placeholder="Select start date"
														required={true}
														dateFormat="DD/MM/YYYY"
														selectedDate={
															field.value ? new Date(field.value) : undefined
														}
														setSelectedDate={(date) => {
															field.onChange(date.toISOString().split("T")[0]);
														}}
														helperText="When the project commences"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* End Date */}
									<FormField
										control={form.control}
										name="end_date"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<DatePicker
														label="End Date"
														placeholder="Select end date (optional)"
														required={false}
														dateFormat="DD/MM/YYYY"
														selectedDate={
															field.value ? new Date(field.value) : undefined
														}
														setSelectedDate={(date) => {
															field.onChange(date.toISOString().split("T")[0]);
														}}
														helperText="Leave empty if project has no end date"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Data Custodian */}
								<FormField
									control={form.control}
									name="data_custodian"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Data Custodian</FormLabel>
											<FormControl>
												<UserSearchDropdown
													onlyInternal={true}
													isRequired={false}
													setUserFunction={(userId) => field.onChange(userId)}
													label=""
													placeholder="Search for a user..."
													helperText=""
													preselectedUserPk={field.value || undefined}
													isEditable={true}
												/>
											</FormControl>
											<FormDescription>
												Select a data custodian for this project (optional)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</section>

						{/* External Project Fields */}
						{isExternalProject && (
							<section
								className={cn(
									"bg-card rounded-lg border p-6 mt-6",
									getSectionBorderClass(["collaboration_with", "budget"])
								)}
							>
								<h2 className="text-xl font-semibold mb-4">
									External Partnership Details
								</h2>
								<div className="space-y-6">
									{/* Collaboration With */}
									<FormField
										control={form.control}
										name="collaboration_with"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Collaboration With</FormLabel>
												<FormControl>
													<AffiliationCombobox
														multiple
														values={
															field.value
																? field.value.split("; ").map(
																		(name, index) =>
																			({
																				id: -index - 1,
																				name: name.trim(),
																			}) as IAffiliation
																	)
																: []
														}
														onChangeMultiple={(affiliations) => {
															const names = affiliations
																.map((a) => a.name)
																.join("; ");
															field.onChange(names);
														}}
														placeholder="Search for or add a collaboration partner"
														helperText="The entity/s this project is in collaboration with"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Budget */}
									<FormField
										control={form.control}
										name="budget"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Budget</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Enter budget in dollars"
													/>
												</FormControl>
												<FormDescription>
													The estimated budget for the project in dollars
													(optional)
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</section>
						)}

						{/* Student Project Fields */}
						{isStudentProject && (
							<section
								className={cn(
									"bg-card rounded-lg border p-6 mt-6",
									getSectionBorderClass(["organisation", "level"])
								)}
							>
								<h2 className="text-xl font-semibold mb-4">
									Student Project Details
								</h2>
								<div className="space-y-6">
									{/* Organisation */}
									<FormField
										control={form.control}
										name="organisation"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Organisation *</FormLabel>
												<FormControl>
													<AffiliationCombobox
														multiple
														values={
															field.value
																? field.value.split("; ").map(
																		(name, index) =>
																			({
																				id: -index - 1,
																				name: name.trim(),
																			}) as IAffiliation
																	)
																: []
														}
														onChangeMultiple={(affiliations) => {
															const names = affiliations
																.map((a) => a.name)
																.join("; ");
															field.onChange(names);
														}}
														placeholder="Search for or add an organisation"
														helperText="The academic organisation of the student"
														isRequired={true}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Level */}
									<FormField
										control={form.control}
										name="level"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Level *</FormLabel>
												<Select
													value={field.value}
													onValueChange={field.onChange}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select study level" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="phd">PhD</SelectItem>
														<SelectItem value="msc">MSc</SelectItem>
														<SelectItem value="honours">BSc Honours</SelectItem>
														<SelectItem value="fourth_year">
															Fourth Year
														</SelectItem>
														<SelectItem value="third_year">
															Third Year
														</SelectItem>
														<SelectItem value="undergrad">
															Undergraduate
														</SelectItem>
													</SelectContent>
												</Select>
												<FormDescription>
													The level of the student and the project
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</section>
						)}
					</TabsContent>

					<TabsContent value="project-areas" className="space-y-0">
						{/* Project Areas Section */}
						<section
							className={cn(
								"bg-card rounded-lg border p-6",
								getSectionBorderClass(["project_areas"])
							)}
						>
							<h2 className="text-xl font-semibold mb-4">Project Areas</h2>
							<FormField
								control={form.control}
								name="project_areas"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="outline"
														className="w-full justify-between text-sm font-normal h-11"
														type="button"
													>
														<span className="truncate">
															{field.value.length === 0
																? "Select project areas"
																: field.value.length === 1
																	? projectAreas?.find(
																			(area) => area.id === field.value[0]
																		)?.area_name || "1 Selected"
																	: `${field.value.length} Selected`}
														</span>
														<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													className="w-[400px] p-0"
													align="start"
												>
													<div className="flex flex-col">
														<div className="p-3 border-b">
															<div className="flex items-center justify-between mb-2">
																<span className="text-sm font-medium">
																	Project Areas
																</span>
																<div className="flex gap-2">
																	<button
																		type="button"
																		onClick={() => {
																			const allIds =
																				projectAreas?.map((area) => area.id) ||
																				[];
																			field.onChange(allIds);
																		}}
																		className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
																	>
																		Select All
																	</button>
																	<button
																		type="button"
																		onClick={() => field.onChange([])}
																		className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
																	>
																		Clear
																	</button>
																</div>
															</div>
														</div>
														<div className="max-h-[300px] overflow-y-auto p-3">
															<div className="space-y-2">
																{projectAreas?.map((area) => {
																	const isChecked = field.value.includes(
																		area.id
																	);
																	return (
																		<div
																			key={area.id}
																			onClick={() => {
																				const newValue = isChecked
																					? field.value.filter(
																							(id) => id !== area.id
																						)
																					: [...field.value, area.id];
																				field.onChange(newValue);
																			}}
																			className="flex items-center space-x-2 rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
																		>
																			<div className="flex items-center justify-center w-4 h-4 border border-gray-300 dark:border-gray-600 rounded">
																				{isChecked && (
																					<Check className="w-3 h-3" />
																				)}
																			</div>
																			<span className="text-sm font-normal flex-1">
																				{area.area_name}
																			</span>
																		</div>
																	);
																})}
															</div>
														</div>
													</div>
												</DropdownMenuContent>
											</DropdownMenu>
										</FormControl>
										<FormDescription>
											Select one or more project areas (optional). Future
											enhancement: integrate map component for visual area
											selection.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</section>
					</TabsContent>
				</Tabs>

				{/* Form Actions */}
				<div className="flex justify-end gap-3 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading || !editStore.isValid}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</div>
			</form>
		</Form>
	);
});
