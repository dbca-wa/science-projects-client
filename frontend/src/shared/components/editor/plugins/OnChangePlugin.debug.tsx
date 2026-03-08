/**
 * OnChangePlugin - DEBUG VERSION
 *
 * Lexical plugin that tracks content changes and converts editor state to HTML.
 * This version includes extensive logging to debug the save button issue.
 */

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import type { EditorState } from "lexical";

interface OnChangePluginProps {
	onChange?: (html: string) => void;
}

export const OnChangePlugin: React.FC<OnChangePluginProps> = ({ onChange }) => {
	const [editor] = useLexicalComposerContext();
	const initialContent = useRef<string>("");
	const hasStoredInitial = useRef(false);
	const becameEditableOnce = useRef(false);
	const updateCount = useRef(0);

	useEffect(() => {
		console.log("[OnChangePlugin] Mounted, onChange callback:", !!onChange);

		if (!onChange) {
			console.log("[OnChangePlugin] No onChange callback provided");
			return;
		}

		return editor.registerUpdateListener(
			({
				editorState,
				tags,
			}: {
				editorState: EditorState;
				tags: Set<string>;
			}) => {
				updateCount.current++;
				const updateNum = updateCount.current;

				editorState.read(() => {
					const html = $generateHtmlFromNodes(editor);
					const isEditable = editor.isEditable();
					const tagsArray = Array.from(tags);

					console.log(`[OnChangePlugin] Update #${updateNum}:`, {
						isEditable,
						tags: tagsArray,
						hasStoredInitial: hasStoredInitial.current,
						becameEditableOnce: becameEditableOnce.current,
						htmlLength: html.length,
						htmlPreview: html.substring(0, 100),
						initialContentLength: initialContent.current.length,
					});

					// Store initial content on first update (while non-editable)
					if (!hasStoredInitial.current) {
						console.log(
							`[OnChangePlugin] Update #${updateNum}: Storing initial content (first update)`
						);
						initialContent.current = html;
						hasStoredInitial.current = true;
						return;
					}

					// If editor is not editable yet, keep updating initial content
					if (!isEditable) {
						console.log(
							`[OnChangePlugin] Update #${updateNum}: Editor not editable, updating initial content`
						);
						initialContent.current = html;
						return;
					}

					// If this is the first time becoming editable, update initial content and skip onChange
					if (tags.has("becoming-editable") || !becameEditableOnce.current) {
						console.log(
							`[OnChangePlugin] Update #${updateNum}: First time editable, updating initial content`
						);
						initialContent.current = html;
						becameEditableOnce.current = true;
						return;
					}

					// Check if content changed
					const hasChanged = html !== initialContent.current;
					console.log(
						`[OnChangePlugin] Update #${updateNum}: Content comparison:`,
						{
							hasChanged,
							currentLength: html.length,
							initialLength: initialContent.current.length,
							currentPreview: html.substring(0, 100),
							initialPreview: initialContent.current.substring(0, 100),
						}
					);

					// Only call onChange if content actually changed from initial
					if (hasChanged) {
						console.log(
							`[OnChangePlugin] Update #${updateNum}: CALLING onChange callback`
						);
						onChange(html);
					} else {
						console.log(
							`[OnChangePlugin] Update #${updateNum}: No change detected, skipping onChange`
						);
					}
				});
			}
		);
	}, [editor, onChange]);

	return null;
};
