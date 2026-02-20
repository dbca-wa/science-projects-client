#!/usr/bin/env node
/**
 * Accessibility checks for pre-commit hooks
 *
 * This script runs the comprehensive accessibility scanner on staged files.
 * Configuration is loaded from package.json accessibility section.
 */

import { spawnSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

if (args.length === 0) {
	console.log("ℹ️  No files to check");
	process.exit(0);
}

// Filter for .tsx and .jsx files only
const files = args.filter((f) => f.match(/\.(tsx|jsx)$/));

if (files.length === 0) {
	console.log("ℹ️  No .tsx or .jsx files to check");
	process.exit(0);
}

try {
	// Run the comprehensive scanner
	// Use spawnSync with array arguments to prevent shell injection
	const scannerPath = resolve(__dirname, "../accessibility/scanner.js");

	const result = spawnSync("node", [scannerPath, ...files], {
		stdio: "inherit",
		cwd: process.cwd(),
	});

	process.exit(result.status || 0);
} catch (error) {
	// Scanner already displays errors, just exit
	process.exit(0);
}
