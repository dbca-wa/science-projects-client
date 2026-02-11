/**
 * ListButton Component
 *
 * Buttons for creating bullet and numbered lists.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import type { LexicalNode } from "lexical";
import {
	$isListNode,
	ListNode,
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
	REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { List, ListOrdered } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ListButtonProps {
	listType: "bullet" | "number";
	disabled?: boolean;
}

export const ListButton: React.FC<ListButtonProps> = ({
	listType,
	disabled = false,
}) => {
	const [editor] = useLexicalComposerContext();
	const [isActive, setIsActive] = useState(false);

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const anchorNode = selection.anchor.getNode();

			// Start from the anchor node and traverse up to find a list
			let currentNode: LexicalNode | null = anchorNode;
			while (currentNode) {
				const parent: LexicalNode | null = currentNode.getParent();
				if (parent && $isListNode(parent)) {
					const listTag = (parent as ListNode).getTag();
					setIsActive(
						(listType === "bullet" && listTag === "ul") ||
							(listType === "number" && listTag === "ol")
					);
					return;
				}
				currentNode = parent;
			}
			setIsActive(false);
		}
	}, [listType]);

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				updateToolbar();
				return false;
			},
			1
		);
	}, [editor, updateToolbar]);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateToolbar();
			});
		});
	}, [editor, updateToolbar]);

	const handleClick = () => {
		if (isActive) {
			editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
		} else {
			if (listType === "bullet") {
				editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
			} else {
				editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
			}
		}
	};

	const Icon = listType === "bullet" ? List : ListOrdered;
	const label = listType === "bullet" ? "Bullet List" : "Numbered List";

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className={`h-8 w-8 p-0 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""}`}
			onClick={handleClick}
			disabled={disabled}
			aria-label={label}
			title={label}
		>
			<Icon className="h-4 w-4" />
		</Button>
	);
};
