/**
 * StrikethroughButton Component
 *
 * Toolbar button for strikethrough text formatting.
 */

import React from "react";
import { Strikethrough } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { StrikethroughButtonProps } from "@/shared/types/editor.types";

export const StrikethroughButton: React.FC<StrikethroughButtonProps> = ({
	isActive,
	onToggle,
	disabled = false,
}) => {
	return (
		<BaseToolbarButton
			icon={Strikethrough}
			label="Strikethrough"
			onClick={onToggle}
			isActive={isActive}
			disabled={disabled}
		/>
	);
};
