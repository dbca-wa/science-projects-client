import { z } from "zod";

/**
 * Zod schema for caretaker request form
 * Validates caretaker request with conditional field requirements
 */
export const caretakerRequestSchema = z
	.object({
		reason: z.enum(["leave", "resignation", "other"]),

		endDate: z.date().optional().nullable(),

		notes: z.string().optional(),

		caretakerUserId: z.number(),
	})
	.refine(
		(data) => {
			// End date is required if reason is not "resignation"
			if (data.reason !== "resignation" && !data.endDate) {
				return false;
			}
			return true;
		},
		{
			message: "End date is required for leave and other reasons",
			path: ["endDate"],
		}
	)
	.refine(
		(data) => {
			// Notes are required if reason is "other"
			if (
				data.reason === "other" &&
				(!data.notes || data.notes.trim() === "")
			) {
				return false;
			}
			return true;
		},
		{
			message: "Please provide notes explaining the reason",
			path: ["notes"],
		}
	)
	.refine(
		(data) => {
			// End date must be in the future
			if (data.endDate && data.endDate <= new Date()) {
				return false;
			}
			return true;
		},
		{
			message: "End date must be in the future",
			path: ["endDate"],
		}
	);

/**
 * TypeScript type inferred from the caretaker request schema
 */
export type CaretakerRequestFormData = z.infer<typeof caretakerRequestSchema>;
