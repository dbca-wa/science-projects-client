/**
 * SuperscriptButton Component
 *
 * Toggle button for superscript formatting.
 * Receives state and actions from parent Toolbar component.
 */

import React from "react";
import { Superscript } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { SuperscriptButtonProps } from "@/shared/types/editor.types";

export const SuperscriptButton: React.FC<SuperscriptButtonProps> = ({
	isActive,
	onToggle,
	disabled = false,
}) => {
	return (
		<BaseToolbarButton
			icon={Superscript}
			label="Superscript (Ctrl+.)"
			onClick={onToggle}
			isActive={isActive}
			disabled={disabled}
		/>
	);
};
