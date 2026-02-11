/**
 * UndoRedoButtons Component
 *
 * Undo and Redo buttons with disabled state based on history.
 */

import React, { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	UNDO_COMMAND,
	REDO_COMMAND,
	CAN_UNDO_COMMAND,
	CAN_REDO_COMMAND,
	COMMAND_PRIORITY_LOW,
} from "lexical";
import { Undo, Redo } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface UndoRedoButtonsProps {
	disabled?: boolean;
}

export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
	disabled = false,
}) => {
	const [editor] = useLexicalComposerContext();
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	useEffect(() => {
		return editor.registerCommand(
			CAN_UNDO_COMMAND,
			(payload) => {
				setCanUndo(payload);
				return false;
			},
			COMMAND_PRIORITY_LOW
		);
	}, [editor]);

	useEffect(() => {
		return editor.registerCommand(
			CAN_REDO_COMMAND,
			(payload) => {
				setCanRedo(payload);
				return false;
			},
			COMMAND_PRIORITY_LOW
		);
	}, [editor]);

	const handleUndo = useCallback(() => {
		editor.dispatchCommand(UNDO_COMMAND, undefined);
	}, [editor]);

	const handleRedo = useCallback(() => {
		editor.dispatchCommand(REDO_COMMAND, undefined);
	}, [editor]);

	return (
		<>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={handleUndo}
				disabled={disabled || !canUndo}
				aria-label="Undo (Ctrl+Z)"
				title="Undo (Ctrl+Z)"
			>
				<Undo className="h-4 w-4" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={handleRedo}
				disabled={disabled || !canRedo}
				aria-label="Redo (Ctrl+Shift+Z)"
				title="Redo (Ctrl+Shift+Z)"
			>
				<Redo className="h-4 w-4" />
			</Button>
		</>
	);
};
