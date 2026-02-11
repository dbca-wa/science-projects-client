/**
 * SaveOnCtrlSPlugin
 *
 * Listens for Ctrl+S (Cmd+S on Mac) and triggers form submission.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { KEY_DOWN_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";

export const SaveOnCtrlSPlugin = () => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			KEY_DOWN_COMMAND,
			(event: KeyboardEvent) => {
				const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
				const isCtrlS =
					(isMac ? event.metaKey : event.ctrlKey) && event.key === "s";

				if (isCtrlS) {
					event.preventDefault();
					event.stopPropagation();

					// Find the closest form element
					const editorElement = editor.getRootElement();
					if (editorElement) {
						const form = editorElement.closest("form");
						if (form) {
							// Trigger form submission
							form.requestSubmit();
						}
					}

					return true; // Command handled
				}

				return false; // Command not handled
			},
			COMMAND_PRIORITY_HIGH
		);
	}, [editor]);

	return null;
};
