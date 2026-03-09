/**
 * UndoRedoButtons Component
 *
 * Undo and Redo buttons with disabled state based on history.
 * Receives state and actions from parent Toolbar component.
 */

import React from "react";
import { Undo, Redo } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { UndoRedoButtonsProps } from "@/shared/types/editor.types";

export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
	canUndo,
	canRedo,
	onUndo,
	onRedo,
	disabled = false,
}) => {
	return (
		<>
			<BaseToolbarButton
				icon={Undo}
				label="Undo (Ctrl+Z)"
				onClick={onUndo}
				disabled={disabled || !canUndo}
			/>
			<BaseToolbarButton
				icon={Redo}
				label="Redo (Ctrl+Shift+Z)"
				onClick={onRedo}
				disabled={disabled || !canRedo}
			/>
		</>
	);
};
