/**
 * ClearFormattingButton Component
 *
 * Button to remove all text formatting while preserving content.
 */

import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $isTextNode } from "lexical";
import { RemoveFormatting } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";

interface ClearFormattingButtonProps {
	disabled?: boolean;
}

export const ClearFormattingButton: React.FC<ClearFormattingButtonProps> = ({
	disabled = false,
}) => {
	const [editor] = useLexicalComposerContext();

	const handleClick = () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				// Get all nodes in the selection
				const nodes = selection.getNodes();

				// Clear formatting on each text node
				nodes.forEach((node) => {
					if ($isTextNode(node)) {
						// Remove all formats by setting format to 0 (no formatting)
						node.setFormat(0);
					}
				});
			}
		});
	};

	return (
		<BaseToolbarButton
			icon={RemoveFormatting}
			label="Clear formatting"
			onClick={handleClick}
			disabled={disabled}
		/>
	);
};
