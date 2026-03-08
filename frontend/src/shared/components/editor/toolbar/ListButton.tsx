/**
 * ListButton Component
 *
 * Buttons for creating bullet and numbered lists.
 * Receives state and actions from parent Toolbar component.
 */

import React from "react";
import { List, ListOrdered } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { ListButtonProps } from "@/shared/types/editor.types";

export const ListButton: React.FC<ListButtonProps> = ({
	listType,
	isActive,
	onToggle,
	disabled = false,
}) => {
	const Icon = listType === "bullet" ? List : ListOrdered;
	const label = listType === "bullet" ? "Bullet List" : "Numbered List";

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className={`h-8 w-8 p-0 ${isActive ? "bg-accent" : ""}`}
			onClick={onToggle}
			disabled={disabled}
			aria-label={label}
			aria-pressed={isActive}
			title={label}
		>
			<Icon className="h-4 w-4" />
		</Button>
	);
};
