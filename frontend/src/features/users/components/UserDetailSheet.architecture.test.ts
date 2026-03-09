/**
 * Bug Condition Exploration Test - Architecture Violation Detection
 *
 * Property 1: Bug Condition - Cross-Domain Import Violation
 *
 * CRITICAL: This test MUST FAIL on unfixed code
 *
 * This test detects the architectural violation where UserDetailSheet
 * imports from the projects feature, violating the principle that
 * platform features (users) should not depend on domain features (projects).
 *
 * Expected behavior:
 * - BEFORE FIX: Test FAILS (confirms violation exists)
 * - AFTER FIX: Test PASSES (confirms violation is resolved)
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("UserDetailSheet Architecture - Bug Condition Exploration", () => {
	it("should NOT import from projects feature (cross-domain violation)", () => {
		// Read the UserDetailSheet source file
		const filePath = join(__dirname, "UserDetailSheet.tsx");
		const fileContent = readFileSync(filePath, "utf-8");

		// Check for imports from @/features/projects/
		const projectsImportPattern = /from\s+["']@\/features\/projects\//g;
		const matches = fileContent.match(projectsImportPattern);

		// Document violations if found
		if (matches) {
			const lines = fileContent.split("\n");
			const violations: string[] = [];

			lines.forEach((line, index) => {
				if (line.includes("@/features/projects/")) {
					violations.push(`Line ${index + 1}: ${line.trim()}`);
				}
			});

			console.log("\n=== ARCHITECTURAL VIOLATIONS DETECTED ===");
			console.log("UserDetailSheet imports from projects feature:");
			violations.forEach((v) => console.log(`  ${v}`));
			console.log("=========================================\n");
		}

		// Assert: UserDetailSheet should NOT import from projects feature
		// This enforces the architectural rule that platform features (users)
		// should not depend on domain features (projects)
		expect(
			matches,
			"UserDetailSheet (platform feature) must not import from projects (domain feature). " +
				"Platform features should be independent of domain features. " +
				"Move shared components to @/shared/ instead."
		).toBeNull();
	});

	it("should only import from allowed sources (shared, users, auth)", () => {
		const filePath = join(__dirname, "UserDetailSheet.tsx");
		const fileContent = readFileSync(filePath, "utf-8");

		// Extract all import statements
		const importPattern = /import\s+.*?\s+from\s+["'](@\/[^"']+)["']/g;
		const imports = [...fileContent.matchAll(importPattern)];

		const violations: string[] = [];

		imports.forEach((match) => {
			const importPath = match[1];

			// Allowed import sources for users feature
			const isAllowed =
				importPath.startsWith("@/shared/") ||
				importPath.startsWith("@/features/users/") ||
				importPath.startsWith("@/features/auth/") ||
				importPath.startsWith("@/features/caretakers/") || // Acceptable for now
				importPath.startsWith("@/app/");

			if (!isAllowed) {
				violations.push(importPath);
			}
		});

		if (violations.length > 0) {
			console.log("\n=== DISALLOWED IMPORTS ===");
			violations.forEach((v) => console.log(`  ${v}`));
			console.log("==========================\n");
		}

		expect(
			violations,
			"UserDetailSheet should only import from shared, users, auth, or app layers"
		).toHaveLength(0);
	});
});
