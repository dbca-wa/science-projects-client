/**
 * Axe-core test utilities for accessibility testing
 *
 * Provides utilities for running axe-core automated accessibility tests
 * configured for WCAG 2.2 Level AA compliance.
 */

import { configureAxe, type JestAxeConfigureOptions } from "jest-axe";
import type { Result as AxeResult, RunOptions, Spec } from "axe-core";

/**
 * WCAG 2.2 Level AA configuration for axe-core
 */
export const WCAG_22_AA_CONFIG: RunOptions = {
	runOnly: {
		type: "tag",
		values: [
			"wcag2a",
			"wcag2aa",
			"wcag21a",
			"wcag21aa",
			"wcag22aa", // WCAG 2.2 Level AA
		],
	},
	rules: {
		// Enable all WCAG 2.2 AA rules
		"color-contrast": { enabled: true },
		"valid-lang": { enabled: true },
		"html-has-lang": { enabled: true },
		"landmark-one-main": { enabled: true },
		"page-has-heading-one": { enabled: true },
		region: { enabled: true },
		bypass: { enabled: true },
		"focus-order-semantics": { enabled: true },
		"target-size": { enabled: true }, // WCAG 2.2
	},
};

/**
 * Configure axe for testing with WCAG 2.2 Level AA rules
 */
export const axe = configureAxe({
	...WCAG_22_AA_CONFIG,
	// Additional configuration
	elementRef: true, // Include element references in results
	resultTypes: ["violations", "incomplete"], // Include violations and incomplete tests
} as JestAxeConfigureOptions);

/**
 * Axe violation with enhanced information
 */
export interface AxeViolation {
	id: string;
	impact: "critical" | "serious" | "moderate" | "minor";
	description: string;
	help: string;
	helpUrl: string;
	tags: string[];
	nodes: Array<{
		target: string[];
		html: string;
		failureSummary: string;
		impact: "critical" | "serious" | "moderate" | "minor";
	}>;
}

/**
 * Processed axe test results
 */
export interface ProcessedAxeResults {
	violations: AxeViolation[];
	violationCount: number;
	criticalCount: number;
	seriousCount: number;
	moderateCount: number;
	minorCount: number;
	wcagCriteria: Set<string>;
}

/**
 * Process axe-core results into structured format
 */
export function processAxeResults(results: AxeResult): ProcessedAxeResults {
	const violations: AxeViolation[] = results.violations.map((violation) => ({
		id: violation.id,
		impact: violation.impact as "critical" | "serious" | "moderate" | "minor",
		description: violation.description,
		help: violation.help,
		helpUrl: violation.helpUrl,
		tags: violation.tags,
		nodes: violation.nodes.map((node) => ({
			target: node.target,
			html: node.html,
			failureSummary: node.failureSummary || "",
			impact: node.impact as "critical" | "serious" | "moderate" | "minor",
		})),
	}));

	// Count violations by severity
	const criticalCount = violations.filter(
		(v) => v.impact === "critical"
	).length;
	const seriousCount = violations.filter((v) => v.impact === "serious").length;
	const moderateCount = violations.filter(
		(v) => v.impact === "moderate"
	).length;
	const minorCount = violations.filter((v) => v.impact === "minor").length;

	// Extract WCAG criteria from tags
	const wcagCriteria = new Set<string>();
	violations.forEach((violation) => {
		violation.tags.forEach((tag) => {
			if (tag.startsWith("wcag")) {
				wcagCriteria.add(tag);
			}
		});
	});

	return {
		violations,
		violationCount: violations.length,
		criticalCount,
		seriousCount,
		moderateCount,
		minorCount,
		wcagCriteria,
	};
}

/**
 * Format axe violation for reporting
 */
export function formatViolation(violation: AxeViolation): string {
	const lines: string[] = [];

	lines.push(`\n${violation.id} (${violation.impact})`);
	lines.push(`Description: ${violation.description}`);
	lines.push(`Help: ${violation.help}`);
	lines.push(`URL: ${violation.helpUrl}`);
	lines.push(
		`WCAG: ${violation.tags.filter((t) => t.startsWith("wcag")).join(", ")}`
	);
	lines.push(`\nAffected elements (${violation.nodes.length}):`);

	violation.nodes.forEach((node, index) => {
		lines.push(`\n  ${index + 1}. ${node.target.join(" > ")}`);
		lines.push(
			`     ${node.html.substring(0, 100)}${node.html.length > 100 ? "..." : ""}`
		);
		if (node.failureSummary) {
			lines.push(`     ${node.failureSummary}`);
		}
	});

	return lines.join("\n");
}

/**
 * Format processed results summary
 */
export function formatResultsSummary(results: ProcessedAxeResults): string {
	const lines: string[] = [];

	lines.push("\n=== Accessibility Test Results ===");
	lines.push(`Total Violations: ${results.violationCount}`);
	lines.push(`  Critical: ${results.criticalCount}`);
	lines.push(`  Serious: ${results.seriousCount}`);
	lines.push(`  Moderate: ${results.moderateCount}`);
	lines.push(`  Minor: ${results.minorCount}`);
	lines.push(
		`\nWCAG Criteria Affected: ${Array.from(results.wcagCriteria).join(", ")}`
	);

	return lines.join("\n");
}

/**
 * Custom matcher for jest-axe that provides better error messages
 */
export function expectNoViolations(results: AxeResult): void {
	const processed = processAxeResults(results);

	if (processed.violationCount > 0) {
		const summary = formatResultsSummary(processed);
		const violations = processed.violations.map(formatViolation).join("\n");

		throw new Error(`${summary}\n${violations}`);
	}
}
