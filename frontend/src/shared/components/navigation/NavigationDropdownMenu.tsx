import { type ReactNode } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { IoCaretDown } from "react-icons/io5";

interface NavigationDropdownMenuProps {
	label: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
}

/**
 * NavigationDropdownMenu - Accessible dropdown menu wrapper
 *
 * Simplified wrapper that uses DropdownMenu component.
 * Content component (NavigationDropdownMenuContent) handles keyboard navigation.
 *
 * WCAG 2.2 Compliance:
 * - 2.1.1 Keyboard (Level A) - Full keyboard support with arrow keys
 * - 2.4.3 Focus Order (Level A) - Logical focus order
 * - 4.1.2 Name, Role, Value (Level A) - Proper ARIA attributes
 */
export function NavigationDropdownMenu({
	label,
	open,
	onOpenChange,
	children,
}: NavigationDropdownMenuProps) {
	return (
		<div className="relative">
			<DropdownMenu open={open} onOpenChange={onOpenChange}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="text-white/70 hover:text-white hover:bg-white/10 select-none"
						aria-label={`${label} menu`}
						aria-expanded={open}
						aria-haspopup="menu"
					>
						{label}
						<IoCaretDown className="ml-1 h-3 w-3" aria-hidden="true" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="bg-white text-gray-900 border-gray-200 !p-0"
					align="start"
					sideOffset={4}
				>
					{children}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
