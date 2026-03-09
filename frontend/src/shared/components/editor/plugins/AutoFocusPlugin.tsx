/**
 * AutoFocusPlugin
 *
 * Automatically focuses the editor when it mounts.
 * This is more reliable than the autoFocus prop on ContentEditable.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function AutoFocusPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		// Focus the editor after a short delay to ensure it's mounted
		const timeoutId = setTimeout(() => {
			editor.focus();
		}, 0);

		return () => clearTimeout(timeoutId);
	}, [editor]);

	return null;
}
