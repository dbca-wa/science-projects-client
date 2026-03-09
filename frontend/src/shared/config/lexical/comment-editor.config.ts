import { ParagraphNode, TextNode } from "lexical";
import { ListItemNode, ListNode } from "@lexical/list";
import { MentionNode } from "@/shared/nodes/MentionNode.tsx";
import { COMMENT_THEME } from "@/shared/config/lexical/comment-theme";

/**
 * Lexical nodes for comment editor
 */
export const COMMENT_EDITOR_NODES = [
	ParagraphNode,
	TextNode,
	ListNode,
	ListItemNode,
	MentionNode,
];

/**
 * Create Lexical editor configuration for comments
 */
export function createCommentEditorConfig(namespace: string = "CommentEditor") {
	return {
		namespace,
		theme: COMMENT_THEME,
		nodes: COMMENT_EDITOR_NODES,
		onError: (error: Error) => {
			console.error("Lexical comment editor error:", error);
		},
	};
}
