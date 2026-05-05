/**
 * PastePlugin
 *
 * Handles paste events including Microsoft Word documents.
 * Strips disallowed content based on the editor's toolbar mode configuration.
 *
 * Security: All pasted HTML is sanitised using DOMPurify before processing
 * to prevent XSS attacks. This protects against malicious content in clipboard.
 *
 * Flow:
 * 1. Detect paste event
 * 2. Get HTML from clipboard
 * 3. Sanitise with DOMPurify (sanitizeRichText)
 * 4. If Word content: clean Word HTML (cleanWordHTML)
 * 5. Strip disallowed content based on mode (stripDisallowedContent)
 * 6. Parse to DOM, generate Lexical nodes, insert
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { PASTE_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { $insertNodes, $getSelection, $isRangeSelection } from "lexical";
import { sanitizeRichText } from "@/shared/utils/sanitise.utils";
import { TOOLBAR_CONFIGS } from "../toolbar/toolbar-configs";
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
 */
function stripDisallowedContent(doc: Document, mode: ToolbarMode): Document {
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

	return doc;
}

export const PastePlugin = ({ mode = "full" }: PastePluginProps) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			PASTE_COMMAND,
			(event: ClipboardEvent) => {
				const clipboardData = event.clipboardData;
				if (!clipboardData) return false;

				const html = clipboardData.getData("text/html");
				if (!html) return false;

				event.preventDefault();

				editor.update(() => {
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return;

					// Step 1: Sanitise clipboard HTML to prevent XSS attacks
					let processedHTML = sanitizeRichText(html);

					// Step 2: If Word content, clean Word-specific formatting
					const isFromWord =
						html.includes("urn:schemas-microsoft-com:office:word") ||
						html.includes("mso-") ||
						html.includes("MsoNormal");

					if (isFromWord) {
						processedHTML = cleanWordHTML(processedHTML);
					}

					// Step 3: Strip disallowed content based on mode
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

/**
 * Clean Word HTML by removing unsupported formatting.
 *
 * Strips Word-specific XML namespaces, metadata, styles, and classes
 * while preserving the semantic HTML structure (lists, headings, etc.)
 * so that mode-aware stripping can evaluate them correctly.
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
