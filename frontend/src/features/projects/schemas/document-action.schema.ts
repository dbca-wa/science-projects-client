import * as z from "zod";

/**
 * Validation schema for document action modals
 * Used by UnifiedDocumentActionModal for submit, approve, recall, send_back, reopen actions
 */
export const documentActionSchema = z.object({
	comment: z.string().optional(),
	reason: z.string().optional(),
	sendEmail: z.boolean().default(true),
});

export type DocumentActionFormData = z.infer<typeof documentActionSchema>;

/**
 * Validation schema for create progress report modal
 * Used by CreateProgressReportModal
 */
export const createProgressReportSchema = z.object({
	year: z.number().int().min(1900).max(2100),
});

export type CreateProgressReportFormData = z.infer<
	typeof createProgressReportSchema
>;

/**
 * Validation schema for set areas modal
 * Used by SetAreasModal
 */
export const setAreasSchema = z.object({
	areaIds: z.array(z.number()).min(1, "At least one area must be selected"),
});

export type SetAreasFormData = z.infer<typeof setAreasSchema>;
