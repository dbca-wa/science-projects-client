/**
 * PrepopulateHTMLPlugin
 *
 * Lexical plugin that loads initial HTML content into the editor ONCE on mount.
 * This plugin should only handle the initial content loading, not subsequent updates.
 *
 * For controlled component behavior (responding to external value changes like Clear button),
 * use ControlledValuePlugin instead.
 *
 * Security: All HTML content is sanitised using DOMPurify before rendering
 * to prevent XSS attacks from stored content. This addresses CodeQL/Seer
 * vulnerabilities related to incomplete regex-based sanitisation.
 */

import React, { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";
import { sanitizeRichText } from "@/shared/utils/sanitise.utils";

interface PrepopulateHTMLPluginProps {
	html?: string;
}

export const PrepopulateHTMLPlugin: React.FC<PrepopulateHTMLPluginProps> = ({
	html,
}) => {
	const [editor] = useLexicalComposerContext();
	const isInitialized = useRef(false);

	useEffect(() => {
		// Only run once on mount
		if (isInitialized.current) return;

		try {
			// SECURITY: Sanitise HTML using DOMPurify to prevent XSS attacks
			// This replaces the previous incomplete regex-based sanitisation
			// and addresses all CodeQL/Seer vulnerabilities in this file:
			// - Script tag variations
			// - Event handler attribute variations
			// - Dangerous URL protocols (javascript:, data:, vbscript:)
			const sanitisedHTML = html ? sanitizeRichText(html) : "";

			// Store current scroll position
			const scrollX = window.scrollX;
			const scrollY = window.scrollY;

			// Store currently focused element
			const activeElement = document.activeElement as HTMLElement;

			// Get the root element and prevent it from being scrolled into view
			const rootElement = editor.getRootElement();
			if (rootElement) {
				// Temporarily override scrollIntoView to prevent auto-scroll
				const originalScrollIntoView = rootElement.scrollIntoView;
				rootElement.scrollIntoView = () => {};

				// Temporarily override focus to prevent auto-focus
				// Use try-catch for test environments where focus may be read-only
				let originalFocus: (() => void) | undefined;
				try {
					originalFocus = rootElement.focus;
					rootElement.focus = () => {};
				} catch {
					// In test environments (JSDOM), focus may be read-only
					// This is acceptable as we don't need focus prevention in tests
					originalFocus = undefined;
				}

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
						tag: "history-merge",
					}
				);

				// Restore scroll position immediately after content insertion
				window.scrollTo(scrollX, scrollY);

				// Restore focus to the previously focused element if it wasn't the editor
				if (
					activeElement &&
					activeElement !== rootElement &&
					activeElement !== document.body
				) {
					activeElement.focus();
				}

				// Restore scrollIntoView and focus after a delay
				setTimeout(() => {
					rootElement.scrollIntoView = originalScrollIntoView;
					// Only restore focus if we successfully overrode it
					if (originalFocus) {
						try {
							rootElement.focus = originalFocus;
						} catch {
							// Ignore errors in test environments
						}
					}
				}, 100);
			}

			isInitialized.current = true;
		} catch (error) {
			console.error("[PrepopulateHTMLPlugin] Error loading HTML:", error);
		}
	}, [editor, html]);

	return null;
};
