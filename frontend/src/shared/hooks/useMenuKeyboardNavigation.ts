import { useRef, useState, useCallback } from "react";

/**
 * useMenuKeyboardNavigation - Complete WCAG-compliant keyboard navigation for menus
 *
 * This hook provides full keyboard navigation for dropdown menus:
 * - Arrow Up/Down: Navigate between menu items (skips disabled items)
 * - Home: Jump to first enabled item
 * - End: Jump to last enabled item
 * - Tab/Shift+Tab: Close menu and move focus to next/previous element
 *
 * WCAG 2.2 Compliance:
 * - Menus are "composite widgets" with single tab stop
 * - Arrow keys for internal navigation
 * - Tab/Shift+Tab closes menu and moves to next/previous element
 * - Automatic focus management on mount
 *
 * @param onClose - Callback to close the menu
 * @returns Object with menuItems ref, handleKeyDown, registerMenuItem, and focusFirstItem
 *
 * @example
 * ```tsx
 * const { menuItems, handleKeyDown, registerMenuItem, focusFirstItem } =
 *   useMenuKeyboardNavigation(onClose);
 *
 * useEffect(() => {
 *   focusFirstItem();
 * }, [focusFirstItem]);
 *
 * return (
 *   <div onKeyDown={handleKeyDown}>
 *     <button ref={registerMenuItem(0)} role="menuitem">Item 1</button>
 *     <button ref={registerMenuItem(1)} role="menuitem">Item 2</button>
 *   </div>
 * );
 * ```
 */
export function useMenuKeyboardNavigation(onClose: () => void) {
	const menuItems = useRef<HTMLButtonElement[]>([]);
	const [_focusedIndex, setFocusedIndex] = useState(0);

	// Helper to find next enabled item
	const findNextEnabled = (startIndex: number, direction: 1 | -1): number => {
		const itemCount = menuItems.current.length;
		let index = startIndex;
		let attempts = 0;

		while (attempts < itemCount) {
			index =
				direction === 1
					? (index + 1) % itemCount
					: (index - 1 + itemCount) % itemCount;

			if (menuItems.current[index] && !menuItems.current[index].disabled) {
				return index;
			}
			attempts++;
		}
		return startIndex; // No enabled items found, stay at current
	};

	// Helper to find first enabled item
	const findFirstEnabled = (): number => {
		return menuItems.current.findIndex((item) => item && !item.disabled);
	};

	// Helper to find last enabled item
	const findLastEnabled = (): number => {
		for (let i = menuItems.current.length - 1; i >= 0; i--) {
			if (menuItems.current[i] && !menuItems.current[i].disabled) {
				return i;
			}
		}
		return 0;
	};

	// Handle Tab/Shift+Tab navigation
	const handleTabNavigation = (isShiftTab: boolean) => {
		// Find all focusable elements BEFORE closing menu
		// CRITICAL: Exclude menu items (role="menuitem") to prevent focusing menu items
		const allButtons = Array.from(
			document.querySelectorAll<HTMLElement>(
				'button:not([disabled]):not([role="menuitem"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		);

		// Find the trigger button by aria-expanded="true" (the open menu's trigger)
		const trigger = allButtons.find(
			(btn) => btn.getAttribute("aria-expanded") === "true"
		);

		if (!trigger) return;

		const triggerIndex = allButtons.indexOf(trigger);

		// Close menu first
		onClose();

		// After menu closes, move focus to previous/next element
		// Delay ensures Radix has finished its cleanup
		setTimeout(() => {
			if (isShiftTab) {
				// Shift+Tab: focus previous element
				const prevElement = allButtons[triggerIndex - 1];
				if (prevElement) {
					prevElement.focus();
				}
			} else {
				// Tab: focus next element
				const nextElement = allButtons[triggerIndex + 1];
				if (nextElement) {
					nextElement.focus();
				}
			}
		}, 100);
	};

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		switch (e.key) {
			case "ArrowDown": {
				e.preventDefault();
				setFocusedIndex((prev) => {
					const next = findNextEnabled(prev, 1);
					menuItems.current[next]?.focus();
					return next;
				});
				break;
			}
			case "ArrowUp": {
				e.preventDefault();
				setFocusedIndex((prev) => {
					const next = findNextEnabled(prev, -1);
					menuItems.current[next]?.focus();
					return next;
				});
				break;
			}
			case "Home": {
				e.preventDefault();
				const firstEnabled = findFirstEnabled();
				setFocusedIndex(firstEnabled);
				menuItems.current[firstEnabled]?.focus();
				break;
			}
			case "End": {
				e.preventDefault();
				const lastEnabled = findLastEnabled();
				setFocusedIndex(lastEnabled);
				menuItems.current[lastEnabled]?.focus();
				break;
			}
			case "Tab":
				e.preventDefault();
				handleTabNavigation(e.shiftKey);
				break;
		}
	};

	// Register menu item ref
	const registerMenuItem =
		(index: number) => (el: HTMLButtonElement | null) => {
			if (el) {
				menuItems.current[index] = el;
			}
		};

	// Focus first enabled menu item (call in useEffect)
	const focusFirstItem = useCallback(() => {
		const firstEnabledIndex = findFirstEnabled();
		if (firstEnabledIndex !== -1) {
			setFocusedIndex(firstEnabledIndex);
			menuItems.current[firstEnabledIndex]?.focus();
		}
	}, []);

	return {
		menuItems,
		handleKeyDown,
		registerMenuItem,
		focusFirstItem,
	};
}
