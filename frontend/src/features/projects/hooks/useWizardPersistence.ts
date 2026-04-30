import { useEffect, useCallback, useRef } from "react";
import { reaction } from "mobx";
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
 * Maximum size for base64-encoded image data (~2MB).
 * Base64 adds ~33% overhead, so a ~1.5MB image file becomes ~2MB in base64.
 * Prevents exceeding sessionStorage quotas (~5MB total).
 */
const MAX_IMAGE_PERSISTENCE_SIZE = 2_097_152;

/**
 * Convert a File to a base64 data URL string.
 * Returns null if the file cannot be read.
 */
const fileToBase64 = (file: File): Promise<string | null> => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result as string);
		};
		reader.onerror = () => {
			logger.warn("Failed to convert image file to base64", {
				fileName: file.name,
			});
			resolve(null);
		};
		reader.readAsDataURL(file);
	});
};

/**
 * Convert a base64 data URL back to a File object.
 * Uses atob + Uint8Array instead of fetch() to avoid CSP restrictions
 * on data: URLs (connect-src policy blocks fetch on data: URIs).
 * Returns null if the conversion fails.
 */
const base64ToFile = async (
	dataUrl: string,
	fileName: string
): Promise<File | null> => {
	try {
		// Parse the data URL: "data:image/jpeg;base64,/9j/4AAQ..."
		const [header, base64Data] = dataUrl.split(",");
		if (!header || !base64Data) {
			logger.warn("Invalid data URL format — missing header or data");
			return null;
		}

		// Extract MIME type from header: "data:image/jpeg;base64"
		const mimeMatch = header.match(/data:([^;]+)/);
		const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

		// Decode base64 to binary
		const binaryString = atob(base64Data);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return new File([bytes], fileName, { type: mimeType });
	} catch (error) {
		logger.warn("Failed to convert base64 data URL back to File", {
			errorMessage: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
};

/**
 * Interface for the persisted image data stored alongside the draft
 */
interface IPersistedImageData {
	dataUrl: string;
	fileName: string;
}

/**
 * Interface for persisted wizard data
 */
interface IPersistedWizardData {
	timestamp: number;
	projectKind: ProjectKind | null;
	currentStep: number;
	completedSteps: number[];
	imageData: IPersistedImageData | null;
	teamMembers: Array<{
		userId: number;
		role: string;
		isLeader: boolean;
		displayName: string;
		position: number;
		isStaff: boolean;
		timeAllocation: number;
	}>;
	formData: {
		baseInformation: {
			title: string;
			description: string;
			keywords: string[];
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
	/** Prevents the MobX reaction from saving over the draft while restore is in progress */
	const isRestoringRef = useRef(false);

	/**
	 * Check if persisted data has expired
	 */
	const isExpired = useCallback((timestamp: number): boolean => {
		const now = Date.now();
		return now - timestamp > EXPIRATION_TIME;
	}, []);

	/**
	 * Save wizard data to session storage immediately (no debounce).
	 * Called on step transitions to ensure data is persisted before navigation.
	 */
	const saveDraftSync = useCallback(async () => {
		// Clear any pending debounced save
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = null;
		}

		try {
			// Convert image File to base64 if present
			let imageData: IPersistedImageData | null = null;
			const imageFile = wizardStore.state.formData.baseInformation.image;

			if (imageFile instanceof File) {
				const base64 = await fileToBase64(imageFile);
				if (base64) {
					if (base64.length > MAX_IMAGE_PERSISTENCE_SIZE) {
						logger.warn(
							"Image exceeds maximum persistence size (~2MB), skipping image draft storage",
							{
								fileName: imageFile.name,
								base64Length: base64.length,
								maxSize: MAX_IMAGE_PERSISTENCE_SIZE,
							}
						);
					} else {
						imageData = {
							dataUrl: base64,
							fileName: imageFile.name,
						};
					}
				} else {
					logger.warn(
						"Failed to convert image to base64 — fileToBase64 returned null"
					);
				}
			} else if (imageFile) {
				logger.warn("Image in store is not a File instance, cannot persist", {
					type: typeof imageFile,
				});
			}

			const data: IPersistedWizardData = {
				timestamp: Date.now(),
				projectKind: wizardStore.state.projectKind,
				currentStep: wizardStore.state.currentStep,
				completedSteps: Array.from(wizardStore.state.completedSteps),
				imageData,
				teamMembers: wizardStore.state.teamMembers.map((m) => ({
					userId: m.userId,
					role: m.role,
					isLeader: m.isLeader,
					displayName: m.displayName,
					position: m.position,
					isStaff: m.isStaff,
					timeAllocation: m.timeAllocation,
				})),
				formData: {
					baseInformation: {
						title: wizardStore.state.formData.baseInformation.title,
						description: wizardStore.state.formData.baseInformation.description,
						keywords: wizardStore.state.formData.baseInformation.keywords,
					},
					projectDetails: {
						start_date: wizardStore.state.formData.projectDetails.start_date,
						end_date: wizardStore.state.formData.projectDetails.end_date,
						business_area:
							wizardStore.state.formData.projectDetails.business_area,
						departmental_service:
							wizardStore.state.formData.projectDetails.departmental_service,
						project_leader:
							wizardStore.state.formData.projectDetails.project_leader,
						data_custodian:
							wizardStore.state.formData.projectDetails.data_custodian,
					},
					location: {
						areas: wizardStore.state.formData.location.areas,
					},
					externalDetails: wizardStore.state.formData.externalDetails,
					studentDetails: wizardStore.state.formData.studentDetails,
				},
			};

			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			logger.debug("Wizard draft saved to session storage", {
				hasImage: imageData !== null,
			});
		} catch (error) {
			logger.error("Failed to save wizard draft", {
				errorMessage: error instanceof Error ? error.message : String(error),
			});
		}
	}, [wizardStore]);

	/**
	 * Save wizard data to session storage (debounced).
	 * Wraps saveDraftSync with a 500ms debounce for reactive auto-saves.
	 */
	const saveDraft = useCallback(() => {
		// Clear existing timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		// Debounce save operation (500ms)
		saveTimeoutRef.current = setTimeout(async () => {
			await saveDraftSync();
		}, 500);
	}, [saveDraftSync]);

	/**
	 * Clear wizard draft from session storage
	 */
	const clearDraft = useCallback(() => {
		try {
			sessionStorage.removeItem(STORAGE_KEY);
			logger.debug("Wizard draft cleared from session storage");
		} catch (error) {
			logger.error("Failed to clear wizard draft", {
				errorMessage: error instanceof Error ? error.message : String(error),
			});
		}
	}, []);

	/**
	 * Restore wizard data from session storage.
	 * Converts persisted base64 image data back to a File object.
	 */
	const restoreDraft = useCallback(async (): Promise<boolean> => {
		isRestoringRef.current = true;
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

			// Restore form data (without image first)
			wizardStore.setBaseInformation({
				title: data.formData.baseInformation.title,
				description: data.formData.baseInformation.description,
				keywords: data.formData.baseInformation.keywords,
			});

			// Restore image from base64 data URL if present
			if (data.imageData) {
				const restoredFile = await base64ToFile(
					data.imageData.dataUrl,
					data.imageData.fileName
				);
				if (restoredFile) {
					wizardStore.setBaseInformation({ image: restoredFile });
					logger.debug("Restored image from persisted draft", {
						fileName: data.imageData.fileName,
					});
				} else {
					logger.warn("Could not restore image from persisted draft");
				}
			}

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

			// Restore completed steps BEFORE navigating (goToStep checks completedSteps)
			if (data.completedSteps && data.completedSteps.length > 0) {
				for (const stepIndex of data.completedSteps) {
					wizardStore.markStepCompleted(stepIndex);
				}
			}

			// Restore team members
			if (data.teamMembers && data.teamMembers.length > 0) {
				for (const member of data.teamMembers) {
					wizardStore.addTeamMember(member);
				}
			}

			// Restore current step using the store action
			wizardStore.goToStep(data.currentStep);

			logger.info("Wizard draft restored from session storage", {
				projectKind: data.projectKind,
				currentStep: data.currentStep,
				hasImage: data.imageData !== null,
			});

			return true;
		} catch (error) {
			logger.error("Failed to restore wizard draft", {
				errorMessage: error instanceof Error ? error.message : String(error),
			});
			clearDraft();
			return false;
		} finally {
			isRestoringRef.current = false;
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
				errorMessage: error instanceof Error ? error.message : String(error),
			});
			return false;
		}
	}, [isExpired]);

	/**
	 * NOTE: Draft restoration is handled explicitly by the page component
	 * (ProjectCreateWizardPage) to gate rendering until restore is complete.
	 * The auto-restore useEffect has been removed to prevent race conditions.
	 */

	/**
	 * Save draft when wizard state changes.
	 * Uses MobX reaction() to properly track deep observable changes
	 * (useEffect with MobX observables doesn't detect deep mutations).
	 */
	useEffect(() => {
		const dispose = reaction(
			// Data function — accesses all observables we want to track
			() => {
				const state = wizardStore.state;
				const base = state.formData.baseInformation;
				const details = state.formData.projectDetails;
				const location = state.formData.location;
				const ext = state.formData.externalDetails;
				const stu = state.formData.studentDetails;

				return {
					projectKind: state.projectKind,
					currentStep: state.currentStep,
					completedSteps: Array.from(state.completedSteps),
					// Deep-read all fields so MobX tracks them
					title: base.title,
					description: base.description,
					keywords: [...base.keywords],
					image: base.image,
					business_area: details.business_area,
					departmental_service: details.departmental_service,
					start_date: details.start_date,
					end_date: details.end_date,
					project_leader: details.project_leader,
					data_custodian: details.data_custodian,
					areas: [...location.areas],
					teamMemberCount: state.teamMembers.length,
					teamMemberIds: state.teamMembers.map((m) => m.userId),
					extCollab: ext?.collaboration_with,
					extBudget: ext?.budget,
					extDesc: ext?.external_description,
					extAims: ext?.aims,
					stuOrg: stu?.organisation,
					stuLevel: stu?.level,
				};
			},
			// Effect function — runs when any tracked observable changes
			() => {
				if (wizardStore.state.projectKind && !isRestoringRef.current) {
					saveDraft();
				}
			},
			{ fireImmediately: false }
		);

		return () => dispose();
	}, [wizardStore, saveDraft]);

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
		saveDraftSync,
		restoreDraft,
		clearDraft,
		hasDraft,
	};
};
