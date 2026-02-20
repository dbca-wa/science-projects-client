/**
 * Accessibility tests for HowTo page
 * Tests WCAG 2.2 Level AA compliance using axe-core
 */

import { describe, it, expect } from "vitest";
import { renderPage, testAccessibility } from "@/test/page-test-utils";
import HowTo from "./HowTo";

describe("HowTo Page - Accessibility", () => {
	it("should have no accessibility violations", async () => {
		const { container } = renderPage(<HowTo />);
		const results = await testAccessibility(container);
		expect(results).toHaveNoViolations();
	});
});
