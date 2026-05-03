import type {
	IWizardFormData,
	IWizardTeamMember,
} from "@/app/stores/derived/project-wizard.store";
import type { ProjectKind } from "@/shared/types/project.types";
import { logger } from "@/shared/services/logger.service";

/**
 * Persisted draft state shape.
 * Sets are serialised as arrays; Dates as ISO strings; Files stored as base64.
 */
export interface IDraftState {
	formData: IWizardFormData;
	teamMembers: IWizardTeamMember[];
	currentStep: number;
	completedSteps: number[];
	projectKind: ProjectKind;
	savedAt: string;
	/** Base64-encoded image data for cross-session persistence */
	imageData: IPersistedImageData | null;
}

/**
 * Persisted image data — base64 data URL + original file name.
 */
export interface IPersistedImageData {
	dataUrl: string;
	fileName: string;
}

/** Build the localStorage key for a given project kind. */
function buildStorageKey(kind: ProjectKind): string {
	return `spms_wizard_draft_${kind}`;
}

/**
 * ISO 8601 date string pattern used to identify serialised Date values
 * during deserialisation. Matches strings like "2026-01-15T00:00:00.000Z".
 */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

/**
 * JSON replacer that handles non-serialisable types:
 * - Date → ISO string
 * - Set  → Array
 * - File → null
 */
function draftReplacer(_key: string, value: unknown): unknown {
	if (value instanceof Date) {
		return value.toISOString();
	}
	if (value instanceof Set) {
		return Array.from(value);
	}
	if (typeof File !== "undefined" && value instanceof File) {
		return null;
	}
	return value;
}

/**
 * JSON reviver that restores Date objects from ISO strings
 * for known date fields (start_date, end_date).
 */
function draftReviver(key: string, value: unknown): unknown {
	if (
		typeof value === "string" &&
		(key === "start_date" || key === "end_date") &&
		ISO_DATE_PATTERN.test(value)
	) {
		return new Date(value);
	}
	return value;
}

/**
 * Type guard to validate that a parsed value looks like a valid IDraftState.
 * Checks structural shape without deep-validating every nested field.
 */
function isDraftState(value: unknown): value is IDraftState {
	if (typeof value !== "object" || value === null) return false;

	const candidate = value as Record<string, unknown>;

	return (
		typeof candidate.formData === "object" &&
		candidate.formData !== null &&
		Array.isArray(candidate.teamMembers) &&
		typeof candidate.currentStep === "number" &&
		Array.isArray(candidate.completedSteps) &&
		typeof candidate.projectKind === "string" &&
		typeof candidate.savedAt === "string"
	);
}

/**
 * Persist the saved wizard state to localStorage.
 *
 * Serialisation rules:
 * - Date objects → ISO strings
 * - Set<number> → number[] (completedSteps)
 * - File objects → null (cannot be serialised)
 * - Everything else → as-is
 *
 * Errors are logged but never thrown — localStorage failures must not
 * block the wizard.
 */
export function saveDraftToLocalStorage(
	kind: ProjectKind,
	state: IDraftState
): void {
	try {
		const key = buildStorageKey(kind);
		const serialised = JSON.stringify(state, draftReplacer);
		localStorage.setItem(key, serialised);
		logger.debug("Saved wizard draft to localStorage", { kind });
	} catch (error) {
		logger.error("Failed to save wizard draft to localStorage", {
			kind,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

/**
 * Load a previously saved wizard draft from localStorage.
 *
 * Deserialisation rules:
 * - ISO date strings for start_date / end_date → Date objects
 * - number[] completedSteps → kept as array (store converts to Set)
 * - null image → null (user must re-upload)
 *
 * Returns null if no draft exists or parsing fails.
 */
export function loadDraftFromLocalStorage(
	kind: ProjectKind
): IDraftState | null {
	try {
		const key = buildStorageKey(kind);
		const raw = localStorage.getItem(key);

		if (!raw) return null;

		const parsed: unknown = JSON.parse(raw, draftReviver);

		if (!isDraftState(parsed)) {
			logger.warn("Invalid draft shape in localStorage — ignoring", { kind });
			return null;
		}

		logger.debug("Loaded wizard draft from localStorage", { kind });
		return parsed;
	} catch (error) {
		logger.error("Failed to load wizard draft from localStorage", {
			kind,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

/**
 * Remove the wizard draft for the given project kind from localStorage.
 * Errors are logged but never thrown.
 */
export function clearDraftFromLocalStorage(kind: ProjectKind): void {
	try {
		const key = buildStorageKey(kind);
		localStorage.removeItem(key);
		logger.debug("Cleared wizard draft from localStorage", { kind });
	} catch (error) {
		logger.error("Failed to clear wizard draft from localStorage", {
			kind,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
