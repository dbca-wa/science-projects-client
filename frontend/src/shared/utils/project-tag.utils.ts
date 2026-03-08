import type { IProjectData, ProjectKind } from "@/shared/types/project.types";
import { PROJECT_KIND_COLORS } from "@/shared/constants/project-colors";

/**
 * Project Tag Utilities
 *
 * Utilities for formatting, parsing, and validating project tags.
 * Project tags follow the format: {type}-{year}-{number}
 * where type is SP/STP/EXT/CF based on project kind.
 */

/**
 * Map project kind to tag type prefix
 */
const PROJECT_KIND_TO_TYPE: Record<ProjectKind, string> = {
	science: "SP",
	student: "STP",
	external: "EXT",
	core_function: "CF",
};

/**
 * Map tag type prefix to project kind
 */
const TYPE_TO_PROJECT_KIND: Record<string, ProjectKind> = {
	SP: "science",
	STP: "student",
	EXT: "external",
	CF: "core_function",
};

/**
 * Format project year based on start and end year
 *
 * Rules:
 * - If start_year equals end_year: return single year
 * - If end_year is null: return "{start_year}-"
 * - Otherwise: return "{start_year}-{end_year}"
 */
export function formatProjectYear(
	startYear: number,
	endYear: number | null
): string {
	if (endYear === null) {
		return `${startYear}-`;
	}
	if (startYear === endYear) {
		return `${startYear}`;
	}
	return `${startYear}-${endYear}`;
}

/**
 * Format complete project tag
 *
 * Format: {type}-{year}-{number}
 * Examples:
 * - "SP-2024-6" (single year)
 * - "SP-2024-2025-6" (year range)
 * - "SP-2024--6" (open-ended range)
 */
export function formatProjectTag(project: IProjectData): string {
	const type = PROJECT_KIND_TO_TYPE[project.kind];

	// For now, use the year field as both start and end
	// TODO: Update when start_year and end_year fields are available
	const year = project.year.toString();

	return `${type}-${year}-${project.number}`;
}

/**
 * Parse project tag string into components
 *
 * Returns null if the tag format is invalid
 */
export function parseProjectTag(tag: string): {
	type: string;
	kind: ProjectKind;
	startYear: number;
	endYear: number | null;
	number: number;
} | null {
	// Pattern: {type}-{year}[-{year}]-{number}
	// Matches: SP-2024-6, SP-2024-2025-6, SP-2024--6
	const pattern = /^(SP|STP|EXT|CF)-(\d{4})(?:-(\d{4})?)?-(\d+)$/;
	const match = tag.match(pattern);

	if (!match) return null;

	const [, type, startYearStr, endYearStr, numberStr] = match;

	// Validate type
	if (!(type in TYPE_TO_PROJECT_KIND)) return null;

	const startYear = parseInt(startYearStr, 10);
	const endYear = endYearStr ? parseInt(endYearStr, 10) : null;
	const number = parseInt(numberStr, 10);

	// Validate year range
	if (endYear !== null && endYear < startYear) return null;

	return {
		type,
		kind: TYPE_TO_PROJECT_KIND[type],
		startYear,
		endYear,
		number,
	};
}

/**
 * Validate project tag format
 *
 * Returns true if the tag matches the expected format
 */
export function isValidProjectTag(tag: string): boolean {
	return parseProjectTag(tag) !== null;
}

/**
 * Get project kind colour for badges
 *
 * Returns inline style object using PROJECT_KIND_COLORS constants
 */
export function getProjectKindColour(kind: ProjectKind): {
	backgroundColor: string;
	color: string;
} {
	return {
		backgroundColor: PROJECT_KIND_COLORS[kind],
		color: "white",
	};
}
