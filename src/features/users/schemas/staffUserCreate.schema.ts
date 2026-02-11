import { z } from "zod";

export const staffUserCreateSchema = z
	.object({
		firstName: z
			.string()
			.min(2, "First name must be at least 2 characters")
			.max(30, "First name must be at most 30 characters")
			.regex(
				/^[A-Za-z\- ]+$/,
				"First name should only contain alphabetic characters, spaces, and hyphens"
			),

		lastName: z
			.string()
			.min(2, "Last name must be at least 2 characters")
			.max(30, "Last name must be at most 30 characters")
			.regex(
				/^[A-Za-z\- ]+$/,
				"Last name should only contain alphabetic characters, spaces, and hyphens"
			),

		email: z
			.string()
			.email("Please enter a valid email address")
			.min(5, "Email must be at least 5 characters")
			.max(50, "Email must be at most 50 characters")
			.refine(
				(email) => email.endsWith("@dbca.wa.gov.au"),
				"Needs to be a DBCA address."
			),

		confirmEmail: z.string().email("Please enter a valid email address"),

		branch: z.number().refine((val) => val !== undefined, {
			message: "Branch is required",
		}),

		businessArea: z.number().refine((val) => val !== undefined, {
			message: "Business area is required",
		}),
	})
	.refine((data) => data.email === data.confirmEmail, {
		message: "Email and Confirm Email must match",
		path: ["confirmEmail"],
	});

export type StaffUserCreateFormData = z.infer<typeof staffUserCreateSchema>;
