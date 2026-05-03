import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot, type LexicalEditor, type LexicalNode } from "lexical";
import { $isMentionNode, MentionNode } from "@/shared/nodes/MentionNode.tsx";

/**
 * Generate HTML from Lexical editor state for comment submission
 *
 * Converts the editor state to HTML with properly formatted mention spans.
 * Mention format: <span class="mention" data-user-id="123" data-display-name="John Doe">@John Doe</span>
 *
 * @param editor - Lexical editor instance
 * @returns HTML string ready for API submission
 */
export function generateCommentHTML(editor: LexicalEditor): string {
	let html = "";

	editor.getEditorState().read(() => {
		html = $generateHtmlFromNodes(editor, null);
	});

	return html;
}

/**
 * Extract mentioned user IDs from Lexical editor state
 *
 * Traverses the editor state and collects user IDs from MentionNodes.
 * Returns unique array of user IDs for notification system.
 *
 * @param editor - Lexical editor instance
 * @returns Array of unique user IDs
 */
export function extractMentionedUsers(editor: LexicalEditor): number[] {
	const userIds: number[] = [];

	editor.getEditorState().read(() => {
		const root = $getRoot();

		// Get all nodes including decorator nodes (mentions)
		const descendants = root.getChildren();

		const collectMentions = (nodes: unknown[]) => {
			for (const node of nodes) {
				// Type guard: check if node is a MentionNode
				if (
					typeof node === "object" &&
					node !== null &&
					"__type" in node &&
					$isMentionNode(node as LexicalNode)
				) {
					const userId = (node as MentionNode).getUserId();
					if (!userIds.includes(userId)) {
						userIds.push(userId);
					}
				}

				// Recursively check children
				if (
					typeof node === "object" &&
					node !== null &&
					"getChildren" in node &&
					typeof node.getChildren === "function"
				) {
					collectMentions(node.getChildren());
				}
			}
		};

		collectMentions(descendants);
	});

	return userIds;
}
