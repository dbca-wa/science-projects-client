/**
 * Colour Contrast Checker
 *
 * Calculates WCAG 2.2 colour contrast ratios and validates against thresholds.
 * Handles Tailwind CSS classes and hex/rgb colour values.
 */

/**
 * Tailwind CSS v4 colour palette
 * Based on the default Tailwind colours
 */
const TAILWIND_COLORS = {
	// Grayscale
	white: "#ffffff",
	black: "#000000",
	"gray-50": "#f9fafb",
	"gray-100": "#f3f4f6",
	"gray-200": "#e5e7eb",
	"gray-300": "#d1d5db",
	"gray-400": "#9ca3af",
	"gray-500": "#6b7280",
	"gray-600": "#4b5563",
	"gray-700": "#374151",
	"gray-800": "#1f2937",
	"gray-900": "#111827",
	"gray-950": "#030712",

	// Blue
	"blue-50": "#eff6ff",
	"blue-100": "#dbeafe",
	"blue-200": "#bfdbfe",
	"blue-300": "#93c5fd",
	"blue-400": "#60a5fa",
	"blue-500": "#3b82f6",
	"blue-600": "#2563eb",
	"blue-700": "#1d4ed8",
	"blue-800": "#1e40af",
	"blue-900": "#1e3a8a",
	"blue-950": "#172554",

	// Red
	"red-50": "#fef2f2",
	"red-100": "#fee2e2",
	"red-200": "#fecaca",
	"red-300": "#fca5a5",
	"red-400": "#f87171",
	"red-500": "#ef4444",
	"red-600": "#dc2626",
	"red-700": "#b91c1c",
	"red-800": "#991b1b",
	"red-900": "#7f1d1d",
	"red-950": "#450a0a",

	// Green
	"green-50": "#f0fdf4",
	"green-100": "#dcfce7",
	"green-200": "#bbf7d0",
	"green-300": "#86efac",
	"green-400": "#4ade80",
	"green-500": "#22c55e",
	"green-600": "#16a34a",
	"green-700": "#15803d",
	"green-800": "#166534",
	"green-900": "#14532d",
	"green-950": "#052e16",

	// Yellow
	"yellow-50": "#fefce8",
	"yellow-100": "#fef9c3",
	"yellow-200": "#fef08a",
	"yellow-300": "#fde047",
	"yellow-400": "#facc15",
	"yellow-500": "#eab308",
	"yellow-600": "#ca8a04",
	"yellow-700": "#a16207",
	"yellow-800": "#854d0e",
	"yellow-900": "#713f12",
	"yellow-950": "#422006",

	// Additional common colours
	"slate-50": "#f8fafc",
	"slate-100": "#f1f5f9",
	"slate-200": "#e2e8f0",
	"slate-300": "#cbd5e1",
	"slate-400": "#94a3b8",
	"slate-500": "#64748b",
	"slate-600": "#475569",
	"slate-700": "#334155",
	"slate-800": "#1e293b",
	"slate-900": "#0f172a",
	"slate-950": "#020617",
};

/**
 * Extract colour from Tailwind class name
 */
export function extractTailwindColour(className) {
	if (!className) return null;

	// Match text-{colour} or bg-{colour}
	const textMatch = className.match(/text-([\w-]+)/);
	const bgMatch = className.match(/bg-([\w-]+)/);

	if (textMatch) {
		const colourKey = textMatch[1];
		return TAILWIND_COLORS[colourKey] || null;
	}

	if (bgMatch) {
		const colourKey = bgMatch[1];
		return TAILWIND_COLORS[colourKey] || null;
	}

	return null;
}

/**
 * Parse hex colour to RGB
 */
export function hexToRgb(hex) {
	// Remove # if present
	hex = hex.replace(/^#/, "");

	// Handle 3-digit hex
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
	}

	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return { r, g, b };
}

/**
 * Parse RGB string to RGB object
 */
export function parseRgb(rgbString) {
	const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
	if (!match) return null;

	return {
		r: parseInt(match[1]),
		g: parseInt(match[2]),
		b: parseInt(match[3]),
	};
}

/**
 * Calculate relative luminance
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(rgb) {
	const { r, g, b } = rgb;

	// Convert to 0-1 range
	const rsRGB = r / 255;
	const gsRGB = g / 255;
	const bsRGB = b / 255;

	// Apply gamma correction
	const rLinear =
		rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
	const gLinear =
		gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
	const bLinear =
		bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

	// Calculate luminance
	return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colours
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function getContrastRatio(colour1, colour2) {
	const lum1 = getRelativeLuminance(colour1);
	const lum2 = getRelativeLuminance(colour2);

	const lighter = Math.max(lum1, lum2);
	const darker = Math.min(lum1, lum2);

	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG threshold
 */
export function meetsContrastThreshold(ratio, level = "AA", size = "normal") {
	if (level === "AAA") {
		return size === "large" ? ratio >= 4.5 : ratio >= 7;
	}

	// Level AA (default)
	return size === "large" ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Determine if text is considered "large" for WCAG
 * Large text is 18pt (24px) or 14pt (18.66px) bold
 */
export function isLargeText(fontSize, fontWeight) {
	const size = parseFloat(fontSize);
	const weight = parseInt(fontWeight) || 400;

	// 18pt = 24px
	if (size >= 24) return true;

	// 14pt = 18.66px and bold (700+)
	if (size >= 18.66 && weight >= 700) return true;

	return false;
}

/**
 * Extract colours from className string
 */
export function extractColoursFromClassName(className) {
	if (!className) return { foreground: null, background: null };

	const classes = className.split(/\s+/);
	let foreground = null;
	let background = null;

	classes.forEach((cls) => {
		const textColour = extractTailwindColour(
			`text-${cls.replace(/^text-/, "")}`
		);
		const bgColour = extractTailwindColour(`bg-${cls.replace(/^bg-/, "")}`);

		if (textColour) foreground = textColour;
		if (bgColour) background = bgColour;
	});

	return { foreground, background };
}

/**
 * Check contrast for a text element
 */
export function checkTextContrast(
	foreground,
	background,
	fontSize = "16px",
	fontWeight = "400"
) {
	if (!foreground || !background) {
		return {
			valid: null,
			ratio: null,
			message: "Unable to determine colours",
		};
	}

	const fgRgb =
		typeof foreground === "string" ? hexToRgb(foreground) : foreground;
	const bgRgb =
		typeof background === "string" ? hexToRgb(background) : background;

	const ratio = getContrastRatio(fgRgb, bgRgb);
	const large = isLargeText(fontSize, fontWeight);
	const meetsAA = meetsContrastThreshold(
		ratio,
		"AA",
		large ? "large" : "normal"
	);

	return {
		valid: meetsAA,
		ratio: ratio.toFixed(2),
		threshold: large ? 3 : 4.5,
		size: large ? "large" : "normal",
		message: meetsAA
			? `Passes WCAG AA (${ratio.toFixed(2)}:1)`
			: `Fails WCAG AA (${ratio.toFixed(2)}:1, needs ${large ? "3" : "4.5"}:1)`,
	};
}

/**
 * Analyse contrast in a code snippet
 */
export function analyseContrastInCode(code, line) {
	const issues = [];

	// Extract className attribute
	const classMatch = code.match(/className=["']([^"']+)["']/);
	if (!classMatch) return issues;

	const className = classMatch[1];
	const { foreground, background } = extractColoursFromClassName(className);

	// Check if we have both colours
	if (foreground && background) {
		const result = checkTextContrast(foreground, background);

		if (result.valid === false) {
			issues.push({
				line,
				type: "contrast",
				severity: "high",
				message: result.message,
				wcag: "1.4.3 Contrast (Minimum) (Level AA)",
				foreground,
				background,
				ratio: result.ratio,
			});
		}
	}

	return issues;
}

/**
 * Get colour name from hex value
 */
export function getColourName(hex) {
	for (const [name, value] of Object.entries(TAILWIND_COLORS)) {
		if (value.toLowerCase() === hex.toLowerCase()) {
			return name;
		}
	}
	return hex;
}

/**
 * Suggest better colour combinations
 */
export function suggestBetterColours(foreground, background) {
	const fgRgb =
		typeof foreground === "string" ? hexToRgb(foreground) : foreground;
	const bgRgb =
		typeof background === "string" ? hexToRgb(background) : background;

	const currentRatio = getContrastRatio(fgRgb, bgRgb);
	const suggestions = [];

	// Try darker/lighter variations
	const fgName = getColourName(foreground);
	const bgName = getColourName(background);

	// If foreground is too light, suggest darker
	if (fgName.includes("gray-")) {
		const shade = parseInt(fgName.split("-")[1]);
		if (shade < 600) {
			suggestions.push(
				`Try text-gray-700 or text-gray-800 for better contrast`
			);
		}
	}

	// If background is too dark, suggest lighter
	if (bgName.includes("gray-")) {
		const shade = parseInt(bgName.split("-")[1]);
		if (shade > 400) {
			suggestions.push(`Try bg-gray-100 or bg-white for better contrast`);
		}
	}

	return suggestions;
}
