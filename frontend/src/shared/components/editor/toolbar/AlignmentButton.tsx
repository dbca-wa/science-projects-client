/**
 * AlignmentButton Component
 *
 * Toolbar button for cycling through text alignment options.
 * Cycles: left → center → right → justify → left
 */

import React from "react";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { AlignmentButtonProps } from "@/shared/types/editor.types";

export const AlignmentButton: React.FC<AlignmentButtonProps> = ({
	disabled = false,
	alignment,
	onCycleAlignment,
}) => {
	// Get icon based on current alignment
	const getIcon = () => {
		switch (alignment) {
			case "center":
				return AlignCenter;
			case "right":
				return AlignRight;
			case "justify":
				return AlignJustify;
			default:
				return AlignLeft;
		}
	};

	// Get label based on current alignment
	const getLabel = () => {
		switch (alignment) {
			case "center":
				return "Align centre";
			case "right":
				return "Align right";
			case "justify":
				return "Align justify";
			default:
				return "Align left";
		}
	};

	return (
		<BaseToolbarButton
			icon={getIcon()}
			label={getLabel()}
			onClick={onCycleAlignment}
			disabled={disabled}
		/>
	);
};
