import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { PROJECT_ENDPOINTS } from "@/features/projects/services/project.endpoints";
import { logger } from "@/shared/services/logger.service";
import type { ProjectKind } from "@/shared/types/project.types";

/**
 * Server draft response shape — matches the backend ProjectDraftDetail view.
 */
export interface IDraftResponse {
	id: number;
	project_kind: ProjectKind;
	data: Record<string, unknown>;
	current_step: number;
	created_at: string;
	updated_at: string;
}

/**
 * Payload for creating or updating a server draft.
 */
export interface ISaveDraftPayload {
	data: Record<string, unknown>;
	current_step: number;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

const getDraft = async (kind: ProjectKind): Promise<IDraftResponse | null> => {
	try {
		return await apiClient.get<IDraftResponse>(
			PROJECT_ENDPOINTS.DRAFT_DETAIL(kind)
		);
	} catch {
		// 404 means no draft exists — not an error
		return null;
	}
};

const saveDraft = async (
	kind: ProjectKind,
	payload: ISaveDraftPayload
): Promise<IDraftResponse> => {
	return apiClient.put<IDraftResponse>(
		PROJECT_ENDPOINTS.DRAFT_DETAIL(kind),
		payload
	);
};

const deleteDraft = async (kind: ProjectKind): Promise<void> => {
	try {
		await apiClient.delete(PROJECT_ENDPOINTS.DRAFT_DETAIL(kind));
	} catch {
		// Ignore errors — draft may not exist on the server
	}
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Load a server draft for the given project kind.
 * Returns null when no draft exists (404 is swallowed).
 * Only fetches once on mount (staleTime: Infinity).
 */
export const useDraft = (kind: ProjectKind | null) => {
	return useQuery({
		queryKey: ["projects", "drafts", kind],
		queryFn: () => getDraft(kind!),
		enabled: !!kind,
		staleTime: Infinity,
		retry: false,
	});
};

/**
 * Persist the current wizard state to the server (upsert).
 * Failures are non-blocking — localStorage is the fallback.
 */
export const useSaveDraft = (kind: ProjectKind | null) => {
	return useMutation({
		mutationFn: (payload: ISaveDraftPayload) => saveDraft(kind!, payload),
		onError: () => {
			logger.warn(
				"Failed to save draft to server — localStorage is the fallback"
			);
		},
	});
};

/**
 * Delete the server draft for the given project kind.
 * Errors are silently swallowed (the draft may not exist).
 */
export const useDeleteDraft = (kind: ProjectKind | null) => {
	return useMutation({
		mutationFn: () => deleteDraft(kind!),
	});
};
