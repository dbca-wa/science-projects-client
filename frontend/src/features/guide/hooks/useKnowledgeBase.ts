/**
 * Knowledge Base TanStack Query Hooks
 *
 * Hooks for fetching and mutating guide sections and content fields.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/shared/constants";
import {
	getGuideSections,
	createGuideSection,
	updateGuideSection,
	deleteGuideSection,
	reorderGuideSections,
	createContentField,
	updateContentField,
	deleteContentField,
	reorderContentFields,
} from "../services/guide.service";
import type {
	IGuideSectionPayload,
	IContentFieldPayload,
} from "../types/guide.types";

export const guideKeys = {
	all: ["guide"] as const,
	sections: ["guide", "sections"] as const,
	section: (id: string) => ["guide", "sections", id] as const,
};

/** Fetch all guide sections with their content fields */
export const useGuideSections = () => {
	return useQuery({
		queryKey: guideKeys.sections,
		queryFn: getGuideSections,
		staleTime: STALE_TIME.LONG,
	});
};

/** Create a new guide section */
export const useCreateGuideSection = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IGuideSectionPayload) => createGuideSection(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: guideKeys.sections });
		},
	});
};

/** Update an existing guide section */
export const useUpdateGuideSection = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<IGuideSectionPayload>;
		}) => updateGuideSection(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: guideKeys.sections });
		},
	});
};

/** Delete a guide section */
export const useDeleteGuideSection = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteGuideSection(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: guideKeys.sections });
		},
	});
};

/** Reorder guide sections */
export const useReorderGuideSections = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (sectionIds: string[]) => reorderGuideSections(sectionIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: guideKeys.sections });
		},
	});
};

/** Create a new content field (article) */
export const useCreateContentField = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IContentFieldPayload) => createContentField(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: guideKeys.sections });
		},
	});
};

/** Update an existing content field */
export const useUpdateContentField = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<IContentFieldPayload>;
		}) => updateContentField(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: guideKeys.sections });
		},
	});
};

/** Delete a content field */
export const useDeleteContentField = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteContentField(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: guideKeys.sections });
		},
	});
};

/** Reorder content fields within a section */
export const useReorderContentFields = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			sectionId,
			fieldIds,
		}: {
			sectionId: string;
			fieldIds: string[];
		}) => reorderContentFields(sectionId, fieldIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: guideKeys.sections });
		},
	});
};
