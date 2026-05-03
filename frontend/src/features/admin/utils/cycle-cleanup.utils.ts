import type { NewCycleStore } from "@/app/stores/derived/new-cycle.store";
import { logger } from "@/shared/services/logger.service";

const STORAGE_KEY = "spms_new_cycle_draft";

/**
 * Clears all new cycle creation state:
 * 1. MobX store: reset() — clears all form state
 * 2. localStorage: removes the draft key
 *
 * Server persistence is not used for the new cycle form (localStorage only).
 */
export function clearAllCycleState(store: NewCycleStore): void {
	// 1. MobX store reset (also clears localStorage internally)
	store.reset();

	// 2. Explicit localStorage removal as a safety net
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		logger.error("Failed to clear new cycle localStorage draft", {
			error: error instanceof Error ? error.message : String(error),
		});
	}

	logger.info("Cleared all new cycle state");
}
