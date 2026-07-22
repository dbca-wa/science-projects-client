/**
 * Authentication cookie helpers.
 *
 * Single source of truth for the cookie names the frontend reads or clears,
 * kept in sync with the backend's Django settings.
 *
 * The session cookie is intentionally absent: it is HttpOnly (and, in staging
 * and production, scoped to the shared .dbca.wa.gov.au domain), so JavaScript
 * cannot read or remove it. The backend expires it on logout; the frontend
 * never touches it.
 */

/**
 * CSRF cookie name per environment. Must mirror CSRF_COOKIE_NAMES in the
 * backend settings. Staging and production share the .dbca.wa.gov.au parent
 * domain, so they use distinct names to stop one environment's cookie from
 * clobbering the other's. Production keeps the historical "spmscsrf" name so
 * existing sessions aren't disrupted.
 */
const CSRF_COOKIE_NAMES = {
	development: "spms_dev_csrf",
	staging: "spms_test_csrf",
	production: "spmscsrf",
} as const;

/**
 * Resolve the CSRF cookie name for the current environment.
 *
 * A single built bundle serves every environment, so the name is resolved at
 * runtime from the browser host rather than at build time. The staging check
 * must come first because staging hosts also end with ".dbca.wa.gov.au".
 */
export const getCsrfCookieName = (): string => {
	if (typeof window !== "undefined") {
		const host = window.location.hostname;
		if (host.includes("-test.dbca.wa.gov.au")) {
			return CSRF_COOKIE_NAMES.staging;
		}
		if (host.endsWith(".dbca.wa.gov.au")) {
			return CSRF_COOKIE_NAMES.production;
		}
	}
	return CSRF_COOKIE_NAMES.development;
};

export const AUTH_COOKIES = {
	/**
	 * Legacy CSRF cookie name from earlier versions. Cleared on logout so a
	 * stale cookie doesn't linger in the browser.
	 */
	LEGACY_CSRF: "csrf",
} as const;
