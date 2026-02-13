import { z } from "zod";
import { FILE_SIZE, ACCEPTED_FILE_TYPES } from "@/shared/constants";

/**
 * Zod schema for creating a new user
 * Validates all required and optional fields for user creation
 */
export const userCreateSchema = z.object({
	// Required fields
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(150, "Username must be less than 150 characters")
		.regex(
			/^[\w.@+-]+$/,
			"Username can only contain letters, numbers, and @/./+/-/_"
		),

	firstName: z
		.string()
		.min(1, "First name is required")
		.max(150, "First name must be less than 150 characters"),

	lastName: z
		.string()
		.min(1, "Last name is required")
		.max(150, "Last name must be less than 150 characters"),

	email: z
		.string()
		.email("Invalid email address")
		.max(254, "Email must be less than 254 characters"),

	// Optional personal info fields
	displayFirstName: z
		.string()
		.max(150, "Display first name must be less than 150 characters")
		.optional(),

	displayLastName: z
		.string()
		.max(150, "Display last name must be less than 150 characters")
		.optional(),

	title: z
		.string()
		.max(200, "Title must be less than 200 characters")
		.optional(),

	phone: z
		.string()
		.regex(/^[\d\s\-+()]*$/, "Invalid phone number format")
		.max(20, "Phone number must be less than 20 characters")
		.optional(),

	fax: z
		.string()
		.regex(/^[\d\s\-+()]*$/, "Invalid fax number format")
		.max(20, "Fax number must be less than 20 characters")
		.optional(),

	// Profile fields
	image: z
		.instanceof(File)
		.refine(
			(file) => file.size <= FILE_SIZE.MAX_IMAGE_SIZE,
			"File must be less than 5MB"
		)
		.refine(
			(file) => ACCEPTED_FILE_TYPES.IMAGES.includes(file.type as any),
			"File must be JPG, PNG, or GIF"
		)
		.optional()
		.nullable(),

	about: z
		.string()
		.max(5000, "About section must be less than 5000 characters")
		.optional(),

	expertise: z
		.string()
		.max(5000, "Expertise section must be less than 5000 characters")
		.optional(),

	// Membership fields
	isStaff: z.boolean().optional(),

	branch: z.number().optional(),

	businessArea: z.number().optional(),

	affiliation: z.number().optional(),
});

/**
 * TypeScript type inferred from the create schema
 */
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
