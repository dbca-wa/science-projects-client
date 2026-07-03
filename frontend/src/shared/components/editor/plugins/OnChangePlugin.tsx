/**
 * OnChangePlugin
 *
 * Lexical plugin that tracks content changes and converts editor state to HTML.
 *
 * onChange fires only when editor content actually changes while the editor is
 * editable. Selection/focus-only updates (clicking into a field or moving the
 * cursor between fields), the initial content load, the becoming-editable
 * transition, and programmatic controlled-value syncs are all ignored so they
 * don't register as user edits.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import type { EditorState, NodeKey } from "lexical";

interface OnChangePluginProps {
	onChange?: (html: string) => void;
	stripBold?: boolean;
}

/**
 * Strip bold formatting tags (<strong> and <b>) from HTML,
 * preserving the inner content.
 */
function stripBoldTags(html: string): string {
	return html.replace(/<\/?strong[^>]*>/gi, "").replace(/<\/?b[^>]*>/gi, "");
}

// Tags applied to updates that are not user content edits and must not emit
const PROGRAMMATIC_TAGS = [
	"history-merge", // initial content load (PrepopulateHTMLPlugin)
	"becoming-editable", // read-only → editable transition
	"controlled-value-update", // parent programmatically set the value
];

export const OnChangePlugin: React.FC<OnChangePluginProps> = ({
	onChange,
	stripBold = false,
}) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!onChange) return;

		return editor.registerUpdateListener(
			({
				editorState,
				dirtyElements,
				dirtyLeaves,
				tags,
			}: {
				editorState: EditorState;
				dirtyElements: Map<NodeKey, boolean>;
				dirtyLeaves: Set<NodeKey>;
				tags: Set<string>;
			}) => {
				// Ignore programmatic updates (initial load, becoming editable,
				// controlled-value sync from the parent)
				if (PROGRAMMATIC_TAGS.some((tag) => tags.has(tag))) {
					return;
				}

				// Ignore selection/focus-only changes — clicking into or between
				// editors mutates no nodes, so there is nothing to report. This is
				// what previously caused clicking between fields to register as an edit.
				if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
					return;
				}

				// Only emit while the editor is editable (ignore any content set
				// while read-only)
				if (!editor.isEditable()) {
					return;
				}

				// Genuine content change (including the first keystroke and undo/redo)
				editorState.read(() => {
					const html = $generateHtmlFromNodes(editor);
					const output = stripBold ? stripBoldTags(html) : html;
					onChange(output);
				});
			}
		);
	}, [editor, onChange, stripBold]);

	return null;
};
