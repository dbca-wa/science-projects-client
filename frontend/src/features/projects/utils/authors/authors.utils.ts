import type { IProjectMember } from "@/shared/types/project.types";

/**
 * Check if a name field is valid for author display.
 */
function isValidAuthorName(value: string | null | undefined): boolean {
	if (!value) return false;
	if (value.trim().length === 0) return false;
	if (value.startsWith("None")) return false;
	return true;
}

/**
 * Represents a formatted author entry for display
 */
export interface AuthorEntry {
	/** Formatted display text (e.g. "J. Smith" or username) */
	text: string;
	/** Whether this author has invalid/missing name data */
	hasInvalidName: boolean;
	/** User ID for linking */
	userId: number;
}

/**
 * Formats project team members as authors string
 *
 * Filters members with valid names, sorts by position, and formats as "F. LastName"
 * matching the original SPMS frontend display format.
 *
 * @param members - Array of project team members
 * @returns Formatted authors string (e.g., "J. Smith, A. Johnson")
 */
export function formatAuthors(members: IProjectMember[]): string {
	const entries = getAuthorEntries(members);
	return entries
		.filter((e) => !e.hasInvalidName)
		.map((e) => e.text)
		.join(", ");
}

/**
 * Get structured author entries including members with invalid names.
 * Members with valid names are formatted as "F. LastName".
 * Members with invalid names show their username and are flagged.
 *
 * @param members - Array of project team members
 * @returns Array of AuthorEntry objects sorted by position
 */
export function getAuthorEntries(members: IProjectMember[]): AuthorEntry[] {
	// Sort: leader first, then by position (ascending)
	const sorted = [...members].sort((a, b) => {
		if (a.is_leader && !b.is_leader) return -1;
		if (!a.is_leader && b.is_leader) return 1;
		return a.position - b.position;
	});

	return sorted.map((member) => {
		const firstName = member.user.display_first_name || member.user.first_name;
		const lastName = member.user.display_last_name || member.user.last_name;

		const hasValidFirst = isValidAuthorName(firstName);
		const hasValidLast = isValidAuthorName(lastName);

		if (hasValidFirst && hasValidLast) {
			const initial = firstName?.charAt(0) || "";
			return {
				text: `${initial}. ${lastName}`,
				hasInvalidName: false,
				userId: member.user.id,
			};
		}

		// For users with only one valid name (e.g. organisations like "OIM")
		if (hasValidFirst && !hasValidLast) {
			return {
				text: firstName!,
				hasInvalidName: false,
				userId: member.user.id,
			};
		}
		if (!hasValidFirst && hasValidLast) {
			return {
				text: lastName!,
				hasInvalidName: false,
				userId: member.user.id,
			};
		}

		// No valid names — show username flagged as invalid
		return {
			text: member.user.username || "Unknown",
			hasInvalidName: true,
			userId: member.user.id,
		};
	});
}
