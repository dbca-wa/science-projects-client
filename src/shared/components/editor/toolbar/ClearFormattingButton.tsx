/**
 * ClearFormattingButton Component
 *
 * Button to remove all text formatting while preserving content.
 */

import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $isTextNode } from "lexical";
import { RemoveFormatting } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

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
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className="h-8 w-8 p-0"
			onClick={handleClick}
			disabled={disabled}
			aria-label="Clear formatting"
			title="Clear formatting"
		>
			<RemoveFormatting className="h-4 w-4" />
		</Button>
	);
};
