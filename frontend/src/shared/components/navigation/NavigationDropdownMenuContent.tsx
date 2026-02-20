import { useRef, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { DropdownMenuLabel } from "@/shared/components/ui/dropdown-menu";
import { hasModifierKey } from "@/shared/utils/navigation.utils";
import { cn } from "@/shared/lib/utils";
import { useMenuKeyboardNavigation } from "@/shared/hooks/useMenuKeyboardNavigation";

interface NavigationDropdownMenuContentProps {
	label: string;
	items: Array<{
		targetPath: string;
		icon: ReactNode;
		label: string;
	}>;
	onClose: () => void;
}

/**
 * NavigationDropdownMenuContent - Menu content with keyboard navigation
 *
 * Mirrors NavitarContent pattern:
 * - Uses buttons with refs (not anchor tags)
 * - Attaches onKeyDown to container div
 * - Focuses first button on mount
 * - Arrow keys navigate between buttons
 */
export function NavigationDropdownMenuContent({
	label,
	items,
	onClose,
}: NavigationDropdownMenuContentProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const menuRef = useRef<HTMLDivElement>(null);
	const { handleKeyDown, registerMenuItem, focusFirstItem } =
		useMenuKeyboardNavigation(onClose);

	// Focus first non-disabled menu item when component mounts
	useEffect(() => {
		focusFirstItem();
	}, [focusFirstItem]);

	// Get base path without query params or hash
	const getBasePath = (path: string) => {
		return path.split("?")[0].split("#")[0];
	};

	// Check if path is active
	const isPathActive = (targetPath: string) => {
		const currentBasePath = getBasePath(location.pathname);
		const targetBasePath = getBasePath(targetPath);
		return currentBasePath === targetBasePath;
	};

	// Handle navigation
	const handleNavigate = (
		targetPath: string,
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		const isActive = isPathActive(targetPath);

		// If already on this route, do nothing
		if (isActive) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		// Ctrl+Click: Open in new tab
		if (hasModifierKey(event.nativeEvent)) {
			window.open(targetPath, "_blank");
			onClose();
			return;
		}

		// Standard click: Navigate with React Router
		navigate(targetPath);
		onClose();
	};

	return (
		<div ref={menuRef} className="flex flex-col" onKeyDown={handleKeyDown}>
			<DropdownMenuLabel className="text-center text-xs text-gray-500">
				{label}
			</DropdownMenuLabel>

			{items.map((item, index) => {
				const isActive = isPathActive(item.targetPath);

				return (
					<button
						key={item.targetPath}
						ref={registerMenuItem(index)}
						type="button"
						onClick={(e) => handleNavigate(item.targetPath, e)}
						disabled={isActive}
						className={cn(
							"w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center gap-2",
							"select-none focus:outline-none",
							isActive
								? "bg-blue-100 dark:bg-blue-900/30 cursor-default focus:bg-blue-200 dark:focus:bg-blue-800/50 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
								: "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
						)}
						role="menuitem"
						aria-current={isActive ? "page" : undefined}
					>
						{item.icon}
						<span>{item.label}</span>
					</button>
				);
			})}
		</div>
	);
}
