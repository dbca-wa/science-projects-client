/**
 * BaseToolbarButton Component
 *
 * Base button component for all toolbar buttons with consistent styling and tooltip.
 * All toolbar buttons should use this component for consistency.
 */

import React from "react";
import { Button } from "@/shared/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { type LucideIcon } from "lucide-react";

interface BaseToolbarButtonProps {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
	isActive?: boolean;
	disabled?: boolean;
	ariaPressed?: boolean;
	className?: string;
}

export const BaseToolbarButton: React.FC<BaseToolbarButtonProps> = ({
	icon: Icon,
	label,
	onClick,
	isActive = false,
	disabled = false,
	ariaPressed,
	className = "",
}) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className={`h-8 w-8 p-0 ${isActive ? "bg-accent" : ""} ${className}`}
					onClick={onClick}
					disabled={disabled}
					aria-label={label}
					aria-pressed={ariaPressed !== undefined ? ariaPressed : isActive}
				>
					<Icon className="h-4 w-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p>{label}</p>
			</TooltipContent>
		</Tooltip>
	);
};
