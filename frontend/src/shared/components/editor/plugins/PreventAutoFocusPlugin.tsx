/**
 * PreventAutoFocusPlugin
 *
 * Prevents the editor from auto-focusing on mount and auto-scrolling.
 * This is important when multiple editors are on the same page.
 *
 * Works in conjunction with EditableOnInteractionPlugin which restores
 * focusability when the user clicks on the editor.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export const PreventAutoFocusPlugin: React.FC = () => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		const rootElement = editor.getRootElement();
		if (!rootElement) return;

		// Override scrollIntoView to prevent any auto-scrolling during initialization
		const originalScrollIntoView = rootElement.scrollIntoView;
		rootElement.scrollIntoView = () => {};

		// Store the currently focused element
		const activeElement = document.activeElement;

		// If the editor somehow got focus during initialization, blur it
		if (activeElement === rootElement) {
			rootElement.blur();
			// Restore focus to body or previous element
			if (document.body) {
				document.body.focus();
			}
		}

		// Restore scrollIntoView after initialization is complete
		// Note: tabindex is managed by EditableOnInteractionPlugin
		const timeoutId = setTimeout(() => {
			rootElement.scrollIntoView = originalScrollIntoView;
		}, 500);

		return () => {
			clearTimeout(timeoutId);
			rootElement.scrollIntoView = originalScrollIntoView;
		};
	}, [editor]);

	return null;
};
