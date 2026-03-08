import { Link } from "react-router";
import type { ICommentMention } from "@/shared/types/comment.types";

interface MentionDisplayProps {
	/** Comment text content with @mentions */
	text: string;
	/** Array of mention objects with user details */
	mentions: ICommentMention[];
}

/**
 * MentionDisplay Component
 *
 * Renders comment text with @mentions as clickable links.
 * Mentions are styled distinctly (blue text, bold) and link to user profile pages.
 */
export const MentionDisplay = ({ text, mentions }: MentionDisplayProps) => {
	// If no mentions, return plain text
	if (mentions.length === 0) {
		return <span className="whitespace-pre-wrap">{text}</span>;
	}

	// Create a map of mention text to user ID for quick lookup
	const mentionMap = new Map<string, number>();
	mentions.forEach((mention) => {
		const mentionText = `@${mention.mentioned_user.display_first_name} ${mention.mentioned_user.display_last_name}`;
		mentionMap.set(mentionText, mention.mentioned_user.id);
	});

	// Regex to match @FirstName LastName pattern
	const mentionRegex = /@([A-Z][a-z]+\s[A-Z][a-z]+)/g;

	// Split text into parts (text and mentions)
	const parts: Array<{
		type: "text" | "mention";
		content: string;
		userId?: number;
	}> = [];
	let lastIndex = 0;
	let match;

	while ((match = mentionRegex.exec(text)) !== null) {
		// Add text before mention
		if (match.index > lastIndex) {
			parts.push({
				type: "text",
				content: text.slice(lastIndex, match.index),
			});
		}

		// Add mention
		const mentionText = match[0]; // Full match including @
		const userId = mentionMap.get(mentionText);
		parts.push({
			type: "mention",
			content: mentionText,
			userId,
		});

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text after last mention
	if (lastIndex < text.length) {
		parts.push({
			type: "text",
			content: text.slice(lastIndex),
		});
	}

	return (
		<span className="whitespace-pre-wrap">
			{parts.map((part, index) => {
				if (part.type === "text") {
					return <span key={index}>{part.content}</span>;
				}

				// Render mention as link
				if (part.userId) {
					return (
						<Link
							key={index}
							to={`/users/${part.userId}`}
							className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
						>
							{part.content}
						</Link>
					);
				}

				// Fallback: render as plain text if user ID not found
				return (
					<span key={index} className="font-semibold text-blue-600">
						{part.content}
					</span>
				);
			})}
		</span>
	);
};
