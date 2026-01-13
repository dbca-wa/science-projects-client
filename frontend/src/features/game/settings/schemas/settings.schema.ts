import { z } from "zod";

/**
 * Settings form validation schema
 */
export const settingsSchema = z.object({
	// User preferences
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(20, "Username must be less than 20 characters")
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			"Username can only contain letters, numbers, underscores, and hyphens"
		),

	email: z
		.string()
		.email("Invalid email address")
		.min(1, "Email is required"),

	// Game preferences
	defaultDifficulty: z.enum(["easy", "normal", "hard"], {
		message: "Please select a difficulty",
	}),

	soundEnabled: z.boolean(),

	// UI preferences
	theme: z.enum(["light", "dark"], {
		message: "Please select a theme",
	}),
});

/**
 * TypeScript type inferred from schema
 */
export type SettingsFormData = z.infer<typeof settingsSchema>;
