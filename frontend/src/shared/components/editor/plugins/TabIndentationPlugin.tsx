/**
 * TabIndentationPlugin
 *
 * Handles Tab and Shift+Tab for indentation/outdentation in lists, and Escape to blur.
 * Allows Tab to move focus out of editor when not in an indentable context (accessibility).
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	INDENT_CONTENT_COMMAND,
	OUTDENT_CONTENT_COMMAND,
	KEY_TAB_COMMAND,
	KEY_ESCAPE_COMMAND,
	$getSelection,
	$isRangeSelection,
} from "lexical";
import { ListNode } from "@lexical/list";
import { $getNearestNodeOfType } from "@lexical/utils";

export const TabIndentationPlugin: React.FC = () => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		// Handle Tab and Shift+Tab
		const unregisterTab = editor.registerCommand(
			KEY_TAB_COMMAND,
			(event: KeyboardEvent) => {
				const selection = $getSelection();

				// Only handle Tab for indentation when in a list context
				if ($isRangeSelection(selection)) {
					const anchorNode = selection.anchor.getNode();
					const listNode = $getNearestNodeOfType(anchorNode, ListNode);

					// If we're in a list, handle indentation
					if (listNode) {
						event.preventDefault();

						if (event.shiftKey) {
							return editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
						} else {
							return editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
						}
					}
				}

				// Not in a list context - allow Tab to move focus (return false = don't handle)
				return false;
			},
			1
		);

		// Handle Escape to blur editor
		const unregisterEscape = editor.registerCommand(
			KEY_ESCAPE_COMMAND,
			() => {
				const rootElement = editor.getRootElement();
				if (rootElement) {
					rootElement.blur();
				}
				return true;
			},
			1
		);

		return () => {
			unregisterTab();
			unregisterEscape();
		};
	}, [editor]);

	return null;
};
