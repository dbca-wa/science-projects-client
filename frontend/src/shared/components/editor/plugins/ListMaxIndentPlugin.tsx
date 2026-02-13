/**
 * ListMaxIndentPlugin
 *
 * Limits the maximum nesting depth of lists to prevent excessive indentation.
 * Default max depth is 9 (3 sets of 3 levels: disc/circle/square pattern repeats 4 times).
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getListDepth, $isListItemNode, $isListNode } from "@lexical/list";
import {
	$getSelection,
	$isElementNode,
	$isRangeSelection,
	COMMAND_PRIORITY_CRITICAL,
	INDENT_CONTENT_COMMAND,
	type ElementNode,
	type RangeSelection,
} from "lexical";

interface ListMaxIndentPluginProps {
	maxDepth?: number;
}

function getElementNodesInSelection(
	selection: RangeSelection
): Set<ElementNode> {
	const nodesInSelection = selection.getNodes();

	if (nodesInSelection.length === 0) {
		return new Set([
			selection.anchor.getNode().getParentOrThrow(),
			selection.focus.getNode().getParentOrThrow(),
		]);
	}

	return new Set(
		nodesInSelection.map((n) => ($isElementNode(n) ? n : n.getParentOrThrow()))
	);
}

function isIndentPermitted(maxDepth: number): boolean {
	const selection = $getSelection();

	if (!$isRangeSelection(selection)) {
		return false;
	}

	const elementNodesInSelection = getElementNodesInSelection(selection);
	let totalDepth = 0;

	for (const elementNode of elementNodesInSelection) {
		if ($isListNode(elementNode)) {
			totalDepth = Math.max($getListDepth(elementNode) + 1, totalDepth);
		} else if ($isListItemNode(elementNode)) {
			const parent = elementNode.getParent();

			if (!$isListNode(parent)) {
				throw new Error(
					"ListMaxIndentPlugin: A ListItemNode must have a ListNode for a parent."
				);
			}

			totalDepth = Math.max($getListDepth(parent) + 1, totalDepth);
		}
	}

	return totalDepth <= maxDepth;
}

export function ListMaxIndentPlugin({
	maxDepth = 12,
}: ListMaxIndentPluginProps): null {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			INDENT_CONTENT_COMMAND,
			() => !isIndentPermitted(maxDepth),
			COMMAND_PRIORITY_CRITICAL
		);
	}, [editor, maxDepth]);

	return null;
}
