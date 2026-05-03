import { describe, it, expect } from "vitest";
import { extractUserFriendlyMessage } from "./error.utils";

describe("error.utils", () => {
	describe("extractUserFriendlyMessage", () => {
		it("should extract message from JSON error response", () => {
			const error = {
				name: "Error",
				message: "Request failed",
				response: {
					data: {
						message: "Invalid project ID",
					},
				},
			} as unknown as Error;

			expect(extractUserFriendlyMessage(error)).toBe("Invalid project ID");
		});

		it("should strip HTML tags from error message", () => {
			const error = {
				name: "Error",
				message:
					"<html><body><h1>Error 500</h1><p>Server error occurred</p></body></html>",
			} as Error;

			expect(extractUserFriendlyMessage(error)).toBe(
				"Error 500Server error occurred"
			);
		});

		it("should limit message length to 200 characters", () => {
			const longMessage = "A".repeat(250);
			const error = {
				name: "Error",
				message: longMessage,
			} as Error;

			const result = extractUserFriendlyMessage(error);
			expect(result.length).toBeLessThanOrEqual(200);
			expect(result).toContain("...");
		});

		it("should decode HTML entities", () => {
			const error = {
				name: "Error",
				message: "User &quot;John&quot; &amp; &quot;Jane&quot;",
			} as Error;

			expect(extractUserFriendlyMessage(error)).toBe('User "John" & "Jane"');
		});

		it("should use fallback message when extraction fails", () => {
			const error = {
				name: "Error",
				message: "",
			} as Error;

			expect(extractUserFriendlyMessage(error)).toBe(
				"An error occurred. Please try again."
			);
		});

		it("should use custom fallback message", () => {
			const error = {
				name: "Error",
				message: "",
			} as Error;

			expect(extractUserFriendlyMessage(error, "Custom fallback")).toBe(
				"Custom fallback"
			);
		});

		it("should handle error.detail field", () => {
			const error = {
				name: "Error",
				message: "Request failed",
				response: {
					data: {
						detail: "Project not found",
					},
				},
			} as unknown as Error;

			expect(extractUserFriendlyMessage(error)).toBe("Project not found");
		});

		it("should handle non_field_errors array", () => {
			const error = {
				name: "Error",
				message: "Request failed",
				response: {
					data: {
						non_field_errors: ["Validation failed", "Another error"],
					},
				},
			} as unknown as Error;

			expect(extractUserFriendlyMessage(error)).toBe("Validation failed");
		});

		it("should handle HTML string in response data", () => {
			const error = {
				name: "Error",
				message: "Request failed",
				response: {
					data: "<html><body>404 Not Found</body></html>",
				},
			} as unknown as Error;

			expect(extractUserFriendlyMessage(error)).toBe("404 Not Found");
		});
	});
});
