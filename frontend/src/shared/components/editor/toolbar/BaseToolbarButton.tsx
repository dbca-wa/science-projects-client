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
			? "bg-gray-200 text-gray-900 hover:bg-gray-300 ring-1 ring-gray-300"
			: "bg-blue-200/80 text-blue-800 hover:bg-blue-200 ring-1 ring-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900/60 dark:ring-blue-700"
		: "hover:bg-green-200/80 hover:text-green-800 hover:ring-1 hover:ring-green-300 dark:hover:bg-green-900/50 dark:hover:text-green-200 dark:hover:ring-green-700";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className={`h-8 w-8 p-0 ${activeClass} ${className}`}
					onClick={onClick}
					onMouseDown={(e) => e.preventDefault()}
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
