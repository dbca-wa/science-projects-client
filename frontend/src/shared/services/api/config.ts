// API configuration - all in one place
import { TIMEOUT } from "@/shared/constants";

// In development the API runs on a different port, so we hardcode the dev URL.
// In production the API is served from the same origin as the frontend, so we
// use window.location.origin at runtime. This lets a single built image work
// across staging and prod without rebuilding (no baked-in URLs).
const getProductionApiUrl = (): string => {
	// Allow explicit override via build-time env var (for edge cases where the
	// frontend and backend are on different domains). Falls back to same-origin.
	const override = import.meta.env.VITE_PRODUCTION_BACKEND_API_URL;
	if (override) return override;
	if (typeof window !== "undefined") {
		return `${window.location.origin}/api/v1/`;
	}
	return "";
};

export const API_CONFIG = {
	BASE_URL:
		import.meta.env.MODE === "development"
			? "http://127.0.0.1:8000/api/v1/"
			: getProductionApiUrl(),
	TIMEOUT: TIMEOUT.DEFAULT,
} as const;
