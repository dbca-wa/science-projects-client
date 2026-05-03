import { observer } from "mobx-react-lite";
import { useEffect, useRef, useCallback } from "react";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useServices } from "@/shared/hooks/queries/useServices";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { UserCombobox } from "@/shared/components/user";
import { DatePicker } from "@/shared/components/DatePicker";
import type { UserComboboxRef } from "@/shared/components/user";
import { BusinessAreaSelectItems } from "@/shared/components/BusinessAreaSelectItems";
import { FieldError } from "../FieldError";
import { shouldShowError } from "../validation-helpers";
import { SectionCard } from "../SectionCard";
import { WizardTeamSection } from "../WizardTeamSection";
import { AlertCircle, Info } from "lucide-react";

/**
 * ProjectDetailsStep - Step 2 of project creation wizard
 *
 * Collects:
 * - Departmental Service (optional, dropdown)
 * - Business Area (required, dropdown)
 * - Start date (required)
 * - End date (required)
 * - Project Leader (required, single select)
 * - Data custodian (required, single select)
 */
const ProjectDetailsStep = observer(() => {
	const wizardStore = useProjectWizardStore();
	const formData = wizardStore.state.editingFormData.projectDetails;
	const validation = wizardStore.state.validation[1]; // Step 1 is Project Details
	const stepIndex = 1;
	const { data: businessAreas, isLoading: baLoading } = useBusinessAreas();
	const { data: services, isLoading: servicesLoading } = useServices();
	const leaderRef = useRef<UserComboboxRef>(null);
	const custodianRef = useRef<UserComboboxRef>(null);
	const teamMembers = wizardStore.state.editingTeamMembers;

	const handleFieldBlur = useCallback(
		(fieldName: string) => {
			wizardStore.markFieldTouched(fieldName);
		},
		[wizardStore]
	);

	// Validate on every form data change
	useEffect(() => {
		const errors: Record<string, string> = {};

		if (!formData.business_area || formData.business_area <= 0) {
			errors.business_area = "Business area is required";
		}
		if (!formData.start_date) {
			errors.start_date = "Start date is required";
		}
		if (!formData.end_date) {
			errors.end_date = "End date is required";
		}
		if (
			formData.start_date &&
			formData.end_date &&
			formData.end_date < formData.start_date
		) {
			errors.end_date = "End date must be after start date";
		}
		if (!formData.project_leader) {
			errors.project_leader = "Project leader is required";
		}
		if (!formData.data_custodian) {
			errors.data_custodian = "Data custodian is required";
		}

		// Team member requirements based on project kind
		const teamMembers = wizardStore.state.editingTeamMembers;
		const projectKind = wizardStore.state.projectKind;
		if (projectKind === "student") {
			const hasStudent = teamMembers.some((m) => m.role === "student");
			if (!hasStudent) {
				errors.team_student =
					"Student projects require at least one team member with the Supervised Student role";
			}
		} else if (projectKind === "external") {
			const hasExternal = teamMembers.some((m) => !m.isStaff && !m.isLeader);
			if (!hasExternal) {
				errors.team_external =
					"External projects require at least one external team member";
			}
		}

		const isValid = Object.keys(errors).length === 0;
		wizardStore.setStepValidation(1, isValid, errors);
	}, [
		formData.business_area,
		formData.start_date,
		formData.end_date,
		formData.project_leader,
		formData.data_custodian,
		wizardStore,
		wizardStore.state.editingTeamMembers,
		wizardStore.state.projectKind,
	]);

	const handleStartDateChange = (date: Date) => {
		wizardStore.setProjectDetails({ start_date: date });
		handleFieldBlur("start_date");
	};

	const handleEndDateChange = (date: Date) => {
		wizardStore.setProjectDetails({ end_date: date });
		handleFieldBlur("end_date");
	};

	const handleBusinessAreaChange = (value: string) => {
		wizardStore.setProjectDetails({ business_area: Number(value) });
		handleFieldBlur("business_area");
	};

	const handleDepartmentalServiceChange = (value: string) => {
		wizardStore.setProjectDetails({ departmental_service: Number(value) });
	};

	const handleLeaderSelect = (userId: number | null) => {
		wizardStore.setProjectDetails({ project_leader: userId });
		handleFieldBlur("project_leader");

		// Auto-populate data custodian if it's currently empty
		if (userId && !formData.data_custodian) {
			wizardStore.setProjectDetails({ data_custodian: userId });
		}

		// Sync the leader into the team members list
		wizardStore.syncLeaderToTeam();
	};

	const handleCustodianSelect = (userId: number | null) => {
		wizardStore.setProjectDetails({ data_custodian: userId });
		handleFieldBlur("data_custodian");
	};

	// Validate dates
	const isEndDateValid = () => {
		if (!formData.start_date || !formData.end_date) return true;
		return formData.end_date > formData.start_date;
	};

	// Compute section completion states
	const isBusinessAreaComplete =
		!!formData.business_area && formData.business_area > 0;
	const isDatesComplete =
		!!formData.start_date && !!formData.end_date && isEndDateValid();
	const isTeamComplete = !!formData.project_leader && !!formData.data_custodian;

	return (
		<div className="space-y-6">
			{/* Business Area + Service */}
			<SectionCard
				title="Business Area & Service"
				isComplete={isBusinessAreaComplete}
				completionLabel="Business area section complete"
			>
				<div className="space-y-6">
					{/* Departmental Service */}
					<div className="space-y-2">
						<Label htmlFor="departmental_service">
							Departmental Service (Optional)
						</Label>
						<Select
							value={formData.departmental_service?.toString()}
							onValueChange={handleDepartmentalServiceChange}
							disabled={servicesLoading}
						>
							<SelectTrigger id="departmental_service" className="text-base">
								<SelectValue placeholder="Select a Departmental Service" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">None</SelectItem>
								{servicesLoading ? (
									<SelectItem value="loading" disabled>
										Loading services...
									</SelectItem>
								) : (
									services
										?.slice()
										.sort((a, b) => a.name.localeCompare(b.name))
										.map((service) => (
											<SelectItem
												key={service.id}
												value={service.id.toString()}
											>
												{service.name}
											</SelectItem>
										))
								)}
							</SelectContent>
						</Select>
						<p className="text-xs text-muted-foreground">
							The DBCA service that this project delivers outputs to
						</p>
					</div>

					{/* Business Area */}
					<div className="space-y-2">
						<Label htmlFor="business_area">
							Business Area <span className="text-destructive">*</span>
						</Label>
						<Select
							value={formData.business_area?.toString()}
							onValueChange={handleBusinessAreaChange}
							disabled={baLoading}
						>
							<SelectTrigger id="business_area" className="text-base">
								<SelectValue placeholder="Select a Business Area" />
							</SelectTrigger>
							<SelectContent>
								{baLoading ? (
									<SelectItem value="loading" disabled>
										Loading business areas...
									</SelectItem>
								) : (
									<BusinessAreaSelectItems
										businessAreas={businessAreas || []}
									/>
								)}
							</SelectContent>
						</Select>
						<FieldError
							error={
								shouldShowError(wizardStore, "business_area", stepIndex)
									? validation?.errors.business_area
									: undefined
							}
						/>
						<p className="text-xs text-muted-foreground">
							The Business Area / Program that this project belongs to. Only
							active Business Areas are selectable.
						</p>
					</div>
				</div>
			</SectionCard>

			{/* Dates */}
			<SectionCard
				title="Project Timeline"
				isComplete={isDatesComplete}
				completionLabel="Timeline section complete"
			>
				<div className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Start Date */}
						<div className="space-y-2">
							<DatePicker
								label="Start Date"
								required={true}
								selectedDate={formData.start_date ?? undefined}
								setSelectedDate={handleStartDateChange}
								placeholder="Select Start Date"
							/>
							<FieldError
								error={
									shouldShowError(wizardStore, "start_date", stepIndex)
										? validation?.errors.start_date
										: undefined
								}
							/>
						</div>

						{/* End Date */}
						<div className="space-y-2">
							<DatePicker
								label="End Date"
								required={true}
								selectedDate={formData.end_date ?? undefined}
								setSelectedDate={handleEndDateChange}
								placeholder="Select End Date"
							/>
							<FieldError
								error={
									shouldShowError(wizardStore, "end_date", stepIndex)
										? validation?.errors.end_date
										: undefined
								}
							/>
							{!isEndDateValid() && (
								<p className="text-xs text-destructive">
									End date must be after start date
								</p>
							)}
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						These dates can be tentative and adjusted from project settings
						later
					</p>
				</div>
			</SectionCard>

			{/* Project Leader + Data Custodian */}
			<SectionCard
				title="Project Leadership"
				isComplete={isTeamComplete}
				completionLabel="Leadership section complete"
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* Project Leader */}
					<div className="space-y-2">
						<UserCombobox
							ref={leaderRef}
							label="Project Leader"
							placeholder="Search for a Project Leader"
							helperText="The Project Leader"
							isRequired={true}
							value={formData.project_leader || null}
							onValueChange={handleLeaderSelect}
							showIcon={true}
							className="text-base"
							wrapperClassName="space-y-2"
						/>
						<FieldError
							error={
								shouldShowError(wizardStore, "project_leader", stepIndex)
									? validation?.errors.project_leader
									: undefined
							}
						/>
					</div>

					{/* Data Custodian */}
					<div className="space-y-2">
						<UserCombobox
							ref={custodianRef}
							label="Data Custodian"
							placeholder="Search for a data custodian"
							helperText="The data custodian is responsible for data management, publishing, and metadata documentation on the data catalogue"
							isRequired={true}
							value={formData.data_custodian || null}
							onValueChange={handleCustodianSelect}
							isEditable={true}
							showIcon={true}
							className="text-base"
							wrapperClassName="space-y-2"
						/>
						<FieldError
							error={
								shouldShowError(wizardStore, "data_custodian", stepIndex)
									? validation?.errors.data_custodian
									: undefined
							}
						/>
					</div>
				</div>
			</SectionCard>

			{/* Team Members */}
			{(() => {
				const projectKind = wizardStore.state.projectKind;
				const hasTeamError =
					!!validation?.errors.team_student ||
					!!validation?.errors.team_external;
				const hasStudent = teamMembers.some((m) => m.role === "student");
				const hasAcademicSupervisor = teamMembers.some(
					(m) => m.role === "academicsuper"
				);
				const hasExternal = teamMembers.some((m) => !m.isStaff && !m.isLeader);

				// Determine completion: for student/external, must have required member type
				const isTeamComplete =
					projectKind === "student"
						? hasStudent
						: projectKind === "external"
							? hasExternal
							: teamMembers.length > 0;

				return (
					<SectionCard
						title="Team Members"
						isComplete={isTeamComplete}
						isInvalid={hasTeamError && teamMembers.length > 0}
						completionLabel="Team members section complete"
					>
						{/* Requirement message for student/external projects */}
						{projectKind === "student" && !hasStudent && (
							<div className="mb-4 flex gap-3 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20 px-4 py-3 text-sm text-orange-800 dark:text-orange-200">
								<AlertCircle className="size-4 mt-0.5 shrink-0 text-orange-600 dark:text-orange-400" />
								<p>
									Student projects require at least one team member with the{" "}
									<span className="font-semibold">Supervised Student</span>{" "}
									role. Add an external user and assign them the student role.
								</p>
							</div>
						)}
						{projectKind === "external" && !hasExternal && (
							<div className="mb-4 flex gap-3 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20 px-4 py-3 text-sm text-orange-800 dark:text-orange-200">
								<AlertCircle className="size-4 mt-0.5 shrink-0 text-orange-600 dark:text-orange-400" />
								<p>
									External projects require at least one{" "}
									<span className="font-semibold">external team member</span>.
									Search for an existing external user or create a new one.
								</p>
							</div>
						)}

						<WizardTeamSection />

						{/* Suggestion: add academic supervisor for student projects */}
						{projectKind === "student" &&
							hasStudent &&
							!hasAcademicSupervisor && (
								<div className="mt-4 flex gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 px-4 py-3 text-sm text-blue-800 dark:text-blue-200">
									<Info className="size-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
									<p>
										Consider adding an{" "}
										<span className="font-semibold">Academic Supervisor</span>{" "}
										to the team. This is recommended for student projects but
										not required.
									</p>
								</div>
							)}
					</SectionCard>
				);
			})()}
		</div>
	);
});

export { ProjectDetailsStep };
