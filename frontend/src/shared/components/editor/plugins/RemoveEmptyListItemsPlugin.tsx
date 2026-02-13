/**
 * RemoveEmptyListItemsPlugin
 *
 * Automatically removes empty list items that appear after deletions.
 * This prevents orphaned empty bullets from appearing when lists are deleted.
 *
 * Only removes empty list items when the selection is NOT in them,
 * to avoid interfering with users creating new list items.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isListItemNode, $isListNode } from "@lexical/list";
import {
	$getRoot,
	$getSelection,
	$isElementNode,
	$isParagraphNode,
	$isRangeSelection,
	$isTextNode,
} from "lexical";
import type { LexicalNode } from "lexical";

function $removeEmptyListItems(): void {
	const root = $getRoot();
	const selection = $getSelection();
	const nodesToRemove: LexicalNode[] = [];

	// Get the node where the selection is (if any)
	let selectedNode: LexicalNode | null = null;
	if ($isRangeSelection(selection)) {
		selectedNode = selection.anchor.getNode();
	}

	function checkNode(node: LexicalNode): void {
		if ($isListItemNode(node)) {
			// Check if the list item is truly empty (no text content)
			const textContent = node.getTextContent().trim();

			if (textContent === "") {
				// Don't remove if the selection is in this node or its descendants
				// This allows users to create new list items by pressing Enter
				if (selectedNode) {
					let current: LexicalNode | null = selectedNode;
					while (current) {
						if (current === node) {
							// Selection is in this empty node, don't remove it
							return;
						}
						current = current.getParent();
					}
				}

				// Check if it only contains empty paragraphs or nested empty lists
				const children = node.getChildren();
				let hasContent = false;

				for (const child of children) {
					if ($isTextNode(child) && child.getTextContent().trim() !== "") {
						hasContent = true;
						break;
					}
					if ($isParagraphNode(child)) {
						const paragraphText = child.getTextContent().trim();
						if (paragraphText !== "") {
							hasContent = true;
							break;
						}
					}
					// If it has a non-empty nested list, it has content
					if ($isListNode(child)) {
						const listText = child.getTextContent().trim();
						if (listText !== "") {
							hasContent = true;
							break;
						}
					}
				}

				if (!hasContent) {
					// Check if removing this would leave the parent list empty
					const parentList = node.getParent();
					if ($isListNode(parentList)) {
						const siblings = parentList.getChildren();
						const nonEmptySiblings = siblings.filter((sibling: LexicalNode) => {
							if (sibling === node) return false;
							return sibling.getTextContent().trim() !== "";
						});

						// If this is the last item in the list, mark the whole list for removal
						if (nonEmptySiblings.length === 0) {
							nodesToRemove.push(parentList);
						} else {
							// Otherwise just remove this empty item
							nodesToRemove.push(node);
						}
					} else {
						nodesToRemove.push(node);
					}
				}
			}
		}

		// Recursively check children
		if ($isElementNode(node)) {
			const children = node.getChildren();
			children.forEach(checkNode);
		}
	}

	checkNode(root);

	// Remove all marked nodes
	nodesToRemove.forEach((node) => {
		try {
			if (node.isAttached()) {
				node.remove();
			}
		} catch (e) {
			// Node might have been removed already as part of parent removal
			console.debug("Could not remove node:", e);
		}
	});
}

export function RemoveEmptyListItemsPlugin(): null {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | null = null;

		return editor.registerUpdateListener(
			({ editorState, dirtyElements, dirtyLeaves }) => {
				// Only run if there were changes
				if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
					// Check if any list nodes were modified
					let hasListChanges = false;

					for (const [nodeKey] of dirtyElements) {
						const node = editorState._nodeMap.get(nodeKey);
						if (node && ($isListNode(node) || $isListItemNode(node))) {
							hasListChanges = true;
							break;
						}
					}

					if (hasListChanges) {
						// Debounce cleanup to avoid excessive updates
						if (timeoutId) {
							clearTimeout(timeoutId);
						}

						timeoutId = setTimeout(() => {
							editor.update(
								() => {
									$removeEmptyListItems();
								},
								{
									tag: "history-merge",
								}
							);
							timeoutId = null;
						}, 50); // Short delay to let Lexical finish its updates
					}
				}
			}
		);
	}, [editor]);

	return null;
}
