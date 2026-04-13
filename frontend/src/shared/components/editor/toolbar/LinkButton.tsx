/**
 * LinkButton Component
 *
 * Simplified toolbar button for inserting and editing links.
 * Opens the inline link editor panel via LinkEditorContext.
 * Uses BaseToolbarButton for consistent styling.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $isLinkNode } from "@lexical/link";
import { Link as LinkIcon } from "lucide-react";
import type { LinkButtonProps } from "@/shared/types/editor.types";
import { BaseToolbarButton } from "./BaseToolbarButton";
import { useLinkEditor } from "./link-editor.utils";

export const LinkButton: React.FC<LinkButtonProps> = ({
	isActive,
	disabled = false,
}) => {
	const [editor] = useLexicalComposerContext();
	const [hasSelection, setHasSelection] = useState(false);
	const [currentLinkUrl, setCurrentLinkUrl] = useState("");
	const linkEditor = useLinkEditor();

	const updateSelectionState = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const node = selection.anchor.getNode();
			const parent = node.getParent();

			let linkNode = null;
			if ($isLinkNode(node)) {
				linkNode = node;
			} else if (parent && $isLinkNode(parent)) {
				linkNode = parent;
			}

			setCurrentLinkUrl(linkNode ? linkNode.getURL() : "");
			setHasSelection(!selection.isCollapsed());
		}
	}, []);

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				updateSelectionState();
				return false;
			},
			1
		);
	}, [editor, updateSelectionState]);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateSelectionState();
			});
		});
	}, [editor, updateSelectionState]);

	const handleClick = () => {
		if (!linkEditor) return;

		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) {
				linkEditor.openLinkEditor({
					hasSelection: false,
					isEditing: false,
					selection: null,
				});
				return;
			}

			const clonedSelection = selection.clone();

			if (isActive && currentLinkUrl) {
				// Find the link node key for reliable removal
				const node = selection.anchor.getNode();
				const parent = node.getParent();
				let linkKey: string | null = null;
				if ($isLinkNode(node)) linkKey = node.getKey();
				else if (parent && $isLinkNode(parent)) linkKey = parent.getKey();

				linkEditor.openLinkEditor({
					url: currentLinkUrl,
					hasSelection: true,
					isEditing: true,
					selection: clonedSelection,
					linkNodeKey: linkKey,
				});
			} else if (hasSelection) {
				linkEditor.openLinkEditor({
					hasSelection: true,
					isEditing: false,
					selection: clonedSelection,
				});
			} else {
				linkEditor.openLinkEditor({
					hasSelection: false,
					isEditing: false,
					selection: null,
				});
			}
		});
	};

	return (
		<BaseToolbarButton
			icon={LinkIcon}
			label={isActive ? "Edit Link" : "Add Link"}
			onClick={handleClick}
			isActive={isActive}
			disabled={disabled}
		/>
	);
};
