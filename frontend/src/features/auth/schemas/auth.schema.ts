import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Invalid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
});

/**
 * Register form validation schema
 */
export const registerSchema = z
	.object({
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
			.min(1, "Email is required")
			.email("Invalid email address"),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number"
			),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

/**
 * TypeScript types inferred from schemas
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
