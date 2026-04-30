import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { makeObservable, action, computed } from "mobx";
import type {
	IProjectData,
	IExtendedProjectDetails,
} from "@/shared/types/project.types";
import { getImageUrl } from "@/shared/utils/image.utils";
import { logger } from "@/shared/services/logger.service";

/**
 * Form data interface for edit project
 */
export interface IEditProjectFormData {
	title: string;
	description: string;
	image: File | string | null;
	business_area: number;
	service: number | null;
	start_date: string;
	end_date: string | null;
	project_leader: number | null;
	data_custodian: number | null;
	keywords: string;
	project_areas: number[];
	// External project fields
	collaboration_with: string;
	budget: string;
	external_description: string;
	aims: string;
	// Student project fields
	organisation: string;
	level: string;
}

/**
 * Edit project store state
 */
interface EditProjectStoreState extends BaseStoreState {
	projectId: number | null;
	originalData: IEditProjectFormData | null;
	formData: IEditProjectFormData;
	activeTab: "basic-info" | "project-areas";
	isSubmitting: boolean;
}

/**
 * EditProjectStore manages the state for editing an existing project.
 * Uses MobX for client-side state management.
 *
 * Unlike ProjectWizardStore, this does NOT persist drafts to localStorage.
 * Changes are only tracked in memory and discarded on navigation away.
 */
export class EditProjectStore extends BaseStore<EditProjectStoreState> {
	constructor() {
		super({
			projectId: null,
			originalData: null,
			formData: {
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
			activeTab: "basic-info",
			isSubmitting: false,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			// Actions
			loadProject: action,
			updateFormData: action,
			setActiveTab: action,
			setSubmitting: action,
			reset: action,
			discardChanges: action,

			// Computed
			isDirty: computed,
			changedFields: computed,
			isValid: computed,
		});
	}

	/**
	 * Load project data into the store
	 */
	loadProject = (project: IProjectData, details: IExtendedProjectDetails) => {
		const isExternalProject =
			details?.external &&
			!Array.isArray(details.external) &&
			details.external.project !== undefined;
		const isStudentProject =
			details?.student &&
			!Array.isArray(details.student) &&
			details.student.organisation !== undefined;

		const formData: IEditProjectFormData = {
			title: project.title,
			description: project.description || "",
			image: getImageUrl(project.image) || null,
			business_area: project.business_area?.id || 0,
			service: details.base.service?.id || null,
			start_date: project.start_date
				? new Date(project.start_date).toISOString().split("T")[0]
				: "",
			end_date: project.end_date
				? new Date(project.end_date).toISOString().split("T")[0]
				: null,
			project_leader: details.base.owner?.id || null,
			data_custodian: details.base.data_custodian?.id || null,
			keywords: project.keywords || "",
			project_areas: project.areas?.map((area) => area.id) || [],
			collaboration_with:
				isExternalProject &&
				details.external &&
				!Array.isArray(details.external)
					? details.external.collaboration_with || ""
					: "",
			budget:
				isExternalProject &&
				details.external &&
				!Array.isArray(details.external)
					? details.external.budget || ""
					: "",
			external_description:
				isExternalProject &&
				details.external &&
				!Array.isArray(details.external)
					? details.external.description || ""
					: "",
			aims:
				isExternalProject &&
				details.external &&
				!Array.isArray(details.external)
					? details.external.aims || ""
					: "",
			organisation:
				isStudentProject && details.student && !Array.isArray(details.student)
					? details.student.organisation || ""
					: "",
			level:
				isStudentProject && details.student && !Array.isArray(details.student)
					? details.student.level || ""
					: "",
		};

		this.state.projectId = project.id!;
		this.state.originalData = { ...formData };
		this.state.formData = { ...formData };
		this.state.initialised = true;

		logger.info("EditProjectStore loaded project", {
			projectId: project.id,
			imageFile: project.image?.file,
			imageUrl: getImageUrl(project.image),
		});
	};

	/**
	 * Update form data (partial update)
	 */
	updateFormData = (data: Partial<IEditProjectFormData>) => {
		this.state.formData = {
			...this.state.formData,
			...data,
		};
		logger.debug("Updated form data", { data });
	};

	/**
	 * Set active tab
	 */
	setActiveTab = (tab: "basic-info" | "project-areas") => {
		this.state.activeTab = tab;
		logger.debug("Set active tab", { tab });
	};

	/**
	 * Set submitting state
	 */
	setSubmitting = (isSubmitting: boolean) => {
		this.state.isSubmitting = isSubmitting;
	};

	/**
	 * Discard changes and reset to original data
	 */
	discardChanges = () => {
		if (this.state.originalData) {
			this.state.formData = { ...this.state.originalData };
			logger.info("Discarded changes, reset to original data");
		}
	};

	/**
	 * Check if form has unsaved changes
	 */
	get isDirty(): boolean {
		if (!this.state.originalData) return false;

		// Compare current form data with original data
		return (
			JSON.stringify(this.state.formData) !==
			JSON.stringify(this.state.originalData)
		);
	}

	/**
	 * Get list of changed fields
	 */
	get changedFields(): string[] {
		if (!this.state.originalData) return [];

		const changed: string[] = [];
		const original = this.state.originalData;
		const current = this.state.formData;

		(Object.keys(current) as Array<keyof IEditProjectFormData>).forEach(
			(key) => {
				if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
					changed.push(key);
				}
			}
		);

		return changed;
	}

	/**
	 * Check if form is valid (basic validation)
	 */
	get isValid(): boolean {
		const { title, business_area, start_date } = this.state.formData;

		// Required fields
		if (!title || !business_area || !start_date) {
			return false;
		}

		// Date validation
		if (this.state.formData.end_date && this.state.formData.start_date) {
			const startDate = new Date(this.state.formData.start_date);
			const endDate = new Date(this.state.formData.end_date);
			if (endDate < startDate) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Reset store to initial state
	 */
	reset() {
		this.state.projectId = null;
		this.state.originalData = null;
		this.state.formData = {
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
		};
		this.state.activeTab = "basic-info";
		this.state.isSubmitting = false;
		this.state.loading = false;
		this.state.error = null;
		this.state.initialised = false;
		logger.info("EditProjectStore reset");
	}
}
