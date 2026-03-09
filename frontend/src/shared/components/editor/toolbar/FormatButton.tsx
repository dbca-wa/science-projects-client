/**
 * FormatButton Component
 *
 * Individual format button for bold, italic, underline.
 * Receives state and actions from parent Toolbar component.
 */

import React from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { FormatButtonProps } from "@/shared/types/editor.types";

const formatIcons = {
	bold: Bold,
	italic: Italic,
	underline: Underline,
};

const formatLabels = {
	bold: "Bold (Ctrl+B)",
	italic: "Italic (Ctrl+I)",
	underline: "Underline (Ctrl+U)",
};

export const FormatButton: React.FC<FormatButtonProps> = ({
	format,
	isActive,
	onToggle,
	disabled = false,
}) => {
	return (
		<BaseToolbarButton
			icon={formatIcons[format]}
			label={formatLabels[format]}
			onClick={onToggle}
			isActive={isActive}
			disabled={disabled}
		/>
	);
};
