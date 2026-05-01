/**
 * PastePlugin
 *
 * Handles paste events from Microsoft Word documents.
 * Converts Word HTML to Lexical nodes while stripping unsupported formatting.
 *
 * Security: All pasted HTML is sanitised using DOMPurify before processing
 * to prevent XSS attacks. This protects against malicious content in clipboard.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { PASTE_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes, $getSelection, $isRangeSelection } from "lexical";
import { sanitizeRichText } from "@/shared/utils/sanitise.utils";

interface PastePluginProps {
	stripBold?: boolean;
}

/**
 * Strip bold formatting tags (<strong> and <b>) from HTML,
 * preserving the inner content.
 */
function stripBoldTags(html: string): string {
	return html.replace(/<\/?strong[^>]*>/gi, "").replace(/<\/?b[^>]*>/gi, "");
}

export const PastePlugin = ({ stripBold = false }: PastePluginProps) => {
	const [editor] = useLexicalComposerContext();

	// Handle bold stripping for all pasted HTML content
	useEffect(() => {
		if (!stripBold) return;

		return editor.registerCommand(
			PASTE_COMMAND,
			(event: ClipboardEvent) => {
				const clipboardData = event.clipboardData;
				if (!clipboardData) return false;

				const html = clipboardData.getData("text/html");
				if (!html) return false;

				// Only intercept if the pasted HTML contains bold tags
				if (!/<\/?(?:strong|b)\b[^>]*>/i.test(html)) return false;

				event.preventDefault();

				editor.update(() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return;

					// SECURITY: Sanitise clipboard HTML before processing to prevent XSS
					const sanitisedHTML = sanitizeRichText(html);

					// Strip bold tags from the sanitised HTML
					const cleanedHTML = stripBoldTags(sanitisedHTML);

					const parser = new DOMParser();
					const dom = parser.parseFromString(cleanedHTML, "text/html");
					const nodes = $generateNodesFromDOM(editor, dom);
					$insertNodes(nodes);
				});

				return true;
			},
			// Use CRITICAL priority so this runs before the Word paste handler
			4
		);
	}, [editor, stripBold]);

	useEffect(() => {
		return editor.registerCommand(
			PASTE_COMMAND,
			(event: ClipboardEvent) => {
				const clipboardData = event.clipboardData;
				if (!clipboardData) return false;

				const html = clipboardData.getData("text/html");
				if (!html) return false;

				// Check if it's from Word (contains Word-specific metadata)
				const isFromWord =
					html.includes("urn:schemas-microsoft-com:office:word") ||
					html.includes("mso-") ||
					html.includes("MsoNormal");

				if (!isFromWord) return false;

				event.preventDefault();

				editor.update(() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return;

					// SECURITY: Sanitise clipboard HTML first to prevent XSS attacks
					// This removes script tags, event handlers, and dangerous protocols
					const sanitisedHTML = sanitizeRichText(html);

					// Clean Word HTML (remove Word-specific formatting)
					const cleanedHTML = cleanWordHTML(sanitisedHTML);

					// Parse cleaned HTML
					const parser = new DOMParser();
					const dom = parser.parseFromString(cleanedHTML, "text/html");

					// Generate Lexical nodes from DOM
					const nodes = $generateNodesFromDOM(editor, dom);

					// Insert nodes at selection
					$insertNodes(nodes);
				});

				return true;
			},
			COMMAND_PRIORITY_HIGH
		);
	}, [editor]);

	return null;
};

/**
 * Clean Word HTML by removing unsupported formatting
 */
function cleanWordHTML(html: string): string {
	// Remove Word-specific XML namespaces and metadata
	html = html.replace(/<\?xml[^>]*>/g, "");
	html = html.replace(/<\/?o:[^>]*>/g, "");
	html = html.replace(/<\/?w:[^>]*>/g, "");
	html = html.replace(/<\/?m:[^>]*>/g, "");
	html = html.replace(/<\/?v:[^>]*>/g, "");

	// Parse HTML
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// Remove unsupported elements (no registered Lexical nodes for these)
	const unsupportedElements = doc.querySelectorAll(
		"style, script, meta, link, img, object, embed, applet, video, audio, canvas, svg, iframe"
	);
	unsupportedElements.forEach((el) => el.remove());

	// Unwrap non-semantic block elements to paragraphs, preserving inner content
	const blockElementsToUnwrap = doc.querySelectorAll(
		"section, article, header, footer, nav, aside, figure, figcaption, main"
	);
	blockElementsToUnwrap.forEach((el) => {
		const p = doc.createElement("p");
		p.innerHTML = el.innerHTML;
		el.replaceWith(p);
	});

	// Clean all elements
	const allElements = doc.querySelectorAll("*");
	allElements.forEach((el) => {
		// Remove Word-specific classes
		const className = el.getAttribute("class") || "";
		if (className.includes("Mso") || className.includes("mso")) {
			el.removeAttribute("class");
		}

		// Remove Word-specific styles
		const style = el.getAttribute("style") || "";
		if (style) {
			// Remove mso-* styles, font-family, font-size, color
			const cleanedStyle = style
				.split(";")
				.filter((s) => {
					const prop = s.trim().split(":")[0];
					return (
						prop &&
						!prop.startsWith("mso-") &&
						prop !== "font-family" &&
						prop !== "font-size" &&
						prop !== "color" &&
						prop !== "background" &&
						prop !== "background-color"
					);
				})
				.join(";");

			if (cleanedStyle) {
				el.setAttribute("style", cleanedStyle);
			} else {
				el.removeAttribute("style");
			}
		}

		// Remove other Word-specific attributes
		const attributesToRemove = ["lang", "xml:lang"];
		attributesToRemove.forEach((attr) => {
			if (el.hasAttribute(attr)) {
				el.removeAttribute(attr);
			}
		});
	});

	return doc.body.innerHTML;
}
