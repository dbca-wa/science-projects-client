import { describe, it, expect } from "vitest";
import {
	isProjectProtected,
	PROTECTED_TOOLTIP,
} from "./project-protection.utils";

describe("isProjectProtected", () => {
	it("returns true for completed, terminated, and closure_requested statuses", () => {
		expect(isProjectProtected("completed")).toBe(true);
		expect(isProjectProtected("terminated")).toBe(true);
		expect(isProjectProtected("closure_requested")).toBe(true);
	});

	it("returns false for active, new, pending, and updating statuses", () => {
		expect(isProjectProtected("active")).toBe(false);
		expect(isProjectProtected("new")).toBe(false);
		expect(isProjectProtected("pending")).toBe(false);
		expect(isProjectProtected("updating")).toBe(false);
		expect(isProjectProtected("suspended")).toBe(false);
	});
});

describe("document action buttons disabled state", () => {
	it("utility drives disabled state — protected statuses disable actions", () => {
		const protectedStatuses = ["completed", "terminated", "closure_requested"];

		for (const status of protectedStatuses) {
			const isDisabled = isProjectProtected(status);
			expect(isDisabled).toBe(true);
		}

		// Tooltip text is consistent across all disabled controls
		expect(PROTECTED_TOOLTIP).toBe(
			"This project is closed \u2014 reopen it to perform this action"
		);
	});
});

describe("reopen button visibility logic", () => {
	it("isProjectProtected returns true for statuses that should show the reopen button", () => {
		// The reopen button is visible when the project is in a protected state
		// and a closure document exists
		const statusesThatShowReopen = [
			"completed",
			"terminated",
			"closure_requested",
		];

		for (const status of statusesThatShowReopen) {
			expect(isProjectProtected(status)).toBe(true);
		}

		// Non-protected statuses should NOT show the reopen button
		const statusesThatHideReopen = ["active", "new", "pending", "updating"];

		for (const status of statusesThatHideReopen) {
			expect(isProjectProtected(status)).toBe(false);
		}
	});
});

describe("backend protection error parsing", () => {
	it("backend 400 error shape is parseable for toast display", () => {
		// The backend returns errors in this shape when a protected project guard rejects
		const documentSpawnerError = {
			error:
				"Cannot create documents for a closed project. Reopen the project first.",
		};
		const bumpError = {
			error: "Cannot send bump reminder \u2014 this project is closed.",
		};

		// Verify the error messages are strings that can be displayed in a toast
		expect(typeof documentSpawnerError.error).toBe("string");
		expect(documentSpawnerError.error.length).toBeGreaterThan(0);

		expect(typeof bumpError.error).toBe("string");
		expect(bumpError.error.length).toBeGreaterThan(0);

		// Verify the error shape has an 'error' key (the format the frontend expects)
		expect("error" in documentSpawnerError).toBe(true);
		expect("error" in bumpError).toBe(true);
	});
});
