/**
 * MoveCursorToEndPlugin
 *
 * Moves the cursor to the end of the content when the editor becomes editable.
 * Used in InlineSaveEditor to allow immediate typing without clicking.
 *
 * CRITICAL: Must wait for PrepopulateHTMLPlugin to finish loading content
 * and restore focus capability (100ms delay in PrepopulateHTMLPlugin).
 *
 * HANDLES EMPTY CONTENT: For empty editors, focuses without calling selectEnd()
 * to ensure cursor is visible and user can type immediately.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $createParagraphNode } from "lexical";

export const MoveCursorToEndPlugin: React.FC = () => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		// Function to position cursor and focus
		const positionCursorAndFocus = () => {
			// Position cursor at end (or start for empty content)
			editor.update(() => {
				const root = $getRoot();
				const textContent = root.getTextContent();
				const childrenSize = root.getChildrenSize();

				// For empty or whitespace-only content
				if (!textContent || textContent.trim() === "") {
					// Ensure there's at least one paragraph node
					if (childrenSize === 0) {
						const paragraph = $createParagraphNode();
						root.append(paragraph);
						paragraph.select();
					} else {
						root.selectStart();
					}
				} else {
					root.selectEnd();
				}
			});

			// Focus editor immediately after positioning cursor
			requestAnimationFrame(() => {
				editor.focus();
			});
		};

		// Check if editor is already editable (happens when moveCursorToEnd={true})
		const isCurrentlyEditable = editor.isEditable();

		if (isCurrentlyEditable) {
			// Editor is already editable, position cursor immediately
			setTimeout(() => {
				positionCursorAndFocus();
			}, 150);
		}

		// Also listen for future editable state changes
		const unregister = editor.registerEditableListener((isEditable) => {
			if (isEditable) {
				// CRITICAL: Wait for PrepopulateHTMLPlugin to restore focus capability
				// PrepopulateHTMLPlugin overrides focus() for 100ms to prevent auto-focus
				// We need to wait at least 150ms to ensure focus is restored
				setTimeout(() => {
					positionCursorAndFocus();
				}, 150);
			}
		});

		return () => {
			unregister();
		};
	}, [editor]);

	return null;
};
