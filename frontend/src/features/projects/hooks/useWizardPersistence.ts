import { useEffect, useCallback, useRef } from "react";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { logger } from "@/shared/services/logger.service";
import type { ProjectKind } from "@/shared/types/project.types";

/**
 * Storage key for wizard persistence
 */
const STORAGE_KEY = "project-wizard-draft";

/**
 * Expiration time for draft data (24 hours in milliseconds)
 */
const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

/**
 * Interface for persisted wizard data
 */
interface IPersistedWizardData {
	timestamp: number;
	projectKind: ProjectKind | null;
	currentStep: number;
	formData: {
		baseInformation: {
			title: string;
			description: string;
			keywords: string[];
			image: File | null;
		};
		projectDetails: {
			start_date: Date | null;
			end_date: Date | null;
			business_area: number | null;
			departmental_service: number | null;
			project_leader: number | null;
			data_custodian: number | null;
		};
		location: {
			areas: number[];
		};
		externalDetails: {
			collaboration_with: string;
			budget: string;
			external_description: string;
			aims: string;
		} | null;
		studentDetails: {
			organisation: string;
			level: string;
		} | null;
	};
}

/**
 * Hook for wizard form data persistence
 * 
 * Automatically saves wizard state to session storage and restores it on mount.
 * Handles data expiration and cleanup.
 * 
 * @returns Persistence functions and state
 */
export const useWizardPersistence = () => {
	const wizardStore = useProjectWizardStore();
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hasRestoredRef = useRef(false);

	/**
	 * Check if persisted data has expired
	 */
	const isExpired = useCallback((timestamp: number): boolean => {
		const now = Date.now();
		return now - timestamp > EXPIRATION_TIME;
	}, []);

	/**
	 * Save wizard data to session storage (debounced)
	 */
	const saveDraft = useCallback(() => {
		// Clear existing timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		// Debounce save operation (500ms)
		saveTimeoutRef.current = setTimeout(() => {
			try {
				const data: IPersistedWizardData = {
					timestamp: Date.now(),
					projectKind: wizardStore.state.projectKind,
					currentStep: wizardStore.state.currentStep,
					formData: {
						baseInformation: {
							title: wizardStore.state.formData.baseInformation.title,
							description: wizardStore.state.formData.baseInformation.description,
							keywords: wizardStore.state.formData.baseInformation.keywords,
							image: null, // Don't persist File objects
						},
						projectDetails: {
							start_date: wizardStore.state.formData.projectDetails.start_date,
							end_date: wizardStore.state.formData.projectDetails.end_date,
							business_area: wizardStore.state.formData.projectDetails.business_area,
							departmental_service: wizardStore.state.formData.projectDetails.departmental_service,
							project_leader: wizardStore.state.formData.projectDetails.project_leader,
							data_custodian: wizardStore.state.formData.projectDetails.data_custodian,
						},
						location: {
							areas: wizardStore.state.formData.location.areas,
						},
						externalDetails: wizardStore.state.formData.externalDetails,
						studentDetails: wizardStore.state.formData.studentDetails,
					},
				};

				sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
				logger.debug("Wizard draft saved to session storage");
			} catch (error) {
				logger.error("Failed to save wizard draft", { 
					errorMessage: error instanceof Error ? error.message : String(error) 
				});
			}
		}, 500);
	}, [wizardStore]);

	/**
	 * Clear wizard draft from session storage
	 */
	const clearDraft = useCallback(() => {
		try {
			sessionStorage.removeItem(STORAGE_KEY);
			logger.debug("Wizard draft cleared from session storage");
		} catch (error) {
			logger.error("Failed to clear wizard draft", { 
				errorMessage: error instanceof Error ? error.message : String(error) 
			});
		}
	}, []);

	/**
	 * Restore wizard data from session storage
	 */
	const restoreDraft = useCallback((): boolean => {
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (!stored) {
				logger.debug("No wizard draft found in session storage");
				return false;
			}

			const data: IPersistedWizardData = JSON.parse(stored);

			// Check if data has expired
			if (isExpired(data.timestamp)) {
				logger.info("Wizard draft has expired, clearing");
				clearDraft();
				return false;
			}

			// Restore wizard state
			if (data.projectKind) {
				wizardStore.setProjectKind(data.projectKind);
			}

			// Restore form data
			wizardStore.setBaseInformation(data.formData.baseInformation);
			wizardStore.setProjectDetails({
				...data.formData.projectDetails,
				start_date: data.formData.projectDetails.start_date
					? new Date(data.formData.projectDetails.start_date)
					: null,
				end_date: data.formData.projectDetails.end_date
					? new Date(data.formData.projectDetails.end_date)
					: null,
			});
			wizardStore.setLocation(data.formData.location);

			if (data.formData.externalDetails) {
				wizardStore.setExternalDetails(data.formData.externalDetails);
			}

			if (data.formData.studentDetails) {
				wizardStore.setStudentDetails(data.formData.studentDetails);
			}

			// Restore current step using the store action
			wizardStore.goToStep(data.currentStep);

			logger.info("Wizard draft restored from session storage", {
				projectKind: data.projectKind,
				currentStep: data.currentStep,
			});

			return true;
		} catch (error) {
			logger.error("Failed to restore wizard draft", { 
				errorMessage: error instanceof Error ? error.message : String(error) 
			});
			clearDraft();
			return false;
		}
	}, [wizardStore, isExpired, clearDraft]);

	/**
	 * Check if a draft exists
	 */
	const hasDraft = useCallback((): boolean => {
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (!stored) return false;

			const data: IPersistedWizardData = JSON.parse(stored);
			return !isExpired(data.timestamp);
		} catch (error) {
			logger.error("Failed to check for wizard draft", { 
				errorMessage: error instanceof Error ? error.message : String(error) 
			});
			return false;
		}
	}, [isExpired]);

	/**
	 * Restore draft on mount (only once)
	 */
	useEffect(() => {
		if (!hasRestoredRef.current) {
			restoreDraft();
			hasRestoredRef.current = true;
		}
	}, [restoreDraft]);

	/**
	 * Save draft when wizard state changes
	 */
	useEffect(() => {
		// Only save if wizard has been initialized with a project kind
		if (wizardStore.state.projectKind) {
			saveDraft();
		}
	}, [
		wizardStore.state.projectKind,
		wizardStore.state.currentStep,
		wizardStore.state.formData,
		saveDraft,
	]);

	/**
	 * Cleanup timeout on unmount
	 */
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

	return {
		saveDraft,
		restoreDraft,
		clearDraft,
		hasDraft,
	};
};
