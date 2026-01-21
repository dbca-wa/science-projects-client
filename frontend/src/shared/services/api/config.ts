// API configuration - all in one place
import { TIMEOUT } from "@/shared/constants";

export const API_CONFIG = {
	BASE_URL:
		import.meta.env.MODE === "development"
			? "http://127.0.0.1:8000/api/v1/"
			: import.meta.env.VITE_PRODUCTION_BACKEND_API_URL || "",
	TIMEOUT: TIMEOUT.DEFAULT,
} as const;
