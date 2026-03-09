/**
 * UnifiedListButton Component
 *
 * Single button that cycles through list types: none → bullet → numbered → none
 * Skips check list type for now.
 * Receives state and actions from parent Toolbar component.
 */

import React from "react";
import { List, ListOrdered } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { UnifiedListButtonProps } from "@/shared/types/editor.types";

export const UnifiedListButton: React.FC<UnifiedListButtonProps> = ({
	isList,
	listType,
	onCycleList,
	disabled = false,
}) => {
	// Determine icon based on current list type
	const icon = listType === "number" ? ListOrdered : List;

	// Determine label based on current state
	const getLabel = () => {
		if (!isList) return "List";
		return listType === "bullet" ? "Bullet List" : "Numbered List";
	};

	return (
		<BaseToolbarButton
			icon={icon}
			label={getLabel()}
			onClick={onCycleList}
			isActive={isList}
			disabled={disabled}
		/>
	);
};
