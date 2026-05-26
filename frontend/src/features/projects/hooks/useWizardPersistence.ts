import { useEffect, useCallback, useRef } from "react";
import { reaction } from "mobx";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { logger } from "@/shared/services/logger.service";
import {
	loadDraftFromLocalStorage,
	saveDraftToLocalStorage,
} from "@/features/projects/utils/draft-persistence.utils";
import { compressImage } from "@/shared/utils/image-compression.utils";
import type { ProjectKind } from "@/shared/types/project.types";
import type { IDraftResponse, ISaveDraftPayload } from "./useDraft";

/**
 * Draft source indicates where the restored draft came from.
 * Used by the page to show an appropriate toast message.
 */
export type DraftSource = "server" | "localStorage" | "sessionStorage" | null;

/**
 * Options for integrating server draft persistence.
 * The page passes these in from the TanStack Query hooks.
 */
export interface IWizardPersistenceOptions {
	/** Server draft data loaded by useDraft (may be null/undefined) */
	serverDraft?: IDraftResponse | null;
	/** Fire-and-forget server save — called after sessionStorage save */
	onServerSave?: (payload: ISaveDraftPayload) => void;
	/** Fire-and-forget server delete — called when clearing drafts */
	onServerDelete?: () => void;
}

/**
 * Storage key for wizard persistence — per project kind
 */
const STORAGE_KEY_PREFIX = "project-wizard-draft";
const buildSessionKey = (kind: ProjectKind | null) =>
	kind ? `${STORAGE_KEY_PREFIX}-${kind}` : STORAGE_KEY_PREFIX;

/**
 * Expiration time for draft data (24 hours in milliseconds)
 */
const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

/**
 * Maximum size for base64-encoded image data (~2MB).
 * Base64 adds ~33% overhead, so a ~1MB file becomes ~1.33MB in base64.
 * Images are compressed before persistence to ensure they fit within this limit.
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
export const useWizardPersistence = (
	options: IWizardPersistenceOptions = {}
) => {
	const { serverDraft, onServerSave, onServerDelete } = options;
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
			const imageFile = wizardStore.state.editingFormData.baseInformation.image;

			if (imageFile instanceof File) {
				let fileToConvert = imageFile;

				// Compress the image if it would exceed the persistence size limit.
				// The base64 encoding adds ~33% overhead, so target a file size that
				// will fit comfortably: MAX_IMAGE_PERSISTENCE_SIZE / 1.4 ≈ 1.5MB.
				const estimatedBase64Size = imageFile.size * 1.37;
				if (estimatedBase64Size > MAX_IMAGE_PERSISTENCE_SIZE) {
					try {
						const targetMB = MAX_IMAGE_PERSISTENCE_SIZE / 1.37 / (1024 * 1024);
						const result = await compressImage(imageFile, {
							maxSizeMB: targetMB,
							useWebWorker: true,
						});
						fileToConvert = result.file;
						logger.debug("Compressed image for draft persistence", {
							originalSize: imageFile.size,
							compressedSize: result.file.size,
							targetMB,
						});
					} catch (error) {
						logger.warn("Failed to compress image for draft persistence", {
							error: error instanceof Error ? error.message : String(error),
						});
					}
				}

				const base64 = await fileToBase64(fileToConvert);
				if (base64) {
					if (base64.length > MAX_IMAGE_PERSISTENCE_SIZE) {
						// Even after compression the image is too large — skip it
						logger.warn(
							"Image still exceeds persistence limit after compression, skipping",
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
				teamMembers: wizardStore.state.editingTeamMembers.map((m) => ({
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
						title: wizardStore.state.editingFormData.baseInformation.title,
						description:
							wizardStore.state.editingFormData.baseInformation.description,
						keywords:
							wizardStore.state.editingFormData.baseInformation.keywords,
					},
					projectDetails: {
						start_date:
							wizardStore.state.editingFormData.projectDetails.start_date,
						end_date: wizardStore.state.editingFormData.projectDetails.end_date,
						business_area:
							wizardStore.state.editingFormData.projectDetails.business_area,
						project_leader:
							wizardStore.state.editingFormData.projectDetails.project_leader,
						data_custodian:
							wizardStore.state.editingFormData.projectDetails.data_custodian,
					},
					location: {
						areas: wizardStore.state.editingFormData.location.areas,
					},
					externalDetails: wizardStore.state.editingFormData.externalDetails,
					studentDetails: wizardStore.state.editingFormData.studentDetails,
				},
			};

			sessionStorage.setItem(
				buildSessionKey(wizardStore.state.projectKind),
				JSON.stringify(data)
			);
			logger.debug("Wizard draft saved to session storage", {
				hasImage: imageData !== null,
			});

			// Also persist to localStorage for cross-session recovery (includes image)
			if (wizardStore.state.projectKind) {
				saveDraftToLocalStorage(wizardStore.state.projectKind, {
					formData: wizardStore.state.editingFormData,
					teamMembers: wizardStore.state.editingTeamMembers.map((m) => ({
						userId: m.userId,
						role: m.role,
						isLeader: m.isLeader,
						displayName: m.displayName,
						position: m.position,
						isStaff: m.isStaff,
						timeAllocation: m.timeAllocation,
					})),
					currentStep: data.currentStep,
					completedSteps: data.completedSteps,
					projectKind: wizardStore.state.projectKind,
					savedAt: new Date().toISOString(),
					imageData,
				});
			}

			// Fire-and-forget server save (non-blocking)
			if (onServerSave && wizardStore.state.projectKind) {
				// The server's `data` JSONField stores the full draft state
				// (formData, teamMembers, completedSteps, imageData) for round-trip fidelity.
				const serverPayloadData: Record<string, unknown> = {
					formData: data.formData,
					teamMembers: data.teamMembers,
					completedSteps: data.completedSteps,
					imageData,
				};
				onServerSave({
					data: serverPayloadData,
					current_step: data.currentStep,
				});
			}
		} catch (error) {
			logger.error("Failed to save wizard draft", {
				errorMessage: error instanceof Error ? error.message : String(error),
			});
		}
	}, [wizardStore, onServerSave]);

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
	 * Clear wizard draft from session storage and server.
	 */
	const clearDraft = useCallback(() => {
		try {
			sessionStorage.removeItem(buildSessionKey(wizardStore.state.projectKind));
			logger.debug("Wizard draft cleared from session storage");
		} catch (error) {
			logger.error("Failed to clear wizard draft", {
				errorMessage: error instanceof Error ? error.message : String(error),
			});
		}

		// Fire-and-forget server delete (non-blocking)
		if (onServerDelete) {
			onServerDelete();
		}
	}, [onServerDelete, wizardStore.state.projectKind]);

	/**
	 * Restore wizard data using a three-tier fallback strategy:
	 * 1. Server draft (passed via options)
	 * 2. localStorage draft (cross-session persistence)
	 * 3. sessionStorage draft (same-session persistence)
	 *
	 * Returns the source of the restored draft, or null if nothing was found.
	 */
	const restoreDraft = useCallback(async (): Promise<DraftSource> => {
		isRestoringRef.current = true;
		try {
			// ── Tier 1: Server draft ──────────────────────────────────────
			if (serverDraft) {
				logger.info("Restoring wizard draft from server", {
					projectKind: serverDraft.project_kind,
					currentStep: serverDraft.current_step,
				});

				const serverData = serverDraft.data as Record<string, unknown>;
				const formData = serverData.formData as
					| IPersistedWizardData["formData"]
					| undefined;
				const teamMembers = serverData.teamMembers as
					| IPersistedWizardData["teamMembers"]
					| undefined;
				const completedSteps = serverData.completedSteps as
					| number[]
					| undefined;
				const serverImageData = serverData.imageData as
					| IPersistedImageData
					| null
					| undefined;

				if (formData) {
					wizardStore.setProjectKind(serverDraft.project_kind);

					wizardStore.setBaseInformation({
						title: formData.baseInformation?.title ?? "",
						description: formData.baseInformation?.description ?? "",
						keywords: formData.baseInformation?.keywords ?? [],
					});

					// Restore image from base64 data URL if present in server draft
					if (serverImageData) {
						const restoredFile = await base64ToFile(
							serverImageData.dataUrl,
							serverImageData.fileName
						);
						if (restoredFile) {
							wizardStore.setBaseInformation({ image: restoredFile });
							logger.debug("Restored image from server draft", {
								fileName: serverImageData.fileName,
							});
						} else {
							logger.warn("Could not restore image from server draft");
						}
					}

					wizardStore.setProjectDetails({
						start_date: formData.projectDetails?.start_date
							? new Date(formData.projectDetails.start_date)
							: null,
						end_date: formData.projectDetails?.end_date
							? new Date(formData.projectDetails.end_date)
							: null,
						business_area: formData.projectDetails?.business_area ?? null,
						project_leader: formData.projectDetails?.project_leader ?? null,
						data_custodian: formData.projectDetails?.data_custodian ?? null,
					});

					wizardStore.setLocation({
						areas: formData.location?.areas ?? [],
					});

					if (formData.externalDetails) {
						wizardStore.setExternalDetails(formData.externalDetails);
					}
					if (formData.studentDetails) {
						wizardStore.setStudentDetails(formData.studentDetails);
					}
				}

				if (completedSteps && completedSteps.length > 0) {
					for (const stepIndex of completedSteps) {
						wizardStore.markStepCompleted(stepIndex);
					}
				}

				if (teamMembers && teamMembers.length > 0) {
					for (const member of teamMembers) {
						wizardStore.addTeamMember(member);
					}
				}

				wizardStore.goToStep(serverDraft.current_step);
				return "server";
			}

			// ── Tier 2: localStorage draft ────────────────────────────────
			const projectKind = wizardStore.state.projectKind;
			if (projectKind) {
				const localDraft = loadDraftFromLocalStorage(projectKind);
				if (localDraft) {
					logger.info("Restoring wizard draft from localStorage", {
						projectKind: localDraft.projectKind,
						currentStep: localDraft.currentStep,
					});

					wizardStore.setBaseInformation({
						title: localDraft.formData.baseInformation.title,
						description: localDraft.formData.baseInformation.description,
						keywords: localDraft.formData.baseInformation.keywords,
					});

					// Restore image from base64 data URL if present
					if (localDraft.imageData) {
						const restoredFile = await base64ToFile(
							localDraft.imageData.dataUrl,
							localDraft.imageData.fileName
						);
						if (restoredFile) {
							wizardStore.setBaseInformation({ image: restoredFile });
							logger.debug("Restored image from localStorage draft", {
								fileName: localDraft.imageData.fileName,
							});
						} else {
							logger.warn("Could not restore image from localStorage draft");
						}
					}

					wizardStore.setProjectDetails({
						start_date: localDraft.formData.projectDetails.start_date
							? new Date(localDraft.formData.projectDetails.start_date)
							: null,
						end_date: localDraft.formData.projectDetails.end_date
							? new Date(localDraft.formData.projectDetails.end_date)
							: null,
						business_area: localDraft.formData.projectDetails.business_area,
						project_leader: localDraft.formData.projectDetails.project_leader,
						data_custodian: localDraft.formData.projectDetails.data_custodian,
					});

					wizardStore.setLocation(localDraft.formData.location);

					if (localDraft.formData.externalDetails) {
						wizardStore.setExternalDetails(localDraft.formData.externalDetails);
					}
					if (localDraft.formData.studentDetails) {
						wizardStore.setStudentDetails(localDraft.formData.studentDetails);
					}

					if (
						localDraft.completedSteps &&
						localDraft.completedSteps.length > 0
					) {
						for (const stepIndex of localDraft.completedSteps) {
							wizardStore.markStepCompleted(stepIndex);
						}
					}

					if (localDraft.teamMembers && localDraft.teamMembers.length > 0) {
						for (const member of localDraft.teamMembers) {
							wizardStore.addTeamMember(member);
						}
					}

					wizardStore.goToStep(localDraft.currentStep);
					return "localStorage";
				}
			}

			// ── Tier 3: sessionStorage draft (same-session persistence) ─────────
			const sessionKey = buildSessionKey(wizardStore.state.projectKind);
			const stored = sessionStorage.getItem(sessionKey);
			if (!stored) {
				logger.debug("No wizard draft found in any storage layer");
				return null;
			}

			const data: IPersistedWizardData = JSON.parse(stored);

			// Check if data has expired
			if (isExpired(data.timestamp)) {
				logger.info("Wizard draft has expired, clearing");
				clearDraft();
				return null;
			}

			// Restore wizard state from sessionStorage
			if (data.projectKind) {
				wizardStore.setProjectKind(data.projectKind);
			}

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

			if (data.completedSteps && data.completedSteps.length > 0) {
				for (const stepIndex of data.completedSteps) {
					wizardStore.markStepCompleted(stepIndex);
				}
			}

			if (data.teamMembers && data.teamMembers.length > 0) {
				for (const member of data.teamMembers) {
					wizardStore.addTeamMember(member);
				}
			}

			wizardStore.goToStep(data.currentStep);

			logger.info("Wizard draft restored from session storage", {
				projectKind: data.projectKind,
				currentStep: data.currentStep,
				hasImage: data.imageData !== null,
			});

			return "sessionStorage";
		} catch (error) {
			logger.error("Failed to restore wizard draft", {
				errorMessage: error instanceof Error ? error.message : String(error),
			});
			clearDraft();
			return null;
		} finally {
			isRestoringRef.current = false;
		}
	}, [wizardStore, isExpired, clearDraft, serverDraft]);

	/**
	 * Check if a draft exists
	 */
	const hasDraft = useCallback((): boolean => {
		try {
			const stored = sessionStorage.getItem(
				buildSessionKey(wizardStore.state.projectKind)
			);
			if (!stored) return false;

			const data: IPersistedWizardData = JSON.parse(stored);
			return !isExpired(data.timestamp);
		} catch (error) {
			logger.error("Failed to check for wizard draft", {
				errorMessage: error instanceof Error ? error.message : String(error),
			});
			return false;
		}
	}, [isExpired, wizardStore.state.projectKind]);

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
				const base = state.editingFormData.baseInformation;
				const details = state.editingFormData.projectDetails;
				const location = state.editingFormData.location;
				const ext = state.editingFormData.externalDetails;
				const stu = state.editingFormData.studentDetails;

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
					start_date: details.start_date,
					end_date: details.end_date,
					project_leader: details.project_leader,
					data_custodian: details.data_custodian,
					areas: [...location.areas],
					teamMemberCount: state.editingTeamMembers.length,
					teamMemberIds: state.editingTeamMembers.map((m) => m.userId),
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
