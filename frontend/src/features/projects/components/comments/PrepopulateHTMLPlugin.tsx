import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getRoot,
	$createParagraphNode,
	$createTextNode,
	type ElementNode,
} from "lexical";
import { $createListNode, $createListItemNode } from "@lexical/list";
import { $createMentionNode } from "@/shared/nodes/MentionNode";

interface PrepopulateHTMLPluginProps {
	html: string;
}

/**
 * PrepopulateHTMLPlugin
 *
 * Plugin to populate Lexical editor with HTML content.
 * Parses HTML and converts it to Lexical editor state.
 *
 * Supports:
 * - Paragraphs
 * - Bold, italic, underline text
 * - Ordered and unordered lists
 * - Mentions (span elements with data-user-id attribute)
 */
export const PrepopulateHTMLPlugin = ({ html }: PrepopulateHTMLPluginProps) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!html) return;

		editor.update(() => {
			const root = $getRoot();
			root.clear();

			// Parse HTML
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");
			const body = doc.body;

			// Process each child node
			body.childNodes.forEach((node) => {
				processNode(node, root);
			});
		});
	}, [editor, html]);

	return null;
};

/**
 * Process a DOM node and convert it to Lexical nodes
 */
function processNode(domNode: Node, lexicalParent: ElementNode) {
	if (domNode.nodeType === Node.TEXT_NODE) {
		// Text node
		const text = domNode.textContent || "";
		if (text.trim()) {
			const textNode = $createTextNode(text);
			lexicalParent.append(textNode);
		}
	} else if (domNode.nodeType === Node.ELEMENT_NODE) {
		const element = domNode as HTMLElement;
		const tagName = element.tagName.toLowerCase();

		switch (tagName) {
			case "p": {
				// Paragraph
				const paragraphNode = $createParagraphNode();
				element.childNodes.forEach((child) => {
					processNode(child, paragraphNode);
				});
				lexicalParent.append(paragraphNode);
				break;
			}

			case "ul": {
				// Unordered list
				const listNode = $createListNode("bullet");
				element.childNodes.forEach((child) => {
					if (child.nodeName.toLowerCase() === "li") {
						const listItemNode = $createListItemNode();
						(child as HTMLElement).childNodes.forEach((grandchild) => {
							processNode(grandchild, listItemNode);
						});
						listNode.append(listItemNode);
					}
				});
				lexicalParent.append(listNode);
				break;
			}

			case "ol": {
				// Ordered list
				const listNode = $createListNode("number");
				element.childNodes.forEach((child) => {
					if (child.nodeName.toLowerCase() === "li") {
						const listItemNode = $createListItemNode();
						(child as HTMLElement).childNodes.forEach((grandchild) => {
							processNode(grandchild, listItemNode);
						});
						listNode.append(listItemNode);
					}
				});
				lexicalParent.append(listNode);
				break;
			}

			case "span": {
				// Check if it's a mention
				const userId = element.getAttribute("data-user-id");
				const displayName = element.getAttribute("data-display-name");
				const email = element.getAttribute("data-email");

				if (userId && displayName) {
					// Mention node
					const mentionNode = $createMentionNode({
						user_id: parseInt(userId, 10),
						display_name: displayName,
						email: email || "",
					});
					lexicalParent.append(mentionNode);
				} else {
					// Regular span - process children
					element.childNodes.forEach((child) => {
						processNode(child, lexicalParent);
					});
				}
				break;
			}

			case "strong":
			case "b": {
				// Bold text
				const textNode = $createTextNode(element.textContent || "");
				textNode.toggleFormat("bold");
				lexicalParent.append(textNode);
				break;
			}

			case "em":
			case "i": {
				// Italic text
				const textNode = $createTextNode(element.textContent || "");
				textNode.toggleFormat("italic");
				lexicalParent.append(textNode);
				break;
			}

			case "u": {
				// Underline text
				const textNode = $createTextNode(element.textContent || "");
				textNode.toggleFormat("underline");
				lexicalParent.append(textNode);
				break;
			}

			default: {
				// Unknown element - process children
				element.childNodes.forEach((child) => {
					processNode(child, lexicalParent);
				});
				break;
			}
		}
	}
}
