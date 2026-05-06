/**
 * Build the URL for the public staff-profiles site based on the current origin.
 *
 * The profiles site lives on a different subdomain than the SPMS app:
 *   SPMS prod:      scienceprojects.dbca.wa.gov.au
 *   Profiles prod:  science-profiles.dbca.wa.gov.au
 *   SPMS staging:   scienceprojects-test.dbca.wa.gov.au
 *   Profiles staging: science-profiles-test.dbca.wa.gov.au
 *
 * We derive the profiles origin by replacing "scienceprojects" with
 * "science-profiles" in the current hostname. This keeps a single built image
 * environment-agnostic.
 */
export const getProfilesOrigin = (): string => {
	if (typeof window === "undefined") {
		return "";
	}
	return window.location.origin.replace("scienceprojects", "science-profiles");
};

/**
 * Build an absolute URL to a profiles-site path (e.g. "/staff/123").
 */
export const getProfilesUrl = (path: string): string => {
	const origin = getProfilesOrigin();
	if (!origin) return path;
	const normalised = path.startsWith("/") ? path : `/${path}`;
	return `${origin}${normalised}`;
};
