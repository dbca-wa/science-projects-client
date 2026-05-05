/**
 * Derives the Lexical node array for the editor.
 *
 * IMPORTANT: All node types are always registered regardless of toolbar mode.
 * This is necessary because existing content in the database may contain any
 * node type (e.g. a table in a field that no longer allows table creation).
 * Lexical throws if it encounters a node type that isn't registered.
 *
 * Content restrictions are enforced at two other levels:
 * - Toolbar: hides buttons for disallowed content types
 * - PastePlugin: strips disallowed content on paste
 */

import type { Klass, LexicalNode } from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { HeadingNode } from "@lexical/rich-text";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ImageNode } from "../nodes/ImageNode";
import type { ToolbarMode } from "@/shared/types/editor.types";

/**
 * Returns all Lexical node classes that should be registered with the editor.
 * All nodes are always registered to support rendering existing content.
 *
 * @param _mode - The active toolbar mode (unused — kept for API compatibility)
 * @returns Array of all Lexical node classes
 */
export function getNodesForMode(_mode: ToolbarMode): Klass<LexicalNode>[] {
	return [
		LinkNode,
		AutoLinkNode,
		ListNode,
		ListItemNode,
		TableNode,
		TableCellNode,
		TableRowNode,
		HeadingNode,
		ImageNode,
	];
}
