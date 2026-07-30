/**
 * PastePlugin
 *
 * Handles paste events including Microsoft Word documents.
 * Strips disallowed content based on the editor's toolbar mode configuration.
 *
 * Security: All pasted HTML is sanitised using DOMPurify before processing
 * to prevent XSS attacks. This protects against malicious content in clipboard.
 *
 * Pipeline:
 * 1. Sanitise clipboard HTML (DOMPurify — always first)
 * 2. Detect Word source on ORIGINAL clipboard HTML (before sanitisation)
 * 3. If Word: convert Word HTML to semantic HTML
 * 4. Parse to DOM and strip disallowed content based on mode
 * 5. Generate Lexical nodes and insert
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { PASTE_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import {
	$insertNodes,
	$getSelection,
	$isRangeSelection,
	type PasteCommandType,
} from "lexical";
import { sanitizeRichText } from "@/shared/utils/sanitise.utils";
import { TOOLBAR_CONFIGS } from "../toolbar/toolbar-configs";
import { detectWordSource } from "../utils/word-detector";
import { convertWordHTML } from "../utils/word-converter";
import type { ToolbarMode } from "@/shared/types/editor.types";

interface PastePluginProps {
	mode?: ToolbarMode;
}

/**
 * Strips disallowed content from a parsed DOM document based on the toolbar mode.
 *
 * Walks the DOM and converts or removes elements that are not permitted
 * by the given mode's configuration. This ensures pasted content conforms
 * to the editor's allowed formatting and block types.
 *
 * Wrapped in try/catch for graceful degradation — never throws.
 */
function stripDisallowedContent(doc: Document, mode: ToolbarMode): Document {
	try {
		const config = TOOLBAR_CONFIGS[mode];

		// Strip lists: convert <ul>, <ol>, <li> to <p> tags (preserve text content)
		if (!config.blocks.lists) {
			const listItems = doc.querySelectorAll("li");
			listItems.forEach((li) => {
				const p = doc.createElement("p");
				p.innerHTML = li.innerHTML;
				li.replaceWith(p);
			});
			// Remove any remaining <ul> and <ol> wrappers, promoting children
			const lists = doc.querySelectorAll("ul, ol");
			lists.forEach((list) => {
				const fragment = doc.createDocumentFragment();
				while (list.firstChild) {
					fragment.appendChild(list.firstChild);
				}
				list.replaceWith(fragment);
			});
		}

		// Strip tables: extract text from cells as <p> tags (one per cell, row order)
		if (!config.blocks.tables) {
			const tables = doc.querySelectorAll("table");
			tables.forEach((table) => {
				const fragment = doc.createDocumentFragment();
				const cells = table.querySelectorAll("td, th");
				cells.forEach((cell) => {
					const textContent = cell.textContent?.trim();
					if (textContent) {
						const p = doc.createElement("p");
						p.textContent = textContent;
						fragment.appendChild(p);
					}
				});
				table.replaceWith(fragment);
			});
		}

		// Strip headings: convert <h1>-<h6> to <p> tags (preserve inner HTML)
		if (!config.blocks.headings) {
			const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
			headings.forEach((heading) => {
				const p = doc.createElement("p");
				p.innerHTML = heading.innerHTML;
				heading.replaceWith(p);
			});
		}

		// Strip bold: unwrap <strong> and <b> tags (preserve inner content)
		if (!config.formatting.bold) {
			const boldElements = doc.querySelectorAll("strong, b");
			boldElements.forEach((el) => {
				const fragment = doc.createDocumentFragment();
				while (el.firstChild) {
					fragment.appendChild(el.firstChild);
				}
				el.replaceWith(fragment);
			});
		}

		// Strip italic: unwrap <em> and <i> tags (preserve inner content)
		if (!config.formatting.italic) {
			const italicElements = doc.querySelectorAll("em, i");
			italicElements.forEach((el) => {
				const fragment = doc.createDocumentFragment();
				while (el.firstChild) {
					fragment.appendChild(el.firstChild);
				}
				el.replaceWith(fragment);
			});
		}

		// Strip underline: unwrap <u> tags (preserve inner content)
		if (!config.formatting.underline) {
			const underlineElements = doc.querySelectorAll("u");
			underlineElements.forEach((el) => {
				const fragment = doc.createDocumentFragment();
				while (el.firstChild) {
					fragment.appendChild(el.firstChild);
				}
				el.replaceWith(fragment);
			});
		}

		// Strip strikethrough: unwrap <s> and <del> tags (preserve inner content)
		if (!config.formatting.strikethrough) {
			const strikethroughElements = doc.querySelectorAll("s, del");
			strikethroughElements.forEach((el) => {
				const fragment = doc.createDocumentFragment();
				while (el.firstChild) {
					fragment.appendChild(el.firstChild);
				}
				el.replaceWith(fragment);
			});
		}

		// Strip superscript: unwrap <sup> tags (preserve inner content)
		if (!config.formatting.superscript) {
			const supElements = doc.querySelectorAll("sup");
			supElements.forEach((el) => {
				const fragment = doc.createDocumentFragment();
				while (el.firstChild) {
					fragment.appendChild(el.firstChild);
				}
				el.replaceWith(fragment);
			});
		}

		// Strip subscript: unwrap <sub> tags (preserve inner content)
		if (!config.formatting.subscript) {
			const subElements = doc.querySelectorAll("sub");
			subElements.forEach((el) => {
				const fragment = doc.createDocumentFragment();
				while (el.firstChild) {
					fragment.appendChild(el.firstChild);
				}
				el.replaceWith(fragment);
			});
		}

		// Strip links: unwrap <a> tags (preserve link text, discard href)
		if (!config.features.links) {
			const links = doc.querySelectorAll("a");
			links.forEach((el) => {
				const fragment = doc.createDocumentFragment();
				while (el.firstChild) {
					fragment.appendChild(el.firstChild);
				}
				el.replaceWith(fragment);
			});
		}

		// Strip images: remove <img> tags entirely
		if (!config.features.images) {
			const images = doc.querySelectorAll("img");
			images.forEach((img) => img.remove());
		}
	} catch (error: unknown) {
		// Graceful degradation — return the document as-is if stripping fails
		const message = error instanceof Error ? error.message : "Unknown error";
		console.warn(`[PastePlugin] stripDisallowedContent failed: ${message}`);
	}

	return doc;
}

export const PastePlugin = ({ mode = "full" }: PastePluginProps) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			PASTE_COMMAND,
			(event: PasteCommandType) => {
				// Only handle ClipboardEvents (not InputEvents)
				if (!(event instanceof ClipboardEvent)) return false;

				const clipboardData = event.clipboardData;
				if (!clipboardData) return false;

				const html = clipboardData.getData("text/html");
				if (!html) return false;

				event.preventDefault();

				editor.update(() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return;

					// Step 1: Sanitise clipboard HTML (security — always first)
					let processedHTML = sanitizeRichText(html);

					// Step 2: Detect and convert Word content
					const source = detectWordSource(html);
					if (source.isWord && source.variant) {
						processedHTML = convertWordHTML(processedHTML, source.variant);
					}

					// Step 3: Parse and strip disallowed content based on mode
					const parser = new DOMParser();
					const dom = parser.parseFromString(processedHTML, "text/html");
					stripDisallowedContent(dom, mode);

					// Step 4: Generate Lexical nodes from the cleaned DOM and insert
					const nodes = $generateNodesFromDOM(editor, dom);
					$insertNodes(nodes);
				});

				return true;
			},
			COMMAND_PRIORITY_HIGH
		);
	}, [editor, mode]);

	return null;
};
