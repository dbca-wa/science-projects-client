/**
 * SuperscriptButton Component
 *
 * Toggle button for superscript formatting.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	FORMAT_TEXT_COMMAND,
	SELECTION_CHANGE_COMMAND,
	COMMAND_PRIORITY_LOW,
} from "lexical";
import { Superscript } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface SuperscriptButtonProps {
	disabled?: boolean;
}

export const SuperscriptButton: React.FC<SuperscriptButtonProps> = ({
	disabled = false,
}) => {
	const [editor] = useLexicalComposerContext();
	const [isActive, setIsActive] = useState(false);

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			setIsActive(selection.hasFormat("superscript"));
		}
	}, []);

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				updateToolbar();
				return false;
			},
			COMMAND_PRIORITY_LOW
		);
	}, [editor, updateToolbar]);

	const handleClick = () => {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
	};

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className={`h-8 w-8 p-0 ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""}`}
			onClick={handleClick}
			disabled={disabled}
			aria-label="Superscript (Ctrl+.)"
			title="Superscript (Ctrl+.)"
		>
			<Superscript className="h-4 w-4" />
		</Button>
	);
};
