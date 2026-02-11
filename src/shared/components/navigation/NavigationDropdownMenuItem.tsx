import { forwardRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";
import { hasModifierKey } from "@/shared/utils/navigation.utils";
import { cn } from "@/shared/lib/utils";
import type { ComponentProps } from "react";

interface NavigationDropdownMenuItemProps
	extends Omit<ComponentProps<typeof DropdownMenuItem>, "onClick"> {
	targetPath: string;
	onNavigate?: () => void; // Callback to close dropdown after navigation
	children: React.ReactNode;
}

/**
 * NavigationDropdownMenuItem - Enhanced dropdown menu item with Ctrl+Click support
 *
 * Uses controlled dropdown pattern to eliminate race conditions.
 * Parent component manages dropdown open/close state and passes onNavigate callback.
 *
 * Features:
 * - Standard click: Navigates with React Router, then closes dropdown
 * - Ctrl+Click: Opens new tab via href (browser native)
 * - Right-click: Shows context menu with "Open in new tab"
 * - Full clickable area: Entire menu item (including padding) triggers navigation
 * - Active route highlighting: Light blue background when on current route
 * - Disabled when active: Cannot click to navigate to current route
 * - No race conditions: Navigation completes before dropdown closes
 *
 * Implementation:
 * - Uses asChild pattern to make anchor tag become the DropdownMenuItem
 * - Anchor inherits all padding and styling from DropdownMenuItem
 * - Entire clickable area (including padding) triggers navigation
 * - Compares base paths (strips query params) for active state
 *
 * @example
 * const [open, setOpen] = useState(false);
 *
 * <DropdownMenu open={open} onOpenChange={setOpen}>
 *   <NavigationDropdownMenuItem
 *     targetPath="/projects"
 *     onNavigate={() => setOpen(false)}
 *   >
 *     Browse Projects
 *   </NavigationDropdownMenuItem>
 * </DropdownMenu>
 */
export const NavigationDropdownMenuItem = forwardRef<
	HTMLAnchorElement,
	NavigationDropdownMenuItemProps
>(({ targetPath, onNavigate, children, className, ...props }, ref) => {
	const navigate = useNavigate();
	const location = useLocation();

	// Get base path without query params or hash
	const getBasePath = (path: string) => {
		return path.split("?")[0].split("#")[0];
	};

	// Check if this menu item links to the current route
	const currentBasePath = getBasePath(location.pathname);
	const targetBasePath = getBasePath(targetPath);
	const isActive = currentBasePath === targetBasePath;

	const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		// If already on this route, do nothing (completely disabled)
		if (isActive) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		// Ctrl+Click: Let browser handle (opens new tab via href)
		if (hasModifierKey(event.nativeEvent)) {
			// Don't prevent default - let href work
			// Dropdown will close naturally
			return;
		}

		// Standard click: Prevent href navigation, use React Router
		event.preventDefault();

		// Navigate first (synchronous)
		navigate(targetPath);

		// Then close dropdown (no race condition)
		if (onNavigate) {
			onNavigate();
		}
	};

	return (
		<DropdownMenuItem
			className={cn(
				className,
				isActive &&
					"bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/30"
			)}
			asChild
			{...props}
		>
			<a
				ref={ref}
				href={isActive ? undefined : targetPath}
				onClick={handleClick}
				className={cn(
					"no-underline select-none",
					isActive && "cursor-default pointer-events-none"
				)}
				aria-current={isActive ? "page" : undefined}
				aria-disabled={isActive ? "true" : undefined}
				tabIndex={isActive ? -1 : undefined}
			>
				{children}
			</a>
		</DropdownMenuItem>
	);
});

NavigationDropdownMenuItem.displayName = "NavigationDropdownMenuItem";
