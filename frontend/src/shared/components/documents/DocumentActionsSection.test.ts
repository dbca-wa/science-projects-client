/**
 * Source-code analysis tests for DocumentActionsSection.
 *
 * Verifies that the canGeneratePdf memo returns true for any
 * authenticated user, not just superusers or project leads.
 */

import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const SOURCE_PATH = path.resolve(__dirname, "DocumentActionsSection.tsx");
const source = fs.readFileSync(SOURCE_PATH, "utf-8");

describe("DocumentActionsSection — canGeneratePdf source analysis", () => {
	it("canGeneratePdf should return true for any authenticated user (!!currentUser)", () => {
		// Extract the canGeneratePdf useMemo block
		const memoPattern =
			/const canGeneratePdf\s*=\s*useMemo\(\s*\(\)\s*=>\s*\{([^}]+)\}/s;
		const match = source.match(memoPattern);

		expect(match).not.toBeNull();

		const memoBody = match![1];

		// Should contain !!currentUser (the simplified check)
		expect(memoBody).toContain("!!currentUser");

		// Should NOT restrict to superuser
		expect(memoBody).not.toContain("is_superuser");

		// Should NOT restrict to project lead
		expect(memoBody).not.toContain("isProjectLead");
	});

	it("canGeneratePdf dependency array should only depend on currentUser", () => {
		// Match the full canGeneratePdf useMemo including its dependency array
		const fullMemoPattern =
			/const canGeneratePdf\s*=\s*useMemo\(\s*\(\)\s*=>\s*\{[^}]+\},\s*\[([^\]]*)\]\s*\)/s;
		const match = source.match(fullMemoPattern);

		expect(match).not.toBeNull();

		const deps = match![1].trim();

		// Should only depend on currentUser
		expect(deps).toBe("currentUser");
	});
});
