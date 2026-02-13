#!/usr/bin/env node
// Import validation for pre-commit hooks

import { readFileSync } from "fs";

const args = process.argv.slice(2);
let warnings = 0;

// Patterns to check
const PATTERNS = {
	// Detect react-router-dom imports (should use react-router)
	wrongRouter: /from ['"]react-router-dom['"]/,

	// Detect npm/yarn/pnpm usage (should use bun)
	wrongPackageManager: /npm install|yarn add|pnpm add/,

	// Detect missing @/ alias for internal imports
	relativeImport: /from ['"]\.\.[\/\\]\.\./, // ../../ patterns

	// Detect circular dependency hints
	circularHint: /\/\/ TODO: circular dependency/i,
};

args.forEach((file) => {
	if (!file.match(/\.(ts|tsx|js|jsx)$/)) return;

	try {
		const content = readFileSync(file, "utf-8");
		const lines = content.split("\n");

		lines.forEach((line, index) => {
			const lineNum = index + 1;

			// Check for wrong router import
			if (PATTERNS.wrongRouter.test(line)) {
				console.error(
					`⚠ ${file}:${lineNum} - Use 'react-router' instead of 'react-router-dom'`
				);
				warnings++;
			}

			// Check for wrong package manager
			if (PATTERNS.wrongPackageManager.test(line)) {
				console.error(
					`⚠ ${file}:${lineNum} - Use 'bun add' instead of npm/yarn/pnpm`
				);
				warnings++;
			}

			// Check for deep relative imports
			if (PATTERNS.relativeImport.test(line)) {
				console.error(
					`⚠ ${file}:${lineNum} - Consider using '@/' alias instead of '../..'`
				);
				warnings++;
			}

			// Check for circular dependency hints
			if (PATTERNS.circularHint.test(line)) {
				console.error(`⚠ ${file}:${lineNum} - Circular dependency TODO found`);
				warnings++;
			}
		});
	} catch (error) {
		console.error(`Error reading ${file}:`, error.message);
	}
});

if (warnings > 0) {
	console.error(`\n⚠ Import validation found ${warnings} warning(s)`);
}

// Exit 0 (warnings only, don't block)
process.exit(0);
