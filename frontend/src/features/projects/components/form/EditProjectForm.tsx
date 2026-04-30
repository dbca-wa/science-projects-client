import { useEffect, useState, useMemo } from "react";
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
import { Loader2, AlertCircle, Search, MapPin, X } from "lucide-react";
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
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
import { FormRichTextEditor } from "@/shared/components/editor/FormRichTextEditor";
import { RichTextEditor } from "@/shared/components/editor/RichTextEditor";
import { UserCombobox } from "@/shared/components/user";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useServices } from "@/shared/hooks/queries/useServices";
import { useProjectAreas } from "@/shared/hooks/queries/useProjectAreas";
import { useLocations } from "@/shared/hooks/queries/useLocations";
import type {
	IAffiliation,
	ISimpleLocationData,
} from "@/shared/types/org.types";
import { cn } from "@/shared/lib/utils";
import { KeywordInput } from "@/shared/components/KeywordInput";
import { Badge } from "@/shared/components/ui/badge";

// Form schema with validation
const editProjectSchema = z
	.object({
		title: z.string().min(1, "Title is required"),
		description: z.string().optional(),
		image: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
		business_area: z.number().min(1, "Business area is required"),
		service: z.number().nullable().optional(),
		start_date: z.string().min(1, "Start date is required"),
		end_date: z.string().nullable().optional(),
		project_leader: z.number().nullable().optional(),
		data_custodian: z.number().nullable().optional(),
		keywords: z.string().optional(),
		project_areas: z.array(z.number()),
		// External project fields
		collaboration_with: z.string().optional(),
		budget: z.string().optional(),
		external_description: z.string().optional(),
		aims: z.string().optional(),
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
	const { data: _projectAreas, isLoading: isLoadingProjectAreas } =
		useProjectAreas();
	const { dbcaRegions, dbcaDistricts } = useLocations();

	// Location search state for project areas tab
	const [locationSearchQuery, setLocationSearchQuery] = useState("");

	// Determine project type
	const isExternalProject =
		details?.external &&
		!Array.isArray(details.external) &&
		details.external.project !== undefined;
	const isStudentProject =
		details?.student &&
		!Array.isArray(details.student) &&
		details.student.organisation !== undefined;

	// Combine all locations with display type for selected chips
	const allLocationsWithType = useMemo(() => {
		const locations: Array<ISimpleLocationData & { displayType: string }> = [];
		dbcaRegions.forEach((loc) =>
			locations.push({ ...loc, displayType: "DBCA Region" })
		);
		dbcaDistricts.forEach((loc) =>
			locations.push({ ...loc, displayType: "DBCA District" })
		);
		return locations;
	}, [dbcaRegions, dbcaDistricts]);

	// Filter districts by search query
	const filteredEditDistricts = useMemo(() => {
		if (!locationSearchQuery.trim()) return dbcaDistricts;
		const query = locationSearchQuery.toLowerCase();
		return dbcaDistricts.filter((loc) =>
			loc.name.toLowerCase().includes(query)
		);
	}, [dbcaDistricts, locationSearchQuery]);

	// Filter regions by search query
	const filteredEditRegions = useMemo(() => {
		if (!locationSearchQuery.trim()) return dbcaRegions;
		const query = locationSearchQuery.toLowerCase();
		return dbcaRegions.filter((loc) => loc.name.toLowerCase().includes(query));
	}, [dbcaRegions, locationSearchQuery]);

	const form = useForm<EditProjectFormData>({
		resolver: zodResolver(editProjectSchema),
		defaultValues: {
			title: "",
			description: "",
			image: null,
			business_area: 0,
			service: null,
			start_date: "",
			end_date: null,
			project_leader: null,
			data_custodian: null,
			keywords: "",
			project_areas: [],
			collaboration_with: "",
			budget: "",
			external_description: "",
			aims: "",
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
			"description",
			"service",
			"business_area",
			"start_date",
			"end_date",
			"project_leader",
			"data_custodian",
			"keywords",
			"collaboration_with",
			"budget",
			"external_description",
			"aims",
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
									"description",
									"keywords",
									"service",
									"business_area",
									"start_date",
									"end_date",
									"project_leader",
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
													floatingToolbar={false}
													disabled={isLoading}
													minHeight="80px"
													aria-label="Project title"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Description */}
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<RichTextEditor
													value={field.value || ""}
													onChange={field.onChange}
													placeholder="A concise project summary, or any additional useful information..."
													toolbar="projectDescription"
													disabled={isLoading}
													minHeight="150px"
													aria-label="Project description"
													className="rounded-lg border-2 border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:bg-blue-50 dark:focus-within:bg-blue-950/20 transition-all duration-300 bg-white dark:bg-gray-800"
												/>
											</FormControl>
											<FormDescription>
												A concise project summary (optional)
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Keywords */}
								<FormField
									control={form.control}
									name="keywords"
									render={({ field }) => {
										const keywordsArray = field.value
											? field.value.split("; ").filter((k) => k.trim())
											: [];

										const handleKeywordsChange = (keywords: string[]) => {
											field.onChange(keywords.join("; "));
										};

										return (
											<FormItem>
												<FormLabel>Keywords</FormLabel>
												<FormControl>
													<KeywordInput
														keywords={keywordsArray}
														onKeywordsChange={handleKeywordsChange}
														disabled={isLoading}
														placeholder="Type a keyword and press Enter (use ; for multiple)"
													/>
												</FormControl>
												<FormDescription>
													Type a keyword and press Enter to add it. Use
													semicolons (;) to add multiple keywords at once (e.g.
													&apos;ecology; conservation; biodiversity&apos;).
												</FormDescription>
												<FormMessage />
											</FormItem>
										);
									}}
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
													{[...(services || [])]
														.sort((a, b) =>
															(a.name || "").localeCompare(b.name || "")
														)
														.map((service) => (
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

								{/* Project Leader and Data Custodian */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Project Leader */}
									<FormField
										control={form.control}
										name="project_leader"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<UserCombobox
														value={field.value}
														onValueChange={(userId) => field.onChange(userId)}
														onlyInternal={true}
														label="Project Leader"
														placeholder="Search for a project leader..."
														helperText="The project leader"
														isRequired={false}
														isEditable={true}
														showIcon={true}
														wrapperClassName="space-y-2"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Data Custodian */}
									<FormField
										control={form.control}
										name="data_custodian"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<UserCombobox
														value={field.value}
														onValueChange={(userId) => field.onChange(userId)}
														onlyInternal={true}
														label="Data Custodian"
														placeholder="Search for a data custodian..."
														helperText="The data custodian is responsible for data management"
														isRequired={false}
														isEditable={true}
														showIcon={true}
														wrapperClassName="space-y-2"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</section>

						{/* External Project Fields */}
						{isExternalProject && (
							<section
								className={cn(
									"bg-card rounded-lg border p-6 mt-6",
									getSectionBorderClass([
										"collaboration_with",
										"budget",
										"external_description",
										"aims",
									])
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

									{/* External Description */}
									<FormField
										control={form.control}
										name="external_description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>External Description</FormLabel>
												<FormControl>
													<RichTextEditor
														value={field.value || ""}
														onChange={field.onChange}
														placeholder="Description specific to this external project..."
														toolbar="projectDescription"
														disabled={isLoading}
														minHeight="150px"
														aria-label="External project description"
														className="rounded-lg border-2 border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:bg-blue-50 dark:focus-within:bg-blue-950/20 transition-all duration-300 bg-white dark:bg-gray-800"
													/>
												</FormControl>
												<FormDescription>
													Description specific to this external project
													(optional)
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Aims */}
									<FormField
										control={form.control}
										name="aims"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Aims</FormLabel>
												<FormControl>
													<RichTextEditor
														value={field.value || ""}
														onChange={field.onChange}
														placeholder="List out the aims of your project..."
														toolbar="projectDescription"
														disabled={isLoading}
														minHeight="150px"
														aria-label="External project aims"
														className="rounded-lg border-2 border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:bg-blue-50 dark:focus-within:bg-blue-950/20 transition-all duration-300 bg-white dark:bg-gray-800"
													/>
												</FormControl>
												<FormDescription>
													List out the aims of your project (optional)
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
						{/* Project Areas Section — matching wizard LocationStep design */}
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
								render={({ field }) => {
									const selectedLocations = allLocationsWithType.filter((loc) =>
										field.value.includes(loc.id)
									);
									const hasFilteredResults =
										filteredEditDistricts.length > 0 ||
										filteredEditRegions.length > 0;

									const handleToggle = (locationId: number) => {
										const isSelected = field.value.includes(locationId);
										if (isSelected) {
											field.onChange(
												field.value.filter((id) => id !== locationId)
											);
										} else {
											field.onChange([...field.value, locationId]);
										}
									};

									return (
										<FormItem className="space-y-4">
											{/* Selected Locations */}
											{selectedLocations.length > 0 && (
												<div className="space-y-2">
													<FormLabel className="text-sm font-medium">
														Selected Locations ({selectedLocations.length})
													</FormLabel>
													<div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md border">
														{selectedLocations.map((location) => (
															<Badge
																key={location.id}
																variant="secondary"
																className="gap-1 pr-1 text-sm"
															>
																<MapPin className="h-3 w-3" />
																{location.name}
																<span className="text-xs text-muted-foreground ml-1">
																	({location.displayType})
																</span>
																<button
																	type="button"
																	onClick={() => handleToggle(location.id)}
																	className="ml-1 rounded-full hover:bg-muted p-0.5"
																>
																	<X className="h-3 w-3" />
																</button>
															</Badge>
														))}
													</div>
												</div>
											)}

											{/* Search */}
											<div className="relative">
												<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
												<Input
													placeholder="Search locations..."
													value={locationSearchQuery}
													onChange={(e) =>
														setLocationSearchQuery(e.target.value)
													}
													className="pl-9 text-base"
												/>
											</div>

											{/* Location Lists — separate bordered containers for Districts and Regions */}
											<FormControl>
												<div>
													<FormLabel className="text-sm font-medium">
														Available Locations
													</FormLabel>
													{!hasFilteredResults ? (
														<div className="p-8 text-center text-muted-foreground border rounded-md mt-2">
															No locations found matching your search.
														</div>
													) : (
														<div className="space-y-4 mt-2">
															{/* DBCA Districts */}
															{filteredEditDistricts.length > 0 && (
																<div className="border rounded-md max-h-64 overflow-y-auto">
																	<EditLocationSection
																		title="DBCA Districts"
																		locations={filteredEditDistricts}
																		selectedAreas={field.value}
																		onToggle={handleToggle}
																	/>
																</div>
															)}

															{/* DBCA Regions */}
															{filteredEditRegions.length > 0 && (
																<div className="border rounded-md max-h-64 overflow-y-auto">
																	<EditLocationSection
																		title="DBCA Regions"
																		locations={filteredEditRegions}
																		selectedAreas={field.value}
																		onToggle={handleToggle}
																	/>
																</div>
															)}
														</div>
													)}
												</div>
											</FormControl>
											<FormDescription>
												Select one or more project areas (optional).
											</FormDescription>
											<FormMessage />
										</FormItem>
									);
								}}
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

/** Section header and location list for a single area type in the edit form */
interface EditLocationSectionProps {
	title: string;
	locations: ISimpleLocationData[];
	selectedAreas: number[];
	onToggle: (locationId: number) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
const EditLocationSection = ({
	title,
	locations,
	selectedAreas,
	onToggle,
}: EditLocationSectionProps) => (
	<div>
		<div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm px-4 py-2 border-b">
			<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{title}
			</span>
		</div>
		<div className="divide-y">
			{locations.map((location) => {
				const isSelected = selectedAreas.includes(location.id);

				return (
					<button
						key={location.id}
						type="button"
						onClick={() => onToggle(location.id)}
						className={`
							w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors
							flex items-center justify-between gap-3
							${isSelected ? "bg-primary/5" : ""}
						`}
					>
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<div
								className={`
									flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
									${isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"}
								`}
							>
								{isSelected && (
									<svg
										className="w-3 h-3 text-primary-foreground"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path d="M5 13l4 4L19 7" />
									</svg>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-medium text-sm truncate">
									{location.name}
								</div>
							</div>
						</div>
					</button>
				);
			})}
		</div>
	</div>
);
