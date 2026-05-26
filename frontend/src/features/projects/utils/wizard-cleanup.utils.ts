import type { QueryClient } from "@tanstack/react-query";
import type { ProjectWizardStore } from "@/app/stores/derived/project-wizard.store";
import type { ProjectKind } from "@/shared/types/project.types";
import { clearDraftFromLocalStorage } from "./draft-persistence.utils";
import { logger } from "@/shared/services/logger.service";

const SESSION_STORAGE_KEY_PREFIX = "project-wizard-draft";

interface ClearAllWizardStateOptions {
	wizardStore: ProjectWizardStore;
	queryClient: QueryClient;
	projectKind: ProjectKind;
	deleteServerDraft?: () => void;
}

/**
 * Clears ALL wizard persistence layers in order:
 * 1. MobX store: resetWizard() — editingFormData, savedFormData, teamMembers, validation, steps
 * 2. MobX store: reset() — projectKind, loading, error, initialised
 * 3. localStorage: clearDraftFromLocalStorage()
 * 4. sessionStorage: remove the session draft key
 * 5. Server draft: fire-and-forget deletion (non-blocking)
 * 6. TanStack Query cache: remove cached draft queries
 */
export function clearAllWizardState({
	wizardStore,
	queryClient,
	projectKind,
	deleteServerDraft,
}: ClearAllWizardStateOptions): void {
	// 1. MobX store: reset wizard (editingFormData, savedFormData, teamMembers, validation, steps)
	wizardStore.resetWizard();

	// 2. MobX store: full reset (projectKind, loading, error, initialised)
	wizardStore.reset();

	// 3. localStorage
	clearDraftFromLocalStorage(projectKind);

	// 4. sessionStorage (per-kind key)
	try {
		sessionStorage.removeItem(`${SESSION_STORAGE_KEY_PREFIX}-${projectKind}`);
	} catch (error) {
		logger.error("Failed to clear sessionStorage draft", {
			error: error instanceof Error ? error.message : String(error),
		});
	}

	// 5. Server draft (non-blocking)
	if (deleteServerDraft) {
		deleteServerDraft();
	}

	// 6. TanStack Query cache — set data to null and remove the query entirely
	// Setting data to null ensures any active observers see the draft as gone,
	// and removeQueries cleans up the cache entry for the next mount.
	// Use exact: true to only remove this specific project kind's draft query.
	queryClient.setQueryData(["projects", "drafts", projectKind], null);
	queryClient.removeQueries({
		queryKey: ["projects", "drafts", projectKind],
		exact: true,
	});

	logger.info("Cleared all wizard state", { projectKind });
}
