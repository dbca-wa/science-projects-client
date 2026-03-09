import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { makeObservable, action, computed } from "mobx";
import type { ProjectKind } from "@/shared/types/project.types";
import { logger } from "@/shared/services/logger.service";

/**
 * Form data for the complete wizard
 */
export interface CreateProjectFormData {
	// Step 1: Base Information
	title: string;
	description: string;
	keywords: string[];
	image: File | string | null;

	// Step 2: Project Details
	business_area: number | null;
	service: number | null;
	start_date: string;
	end_date: string | null;
	data_custodian: number | null;
	project_leader: number | null;

	// Step 3: Location
	project_areas: number[];

	// Step 4: External Details (conditional)
	collaboration_with?: string;
	budget?: string;
	external_description?: string;
	aims?: string;

	// Step 4: Student Details (conditional)
	organisation?: string;
	level?: string;
}

/**
 * Validation state for a step
 */
export interface StepValidation {
	isValid: boolean;
	errors: Record<string, string>;
}

/**
 * Wizard state interface
 */
interface CreateProjectWizardStoreState extends BaseStoreState {
	currentStep: number;
	projectKind: ProjectKind;
	completedSteps: Set<number>;
	formData: CreateProjectFormData;
	validation: Record<number, StepValidation>;
	showPreview: boolean;
	isSubmitting: boolean;
	lastSaved: Date | null;
	isDirty: boolean;
}

/**
 * Session storage data structure
 */
interface SessionStorageData {
	formData: CreateProjectFormData;
	currentStep: number;
	completedSteps: number[];
	projectKind: ProjectKind;
	timestamp: number;
	hadImage: boolean; // Track if image existed before nullifying
}

/**
 * CreateProjectWizardStore manages the state for the enhanced multi-step project creation wizard.
 * Features:
 * - Step-by-step navigation with validation
 * - Live preview functionality
 * - Session storage persistence
 * - Conditional steps based on project kind
 */
export class CreateProjectWizardStore extends BaseStore<CreateProjectWizardStoreState> {
	private readonly SESSION_STORAGE_KEY = "createProjectWizard";
	private readonly SESSION_EXPIRY_HOURS = 24;
	private saveTimer: NodeJS.Timeout | null = null;

	constructor() {
		super({
			currentStep: 0,
			projectKind: "science",
			completedSteps: new Set<number>(),
			formData: {
				title: "",
				description: "",
				keywords: [],
				image: null,
				business_area: null,
				service: null,
				start_date: "",
				end_date: null,
				data_custodian: null,
				project_leader: null,
				project_areas: [],
			},
			validation: {},
			showPreview: false,
			isSubmitting: false,
			lastSaved: null,
			isDirty: false,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			// Navigation actions
			nextStep: action,
			previousStep: action,
			goToStep: action,

			// Form data actions
			updateFormData: action,
			setBaseInformation: action,
			setProjectDetails: action,
			setLocation: action,
			setExternalDetails: action,
			setStudentDetails: action,
			setProjectKind: action,

			// Validation actions
			setStepValidation: action,
			validateCurrentStep: action,
			validateAllSteps: action,

			// UI actions
			togglePreview: action,
			setShowPreview: action,
			setSubmitting: action,

			// Session storage actions
			saveToSessionStorage: action,
			restoreFromSessionStorage: action,
			clearDraft: action,

			// Reset
			reset: action,

			// Computed properties
			canGoForward: computed,
			canGoBack: computed,
			isLastStep: computed,
			totalSteps: computed,
			progressPercentage: computed,
			isCurrentStepValid: computed,
		});
	}

	// ============================================================================
	// Navigation Actions
	// ============================================================================

	/**
	 * Navigate to the next step
	 */
	nextStep = () => {
		if (!this.canGoForward) {
			logger.warn("Cannot go to next step - validation failed or at last step");
			return;
		}

		this.state.completedSteps.add(this.state.currentStep);
		this.state.currentStep += 1;
		this.debouncedSave();

		logger.debug("Navigated to next step", {
			currentStep: this.state.currentStep,
		});
	};

	/**
	 * Navigate to the previous step
	 */
	previousStep = () => {
		if (!this.canGoBack) {
			logger.warn("Cannot go to previous step - already at first step");
			return;
		}

		this.state.currentStep -= 1;
		logger.debug("Navigated to previous step", {
			currentStep: this.state.currentStep,
		});
	};

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

	// ============================================================================
	// Form Data Actions
	// ============================================================================

	/**
	 * Update form data (generic)
	 */
	updateFormData = (data: Partial<CreateProjectFormData>) => {
		this.state.formData = {
			...this.state.formData,
			...data,
		};
		this.state.isDirty = true;
		this.debouncedSave();

		logger.debug("Updated form data", { data });
	};

	/**
	 * Set base information (Step 1)
	 */
	setBaseInformation = (
		data: Partial<
			Pick<
				CreateProjectFormData,
				"title" | "description" | "keywords" | "image"
			>
		>
	) => {
		this.updateFormData(data);
	};

	/**
	 * Set project details (Step 2)
	 */
	setProjectDetails = (
		data: Partial<
			Pick<
				CreateProjectFormData,
				| "business_area"
				| "service"
				| "start_date"
				| "end_date"
				| "data_custodian"
				| "project_leader"
			>
		>
	) => {
		this.updateFormData(data);
	};

	/**
	 * Set location (Step 3)
	 */
	setLocation = (
		data: Partial<Pick<CreateProjectFormData, "project_areas">>
	) => {
		this.updateFormData(data);
	};

	/**
	 * Set external details (Step 4 - conditional)
	 */
	setExternalDetails = (
		data: Partial<
			Pick<
				CreateProjectFormData,
				"collaboration_with" | "budget" | "external_description" | "aims"
			>
		>
	) => {
		this.updateFormData(data);
	};

	/**
	 * Set student details (Step 4 - conditional)
	 */
	setStudentDetails = (
		data: Partial<Pick<CreateProjectFormData, "organisation" | "level">>
	) => {
		this.updateFormData(data);
	};

	/**
	 * Set the project kind
	 */
	setProjectKind = (kind: ProjectKind) => {
		const previousKind = this.state.projectKind;
		this.state.projectKind = kind;

		// Clear kind-specific fields when switching project types
		// This prevents external project data from appearing in student projects and vice versa
		if (previousKind !== kind) {
			// Clear external-specific fields if switching away from external
			if (previousKind === "external") {
				this.state.formData.collaboration_with = undefined;
				this.state.formData.budget = undefined;
				this.state.formData.external_description = undefined;
				this.state.formData.aims = undefined;
			}

			// Clear student-specific fields if switching away from student
			if (previousKind === "student") {
				this.state.formData.organisation = undefined;
				this.state.formData.level = undefined;
			}

			// Clear validation for step 4 when switching kinds
			delete this.state.validation[3];
		}

		this.state.isDirty = true;
		this.debouncedSave();

		logger.info("Set project kind", {
			kind,
			previousKind,
			clearedFields: previousKind !== kind,
		});
	};

	// ============================================================================
	// Validation Actions
	// ============================================================================

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

	// ============================================================================
	// UI Actions
	// ============================================================================

	/**
	 * Toggle preview visibility
	 */
	togglePreview = () => {
		this.state.showPreview = !this.state.showPreview;
		logger.debug("Toggled preview", { showPreview: this.state.showPreview });
	};

	/**
	 * Set preview visibility
	 */
	setShowPreview = (show: boolean) => {
		this.state.showPreview = show;
	};

	/**
	 * Set submitting state
	 */
	setSubmitting = (isSubmitting: boolean) => {
		this.state.isSubmitting = isSubmitting;
	};

	// ============================================================================
	// Session Storage Actions
	// ============================================================================

	/**
	 * Save form data to session storage (debounced)
	 */
	private debouncedSave = () => {
		if (this.saveTimer) {
			clearTimeout(this.saveTimer);
		}

		this.saveTimer = setTimeout(() => {
			this.saveToSessionStorage();
		}, 1000);
	};

	/**
	 * Save form data to session storage
	 */
	saveToSessionStorage = () => {
		try {
			const formDataToSave = { ...this.state.formData };

			// Track if image exists before nullifying
			const hadImage =
				formDataToSave.image instanceof File ||
				typeof formDataToSave.image === "string";

			// Handle image File object
			if (formDataToSave.image instanceof File) {
				// Don't save File objects - they can't be serialized and are ephemeral
				// User will need to re-upload if they restore the draft
				formDataToSave.image = null;
			}

			const data: SessionStorageData = {
				formData: formDataToSave,
				currentStep: this.state.currentStep,
				completedSteps: Array.from(this.state.completedSteps),
				projectKind: this.state.projectKind,
				timestamp: Date.now(),
				hadImage, // Store whether image existed
			};

			sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(data));
			this.state.lastSaved = new Date();
			this.state.isDirty = false;

			logger.debug("Saved to session storage", {
				timestamp: data.timestamp,
				hadImage,
			});
		} catch (error) {
			logger.error("Failed to save to session storage", { error });
		}
	};

	/**
	 * Restore form data from session storage
	 */
	restoreFromSessionStorage = () => {
		try {
			const stored = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
			if (!stored) {
				logger.debug("No session storage data found");
				return false;
			}

			const data: unknown = JSON.parse(stored);

			// Type guard
			if (!this.isValidSessionData(data)) {
				logger.warn("Invalid session storage data structure");
				this.clearDraft();
				return false;
			}

			// Check if data is expired
			const age = Date.now() - data.timestamp;
			const maxAge = this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000;

			if (age > maxAge) {
				logger.info("Session storage data expired", {
					age: Math.round(age / 1000 / 60),
					maxAge: Math.round(maxAge / 1000 / 60),
				});
				this.clearDraft();
				return false;
			}

			// Restore data
			this.state.formData = data.formData;
			this.state.currentStep = data.currentStep;
			this.state.completedSteps = new Set(data.completedSteps);
			this.state.projectKind = data.projectKind;
			this.state.lastSaved = new Date(data.timestamp);
			this.state.isDirty = false;

			logger.info("Restored from session storage", {
				currentStep: data.currentStep,
				timestamp: data.timestamp,
				hadImage: data.hadImage,
			});

			// Return object with restoration details
			return {
				success: true,
				hadImage: data.hadImage ?? false, // Use stored flag
			};
		} catch (error) {
			logger.error("Failed to restore from session storage", { error });
			this.clearDraft();
			return false;
		}
	};

	/**
	 * Type guard for session storage data
	 */
	private isValidSessionData(value: unknown): value is SessionStorageData {
		if (typeof value !== "object" || value === null) return false;

		const data = value as Record<string, unknown>;

		return (
			typeof data.formData === "object" &&
			data.formData !== null &&
			typeof data.currentStep === "number" &&
			Array.isArray(data.completedSteps) &&
			typeof data.projectKind === "string" &&
			typeof data.timestamp === "number"
			// hadImage is optional for backward compatibility
		);
	}

	/**
	 * Clear draft from session storage
	 */
	clearDraft = () => {
		try {
			sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
			this.state.lastSaved = null;
			this.state.isDirty = false;

			logger.info("Cleared draft from session storage");
		} catch (error) {
			logger.error("Failed to clear draft from session storage", { error });
		}
	};

	// ============================================================================
	// Computed Properties
	// ============================================================================

	/**
	 * Check if can navigate to next step
	 */
	get canGoForward(): boolean {
		return (
			this.state.currentStep < this.totalSteps - 1 && this.isCurrentStepValid
		);
	}

	/**
	 * Check if can navigate to previous step
	 */
	get canGoBack(): boolean {
		return this.state.currentStep > 0;
	}

	/**
	 * Check if on the last step
	 */
	get isLastStep(): boolean {
		return this.state.currentStep === this.totalSteps - 1;
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
	 * Calculate progress percentage
	 */
	get progressPercentage(): number {
		if (this.totalSteps === 0) return 0;
		return Math.round(((this.state.currentStep + 1) / this.totalSteps) * 100);
	}

	/**
	 * Check if current step is valid
	 */
	get isCurrentStepValid(): boolean {
		const validation = this.state.validation[this.state.currentStep];
		return validation?.isValid ?? false;
	}

	// ============================================================================
	// Reset
	// ============================================================================

	/**
	 * Reset store to initial state
	 */
	reset() {
		// Clear save timer
		if (this.saveTimer) {
			clearTimeout(this.saveTimer);
			this.saveTimer = null;
		}

		// Reset state
		this.state.currentStep = 0;
		this.state.projectKind = "science";
		this.state.completedSteps.clear();
		this.state.formData = {
			title: "",
			description: "",
			keywords: [],
			image: null,
			business_area: null,
			service: null,
			start_date: "",
			end_date: null,
			data_custodian: null,
			project_leader: null,
			project_areas: [],
		};
		this.state.validation = {};
		this.state.showPreview = false;
		this.state.isSubmitting = false;
		this.state.lastSaved = null;
		this.state.isDirty = false;
		this.state.loading = false;
		this.state.error = null;
		this.state.initialised = false;

		logger.info("CreateProjectWizardStore reset");
	}
}
