import { describe, it, expect, afterEach } from "vitest";
import { getCsrfCookieName } from "./auth";

/**
 * getCsrfCookieName resolves the CSRF cookie name from the current host.
 * A single bundle serves every environment, so the staging and production
 * hosts (which share the .dbca.wa.gov.au parent domain) must be told apart at
 * runtime — staging first, since staging hosts also end with .dbca.wa.gov.au.
 */

const originalLocation = window.location;

const setHostname = (hostname: string) => {
	Object.defineProperty(window, "location", {
		configurable: true,
		value: { ...originalLocation, hostname },
	});
};

afterEach(() => {
	Object.defineProperty(window, "location", {
		configurable: true,
		value: originalLocation,
	});
});

describe("getCsrfCookieName", () => {
	it("returns the staging name on the staging app host", () => {
		setHostname("scienceprojects-test.dbca.wa.gov.au");
		expect(getCsrfCookieName()).toBe("spms_test_csrf");
	});

	it("returns the staging name on the staging profiles host", () => {
		setHostname("science-profiles-test.dbca.wa.gov.au");
		expect(getCsrfCookieName()).toBe("spms_test_csrf");
	});

	it("returns the production name on the production app host", () => {
		setHostname("scienceprojects.dbca.wa.gov.au");
		expect(getCsrfCookieName()).toBe("spmscsrf");
	});

	it("returns the production name on the production profiles host", () => {
		setHostname("science-profiles.dbca.wa.gov.au");
		expect(getCsrfCookieName()).toBe("spmscsrf");
	});

	it("returns the development name on localhost", () => {
		setHostname("localhost");
		expect(getCsrfCookieName()).toBe("spms_dev_csrf");
	});

	it("returns the development name on 127.0.0.1", () => {
		setHostname("127.0.0.1");
		expect(getCsrfCookieName()).toBe("spms_dev_csrf");
	});
});
