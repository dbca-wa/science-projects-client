import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useCreateProjectWizardStore } from "@/app/stores/store-context";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { UserCombobox } from "@/shared/components/user";
import { DatePicker } from "@/shared/components/DatePicker";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useServices } from "@/features/agencies/hooks/useServices";
import { validateStep2 } from "../validation/step2.validation";
import { cn } from "@/shared/lib/utils";

/**
 * Step2ProjectDetails - Project details form step
 *
 * Features:
 * - Business area selection (required)
 * - Service selection (optional)
 * - Start date (required) - Custom calendar picker
 * - End date (optional, must be after start date) - Custom calendar picker
 * - Project leader selection (required)
 * - Data custodian selection (optional, auto-sets to project leader)
 * - Field-level validation on blur
 * - Inline error messages
 * - Connects to CreateProjectWizardStore
 *
 * Component Reuse:
 * - Select from shadcn for business area and service
 * - DatePicker (custom calendar component) for dates
 * - UserCombobox for team members (project leader and data custodian)
 */
export const Step2ProjectDetails = observer(function Step2ProjectDetails() {
	const store = useCreateProjectWizardStore();
	const { data: businessAreas, isLoading: isLoadingBusinessAreas } =
		useBusinessAreas();
	const { data: services, isLoading: isLoadingServices } = useServices();

	// Track if user has manually changed data custodian
	const hasManuallyChangedCustodian = useRef(false);

	// Auto-set data custodian to project leader when project leader changes
	// But only if user hasn't manually changed it
	useEffect(() => {
		if (store.state.formData.project_leader) {
			// If user hasn't manually changed custodian, sync it with project leader
			if (!hasManuallyChangedCustodian.current) {
				store.setProjectDetails({
					data_custodian: store.state.formData.project_leader,
				});
			}
		} else {
			// If project leader is cleared, clear data custodian too
			store.setProjectDetails({ data_custodian: null });
			hasManuallyChangedCustodian.current = false;
		}
	}, [store, store.state.formData.project_leader]);

	// Validate on mount and when form data changes
	useEffect(() => {
		const validation = validateStep2(store.state.formData);
		store.setStepValidation(1, validation.isValid, validation.errors);
	}, [
		store,
		store.state.formData.business_area,
		store.state.formData.service,
		store.state.formData.start_date,
		store.state.formData.end_date,
		store.state.formData.data_custodian,
		store.state.formData.project_leader,
	]);

	const handleBusinessAreaChange = (value: string) => {
		store.setProjectDetails({ business_area: Number(value) });
	};

	const handleServiceChange = (value: string) => {
		store.setProjectDetails({
			service: value === "none" ? null : Number(value),
		});
	};

	const handleStartDateChange = (date: Date) => {
		store.setProjectDetails({ start_date: date.toISOString().split("T")[0] });
	};

	const handleEndDateChange = (date: Date) => {
		store.setProjectDetails({ end_date: date.toISOString().split("T")[0] });
	};

	const handleProjectLeaderChange = (userId: number | null) => {
		store.setProjectDetails({ project_leader: userId });
		// Don't auto-set custodian here - the useEffect will handle it
	};

	const handleDataCustodianChange = (userId: number | null) => {
		// Mark that user has manually changed the custodian
		hasManuallyChangedCustodian.current = true;
		store.setProjectDetails({ data_custodian: userId });
	};

	const errors = store.state.validation[1]?.errors || {};

	return (
		<div className="space-y-6 max-w-2xl">
			<div>
				<h2 className="text-2xl font-bold mb-2">Project Details</h2>
				<p className="text-muted-foreground">
					Provide timeline, team, and business area information for your
					project.
				</p>
			</div>

			{/* Business Area */}
			<div className="space-y-2">
				<Label htmlFor="business_area">
					Business Area <span className="text-destructive">*</span>
				</Label>
				<Select
					value={store.state.formData.business_area?.toString() || ""}
					onValueChange={handleBusinessAreaChange}
					disabled={isLoadingBusinessAreas}
				>
					<SelectTrigger id="business_area" className="w-full">
						<SelectValue placeholder="Select business area" />
					</SelectTrigger>
					<SelectContent>
						{businessAreas?.map((ba) => {
							if (!ba.id) return null;
							return (
								<SelectItem key={ba.id} value={ba.id.toString()}>
									{ba.name}
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
				<p className="text-sm text-muted-foreground">
					The business area this project belongs to
				</p>
				{errors.business_area && (
					<p className="text-sm text-destructive">{errors.business_area}</p>
				)}
			</div>

			{/* Service */}
			<div className="space-y-2">
				<Label htmlFor="service">Service</Label>
				<Select
					value={store.state.formData.service?.toString() || "none"}
					onValueChange={handleServiceChange}
					disabled={isLoadingServices}
				>
					<SelectTrigger id="service" className="w-full">
						<SelectValue placeholder="Select service (optional)" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">None</SelectItem>
						{services?.map((service) => (
							<SelectItem key={service.id} value={service.id!.toString()}>
								{service.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<p className="text-sm text-muted-foreground">
					The departmental service this project belongs to (optional)
				</p>
			</div>

			{/* Start and End Date - side by side on larger screens */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Start Date */}
				<div>
					<DatePicker
						label="Start Date"
						placeholder="Select start date"
						required={true}
						dateFormat="DD/MM/YYYY"
						selectedDate={
							store.state.formData.start_date
								? new Date(store.state.formData.start_date)
								: undefined
						}
						setSelectedDate={handleStartDateChange}
						helperText="When the project commences"
					/>
					{errors.start_date && (
						<p className="text-sm text-destructive mt-1">{errors.start_date}</p>
					)}
				</div>

				{/* End Date */}
				<div>
					<DatePicker
						label="End Date"
						placeholder="Select end date (optional)"
						required={false}
						dateFormat="DD/MM/YYYY"
						selectedDate={
							store.state.formData.end_date
								? new Date(store.state.formData.end_date)
								: undefined
						}
						setSelectedDate={handleEndDateChange}
						helperText="Leave empty if project has no end date"
					/>
					{errors.end_date && (
						<p className="text-sm text-destructive mt-1">{errors.end_date}</p>
					)}
				</div>
			</div>

			{/* Project Leader */}
			<div className="space-y-2">
				<UserCombobox
					label="Project Leader"
					placeholder="Search for a project leader"
					helperText="The project leader (required)"
					isRequired={true}
					value={store.state.formData.project_leader || null}
					onValueChange={handleProjectLeaderChange}
					showIcon={true}
					wrapperClassName="space-y-2"
				/>
				{errors.project_leader && (
					<p className="text-sm text-destructive">{errors.project_leader}</p>
				)}
			</div>

			{/* Data Custodian - fades in after project leader is set */}
			<div
				className={cn(
					"space-y-2 transition-all duration-500",
					store.state.formData.project_leader
						? "opacity-100 max-h-[200px]"
						: "opacity-0 max-h-0 overflow-hidden"
				)}
			>
				<UserCombobox
					label="Data Custodian"
					placeholder="Search for a data custodian"
					helperText="The data custodian is responsible for data management, publishing, and metadata documentation on the data catalogue (defaults to project leader)"
					isRequired={false}
					value={store.state.formData.data_custodian || null}
					onValueChange={handleDataCustodianChange}
					isEditable={true}
					showIcon={true}
					wrapperClassName="space-y-2"
				/>
			</div>
		</div>
	);
});
