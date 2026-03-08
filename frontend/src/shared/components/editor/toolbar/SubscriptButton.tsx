/**
 * SubscriptButton Component
 *
 * Toggle button for subscript formatting.
 * Receives state and actions from parent Toolbar component.
 */

import React from "react";
import { Subscript } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { SubscriptButtonProps } from "@/shared/types/editor.types";

export const SubscriptButton: React.FC<SubscriptButtonProps> = ({
	isActive,
	onToggle,
	disabled = false,
}) => {
	return (
		<BaseToolbarButton
			icon={Subscript}
			label="Subscript (Ctrl+,)"
			onClick={onToggle}
			isActive={isActive}
			disabled={disabled}
		/>
	);
};
