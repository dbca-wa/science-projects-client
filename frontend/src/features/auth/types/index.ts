import type z from "zod";
import type { loginSchema } from "../schemas/auth.schema";

/**
 * TypeScript types inferred from schemas
 */
export type LoginFormData = z.infer<typeof loginSchema>;

export interface IUsernameLoginSuccess {
	ok: string;
}

export interface IUsernameLoginError {
	error: string;
	message: string;
}
