/**
 * ClearEditorButton Component
 *
 * Button to clear all editor content and reset to empty state.
 */

import React from "react";
import { Eraser } from "lucide-react";
import type { ClearEditorButtonProps } from "@/shared/types/editor.types";

export const ClearEditorButton: React.FC<ClearEditorButtonProps> = ({
	onClear,
	disabled = false,
}) => {
	return (
		<button
			type="button"
			className="editor-toolbar-button"
			onClick={onClear}
			disabled={disabled}
			aria-label="Clear editor content"
			title="Clear all content"
		>
			<Eraser className="h-4 w-4" aria-hidden="true" />
		</button>
	);
};
