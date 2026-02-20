#!/usr/bin/env node
/**
 * Accessibility Scanner
 *
 * Comprehensive accessibility scanner for React/TypeScript components.
 * Checks for WCAG 2.2 Level AA compliance and semantic HTML issues.
 *
 * Usage:
 *   node scanner.js <file1> <file2> ...
 *   node scanner.js --all
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load configuration from package.json
function loadConfig() {
	try {
		const packageJson = JSON.parse(
			readFileSync(resolve(process.cwd(), "package.json"), "utf-8")
		);
		return (
			packageJson.accessibility || {
				enabled: true,
				severity: "warning",
				rules: [
					"semantic-html",
					"aria-attributes",
					"keyboard-navigation",
					"form-labels",
					"alt-text",
					"heading-hierarchy",
				],
			}
		);
	} catch (error) {
		console.error("Error loading accessibility config:", error.message);
		return { enabled: true, severity: "warning", rules: [] };
	}
}

// Check if scanner is enabled
const config = loadConfig();
if (!config.enabled) {
	console.log(
		"ℹ Accessibility scanner is disabled (set enabled: true in package.json)"
	);
	process.exit(0);
}

// Scan results storage
const results = {
	files: 0,
	violations: [],
	warnings: [],
};

/**
 * Accessibility Rules
 * Each rule checks for specific WCAG violations
 */
const rules = {
	"semantic-html": {
		name: "Semantic HTML",
		checks: [
			{
				pattern: /<div[^>]*onClick(?![^>]*role=)/i,
				message: 'Interactive div should use <button> or have role="button"',
				wcag: "4.1.2 Name, Role, Value (Level A)",
				severity: "high",
			},
			{
				pattern: /<span[^>]*onClick(?![^>]*role=)/i,
				message: 'Interactive span should use <button> or have role="button"',
				wcag: "4.1.2 Name, Role, Value (Level A)",
				severity: "high",
			},
			{
				pattern: /<div[^>]*href=/i,
				message: "Div with href should use <a> element instead",
				wcag: "4.1.2 Name, Role, Value (Level A)",
				severity: "high",
			},
		],
	},

	"aria-attributes": {
		name: "ARIA Attributes",
		checks: [
			{
				pattern: /aria-labeledby=/i,
				message: 'Use aria-labelledby (double "l") not aria-labeledby',
				wcag: "4.1.2 Name, Role, Value (Level A)",
				severity: "medium",
			},
			{
				pattern: /<[^>]*aria-label=""\s*[^>]*>/i,
				message: "Empty aria-label provides no information",
				wcag: "4.1.2 Name, Role, Value (Level A)",
				severity: "medium",
			},
		],
	},

	"keyboard-navigation": {
		name: "Keyboard Navigation",
		checks: [
			{
				pattern: /tabIndex=["']?[1-9]\d*["']?/i,
				message: "Avoid positive tabIndex values (use 0 or -1)",
				wcag: "2.4.3 Focus Order (Level A)",
				severity: "high",
			},
			{
				pattern: /<div[^>]*onClick(?![^>]*onKeyDown)(?![^>]*onKeyPress)/i,
				message: "Interactive div needs keyboard handler (onKeyDown)",
				wcag: "2.1.1 Keyboard (Level A)",
				severity: "high",
			},
		],
	},

	"form-labels": {
		name: "Form Labels",
		checks: [
			{
				pattern:
					/<input(?![^>]*aria-label)(?![^>]*aria-labelledby)(?![^>]*id=)/i,
				message: "Input needs associated label (id + htmlFor) or aria-label",
				wcag: "3.3.2 Labels or Instructions (Level A)",
				severity: "high",
			},
			{
				pattern:
					/<input[^>]*placeholder="[^"]*"(?![^>]*aria-label)(?![^>]*id=)/i,
				message: "Placeholder is not a substitute for a label",
				wcag: "3.3.2 Labels or Instructions (Level A)",
				severity: "medium",
			},
			{
				pattern:
					/<select(?![^>]*aria-label)(?![^>]*aria-labelledby)(?![^>]*id=)/i,
				message: "Select needs associated label or aria-label",
				wcag: "3.3.2 Labels or Instructions (Level A)",
				severity: "high",
			},
			{
				pattern:
					/<textarea(?![^>]*aria-label)(?![^>]*aria-labelledby)(?![^>]*id=)/i,
				message: "Textarea needs associated label or aria-label",
				wcag: "3.3.2 Labels or Instructions (Level A)",
				severity: "high",
			},
		],
	},

	"alt-text": {
		name: "Alternative Text",
		checks: [
			{
				pattern: /<img(?![^>]*alt=)/i,
				message:
					'Image must have alt attribute (use alt="" for decorative images)',
				wcag: "1.1.1 Non-text Content (Level A)",
				severity: "critical",
			},
			{
				pattern: /<img[^>]*alt="image"[^>]*>/i,
				message: 'Alt text "image" is not descriptive',
				wcag: "1.1.1 Non-text Content (Level A)",
				severity: "medium",
			},
			{
				pattern: /<img[^>]*alt="photo"[^>]*>/i,
				message: 'Alt text "photo" is not descriptive',
				wcag: "1.1.1 Non-text Content (Level A)",
				severity: "medium",
			},
			{
				pattern: /<button[^>]*>[\s\n]*<[^>]*\/>[^<]*<\/button>/i,
				message: "Icon-only button needs aria-label",
				wcag: "4.1.2 Name, Role, Value (Level A)",
				severity: "high",
			},
		],
	},

	"heading-hierarchy": {
		name: "Heading Hierarchy",
		checks: [
			{
				pattern: /<h[1-6][^>]*className="[^"]*text-/i,
				message: "Use semantic heading levels, not className for sizing",
				wcag: "1.3.1 Info and Relationships (Level A)",
				severity: "low",
			},
		],
	},
};

/**
 * Scan a single file for accessibility violations
 */
function scanFile(filePath) {
	try {
		const content = readFileSync(filePath, "utf-8");
		const lines = content.split("\n");
		const fileViolations = [];

		// Get enabled rules from config
		const enabledRules =
			config.rules.length > 0 ? config.rules : Object.keys(rules);

		lines.forEach((line, index) => {
			const lineNum = index + 1;

			// Check each enabled rule
			enabledRules.forEach((ruleName) => {
				const rule = rules[ruleName];
				if (!rule) return;

				rule.checks.forEach((check) => {
					if (check.pattern.test(line)) {
						const violation = {
							file: filePath,
							line: lineNum,
							rule: rule.name,
							message: check.message,
							wcag: check.wcag,
							severity: check.severity,
							code: line.trim(),
						};

						fileViolations.push(violation);

						if (check.severity === "critical" || check.severity === "high") {
							results.violations.push(violation);
						} else {
							results.warnings.push(violation);
						}
					}
				});
			});
		});

		return fileViolations;
	} catch (error) {
		console.error(`Error scanning ${filePath}:`, error.message);
		return [];
	}
}

/**
 * Format and display results
 */
function displayResults() {
	const totalIssues = results.violations.length + results.warnings.length;

	if (totalIssues === 0) {
		console.log("✓ No accessibility issues found");
		return;
	}

	console.log("\n" + "=".repeat(80));
	console.log("Accessibility Scan Results");
	console.log("=".repeat(80) + "\n");

	// Display violations (critical/high severity)
	if (results.violations.length > 0) {
		console.log(`🔴 ${results.violations.length} violation(s) found:\n`);

		results.violations.forEach((v, i) => {
			console.log(`${i + 1}. ${v.file}:${v.line}`);
			console.log(`   ${v.severity.toUpperCase()}: ${v.message}`);
			console.log(`   WCAG: ${v.wcag}`);
			console.log(`   Code: ${v.code}`);
			console.log("");
		});
	}

	// Display warnings (medium/low severity)
	if (results.warnings.length > 0) {
		console.log(`⚠️  ${results.warnings.length} warning(s) found:\n`);

		results.warnings.forEach((w, i) => {
			console.log(`${i + 1}. ${w.file}:${w.line}`);
			console.log(`   ${w.severity.toUpperCase()}: ${w.message}`);
			console.log(`   WCAG: ${w.wcag}`);
			console.log("");
		});
	}

	console.log("=".repeat(80));
	console.log(
		`Total: ${results.violations.length} violations, ${results.warnings.length} warnings`
	);
	console.log("=".repeat(80) + "\n");

	console.log(
		"ℹ️  These are automated hints. Manual testing is still required."
	);
	console.log(
		"ℹ️  See documentation/frontend/development/accessibility.md for guidance.\n"
	);
}

/**
 * Main execution
 */
function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: node scanner.js <file1> <file2> ...");
		console.error("       node scanner.js --all");
		process.exit(1);
	}

	// Filter for .tsx and .jsx files only
	const files = args.filter((f) => f.match(/\.(tsx|jsx)$/));

	if (files.length === 0) {
		console.log("ℹ️  No .tsx or .jsx files to scan");
		process.exit(0);
	}

	console.log(`Scanning ${files.length} file(s) for accessibility issues...\n`);

	files.forEach((file) => {
		results.files++;
		scanFile(file);
	});

	displayResults();

	// Exit with 0 (warnings only, don't block commits)
	process.exit(0);
}

main();
