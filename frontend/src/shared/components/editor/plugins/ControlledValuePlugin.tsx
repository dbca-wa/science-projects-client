/**
 * ControlledValuePlugin
 *
 * Lexical plugin that synchronizes editor content with external value prop changes.
 * This handles the "controlled component" pattern where parent components can
 * programmatically update the editor content (e.g., Clear button, Reset, etc.)
 *
 * Separate from PrepopulateHTMLPlugin which only handles initial content loading.
 *
 * IMPORTANT: This plugin ignores value changes that match the current editor content
 * to prevent cursor jumping when the user is typing.
 */

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";
import { sanitizeRichText } from "@/shared/utils/sanitise.utils";

interface ControlledValuePluginProps {
	value?: string;
}

export const ControlledValuePlugin: React.FC<ControlledValuePluginProps> = ({
	value,
}) => {
	const [editor] = useLexicalComposerContext();
	const lastValue = useRef<string | undefined>(undefined);
	const isFirstRun = useRef(true);

	useEffect(() => {
		// Skip the first run (initial content is handled by PrepopulateHTMLPlugin)
		if (isFirstRun.current) {
			isFirstRun.current = false;
			lastValue.current = value;
			return;
		}

		// Skip if value hasn't changed
		if (value === lastValue.current) return;

		// Check if the new value matches the current editor content
		// This prevents cursor jumping when the user is typing
		const currentEditorContent = editor.getEditorState().read(() => {
			return $generateHtmlFromNodes(editor);
		});

		// If the new value matches current content, just update lastValue and skip
		if (value === currentEditorContent) {
			lastValue.current = value;
			return;
		}

		try {
			// SECURITY: Sanitize HTML using DOMPurify to prevent XSS attacks
			const sanitisedHTML = value ? sanitizeRichText(value) : "";

			// Store current scroll position
			const scrollX = window.scrollX;
			const scrollY = window.scrollY;

			// Get the root element and prevent it from being scrolled into view
			const rootElement = editor.getRootElement();
			if (rootElement) {
				// Temporarily override scrollIntoView to prevent auto-scroll
				const originalScrollIntoView = rootElement.scrollIntoView;
				rootElement.scrollIntoView = () => {};

				editor.update(
					() => {
						const root = $getRoot();
						root.clear();

						// Only insert nodes if there's content
						if (sanitisedHTML) {
							const parser = new DOMParser();
							const dom = parser.parseFromString(sanitisedHTML, "text/html");
							const nodes = $generateNodesFromDOM(editor, dom);
							$insertNodes(nodes);
						}
					},
					{
						discrete: true,
						tag: "controlled-value-update",
					}
				);

				// Restore scroll position immediately after content insertion
				window.scrollTo(scrollX, scrollY);

				// Restore scrollIntoView after a delay
				setTimeout(() => {
					rootElement.scrollIntoView = originalScrollIntoView;
				}, 100);
			}

			lastValue.current = value;
		} catch (error) {
			console.error("[ControlledValuePlugin] Error updating value:", error);
		}
	}, [editor, value]);

	return null;
};
