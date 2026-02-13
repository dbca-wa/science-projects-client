#!/usr/bin/env node

/**
 * Patch leaflet.heat to add willReadFrequently attribute to canvas contexts
 * This fixes the Canvas2D console warning about multiple getImageData operations
 */

import { readFileSync, writeFileSync, rmSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(
	__dirname,
	"../node_modules/leaflet.heat/dist/leaflet-heat.js"
);
const viteCachePath = join(__dirname, "../node_modules/.vite");

try {
	let content = readFileSync(filePath, "utf8");

	// Check if already patched
	if (content.includes("willReadFrequently")) {
		console.log("✓ leaflet.heat already patched");
	} else {
		// Patch all getContext("2d") calls to include willReadFrequently
		content = content.replace(
			/\.getContext\("2d"\)/g,
			'.getContext("2d",{willReadFrequently:!0})'
		);

		writeFileSync(filePath, content, "utf8");
		console.log(
			"✓ Successfully patched leaflet.heat to add willReadFrequently attribute"
		);
	}

	// Clear Vite cache to ensure patch is used
	try {
		rmSync(viteCachePath, { recursive: true, force: true });
		console.log("✓ Cleared Vite cache");
	} catch (err) {
		// Vite cache might not exist yet, that's fine
		if (err.code !== "ENOENT") {
			console.log("⚠ Could not clear Vite cache:", err.message);
		}
	}
} catch (error) {
	console.error("✗ Failed to patch leaflet.heat:", error.message);
	process.exit(1);
}
