import { z } from "zod";

/**
 * Login form validation schema
 * Backend expects username field to contain an email address
 */
export const loginSchema = z.object({
	username: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
	password: z.string().min(1, "Please provide a password"),
});
