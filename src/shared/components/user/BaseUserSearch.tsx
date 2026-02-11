import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
	type ReactNode,
	type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { User } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getUsersBasedOnSearchTerm } from "@/features/users/services/user.service";
import { getFullUser } from "@/features/users/services/user.service";
import type { IUserData } from "@/shared/types/user.types";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

/**
 * Base User Search Component
 *
 * A flexible user search component with composition pattern for custom rendering.
 * Handles all the shared logic: debouncing, search, selection, portal positioning.
 *
 * Features:
 * - Debounced search (300ms)
 * - Portal-based dropdown positioning
 * - Preselected user support
 * - Custom rendering for selected state and menu items
 * - Exclude users from search results
 * - Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
 *
 * @example
 * ```tsx
 * <BaseUserSearch
 *   onSelect={(user) => setUserId(user.id)}
 *   renderSelected={(user, onClear) => <CustomSelectedDisplay user={user} onClear={onClear} />}
 *   renderMenuItem={(user, onSelect, isHighlighted) => (
 *     <CustomMenuItem user={user} onClick={() => onSelect(user)} highlighted={isHighlighted} />
 *   )}
 * />
 * ```
 *
 * @note Breaking Change: renderMenuItem signature now includes isHighlighted parameter
 */

export interface BaseUserSearchProps {
	// Core functionality
	onSelect: (user: IUserData | null) => void;
	onlyInternal?: boolean;
	excludeUserIds?: number[];
	preselectedUserPk?: number;

	// UI customization
	label?: string;
	placeholder?: string;
	helperText?: string;
	autoFocus?: boolean;
	isRequired?: boolean;
	isEditable?: boolean;
	className?: string;
	wrapperClassName?: string;
	hideCannotFind?: boolean;
	placeholderColor?: string;
	showIcon?: boolean;

	// Custom rendering (composition pattern)
	renderSelected?: (user: IUserData, onClear: () => void) => ReactNode;
	/**
	 * Custom menu item renderer
	 * @param user - The user data to render
	 * @param onSelect - Callback to select the user
	 * @param isHighlighted - Whether this item is currently keyboard-highlighted
	 * @note Breaking Change: Third parameter (isHighlighted) added for keyboard navigation support
	 */
	renderMenuItem?: (
		user: IUserData,
		onSelect: (user: IUserData) => void,
		isHighlighted: boolean
	) => ReactNode;
}

export interface BaseUserSearchRef {
	focusInput: () => void;
}

export const BaseUserSearch = forwardRef<
	BaseUserSearchRef,
	BaseUserSearchProps
>(
	(
		{
			onSelect,
			onlyInternal = true,
			excludeUserIds = [],
			preselectedUserPk,
			label,
			placeholder = "Search for a user...",
			helperText,
			autoFocus,
			isRequired,
			isEditable = true,
			className,
			wrapperClassName,
			hideCannotFind,
			placeholderColor,
			showIcon = false,
			renderSelected,
			renderMenuItem,
		},
		ref
	) => {
		const inputRef = useRef<HTMLInputElement>(null);
		const wrapperRef = useRef<HTMLDivElement>(null);
		const [searchTerm, setSearchTerm] = useState("");
		const [isMenuOpen, setIsMenuOpen] = useState(true);
		const [selectedUser, setSelectedUser] = useState<IUserData | null>(null);
		const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

		// Debounce search term (300ms)
		const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

		// Fetch users based on debounced search term
		const { data: searchResults } = useQuery({
			queryKey: [
				"users",
				"search",
				debouncedSearchTerm,
				{ onlyInternal, excludeUserIds },
			],
			queryFn: () =>
				getUsersBasedOnSearchTerm(debouncedSearchTerm, 1, {
					onlyStaff: onlyInternal,
					onlyExternal: false,
					onlySuperuser: false,
					ignoreArray: excludeUserIds,
				}),
			enabled: debouncedSearchTerm.trim().length > 0,
			staleTime: 30_000, // 30 seconds
		});

		// Fetch preselected user
		const { data: preselectedUser } = useQuery({
			queryKey: ["users", "detail", preselectedUserPk],
			queryFn: () => getFullUser(preselectedUserPk!),
			enabled: !!preselectedUserPk && !selectedUser,
			staleTime: 5 * 60_000, // 5 minutes
		});

		// Set preselected user when loaded
		useEffect(() => {
			if (preselectedUser && !selectedUser) {
				Promise.resolve().then(() => {
					setIsMenuOpen(false);
					setSelectedUser(preselectedUser);
					setSearchTerm("");
					onSelect(preselectedUser);
				});
			}
		}, [preselectedUser, selectedUser, onSelect]);

		// Click-away detection
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					wrapperRef.current &&
					!wrapperRef.current.contains(event.target as Node)
				) {
					setIsMenuOpen(false);
					setHighlightedIndex(-1);
				}
			};

			if (isMenuOpen) {
				document.addEventListener("mousedown", handleClickOutside);
				return () =>
					document.removeEventListener("mousedown", handleClickOutside);
			}
		}, [isMenuOpen]);

		const handleSelectUser = (user: IUserData) => {
			setIsMenuOpen(false);
			setHighlightedIndex(-1);
			setSelectedUser(user);
			setSearchTerm("");
			onSelect(user);
		};

		const handleClearUser = () => {
			if (!isEditable) {
				return;
			}
			setSelectedUser(null);
			setIsMenuOpen(true);
			onSelect(null);
		};

		const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
			const { key } = event;
			const resultsCount = filteredItems.length;

			if (resultsCount === 0) return;

			switch (key) {
				case "ArrowDown":
					event.preventDefault();
					setHighlightedIndex((prev) =>
						prev < resultsCount - 1 ? prev + 1 : prev
					);
					break;

				case "ArrowUp":
					event.preventDefault();
					setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
					break;

				case "Enter":
					event.preventDefault();
					if (highlightedIndex >= 0 && highlightedIndex < resultsCount) {
						handleSelectUser(filteredItems[highlightedIndex]);
					}
					break;

				case "Escape":
					event.preventDefault();
					setIsMenuOpen(false);
					setHighlightedIndex(-1);
					break;
			}
		};

		useImperativeHandle(ref, () => ({
			focusInput: () => {
				if (inputRef.current) {
					inputRef.current.focus();
				}
			},
		}));

		const filteredItems = searchResults?.users || [];

		return (
			<div
				ref={wrapperRef}
				className={cn("w-full", isRequired && "required", wrapperClassName)}
			>
				{label && <Label className="mb-2">{label}</Label>}
				{selectedUser && renderSelected ? (
					renderSelected(selectedUser, handleClearUser)
				) : selectedUser ? (
					<DefaultSelectedDisplay
						user={selectedUser}
						onClear={handleClearUser}
					/>
				) : (
					<div
						className="relative"
						onMouseDown={(e) => {
							// Only handle clicks on the wrapper itself, not on the input
							if (e.target !== e.currentTarget) return;

							// Prevent default to avoid cursor jumping to start first
							e.preventDefault();
							// When clicking the wrapper, focus input and move cursor to end
							if (inputRef.current) {
								inputRef.current.focus();
								// Move cursor to end of text
								const length = inputRef.current.value.length;
								inputRef.current.setSelectionRange(length, length);
							}
						}}
					>
						{/* Icon - only show when showIcon is true and no user is selected */}
						{showIcon && (
							<User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
						)}
						<Input
							ref={inputRef}
							type="text"
							value={searchTerm}
							onChange={(event) => {
								setSearchTerm(event.target.value);
								// Reset highlight when search term changes
								setHighlightedIndex(-1);
								// Reopen menu when user starts typing (only if currently closed)
								if (event.target.value.trim().length > 0 && !isMenuOpen) {
									setIsMenuOpen(true);
								}
							}}
							onKeyDown={handleKeyDown}
							placeholder={placeholder}
							className={cn(
								showIcon && "pl-10",
								className,
								"placeholder:ml-[-4px]",
								placeholderColor ? `placeholder:text-[${placeholderColor}]` : ""
							)}
							onFocus={() => setIsMenuOpen(true)}
							autoFocus={autoFocus ? true : false}
							autoComplete="off"
						/>
					</div>
				)}
				{!selectedUser && (
					<div className="relative w-full">
						<SearchResultsPortal
							isOpen={filteredItems.length > 0 && isMenuOpen}
							inputRef={inputRef}
							users={filteredItems.slice(0, 10)}
							onSelect={handleSelectUser}
							renderMenuItem={renderMenuItem}
							highlightedIndex={highlightedIndex}
							onHighlightChange={setHighlightedIndex}
						/>
					</div>
				)}
				{helperText && !hideCannotFind && (
					<p className={cn("text-sm text-muted-foreground mt-2")}>
						{helperText}
					</p>
				)}
			</div>
		);
	}
);

BaseUserSearch.displayName = "BaseUserSearch";

// =========================================== INTERNAL COMPONENTS ====================================================

interface SearchResultsPortalProps {
	isOpen: boolean;
	inputRef: RefObject<HTMLInputElement | null>;
	users: IUserData[];
	onSelect: (user: IUserData) => void;
	renderMenuItem?: (
		user: IUserData,
		onSelect: (user: IUserData) => void,
		isHighlighted: boolean
	) => ReactNode;
	highlightedIndex: number;
	onHighlightChange: (index: number) => void;
}

const SearchResultsPortal = ({
	isOpen,
	inputRef,
	users,
	onSelect,
	renderMenuItem,
	highlightedIndex,
	onHighlightChange,
}: SearchResultsPortalProps) => {
	const portalElement = useState<HTMLElement>(() => {
		const el = document.createElement("div");
		el.style.position = "fixed";
		el.style.zIndex = "9999";
		return el;
	})[0];
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

	// Append/remove portal element
	useEffect(() => {
		if (portalElement) {
			document.body.appendChild(portalElement);
			return () => {
				if (document.body.contains(portalElement)) {
					document.body.removeChild(portalElement);
				}
			};
		}
	}, [portalElement]);

	// Update position when inputRef changes or when isOpen changes
	useEffect(() => {
		if (inputRef.current && isOpen) {
			const updatePosition = () => {
				if (!inputRef.current) return;
				const rect = inputRef.current.getBoundingClientRect();
				setPosition({
					top: rect.bottom + window.scrollY,
					left: rect.left + window.scrollX,
					width: rect.width,
				});
			};

			updatePosition();

			window.addEventListener("scroll", updatePosition);
			window.addEventListener("resize", updatePosition);

			return () => {
				window.removeEventListener("scroll", updatePosition);
				window.removeEventListener("resize", updatePosition);
			};
		}
	}, [inputRef, isOpen]);

	if (!isOpen || !portalElement) return null;

	return createPortal(
		<div
			className={cn(
				"fixed min-w-[200px] shadow-md z-[9999] rounded-md bg-white dark:bg-gray-700"
			)}
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
				width: `${position.width}px`,
			}}
		>
			<div className="relative w-full">
				{users.map((user, index) =>
					renderMenuItem ? (
						<div key={user.id} onMouseEnter={() => onHighlightChange(index)}>
							{renderMenuItem(user, onSelect, index === highlightedIndex)}
						</div>
					) : (
						<DefaultMenuItem
							key={user.id}
							user={user}
							onSelect={onSelect}
							isHighlighted={index === highlightedIndex}
							onHover={() => onHighlightChange(index)}
						/>
					)
				)}
			</div>
		</div>,
		portalElement
	);
};

// Default rendering components (can be overridden via props)
const DefaultSelectedDisplay = ({
	user,
	onClear,
}: {
	user: IUserData;
	onClear: () => void;
}) => {
	return (
		<div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
			<span className="text-sm flex-1 truncate">
				{user.display_first_name} {user.display_last_name}
			</span>
			<button
				type="button"
				onClick={onClear}
				className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
			>
				×
			</button>
		</div>
	);
};

const DefaultMenuItem = ({
	user,
	onSelect,
	isHighlighted,
	onHover,
}: {
	user: IUserData;
	onSelect: (user: IUserData) => void;
	isHighlighted: boolean;
	onHover?: () => void;
}) => {
	return (
		<button
			type="button"
			className={cn(
				"w-full text-left p-2 transition-colors cursor-pointer",
				isHighlighted && "bg-gray-200 dark:bg-gray-600"
			)}
			onMouseDown={(e) => {
				// Prevent the wrapper's onMouseDown from interfering
				e.stopPropagation();
			}}
			onClick={(e) => {
				e.stopPropagation();
				onSelect(user);
			}}
			onMouseEnter={() => onHover?.()}
		>
			<p className="text-sm">
				{user.display_first_name} {user.display_last_name}
			</p>
		</button>
	);
};
