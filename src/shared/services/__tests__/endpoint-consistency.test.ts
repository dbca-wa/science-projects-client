/**
 * Endpoint Consistency Test
 *
 * Verifies that all API endpoint strings follow the no-trailing-slash convention.
 * This test ensures consistency with the backend Django configuration (APPEND_SLASH=False).
 */

import { describe, it, expect } from "vitest";
import { USER_ENDPOINTS } from "@/features/users/services/user.endpoints";
import { CARETAKER_ENDPOINTS } from "@/features/caretakers/services/caretaker.endpoints";
import { AUTH_ENDPOINTS } from "@/features/auth/services/auth.endpoints";

describe("Endpoint Consistency", () => {
	describe("No Trailing Slashes", () => {
		it("should not have trailing slashes in USER_ENDPOINTS", () => {
			// Check static endpoints
			expect(USER_ENDPOINTS.LIST).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.ME).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.SEARCH).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.CREATE).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.CHECK_EMAIL_EXISTS).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.REQUEST_MERGE).not.toMatch(/\/$/);

			// Check dynamic endpoints
			expect(USER_ENDPOINTS.DETAIL(1)).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.PERSONAL_INFO(1)).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.PROFILE(1)).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.MEMBERSHIP(1)).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.REMOVE_AVATAR(1)).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.TOGGLE_ADMIN(1)).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.TOGGLE_ACTIVE(1)).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.DELETE(1)).not.toMatch(/\/$/);
			expect(USER_ENDPOINTS.TOGGLE_STAFF_PROFILE_VISIBILITY(1)).not.toMatch(
				/\/$/
			);
		});

		it("should not have trailing slashes in CARETAKER_ENDPOINTS", () => {
			// Check static endpoints
			expect(CARETAKER_ENDPOINTS.LIST).not.toMatch(/\/$/);
			expect(CARETAKER_ENDPOINTS.CREATE).not.toMatch(/\/$/);
			expect(CARETAKER_ENDPOINTS.REQUESTS_CREATE).not.toMatch(/\/$/);
			expect(CARETAKER_ENDPOINTS.CHECK).not.toMatch(/\/$/);
			expect(CARETAKER_ENDPOINTS.ADMIN_SET).not.toMatch(/\/$/);

			// Check dynamic endpoints
			expect(CARETAKER_ENDPOINTS.DETAIL(1)).not.toMatch(/\/$/);
			expect(CARETAKER_ENDPOINTS.UPDATE(1)).not.toMatch(/\/$/);
			expect(CARETAKER_ENDPOINTS.DELETE(1)).not.toMatch(/\/$/);
			expect(CARETAKER_ENDPOINTS.REQUESTS_APPROVE(1)).not.toMatch(/\/$/);
			expect(CARETAKER_ENDPOINTS.REQUESTS_REJECT(1)).not.toMatch(/\/$/);
			expect(CARETAKER_ENDPOINTS.REQUESTS_CANCEL(1)).not.toMatch(/\/$/);

			// Note: REQUESTS_LIST has query params, so we check before the '?'
			const requestsList = CARETAKER_ENDPOINTS.REQUESTS_LIST(1);
			const beforeQuery = requestsList.split("?")[0];
			expect(beforeQuery).not.toMatch(/\/$/);
		});

		it("should not have trailing slashes in AUTH_ENDPOINTS", () => {
			expect(AUTH_ENDPOINTS.ME).not.toMatch(/\/$/);
			expect(AUTH_ENDPOINTS.LOGIN).not.toMatch(/\/$/);
			expect(AUTH_ENDPOINTS.LOGOUT).not.toMatch(/\/$/);
		});
	});

	describe("Endpoint Format", () => {
		it("should use consistent path format (no leading slash)", () => {
			// Endpoints should not start with '/' as the API client adds the base URL
			expect(USER_ENDPOINTS.LIST).not.toMatch(/^\//);
			expect(USER_ENDPOINTS.ME).not.toMatch(/^\//);
			expect(CARETAKER_ENDPOINTS.LIST).not.toMatch(/^\//);
			expect(AUTH_ENDPOINTS.ME).not.toMatch(/^\//);
		});

		it("should use lowercase paths", () => {
			// API paths should be lowercase
			expect(USER_ENDPOINTS.LIST).toBe(USER_ENDPOINTS.LIST.toLowerCase());
			expect(USER_ENDPOINTS.ME).toBe(USER_ENDPOINTS.ME.toLowerCase());
			expect(CARETAKER_ENDPOINTS.LIST).toBe(
				CARETAKER_ENDPOINTS.LIST.toLowerCase()
			);
		});
	});

	describe("Dynamic Endpoint Functions", () => {
		it("should generate correct paths with IDs", () => {
			// Test with number ID
			expect(USER_ENDPOINTS.DETAIL(123)).toBe("users/123");
			expect(CARETAKER_ENDPOINTS.DETAIL(456)).toBe("caretakers/456");

			// Test with string ID
			expect(USER_ENDPOINTS.DETAIL("123")).toBe("users/123");
		});

		it("should generate correct nested paths", () => {
			expect(USER_ENDPOINTS.PERSONAL_INFO(1)).toBe("users/1/pi");
			expect(USER_ENDPOINTS.PROFILE(1)).toBe("users/1/profile");
			expect(USER_ENDPOINTS.MEMBERSHIP(1)).toBe("users/1/membership");
			expect(CARETAKER_ENDPOINTS.REQUESTS_APPROVE(1)).toBe(
				"caretakers/requests/1/approve"
			);
		});
	});
});
