import { useState, useMemo, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "@/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ChevronDown, X, Check } from "lucide-react";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import type { IBusinessArea } from "@/shared/types/org.types";

interface BusinessAreaMultiSelectProps {
	selectedBusinessAreas: number[];
	onToggleBusinessArea: (baId: number) => void;
	onSelectAll: (businessAreaIds: number[]) => void;
	onClearAll: () => void;
	className?: string;
	placeholder?: string;
	showTags?: boolean;
	disabled?: boolean;
}

/**
 * BusinessAreaMultiSelect - Reusable multi-select component for business areas
 *
 * Features:
 * - Multi-select with checkboxes using DropdownMenu
 * - "Select All" and "Clear All" functionality
 * - Display selected count in trigger button
 * - Show inactive business areas with "(Inactive)" label
 * - Keyboard navigation (Arrow keys, Enter, Escape, Tab)
 * - Focus management and accessibility
 * - Optional tags display for selected items
 *
 * Keyboard Navigation:
 * - Arrow Up/Down: Navigate between items
 * - Enter/Space: Toggle checkbox (menu stays open for multi-select)
 * - Escape: Close menu and return focus to trigger
 * - Tab/Shift+Tab: Close menu and move to next/previous element
 */
export const BusinessAreaMultiSelect = observer(
	({
		selectedBusinessAreas,
		onToggleBusinessArea,
		onSelectAll,
		onClearAll,
		className = "",
		placeholder = "Business Areas",
		showTags = false,
		disabled = false,
	}: BusinessAreaMultiSelectProps) => {
		const { data: businessAreas, isLoading: isLoadingBusinessAreas } =
			useBusinessAreas();
		const [isOpen, setIsOpen] = useState(false);
		const [focusedIndex, setFocusedIndex] = useState(0);
		const menuItemsRef = useRef<(HTMLElement | null)[]>([]);
		const preventCloseRef = useRef(false);

		// Sort business areas alphabetically
		const sortedBusinessAreas = useMemo(() => {
			if (!businessAreas) return [];
			return [...businessAreas].sort((a, b) => a.name.localeCompare(b.name));
		}, [businessAreas]);

		// Total number of menu items (2 buttons + business areas)
		const totalItems = 2 + sortedBusinessAreas.length;

		// Get selected business area names for display
		const selectedNames = useMemo(() => {
			if (selectedBusinessAreas.length === 0) return placeholder;
			if (
				businessAreas &&
				selectedBusinessAreas.length === businessAreas.length
			)
				return "All Selected";
			if (selectedBusinessAreas.length === 1) {
				const selected = businessAreas?.find(
					(ba) => ba.id === selectedBusinessAreas[0]
				);
				return selected?.name || placeholder;
			}
			return `${selectedBusinessAreas.length} Selected`;
		}, [selectedBusinessAreas, businessAreas, placeholder]);

		// Get selected business areas for tag display
		const selectedBusinessAreasList = useMemo(() => {
			if (!businessAreas) return [];
			return businessAreas.filter(
				(ba) => ba.id && selectedBusinessAreas.includes(ba.id)
			);
		}, [businessAreas, selectedBusinessAreas]);

		// Show tags only when some (but not all) are selected and showTags is true
		const shouldShowTags = useMemo(() => {
			return (
				showTags &&
				selectedBusinessAreas.length > 0 &&
				businessAreas &&
				selectedBusinessAreas.length < businessAreas.length
			);
		}, [showTags, selectedBusinessAreas, businessAreas]);

		const handleSelectAll = () => {
			if (businessAreas) {
				const allIds = businessAreas
					.map((ba) => ba.id)
					.filter((id): id is number => id !== undefined);
				onSelectAll(allIds);
			}
		};

		const formatBusinessAreaName = (businessArea: IBusinessArea) => {
			if (businessArea.is_active === false) {
				return `${businessArea.name} (Inactive)`;
			}
			return businessArea.name;
		};

		// Close handler - but NOT for checkbox clicks
		const handleClose = () => {
			setIsOpen(false);
			setFocusedIndex(0);
		};

		// Prevent closing when clicking checkboxes
		const handleOpenChange = (open: boolean) => {
			// If trying to close and we're preventing close, re-open immediately
			if (!open && preventCloseRef.current) {
				preventCloseRef.current = false;
				// Re-open immediately
				setTimeout(() => setIsOpen(true), 0);
				return;
			}
			setIsOpen(open);
			if (!open) {
				setFocusedIndex(0);
			}
		};

		// Handle checkbox toggle - prevent menu from closing
		const handleCheckboxToggle = (baId: number) => {
			preventCloseRef.current = true;
			onToggleBusinessArea(baId);
			// Reset the flag after a short delay to allow the close event to be ignored
			setTimeout(() => {
				preventCloseRef.current = false;
			}, 100);
		};

		// Keyboard navigation
		const handleKeyDown = (e: React.KeyboardEvent) => {
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					// If on Select All (0) or Clear (1), jump to first checkbox (2)
					if (focusedIndex < 2) {
						setFocusedIndex(2);
						menuItemsRef.current[2]?.focus();
					} else {
						// Normal down navigation through checkboxes
						setFocusedIndex((prev) => {
							const next = (prev + 1) % totalItems;
							menuItemsRef.current[next]?.focus();
							return next;
						});
					}
					break;
				case "ArrowUp":
					e.preventDefault();
					// If on first checkbox (2), jump to Clear button (1)
					if (focusedIndex === 2) {
						setFocusedIndex(1);
						menuItemsRef.current[1]?.focus();
					} else {
						// Normal up navigation
						setFocusedIndex((prev) => {
							const next = (prev - 1 + totalItems) % totalItems;
							menuItemsRef.current[next]?.focus();
							return next;
						});
					}
					break;
				case "ArrowLeft":
					e.preventDefault();
					// Only works on Select All (0) and Clear (1) buttons
					if (focusedIndex === 0 || focusedIndex === 1) {
						const newIndex = focusedIndex === 0 ? 1 : 0;
						setFocusedIndex(newIndex);
						menuItemsRef.current[newIndex]?.focus();
					}
					break;
				case "ArrowRight":
					e.preventDefault();
					// Only works on Select All (0) and Clear (1) buttons
					if (focusedIndex === 0 || focusedIndex === 1) {
						const newIndex = focusedIndex === 0 ? 1 : 0;
						setFocusedIndex(newIndex);
						menuItemsRef.current[newIndex]?.focus();
					}
					break;
				case "Enter":
				case " ":
					e.preventDefault();
					e.stopPropagation();
					// Trigger click on focused item
					menuItemsRef.current[focusedIndex]?.click();
					break;
				case "Escape":
					e.preventDefault();
					handleClose();
					break;
				case "Tab":
					// Allow Tab to close and move focus
					handleClose();
					break;
			}
		};

		// Focus first menu item when dropdown opens
		useEffect(() => {
			if (isOpen) {
				// Small delay to ensure DOM is ready
				const timer = setTimeout(() => {
					menuItemsRef.current[0]?.focus();
					setFocusedIndex(0);
				}, 50);
				return () => clearTimeout(timer);
			}
		}, [isOpen]);

		return (
			<div className={className}>
				<div className="relative">
					<DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="w-full justify-between text-sm font-normal h-11"
								disabled={disabled || isLoadingBusinessAreas}
								aria-label="Select business areas"
								aria-expanded={isOpen}
								aria-haspopup="menu"
							>
								<span className="truncate">{selectedNames}</span>
								<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-[400px] p-0" align="end">
							<div
								className="flex flex-col"
								onMouseDown={(e) => {
									// Prevent click-outside handler from triggering
									e.stopPropagation();
								}}
								onKeyDown={handleKeyDown}
							>
								<div className="p-3 border-b">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium">Business Areas</span>
										<div className="flex gap-2">
											<button
												ref={(el) => {
													menuItemsRef.current[0] = el;
												}}
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleSelectAll();
												}}
												className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded"
												role="menuitem"
												tabIndex={-1}
											>
												Select All
											</button>
											<button
												ref={(el) => {
													menuItemsRef.current[1] = el;
												}}
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													onClearAll();
												}}
												className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded"
												role="menuitem"
												tabIndex={-1}
											>
												Clear
											</button>
										</div>
									</div>
								</div>
								<div className="max-h-[300px] overflow-y-auto p-3">
									<div className="space-y-2">
										{isLoadingBusinessAreas && (
											<div className="text-sm text-muted-foreground">
												Loading...
											</div>
										)}
										{sortedBusinessAreas.map((ba, index) => {
											if (ba.id === undefined) return null;
											const menuItemIndex = index + 2; // +2 for Select All and Clear buttons
											const isChecked = selectedBusinessAreas.includes(ba.id);
											return (
												<div
													key={ba.id}
													ref={(el) => {
														menuItemsRef.current[menuItemIndex] = el;
													}}
													data-ba-id={ba.id}
													onMouseDown={(e) => {
														// Prevent the click from bubbling to DropdownMenuContent's click-outside handler
														e.stopPropagation();
													}}
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleCheckboxToggle(ba.id!);
													}}
													className="flex items-center space-x-2 rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none cursor-pointer"
													role="menuitemcheckbox"
													aria-checked={isChecked}
													tabIndex={-1}
												>
													<div className="flex items-center justify-center w-4 h-4 border border-gray-300 dark:border-gray-600 rounded">
														{isChecked && <Check className="w-3 h-3" />}
													</div>
													<span
														className={`text-sm font-normal flex-1 ${
															ba.is_active === false
																? "text-muted-foreground"
																: ""
														}`}
													>
														{formatBusinessAreaName(ba)}
													</span>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Selected Business Area Tags */}
				{shouldShowTags && (
					<div className="flex flex-wrap gap-2 mt-2 max-w-full">
						{selectedBusinessAreasList.map((ba) => (
							<div
								key={ba.id}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-md text-sm max-w-full"
							>
								<span className="truncate">{ba.name}</span>
								<button
									onClick={() => ba.id && onToggleBusinessArea(ba.id)}
									className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-sm p-0.5 transition-colors flex-shrink-0"
									aria-label={`Remove ${ba.name}`}
								>
									<X className="size-3" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}
);
