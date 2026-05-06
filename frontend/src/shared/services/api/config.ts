// API configuration - all in one place
import { TIMEOUT } from "@/shared/constants";

// In development the API runs on a different port, so we hardcode the dev URL.
// In production the API is served from the SPMS app domain (scienceprojects*),
// not from the public profiles domain (science-profiles*). We derive the SPMS
// origin from the current origin at runtime so one built image works in both
// staging and production without rebuilding.
//
// Ingress routes:
//   scienceprojects-test.dbca.wa.gov.au/api -> backend
//   science-profiles-test.dbca.wa.gov.au/api -> DOES NOT EXIST (frontend only)
//
// So when the user is on the profiles domain, we send API calls back to the
// SPMS domain by replacing "science-profiles" with "scienceprojects".
const getProductionApiUrl = (): string => {
	if (typeof window !== "undefined") {
		const spmsOrigin = window.location.origin.replace(
			"science-profiles",
			"scienceprojects"
		);
		return `${spmsOrigin}/api/v1/`;
	}
	// Non-browser context (tests, SSR) — no API URL available
	return "";
};

export const API_CONFIG = {
	BASE_URL:
		import.meta.env.MODE === "development"
			? "http://127.0.0.1:8000/api/v1/"
			: getProductionApiUrl(),
	TIMEOUT: TIMEOUT.DEFAULT,
} as const;
