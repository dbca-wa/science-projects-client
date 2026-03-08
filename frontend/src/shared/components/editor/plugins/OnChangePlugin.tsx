/**
 * OnChangePlugin
 *
 * Lexical plugin that tracks content changes and converts editor state to HTML.
 */

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import type { EditorState } from "lexical";

interface OnChangePluginProps {
	onChange?: (html: string) => void;
}

/**
 * Normalize HTML content for comparison.
 * Treats empty paragraphs as equivalent to empty string.
 */
function normalizeHtml(html: string): string {
	// Trim whitespace
	const trimmed = html.trim();

	// Empty paragraph variations are considered empty
	const emptyParagraphPatterns = [
		'<p class="editor-paragraph mb-2"><br></p>',
		'<p class="editor-paragraph"><br></p>',
		"<p><br></p>",
		"<p></p>",
		"",
	];

	if (emptyParagraphPatterns.includes(trimmed)) {
		return "";
	}

	return trimmed;
}

export const OnChangePlugin: React.FC<OnChangePluginProps> = ({ onChange }) => {
	const [editor] = useLexicalComposerContext();
	const initialContent = useRef<string>("");
	const hasStoredInitial = useRef(false);
	const becameEditableOnce = useRef(false);

	useEffect(() => {
		if (!onChange) return;

		return editor.registerUpdateListener(
			({
				editorState,
				tags,
			}: {
				editorState: EditorState;
				tags: Set<string>;
			}) => {
				editorState.read(() => {
					const html = $generateHtmlFromNodes(editor);
					const normalizedHtml = normalizeHtml(html);

					// Store initial content on first update (while non-editable)
					if (!hasStoredInitial.current) {
						initialContent.current = normalizedHtml;
						hasStoredInitial.current = true;
						return;
					}

					// If editor is not editable yet, keep updating initial content
					if (!editor.isEditable()) {
						initialContent.current = normalizedHtml;
						return;
					}

					// If this is the first time becoming editable, update initial content and skip onChange
					if (tags.has("becoming-editable") || !becameEditableOnce.current) {
						initialContent.current = normalizedHtml;
						becameEditableOnce.current = true;
						return;
					}

					// Always call onChange for any update after editor becomes editable
					// This ensures undo/redo updates trigger onChange
					onChange(html);
				});
			}
		);
	}, [editor, onChange]);

	return null;
};
