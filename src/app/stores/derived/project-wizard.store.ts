import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { makeObservable, action, computed } from "mobx";
import type { ProjectKind } from "@/shared/types/project.types";
import { logger } from "@/shared/services/logger.service";

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
	formData: {
		baseInformation: IBaseInformationData;
		projectDetails: IProjectDetailsData;
		location: ILocationData;
		externalDetails: IExternalDetailsData | null;
		studentDetails: IStudentDetailsData | null;
	};
	validation: Record<number, IStepValidation>;
	isSubmitting: boolean;
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
			validation: {},
			isSubmitting: false,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			// Actions
			goToStep: action,
			goToNextStep: action,
			goToPreviousStep: action,
			markStepCompleted: action,
			resetWizard: action,
			setBaseInformation: action,
			setProjectDetails: action,
			setLocation: action,
			setExternalDetails: action,
			setStudentDetails: action,
			setStepValidation: action,
			validateCurrentStep: action,
			validateAllSteps: action,
			setProjectKind: action,
			setSubmitting: action,
			reset: action,

			// Computed
			canGoToNextStep: computed,
			canGoToPreviousStep: computed,
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
	 * Reset the wizard to initial state
	 */
	resetWizard = () => {
		this.state.currentStep = 0;
		this.state.completedSteps.clear();
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
		this.state.isSubmitting = false;
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
	 * Set the project kind
	 */
	setProjectKind = (kind: ProjectKind) => {
		this.state.projectKind = kind;

		// Initialize conditional form data based on project kind
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
	 * Check if can navigate to next step
	 */
	get canGoToNextStep(): boolean {
		return (
			this.state.currentStep < this.totalSteps - 1 && this.isCurrentStepValid
		);
	}

	/**
	 * Check if can navigate to previous step
	 */
	get canGoToPreviousStep(): boolean {
		return this.state.currentStep > 0;
	}

	/**
	 * Check if current step is valid
	 */
	get isCurrentStepValid(): boolean {
		// For now, allow navigation without validation
		// Validation will be added in Phase 6
		return true;

		// TODO: Implement proper validation in Phase 6
		// const validation = this.state.validation[this.state.currentStep];
		// return validation?.isValid ?? false;
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
