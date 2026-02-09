import { z } from "zod";

/**
 * Zod schema for editing an existing user
 * Username is immutable and excluded from this schema
 */
export const userEditSchema = z.object({
  // Username is excluded - cannot be edited

  // Optional personal info fields (all optional for edit)
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
  // Image can be a File (new upload) or string (existing URL)
  image: z
    .union([
      z.instanceof(File).refine(
        (file) => file.size <= 5 * 1024 * 1024,
        "File must be less than 5MB"
      ).refine(
        (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
        "File must be JPG, PNG, or GIF"
      ),
      z.string(), // Existing image URL
    ])
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
  branch: z.number().optional(),

  businessArea: z.number().optional(),

  affiliation: z.number().optional(),
});

/**
 * TypeScript type inferred from the edit schema
 */
export type UserEditFormData = z.infer<typeof userEditSchema>;
