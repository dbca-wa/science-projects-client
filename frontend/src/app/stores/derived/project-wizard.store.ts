import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { makeObservable, action, computed } from "mobx";
import type { ProjectKind } from "@/shared/types/project.types";
import { logger } from "@/shared/services/logger.service";
import { isRichTextEmpty } from "@/shared/utils/rich-text.utils";

/**
 * Form data interfaces for each wizard step
 */
export interface IBaseInformationData {
	title: string;
	description: string;
	keywords: string[];
	image: File | null;
}

export interface IProjectDetailsData {
	start_date: Date | null;
	end_date: Date | null;
	business_area: number | null;
	departmental_service: number | null;
	project_leader: number | null;
	data_custodian: number | null;
}

export interface ILocationData {
	areas: number[];
}

export interface IExternalDetailsData {
	collaboration_with: string;
	budget: string;
	external_description: string;
	aims: string;
}

export interface IStudentDetailsData {
	organisation: string;
	level: string;
}

/**
 * Team member added during project creation (wizard-scoped, no API calls)
 */
export interface IWizardTeamMember {
	userId: number;
	role: string;
	isLeader: boolean;
	displayName: string;
	position: number;
	isStaff: boolean;
	timeAllocation: number;
}

/**
 * Validation state for a step
 */
export interface IStepValidation {
	isValid: boolean;
	errors: Record<string, string>;
}

/**
 * Wizard state interface
 */
interface ProjectWizardStoreState extends BaseStoreState {
	currentStep: number;
	projectKind: ProjectKind | null;
	completedSteps: Set<number>;
	touchedSteps: Set<number>;
	touchedFields: Set<string>;
	formData: {
		baseInformation: IBaseInformationData;
		projectDetails: IProjectDetailsData;
		location: ILocationData;
		externalDetails: IExternalDetailsData | null;
		studentDetails: IStudentDetailsData | null;
	};
	teamMembers: IWizardTeamMember[];
	validation: Record<number, IStepValidation>;
	isSubmitting: boolean;
	showPreview: boolean;
}

/**
 * ProjectWizardStore manages the state for the multi-step project creation wizard.
 * Uses MobX for client-side state management.
 */
export class ProjectWizardStore extends BaseStore<ProjectWizardStoreState> {
	constructor() {
		super({
			currentStep: 0,
			projectKind: null,
			completedSteps: new Set<number>(),
			touchedSteps: new Set<number>(),
			touchedFields: new Set<string>(),
			formData: {
				baseInformation: {
					title: "",
					description: "",
					keywords: [],
					image: null,
				},
				projectDetails: {
					start_date: null,
					end_date: null,
					business_area: null,
					departmental_service: null,
					project_leader: null,
					data_custodian: null,
				},
				location: {
					areas: [],
				},
				externalDetails: null,
				studentDetails: null,
			},
			teamMembers: [],
			validation: {},
			isSubmitting: false,
			showPreview: false,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			// Actions
			goToStep: action,
			goToNextStep: action,
			goToPreviousStep: action,
			nextStep: action,
			previousStep: action,
			markStepCompleted: action,
			markStepTouched: action,
			markFieldTouched: action,
			resetWizard: action,
			setBaseInformation: action,
			setProjectDetails: action,
			setLocation: action,
			setExternalDetails: action,
			setStudentDetails: action,
			setStepValidation: action,
			validateCurrentStep: action,
			validateAllSteps: action,
			revalidateAllStepsFromData: action,
			setProjectKind: action,
			setSubmitting: action,
			togglePreview: action,
			setShowPreview: action,
			addTeamMember: action,
			removeTeamMember: action,
			reorderTeamMembers: action,
			updateTeamMemberRole: action,
			syncLeaderToTeam: action,
			reset: action,

			// Computed
			canGoToNextStep: computed,
			canGoForward: computed,
			canGoToPreviousStep: computed,
			canGoBack: computed,
			isLastStep: computed,
			isCurrentStepValid: computed,
			progressPercentage: computed,
			totalSteps: computed,
		});
	}

	/**
	 * Navigate to a specific step
	 */
	goToStep = (stepIndex: number) => {
		if (stepIndex < 0 || stepIndex >= this.totalSteps) {
			logger.warn("Invalid step index", {
				stepIndex,
				totalSteps: this.totalSteps,
			});
			return;
		}

		// Only allow navigation to completed steps or the next step
		if (
			stepIndex <= this.state.currentStep ||
			this.state.completedSteps.has(stepIndex - 1)
		) {
			this.state.currentStep = stepIndex;
			logger.debug("Navigated to step", { stepIndex });
		} else {
			logger.warn("Cannot navigate to incomplete step", { stepIndex });
		}
	};

	/**
	 * Navigate to the next step
	 */
	goToNextStep = () => {
		if (this.canGoToNextStep) {
			this.markStepCompleted(this.state.currentStep);
			this.state.currentStep += 1;
			logger.debug("Navigated to next step", {
				currentStep: this.state.currentStep,
			});
		} else {
			logger.warn("Cannot go to next step - validation failed or at last step");
		}
	};

	/**
	 * Navigate to the previous step
	 */
	goToPreviousStep = () => {
		if (this.canGoToPreviousStep) {
			this.state.currentStep -= 1;
			logger.debug("Navigated to previous step", {
				currentStep: this.state.currentStep,
			});
		} else {
			logger.warn("Cannot go to previous step - already at first step");
		}
	};

	/**
	 * Mark a step as completed
	 */
	markStepCompleted = (stepIndex: number) => {
		this.state.completedSteps.add(stepIndex);
		logger.debug("Marked step as completed", { stepIndex });
	};

	/**
	 * Mark a step as touched (user attempted to proceed past it)
	 */
	markStepTouched = (stepIndex: number) => {
		this.state.touchedSteps.add(stepIndex);
		logger.debug("Marked step as touched", { stepIndex });
	};

	/**
	 * Mark an individual field as touched (user focused then blurred it)
	 */
	markFieldTouched = (fieldName: string) => {
		this.state.touchedFields.add(fieldName);
		logger.debug("Marked field as touched", { fieldName });
	};

	/**
	 * Reset the wizard to initial state
	 */
	resetWizard = () => {
		this.state.currentStep = 0;
		this.state.completedSteps.clear();
		this.state.touchedSteps.clear();
		this.state.touchedFields.clear();
		this.state.formData = {
			baseInformation: {
				title: "",
				description: "",
				keywords: [],
				image: null,
			},
			projectDetails: {
				start_date: null,
				end_date: null,
				business_area: null,
				departmental_service: null,
				project_leader: null,
				data_custodian: null,
			},
			location: {
				areas: [],
			},
			externalDetails: null,
			studentDetails: null,
		};
		this.state.validation = {};
		this.state.teamMembers = [];
		this.state.isSubmitting = false;
		this.state.showPreview = false;
		logger.info("Wizard reset to initial state");
	};

	/**
	 * Set base information form data
	 */
	setBaseInformation = (data: Partial<IBaseInformationData>) => {
		this.state.formData.baseInformation = {
			...this.state.formData.baseInformation,
			...data,
		};
		logger.debug("Updated base information", { data });
	};

	/**
	 * Set project details form data
	 */
	setProjectDetails = (data: Partial<IProjectDetailsData>) => {
		this.state.formData.projectDetails = {
			...this.state.formData.projectDetails,
			...data,
		};
		logger.debug("Updated project details", { data });
	};

	/**
	 * Set location form data
	 */
	setLocation = (data: Partial<ILocationData>) => {
		this.state.formData.location = {
			...this.state.formData.location,
			...data,
		};
		logger.debug("Updated location", { data });
	};

	/**
	 * Set external details form data
	 */
	setExternalDetails = (data: Partial<IExternalDetailsData>) => {
		if (!this.state.formData.externalDetails) {
			this.state.formData.externalDetails = {
				collaboration_with: "",
				budget: "",
				external_description: "",
				aims: "",
			};
		}
		this.state.formData.externalDetails = {
			...this.state.formData.externalDetails,
			...data,
		};
		logger.debug("Updated external details", { data });
	};

	/**
	 * Set student details form data
	 */
	setStudentDetails = (data: Partial<IStudentDetailsData>) => {
		if (!this.state.formData.studentDetails) {
			this.state.formData.studentDetails = {
				organisation: "",
				level: "",
			};
		}
		this.state.formData.studentDetails = {
			...this.state.formData.studentDetails,
			...data,
		};
		logger.debug("Updated student details", { data });
	};

	/**
	 * Add a team member to the wizard's team list.
	 * Silently prevents duplicates (same userId).
	 */
	addTeamMember = (member: IWizardTeamMember) => {
		const exists = this.state.teamMembers.some(
			(tm) => tm.userId === member.userId
		);
		if (exists) return;

		this.state.teamMembers = [
			...this.state.teamMembers,
			{
				...member,
				position: this.state.teamMembers.length,
				isStaff: member.isStaff ?? false,
				timeAllocation: member.timeAllocation ?? (member.isStaff ? 1.0 : 0.0),
			},
		];
		logger.debug("Added team member", { userId: member.userId });
	};

	/**
	 * Remove a team member from the wizard's team list.
	 * The project leader cannot be removed.
	 */
	removeTeamMember = (userId: number) => {
		const member = this.state.teamMembers.find((tm) => tm.userId === userId);
		if (!member || member.isLeader) return;

		this.state.teamMembers = this.state.teamMembers
			.filter((tm) => tm.userId !== userId)
			.map((tm, index) => ({ ...tm, position: index }));
		logger.debug("Removed team member", { userId });
	};

	/**
	 * Reorder team members via drag-and-drop.
	 * The leader is always pinned at position 0.
	 */
	reorderTeamMembers = (fromIndex: number, toIndex: number) => {
		const members = [...this.state.teamMembers];
		const draggedMember = members[fromIndex];

		// Prevent moving the leader away from position 0
		if (draggedMember.isLeader && toIndex !== 0) return;
		// Prevent moving a non-leader to position 0 (leader's spot)
		if (!draggedMember.isLeader && toIndex === 0) return;

		const [moved] = members.splice(fromIndex, 1);
		members.splice(toIndex, 0, moved);

		this.state.teamMembers = members.map((tm, index) => ({
			...tm,
			position: index,
		}));
		logger.debug("Reordered team members", { fromIndex, toIndex });
	};

	/**
	 * Update the role of a team member.
	 */
	updateTeamMemberRole = (userId: number, role: string) => {
		this.state.teamMembers = this.state.teamMembers.map((tm) =>
			tm.userId === userId ? { ...tm, role } : tm
		);
		logger.debug("Updated team member role", { userId, role });
	};

	/**
	 * Synchronise the project leader into the team members list.
	 * Called when project_leader changes in the form data.
	 * If the leader changes, the old leader entry is demoted and the new one is added/promoted.
	 */
	syncLeaderToTeam = () => {
		const leaderId = this.state.formData.projectDetails.project_leader;

		if (!leaderId) {
			// No leader selected — remove the old leader from the team entirely
			this.state.teamMembers = this.state.teamMembers
				.filter((tm) => !tm.isLeader)
				.map((tm, index) => ({ ...tm, position: index }));
			return;
		}

		// Demote the old leader(s) to regular members
		const demoted = this.state.teamMembers.map((tm) =>
			tm.isLeader ? { ...tm, isLeader: false } : tm
		);

		// Check if the new leader is already in the team
		const existingIndex = demoted.findIndex((tm) => tm.userId === leaderId);

		if (existingIndex >= 0) {
			// Promote existing member to leader and move to position 0
			demoted[existingIndex] = {
				...demoted[existingIndex],
				isLeader: true,
				role: "supervising",
			};
			const [leader] = demoted.splice(existingIndex, 1);
			demoted.unshift(leader);
		} else {
			// Add new leader at position 0 — name resolves via ResolvedDisplayName component
			demoted.unshift({
				userId: leaderId,
				role: "supervising",
				isLeader: true,
				displayName: "Loading...",
				position: 0,
				isStaff: true,
				timeAllocation: 1.0,
			});
		}

		// Recalculate positions
		this.state.teamMembers = demoted.map((tm, index) => ({
			...tm,
			position: index,
		}));
		logger.debug("Synced leader to team", { leaderId });
	};

	/**
	 * Set validation state for a step
	 */
	setStepValidation = (
		stepIndex: number,
		isValid: boolean,
		errors: Record<string, string> = {}
	) => {
		this.state.validation[stepIndex] = { isValid, errors };
		logger.debug("Updated step validation", { stepIndex, isValid, errors });
	};

	/**
	 * Validate the current step
	 */
	validateCurrentStep = (): boolean => {
		const validation = this.state.validation[this.state.currentStep];
		const isValid = validation?.isValid ?? false;
		logger.debug("Validated current step", {
			currentStep: this.state.currentStep,
			isValid,
		});
		return isValid;
	};

	/**
	 * Validate all steps
	 */
	validateAllSteps = (): boolean => {
		const allValid = Array.from({ length: this.totalSteps }, (_, i) => i).every(
			(stepIndex) => {
				const validation = this.state.validation[stepIndex];
				return validation?.isValid ?? false;
			}
		);
		logger.debug("Validated all steps", { allValid });
		return allValid;
	};

	/**
	 * Re-validate all steps from stored form data.
	 * Called after draft restoration to set validation state for steps
	 * whose components haven't mounted yet. Returns the index of the
	 * first invalid step, or -1 if all are valid.
	 */
	revalidateAllStepsFromData = (): number => {
		const formData = this.state.formData;

		// Step 0: Base Information
		const step0Errors: Record<string, string> = {};
		if (isRichTextEmpty(formData.baseInformation.title)) {
			step0Errors.title = "Title is required";
		}
		if (isRichTextEmpty(formData.baseInformation.description)) {
			step0Errors.description = "Description is required";
		}
		if (
			!formData.baseInformation.keywords ||
			formData.baseInformation.keywords.length === 0
		) {
			step0Errors.keywords = "At least one keyword is required";
		}
		this.state.validation[0] = {
			isValid: Object.keys(step0Errors).length === 0,
			errors: step0Errors,
		};

		// Step 1: Project Details
		const step1Errors: Record<string, string> = {};
		if (!formData.projectDetails.business_area) {
			step1Errors.business_area = "Business area is required";
		}
		if (!formData.projectDetails.start_date) {
			step1Errors.start_date = "Start date is required";
		}
		if (!formData.projectDetails.project_leader) {
			step1Errors.project_leader = "Project leader is required";
		}
		if (!formData.projectDetails.data_custodian) {
			step1Errors.data_custodian = "Data custodian is required";
		}
		this.state.validation[1] = {
			isValid: Object.keys(step1Errors).length === 0,
			errors: step1Errors,
		};

		// Step 2: Location (no required fields — always valid)
		this.state.validation[2] = { isValid: true, errors: {} };

		// Step 3: External/Student Details (conditional)
		if (this.state.projectKind === "external") {
			const step3Errors: Record<string, string> = {};
			if (!formData.externalDetails?.collaboration_with?.trim()) {
				step3Errors.collaboration_with =
					"At least one collaboration partner is required";
			}
			this.state.validation[3] = {
				isValid: Object.keys(step3Errors).length === 0,
				errors: step3Errors,
			};
		} else if (this.state.projectKind === "student") {
			const step3Errors: Record<string, string> = {};
			if (!formData.studentDetails?.organisation?.trim()) {
				step3Errors.organisation = "Organisation is required";
			}
			if (!formData.studentDetails?.level?.trim()) {
				step3Errors.level = "Level is required";
			}
			this.state.validation[3] = {
				isValid: Object.keys(step3Errors).length === 0,
				errors: step3Errors,
			};
		}

		// Find first invalid step
		for (let i = 0; i < this.totalSteps; i++) {
			if (this.state.validation[i] && !this.state.validation[i].isValid) {
				return i;
			}
		}
		return -1;
	};

	/**
	 * Set the project kind
	 */
	setProjectKind = (kind: ProjectKind) => {
		this.state.projectKind = kind;

		// Initialise conditional form data based on project kind
		if (kind === "external") {
			this.state.formData.externalDetails = {
				collaboration_with: "",
				budget: "",
				external_description: "",
				aims: "",
			};
			this.state.formData.studentDetails = null;
		} else if (kind === "student") {
			this.state.formData.studentDetails = {
				organisation: "",
				level: "",
			};
			this.state.formData.externalDetails = null;
		} else {
			this.state.formData.externalDetails = null;
			this.state.formData.studentDetails = null;
		}

		logger.info("Set project kind", { kind });
	};

	/**
	 * Set submitting state
	 */
	setSubmitting = (isSubmitting: boolean) => {
		this.state.isSubmitting = isSubmitting;
	};

	/**
	 * Toggle preview panel visibility
	 */
	togglePreview = () => {
		this.state.showPreview = !this.state.showPreview;
	};

	/**
	 * Set preview panel visibility
	 */
	setShowPreview = (show: boolean) => {
		this.state.showPreview = show;
	};

	/**
	 * Navigate to next step (alias for WizardContainer compatibility)
	 */
	nextStep = () => {
		this.goToNextStep();
	};

	/**
	 * Navigate to previous step (alias for WizardContainer compatibility)
	 */
	previousStep = () => {
		this.goToPreviousStep();
	};

	/**
	 * Check if can navigate to next step
	 */
	get canGoToNextStep(): boolean {
		// Can only proceed if the current step is valid AND all previous steps are valid
		if (this.state.currentStep >= this.totalSteps - 1) return false;
		if (!this.isCurrentStepValid) return false;

		// Check all previous steps are valid too
		for (let i = 0; i < this.state.currentStep; i++) {
			const stepValidation = this.state.validation[i];
			if (!stepValidation || !stepValidation.isValid) return false;
		}

		return true;
	}

	/**
	 * Alias for WizardContainer compatibility
	 */
	get canGoForward(): boolean {
		return this.canGoToNextStep;
	}

	/**
	 * Check if can navigate to previous step
	 */
	get canGoToPreviousStep(): boolean {
		return this.state.currentStep > 0;
	}

	/**
	 * Alias for WizardContainer compatibility
	 */
	get canGoBack(): boolean {
		return this.canGoToPreviousStep;
	}

	/**
	 * Check if on the last step
	 */
	get isLastStep(): boolean {
		return this.state.currentStep === this.totalSteps - 1;
	}

	/**
	 * Check if current step is valid
	 */
	get isCurrentStepValid(): boolean {
		const validation = this.state.validation[this.state.currentStep];
		return validation?.isValid ?? false;
	}

	/**
	 * Calculate progress percentage
	 */
	get progressPercentage(): number {
		if (this.totalSteps === 0) return 0;
		return Math.round(((this.state.currentStep + 1) / this.totalSteps) * 100);
	}

	/**
	 * Calculate total number of steps based on project kind
	 */
	get totalSteps(): number {
		// Base steps: Base Information, Project Details, Location
		let steps = 3;

		// Add conditional step for external or student projects
		if (
			this.state.projectKind === "external" ||
			this.state.projectKind === "student"
		) {
			steps += 1;
		}

		return steps;
	}

	/**
	 * Reset store to initial state
	 */
	reset() {
		this.resetWizard();
		this.state.projectKind = null;
		this.state.loading = false;
		this.state.error = null;
		this.state.initialised = false;
		logger.info("ProjectWizardStore reset");
	}
}
