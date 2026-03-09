/**
 * Comment Utilities
 *
 * Utility functions for working with comments and mentions.
 */

import type { IComment, ICommentMention } from "@/shared/types/comment.types";
import type { IUserMe } from "@/shared/types/user.types";

/**
 * Mention data for API submission
 * Used when creating/updating comments with mentions
 */
interface MentionData {
	user_id: number;
	display_name: string;
	position: number;
}

/**
 * Extract mentions from comment content
 *
 * Parses HTML content to find mention nodes and extract mention data.
 * This function should be called before sending comment data to the API.
 *
 * @param content - HTML content from the rich text editor
 * @returns Array of mention objects with user_id, display_name, and position
 *
 * @example
 * const content = '<p>Hey <span data-mention-id="123">John Doe</span>, check this out!</p>';
 * const mentions = extractMentions(content);
 * // Returns: [{ user_id: 123, display_name: "John Doe", position: 4 }]
 */
export function extractMentions(content: string): MentionData[] {
	const mentions: MentionData[] = [];
	const parser = new DOMParser();
	const doc = parser.parseFromString(content, "text/html");

	// Find all mention spans
	const mentionNodes = doc.querySelectorAll("[data-mention-id]");

	mentionNodes.forEach((node) => {
		const userId = node.getAttribute("data-mention-id");
		const displayName = node.textContent || "";

		if (userId) {
			// Calculate position in the text content
			const textContent = doc.body.textContent || "";
			const position = textContent.indexOf(displayName);

			mentions.push({
				user_id: parseInt(userId, 10),
				display_name: displayName,
				position: position >= 0 ? position : 0,
			});
		}
	});

	return mentions;
}

/**
 * Format comment content with mention highlighting
 *
 * Applies styling to mentions in the comment content for display.
 * This function is used when rendering comments in read-only mode.
 *
 * @param content - HTML content of the comment
 * @param mentions - Array of mentions in the comment
 * @returns Formatted HTML with styled mentions
 *
 * @example
 * const content = '<p>Hey John Doe, check this out!</p>';
 * const mentions = [{ mentioned_user: { id: 123, display_first_name: "John", display_last_name: "Doe" } }];
 * const formatted = formatCommentWithMentions(content, mentions);
 * // Returns content with mentions styled as clickable links
 */
export function formatCommentWithMentions(
	content: string,
	mentions: ICommentMention[]
): string {
	if (mentions.length === 0) {
		return content;
	}

	let formattedContent = content;

	// Process mentions in order
	mentions.forEach((mention) => {
		const displayName = `${mention.mentioned_user.display_first_name} ${mention.mentioned_user.display_last_name}`;
		// Replace mention text with styled span
		const mentionRegex = new RegExp(
			`(${displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
			"g"
		);

		formattedContent = formattedContent.replace(
			mentionRegex,
			`<span class="mention" data-user-id="${mention.mentioned_user.id}">$1</span>`
		);
	});

	return formattedContent;
}

/**
 * Check if a user can delete a comment
 *
 * Determines whether the current user has permission to delete a comment.
 * Users can delete their own comments, and project leaders/admins can delete any comment.
 *
 * @param comment - The comment to check
 * @param currentUser - The current logged-in user
 * @returns True if the user can delete the comment, false otherwise
 *
 * @example
 * const canDelete = canDeleteComment(comment, currentUser);
 * if (canDelete) {
 *   // Show delete button
 * }
 */
export function canDeleteComment(
	comment: IComment,
	currentUser: IUserMe
): boolean {
	// User can delete their own comments
	if (comment.user.id === currentUser.id) {
		return true;
	}

	// Admins can delete any comment
	if (currentUser.is_superuser) {
		return true;
	}

	// Note: Project leader permission check will be added when we have project context
	// For now, only own comments and admin can delete

	return false;
}
