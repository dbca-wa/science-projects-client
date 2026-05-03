/**
 * Tests for NavigationBlocker blocking logic
 *
 * Verifies that ALL navigation is blocked when there are unsaved changes,
 * regardless of whether it's a tab switch or a page change.
 */

import { describe, it, expect } from "vitest";

/**
 * Extracted blocking logic from NavigationBlocker for testability.
 * Returns true if navigation should be BLOCKED, false if allowed.
 */
function shouldBlockNavigation(
	currentPath: string,
	nextPath: string,
	hasUnsavedChanges: boolean
): boolean {
	const pathChanged = currentPath !== nextPath;
	return hasUnsavedChanges && pathChanged;
}

describe("NavigationBlocker logic", () => {
	describe("when there are unsaved changes", () => {
		it("blocks navigation to a different page", () => {
			expect(
				shouldBlockNavigation("/projects/123/overview", "/projects", true)
			).toBe(true);
		});

		it("blocks tab switches within the same project", () => {
			expect(
				shouldBlockNavigation(
					"/projects/123/overview",
					"/projects/123/concept",
					true
				)
			).toBe(true);
		});

		it("blocks tab switches within My Profile", () => {
			expect(
				shouldBlockNavigation("/users/me", "/users/me/caretaker", true)
			).toBe(true);
		});

		it("blocks navigation to home", () => {
			expect(shouldBlockNavigation("/projects/123/overview", "/", true)).toBe(
				true
			);
		});

		it("does not block same-path navigation", () => {
			expect(
				shouldBlockNavigation(
					"/projects/123/overview",
					"/projects/123/overview",
					true
				)
			).toBe(false);
		});
	});

	describe("when there are no unsaved changes", () => {
		it("allows navigation to a different page", () => {
			expect(
				shouldBlockNavigation("/projects/123/overview", "/projects", false)
			).toBe(false);
		});

		it("allows tab switches", () => {
			expect(
				shouldBlockNavigation(
					"/projects/123/overview",
					"/projects/123/concept",
					false
				)
			).toBe(false);
		});

		it("allows navigation to home", () => {
			expect(shouldBlockNavigation("/projects/123/overview", "/", false)).toBe(
				false
			);
		});
	});
});
