import { describe, it, expect } from "vitest";
import { sanitiseFormData } from "./form-sanitisation.utils";

describe("form-sanitisation.utils", () => {
	describe("sanitiseFormData", () => {
		it("should sanitise plain text fields by removing all HTML", () => {
			const data = {
				name: '<script>alert("XSS")</script>John',
				email: "test@example.com",
			};
			const result = sanitiseFormData(data);
			expect(result.name).toBe("John");
			expect(result.name).not.toContain("script");
			expect(result.email).toBe("test@example.com");
		});

		it("should preserve safe HTML in rich text fields", () => {
			const data = {
				name: '<script>alert("XSS")</script>John',
				about: "<p>Hello <strong>world</strong></p>",
			};
			const result = sanitiseFormData(data, ["about"]);
			expect(result.name).toBe("John");
			expect(result.about).toContain("<p>");
			expect(result.about).toContain("<strong>");
		});

		it("should remove malicious content from rich text fields", () => {
			const data = {
				about: '<p>Safe text</p><script>alert("XSS")</script>',
			};
			const result = sanitiseFormData(data, ["about"]);
			expect(result.about).toContain("<p>Safe text</p>");
			expect(result.about).not.toContain("script");
		});

		it("should leave non-string values unchanged", () => {
			const data = {
				name: "John",
				age: 25,
				active: true,
				score: null,
				metadata: undefined,
			};
			const result = sanitiseFormData(data);
			expect(result.name).toBe("John");
			expect(result.age).toBe(25);
			expect(result.active).toBe(true);
			expect(result.score).toBe(null);
			expect(result.metadata).toBe(undefined);
		});

		it("should handle empty rich text fields array", () => {
			const data = {
				name: '<script>alert("XSS")</script>John',
				about: "<p>Text</p>",
			};
			const result = sanitiseFormData(data, []);
			expect(result.name).toBe("John");
			expect(result.about).toBe("Text"); // All HTML removed
		});

		it("should handle multiple rich text fields", () => {
			const data = {
				name: "John",
				about: "<p>About <strong>me</strong></p>",
				expertise: "<p>My <em>skills</em></p>",
			};
			const result = sanitiseFormData(data, ["about", "expertise"]);
			expect(result.name).toBe("John");
			expect(result.about).toContain("<strong>");
			expect(result.expertise).toContain("<em>");
		});

		it("should handle objects with no string fields", () => {
			const data = {
				count: 42,
				enabled: false,
			};
			const result = sanitiseFormData(data);
			expect(result.count).toBe(42);
			expect(result.enabled).toBe(false);
		});

		it("should handle empty object", () => {
			const data = {};
			const result = sanitiseFormData(data);
			expect(result).toEqual({});
		});

		it("should remove event handlers from rich text", () => {
			const data = {
				about: '<p onclick="alert(1)">Click me</p>',
			};
			const result = sanitiseFormData(data, ["about"]);
			expect(result.about).not.toContain("onclick");
			expect(result.about).toContain("<p>");
		});

		it("should remove dangerous protocols from rich text", () => {
			const data = {
				about: '<a href="javascript:alert(1)">Link</a>',
			};
			const result = sanitiseFormData(data, ["about"]);
			expect(result.about).not.toContain("javascript:");
		});

		it("should preserve type safety", () => {
			const data = {
				name: "John<script>",
				age: 25,
				about: "<p>Text</p>",
			};

			const result = sanitiseFormData(data, ["about"]);

			// Verify the result maintains correct types
			expect(typeof result.name).toBe("string");
			expect(typeof result.age).toBe("number");
			expect(typeof result.about).toBe("string");

			expect(result.name).toBe("John");
			expect(result.age).toBe(25);
			expect(result.about).toContain("<p>");
		});
	});
});
