/**
 * BoldBlockPlugin
 *
 * Blocks the Ctrl+B / Cmd+B keyboard shortcut when bold formatting
 * is not permitted (e.g. projectTitle toolbar mode).
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { KEY_DOWN_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";

interface BoldBlockPluginProps {
	enabled: boolean;
}

export const BoldBlockPlugin = ({ enabled }: BoldBlockPluginProps) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!enabled) return;

		return editor.registerCommand(
			KEY_DOWN_COMMAND,
			(event: KeyboardEvent) => {
				// Block Ctrl+B / Cmd+B
				if ((event.ctrlKey || event.metaKey) && event.key === "b") {
					event.preventDefault();
					return true;
				}
				return false;
			},
			COMMAND_PRIORITY_HIGH
		);
	}, [editor, enabled]);

	return null;
};
