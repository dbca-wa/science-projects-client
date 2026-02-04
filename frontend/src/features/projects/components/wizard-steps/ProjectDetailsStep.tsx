import { observer } from "mobx-react-lite";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { UserSearchDropdown } from "@/shared/components/user";
import { useRef } from "react";
import type { BaseUserSearchRef } from "@/shared/components/user";
import { AlertCircle } from "lucide-react";

/**
 * FieldError - Display validation error for a field
 */
const FieldError = ({ error }: { error?: string }) => {
	if (!error) return null;
	return (
		<div className="flex items-center gap-1 text-xs text-destructive mt-1">
			<AlertCircle className="h-3 w-3" />
			<span>{error}</span>
		</div>
	);
};

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
	const formData = wizardStore.state.formData.projectDetails;
	const validation = wizardStore.state.validation[1]; // Step 1 is Project Details
	const { data: businessAreas, isLoading: baLoading } = useBusinessAreas();
	const leaderRef = useRef<BaseUserSearchRef>(null);
	const custodianRef = useRef<BaseUserSearchRef>(null);

	const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		wizardStore.setProjectDetails({ start_date: new Date(e.target.value) });
	};

	const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		wizardStore.setProjectDetails({ end_date: new Date(e.target.value) });
	};

	const handleBusinessAreaChange = (value: string) => {
		wizardStore.setProjectDetails({ business_area: Number(value) });
	};

	const handleDepartmentalServiceChange = (value: string) => {
		wizardStore.setProjectDetails({ departmental_service: Number(value) });
	};

	const handleLeaderSelect = (userId: number | null) => {
		wizardStore.setProjectDetails({ project_leader: userId });
	};

	const handleCustodianSelect = (userId: number | null) => {
		wizardStore.setProjectDetails({ data_custodian: userId });
	};

	// Format date for input (YYYY-MM-DD)
	const formatDateForInput = (date: Date | null) => {
		if (!date) return "";
		return date.toISOString().split("T")[0];
	};

	// Validate dates
	const isEndDateValid = () => {
		if (!formData.start_date || !formData.end_date) return true;
		return formData.end_date > formData.start_date;
	};

	// Group business areas by division
	const groupedBusinessAreas = businessAreas?.reduce((acc, ba) => {
		const division = typeof ba.division === "object" && ba.division ? ba.division.name : "Other";
		if (!acc[division]) {
			acc[division] = [];
		}
		acc[division].push(ba);
		return acc;
	}, {} as Record<string, typeof businessAreas>);

	// Ordered division slugs for display
	const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];

	return (
		<div className="space-y-6">
			{/* Departmental Service */}
			<div className="space-y-2">
				<Label htmlFor="departmental_service">Departmental Service (Optional)</Label>
				<Select
					value={formData.departmental_service?.toString()}
					onValueChange={handleDepartmentalServiceChange}
				>
					<SelectTrigger id="departmental_service" className="text-base">
						<SelectValue placeholder="Select a Departmental Service" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="0">None</SelectItem>
						{/* TODO: Load departmental services from API */}
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
						) : groupedBusinessAreas ? (
							orderedDivisionSlugs.flatMap((divSlug) => {
								const divisionBusinessAreas = businessAreas
									?.filter(
										(ba) =>
											typeof ba.division === "object" &&
											ba.division &&
											ba.division.slug === divSlug &&
											ba.is_active
									)
									.sort((a, b) => a.name.localeCompare(b.name));

								if (!divisionBusinessAreas || divisionBusinessAreas.length === 0) {
									return [];
								}

								return [
									<div key={`${divSlug}-header`} className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
										{divSlug}
									</div>,
									...divisionBusinessAreas.map((ba) => (
										<SelectItem key={ba.id} value={ba.id?.toString() || ""}>
											{ba.name}
										</SelectItem>
									)),
								];
							})
						) : (
							<SelectItem value="none" disabled>
								No business areas available
							</SelectItem>
						)}
					</SelectContent>
				</Select>
				<FieldError error={validation?.errors.business_area} />
				<p className="text-xs text-muted-foreground">
					The Business Area / Program that this project belongs to. Only active Business Areas are selectable.
				</p>
			</div>

			{/* Date Range */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{/* Start Date */}
				<div className="space-y-2">
					<Label htmlFor="start_date">
						Start Date <span className="text-destructive">*</span>
					</Label>
					<Input
						id="start_date"
						type="date"
						value={formatDateForInput(formData.start_date)}
						onChange={handleStartDateChange}
						className="text-base"
					/>
					<FieldError error={validation?.errors.start_date} />
				</div>

				{/* End Date */}
				<div className="space-y-2">
					<Label htmlFor="end_date">
						End Date <span className="text-destructive">*</span>
					</Label>
					<Input
						id="end_date"
						type="date"
						value={formatDateForInput(formData.end_date)}
						onChange={handleEndDateChange}
						className="text-base"
					/>
					<FieldError error={validation?.errors.end_date} />
					{!isEndDateValid() && (
						<p className="text-xs text-destructive">
							End date must be after start date
						</p>
					)}
				</div>
			</div>
			<p className="text-xs text-muted-foreground -mt-2">
				These dates can be tentative and adjusted from project settings later
			</p>

			{/* Project Leader and Data Custodian */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{/* Project Leader */}
				<div className="space-y-2">
					<UserSearchDropdown
						ref={leaderRef}
						label="Project Leader"
						placeholder="Search for a Project Leader"
						helperText="The Project Leader"
						isRequired={true}
						setUserFunction={handleLeaderSelect}
						preselectedUserPk={formData.project_leader || undefined}
						hideCannotFind={true}
						showIcon={true}
						className="text-base"
						wrapperClassName="space-y-2"
					/>
					<FieldError error={validation?.errors.project_leader} />
				</div>

				{/* Data Custodian */}
				<div className="space-y-2">
					<UserSearchDropdown
						ref={custodianRef}
						label="Data Custodian"
						placeholder="Search for a data custodian"
						helperText="The data custodian is responsible for data management, publishing, and metadata documentation on the data catalogue"
						isRequired={true}
						setUserFunction={handleCustodianSelect}
						preselectedUserPk={formData.data_custodian || undefined}
						isEditable={true}
						hideCannotFind={true}
						showIcon={true}
						className="text-base"
						wrapperClassName="space-y-2"
					/>
					<FieldError error={validation?.errors.data_custodian} />
				</div>
			</div>
		</div>
	);
});

export { ProjectDetailsStep };
