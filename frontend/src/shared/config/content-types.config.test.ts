import { describe, it, expect } from "vitest";
import { CONTENT_TYPE_CONFIGS } from "./content-types.config";

describe("CONTENT_TYPE_CONFIGS", () => {
	describe("Configuration validity", () => {
		it("should have valid configuration for all content types", () => {
			Object.entries(CONTENT_TYPE_CONFIGS).forEach(([type, config]) => {
				expect(config.fieldName, `${type} should have fieldName`).toBeTruthy();
				expect(
					config.queryKey,
					`${type} should have queryKey function`
				).toBeInstanceOf(Function);
				expect(
					config.invalidateKeys,
					`${type} should have invalidateKeys function`
				).toBeInstanceOf(Function);
				expect(
					config.updateFn,
					`${type} should have updateFn function`
				).toBeInstanceOf(Function);
				expect(
					config.defaultPlaceholder,
					`${type} should have defaultPlaceholder`
				).toBeTruthy();
				expect(
					config.defaultEmptyMessage,
					`${type} should have defaultEmptyMessage`
				).toBeTruthy();
			});
		});

		it("should have all expected content types", () => {
			const expectedTypes = [
				// Project fields
				"project-description",
				// External Project fields
				"external-project-description",
				"external-project-aims",
				"external-project-budget",
				"external-project-collaboration-with",
				// Concept Plan fields
				"concept-plan-background",
				"concept-plan-aims",
				"concept-plan-outcome",
				"concept-plan-collaborations",
				"concept-plan-strategic-context",
				"concept-plan-staff-time-allocation",
				"concept-plan-budget",
				// Project Plan fields
				"project-plan-background",
				"project-plan-aims",
				"project-plan-outcome",
				"project-plan-knowledge-transfer",
				"project-plan-project-tasks",
				"project-plan-listed-references",
				"project-plan-methodology",
				"project-plan-data-management",
				"project-plan-specimens",
				"project-plan-operating-budget",
				"project-plan-operating-budget-external",
				"project-plan-related-projects",
				// Progress Report fields
				"progress-report-context",
				"progress-report-aims",
				"progress-report-progress",
				"progress-report-implications",
				"progress-report-future",
				// Student Report fields
				"student-report-progress-report",
				// Project Closure fields
				"project-closure-intended-outcome",
				"project-closure-reason",
				"project-closure-scientific-outputs",
				"project-closure-knowledge-transfer",
				"project-closure-data-location",
				"project-closure-hardcopy-location",
				"project-closure-backup-location",
			];

			const actualTypes = Object.keys(CONTENT_TYPE_CONFIGS);
			expect(actualTypes).toHaveLength(expectedTypes.length);
			expectedTypes.forEach((type) => {
				expect(actualTypes).toContain(type);
			});
		});
	});

	describe("Query key generation", () => {
		it("should generate correct query keys for external project content types", () => {
			const config = CONTENT_TYPE_CONFIGS["external-project-aims"];
			expect(config.queryKey(123)).toEqual([
				"external-project-details",
				"detail",
				123,
			]);
		});

		it("should generate correct query keys for concept plan content types", () => {
			const config = CONTENT_TYPE_CONFIGS["concept-plan-background"];
			expect(config.queryKey(456)).toEqual(["concept-plans", "detail", 456]);
		});

		it("should generate correct query keys for project plan content types", () => {
			const config = CONTENT_TYPE_CONFIGS["project-plan-aims"];
			expect(config.queryKey(789)).toEqual(["project-plans", "detail", 789]);
		});

		it("should generate correct query keys for progress report content types", () => {
			const config = CONTENT_TYPE_CONFIGS["progress-report-context"];
			expect(config.queryKey(101)).toEqual(["progress-reports", "detail", 101]);
		});
	});

	describe("Invalidation key generation", () => {
		it("should generate correct invalidation keys for external project content types", () => {
			const config = CONTENT_TYPE_CONFIGS["external-project-description"];
			const keys = config.invalidateKeys(123);

			expect(keys).toContainEqual(["external-project-details", "detail", 123]);
			expect(keys).toContainEqual(["external-project-details"]);
			expect(keys).toContainEqual(["projects"]);
		});

		it("should generate correct invalidation keys for concept plan content types", () => {
			const config = CONTENT_TYPE_CONFIGS["concept-plan-aims"];
			const keys = config.invalidateKeys(456);

			expect(keys).toContainEqual(["concept-plans", "detail", 456]);
			expect(keys).toContainEqual(["concept-plans"]);
		});

		it("should generate correct invalidation keys for project plan content types", () => {
			const config = CONTENT_TYPE_CONFIGS["project-plan-outcome"];
			const keys = config.invalidateKeys(789);

			expect(keys).toContainEqual(["project-plans", "detail", 789]);
			expect(keys).toContainEqual(["project-plans"]);
		});

		it("should generate correct invalidation keys for progress report content types", () => {
			const config = CONTENT_TYPE_CONFIGS["progress-report-progress"];
			const keys = config.invalidateKeys(101);

			expect(keys).toContainEqual(["progress-reports", "detail", 101]);
			expect(keys).toContainEqual(["progress-reports"]);
		});
	});

	describe("Field name configuration", () => {
		it("should have correct field names", () => {
			expect(CONTENT_TYPE_CONFIGS["external-project-aims"].fieldName).toBe(
				"aims"
			);
			expect(
				CONTENT_TYPE_CONFIGS["external-project-description"].fieldName
			).toBe("description");
			expect(CONTENT_TYPE_CONFIGS["concept-plan-background"].fieldName).toBe(
				"background"
			);
			expect(
				CONTENT_TYPE_CONFIGS["project-plan-knowledge-transfer"].fieldName
			).toBe("knowledge_transfer");
			expect(CONTENT_TYPE_CONFIGS["progress-report-context"].fieldName).toBe(
				"context"
			);
		});
	});

	describe("Default messages", () => {
		it("should have non-empty placeholder messages", () => {
			Object.entries(CONTENT_TYPE_CONFIGS).forEach(([type, config]) => {
				expect(
					config.defaultPlaceholder.length,
					`${type} placeholder should not be empty`
				).toBeGreaterThan(0);
			});
		});

		it("should have non-empty empty messages", () => {
			Object.entries(CONTENT_TYPE_CONFIGS).forEach(([type, config]) => {
				expect(
					config.defaultEmptyMessage.length,
					`${type} empty message should not be empty`
				).toBeGreaterThan(0);
			});
		});
	});
});
