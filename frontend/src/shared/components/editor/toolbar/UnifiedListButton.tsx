/**
 * UnifiedListButton Component
 *
 * Single button that cycles through list types: none → bullet → numbered → checklist → none
 * Receives state and actions from parent Toolbar component.
 */

import React from "react";
import { List, ListOrdered, ListChecks } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import type { UnifiedListButtonProps } from "@/shared/types/editor.types";

export const UnifiedListButton: React.FC<UnifiedListButtonProps> = ({
	isList,
	listType,
	onCycleList,
	disabled = false,
}) => {
	// Determine icon based on current list type
	const icon =
		listType === "number"
			? ListOrdered
			: listType === "check"
				? ListChecks
				: List;

	// Determine label based on current state
	const getLabel = () => {
		if (!isList) return "List";
		if (listType === "bullet") return "Bullet List";
		if (listType === "number") return "Numbered List";
		if (listType === "check") return "Checklist";
		return "List";
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
