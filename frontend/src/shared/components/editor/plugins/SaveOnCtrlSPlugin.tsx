/**
 * SaveOnCtrlSPlugin
 *
 * Listens for Ctrl+S (Cmd+S on Mac) and triggers save callback.
 * Only triggers for the focused editor to prevent multiple saves.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { KEY_DOWN_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";

interface SaveOnCtrlSPluginProps {
	onSave?: () => void;
}

export const SaveOnCtrlSPlugin: React.FC<SaveOnCtrlSPluginProps> = ({
	onSave,
}) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			KEY_DOWN_COMMAND,
			(event: KeyboardEvent) => {
				const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
				const isCtrlS =
					(isMac ? event.metaKey : event.ctrlKey) && event.key === "s";

				if (isCtrlS) {
					// Only handle if this editor is focused
					const editorElement = editor.getRootElement();
					if (editorElement && editorElement.contains(document.activeElement)) {
						event.preventDefault();
						event.stopPropagation();

						// Call the save callback
						onSave?.();

						return true; // Command handled
					}
				}

				return false; // Command not handled
			},
			COMMAND_PRIORITY_HIGH
		);
	}, [editor, onSave]);

	return null;
};
