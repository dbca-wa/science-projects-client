/**
 * BaseToolbarButton Component
 *
 * Base button component for all toolbar buttons with consistent styling and tooltip.
 * All toolbar buttons should use this component for consistency.
 */

import React, { useContext } from "react";
import { Button } from "@/shared/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { type LucideIcon } from "lucide-react";
import { ToolbarDarkModeContext } from "./ToolbarContext";

interface BaseToolbarButtonProps {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
	isActive?: boolean;
	disabled?: boolean;
	ariaPressed?: boolean;
	className?: string;
	darkMode?: boolean;
}

export const BaseToolbarButton: React.FC<BaseToolbarButtonProps> = ({
	icon: Icon,
	label,
	onClick,
	isActive = false,
	disabled = false,
	ariaPressed,
	className = "",
	darkMode,
}) => {
	const contextDarkMode = useContext(ToolbarDarkModeContext);
	const isDark = darkMode ?? contextDarkMode;
	const activeClass = isActive
		? isDark
			? "bg-gray-200 text-gray-900 hover:bg-gray-300"
			: "bg-accent"
		: "";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className={`h-8 w-8 p-0 ${activeClass} ${className}`}
					onClick={onClick}
					disabled={disabled}
					aria-label={label}
					aria-pressed={ariaPressed !== undefined ? ariaPressed : isActive}
				>
					<Icon
						className={`h-4 w-4 ${isActive && isDark ? "text-gray-900" : ""}`}
					/>
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p>{label}</p>
			</TooltipContent>
		</Tooltip>
	);
};
