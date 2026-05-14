import type { IProjectMember } from "@/shared/types/project.types";

/**
 * Formats project team members as authors string
 *
 * Filters members with valid names, sorts by position, and formats as "F. LastName"
 * matching the original SPMS frontend display format.
 *
 * @param members - Array of project team members
 * @returns Formatted authors string (e.g., "J. Smith, A. Johnson")
 *
 * @example
 * const members = [
 *   { user: { first_name: "John", last_name: "Smith" }, position: 1 },
 *   { user: { first_name: "Alice", last_name: "Johnson" }, position: 0 }
 * ];
 * formatAuthors(members); // "A. Johnson, J. Smith"
 */
export function formatAuthors(members: IProjectMember[]): string {
	// Filter members with valid first and last names
	// Use display_first_name and display_last_name (preferred) or fall back to first_name/last_name
	const filteredMembers = members.filter((member) => {
		const firstName = member.user.display_first_name || member.user.first_name;
		const lastName = member.user.display_last_name || member.user.last_name;

		return (
			firstName !== null &&
			firstName !== undefined &&
			firstName !== "None" &&
			lastName !== null &&
			lastName !== undefined &&
			lastName !== "None"
		);
	});

	// Sort: leader first, then by position (ascending) — matches team management drag order
	filteredMembers.sort((a, b) => {
		// Leader always first
		if (a.is_leader && !b.is_leader) return -1;
		if (!a.is_leader && b.is_leader) return 1;
		// Otherwise sort by position
		return a.position - b.position;
	});

	// Format as "F. LastName"
	const authorsArray = filteredMembers.map((member) => {
		const firstName = member.user.display_first_name || member.user.first_name;
		const lastName = member.user.display_last_name || member.user.last_name;
		const initial = firstName?.charAt(0) || "";
		return `${initial}. ${lastName}`;
	});

	return authorsArray.join(", ");
}
