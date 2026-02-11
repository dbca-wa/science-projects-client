#!/usr/bin/env node
// Basic accessibility checks for pre-commit hooks

import { readFileSync } from "fs";

const args = process.argv.slice(2);
let warnings = 0;

// Patterns to check
const A11Y_PATTERNS = {
	// Images without alt text
	imgWithoutAlt: /<img(?![^>]*alt=)/i,

	// Buttons without accessible labels
	buttonWithoutLabel:
		/<button(?![^>]*aria-label)(?![^>]*aria-labelledby)>(?!\s*<)/i,

	// Links without text or aria-label
	emptyLink:
		/<a(?![^>]*aria-label)(?![^>]*aria-labelledby)[^>]*>(?:\s*<(?!.*\w))/i,

	// Divs with onClick without role
	divOnClickWithoutRole: /<div[^>]*onClick(?![^>]*role=)/i,

	// Form inputs without labels
	inputWithoutLabel:
		/<input(?![^>]*aria-label)(?![^>]*aria-labelledby)(?![^>]*id=)/i,
};

args.forEach((file) => {
	if (!file.match(/\.(tsx|jsx)$/)) return;

	try {
		const content = readFileSync(file, "utf-8");
		const lines = content.split("\n");

		lines.forEach((line, index) => {
			const lineNum = index + 1;

			// Check for images without alt
			if (A11Y_PATTERNS.imgWithoutAlt.test(line)) {
				console.error(`⚠ ${file}:${lineNum} - Image missing alt attribute`);
				warnings++;
			}

			// Check for buttons without labels
			if (A11Y_PATTERNS.buttonWithoutLabel.test(line)) {
				console.error(
					`⚠ ${file}:${lineNum} - Button may need aria-label or text content`
				);
				warnings++;
			}

			// Check for empty links
			if (A11Y_PATTERNS.emptyLink.test(line)) {
				console.error(
					`⚠ ${file}:${lineNum} - Link may need text content or aria-label`
				);
				warnings++;
			}

			// Check for divs with onClick without role
			if (A11Y_PATTERNS.divOnClickWithoutRole.test(line)) {
				console.error(
					`⚠ ${file}:${lineNum} - Interactive div should have role="button" or use <button>`
				);
				warnings++;
			}

			// Check for inputs without labels
			if (A11Y_PATTERNS.inputWithoutLabel.test(line)) {
				console.error(
					`⚠ ${file}:${lineNum} - Input may need associated label or aria-label`
				);
				warnings++;
			}
		});
	} catch (error) {
		console.error(`Error reading ${file}:`, error.message);
	}
});

if (warnings > 0) {
	console.error(`\n⚠ Accessibility check found ${warnings} warning(s)`);
	console.error("Note: These are hints only. Full a11y testing required.");
}

// Exit 0 (warnings only, don't block)
process.exit(0);
