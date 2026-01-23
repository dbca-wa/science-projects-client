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
 * 
 * @example
 * ```tsx
 * <BaseUserSearch
 *   onSelect={(user) => setUserId(user.id)}
 *   renderSelected={(user, onClear) => <CustomSelectedDisplay user={user} onClear={onClear} />}
 *   renderMenuItem={(user, onSelect) => <CustomMenuItem user={user} onClick={() => onSelect(user)} />}
 * />
 * ```
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
	hideCannotFind?: boolean;
	placeholderColor?: string;
	
	// Custom rendering (composition pattern)
	renderSelected?: (user: IUserData, onClear: () => void) => ReactNode;
	renderMenuItem?: (user: IUserData, onSelect: (user: IUserData) => void) => ReactNode;
}

export interface BaseUserSearchRef {
	focusInput: () => void;
}

export const BaseUserSearch = forwardRef<BaseUserSearchRef, BaseUserSearchProps>(
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
			hideCannotFind,
			placeholderColor,
			renderSelected,
			renderMenuItem,
		},
		ref
	) => {
		const inputRef = useRef<HTMLInputElement>(null);
		const [searchTerm, setSearchTerm] = useState("");
		const [isMenuOpen, setIsMenuOpen] = useState(true);
		const [selectedUser, setSelectedUser] = useState<IUserData | null>(null);

		// Debounce search term (300ms)
		const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

		// Fetch users based on debounced search term
		const { data: searchResults } = useQuery({
			queryKey: ["users", "search", debouncedSearchTerm, { onlyInternal, excludeUserIds }],
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

		const handleSelectUser = (user: IUserData) => {
			setIsMenuOpen(false);
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

		useImperativeHandle(ref, () => ({
			focusInput: () => {
				if (inputRef.current) {
					inputRef.current.focus();
				}
			},
		}));

		const filteredItems = searchResults?.users || [];

		return (
			<div className={cn("w-full", isRequired && "required")}>
				{label && <Label>{label}</Label>}
				{selectedUser && renderSelected ? (
					renderSelected(selectedUser, handleClearUser)
				) : selectedUser ? (
					<DefaultSelectedDisplay user={selectedUser} onClear={handleClearUser} />
				) : (
					<div className="relative">
						<Input
							ref={inputRef}
							type="text"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder={placeholder}
							className={cn(
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
						/>
					</div>
				)}
				{helperText && !hideCannotFind && (
					<p className={cn("text-sm text-muted-foreground mt-2")}>{helperText}</p>
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
	renderMenuItem?: (user: IUserData, onSelect: (user: IUserData) => void) => ReactNode;
}

const SearchResultsPortal = ({
	isOpen,
	inputRef,
	users,
	onSelect,
	renderMenuItem,
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
			className={cn("fixed min-w-[200px] shadow-md z-[9999] rounded-md bg-white dark:bg-gray-700")}
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
				width: `${position.width}px`,
			}}
		>
			<div className="relative w-full">
				{users.map((user) =>
					renderMenuItem ? (
						<div key={user.id}>{renderMenuItem(user, onSelect)}</div>
					) : (
						<DefaultMenuItem key={user.id} user={user} onSelect={onSelect} />
					)
				)}
			</div>
		</div>,
		portalElement
	);
};

// Default rendering components (can be overridden via props)
const DefaultSelectedDisplay = ({ user, onClear }: { user: IUserData; onClear: () => void }) => {
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

const DefaultMenuItem = ({ user, onSelect }: { user: IUserData; onSelect: (user: IUserData) => void }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<button
			type="button"
			className={cn(
				"w-full text-left p-2 transition-colors",
				isHovered ? "bg-gray-200 dark:bg-gray-600" : "transparent"
			)}
			onClick={() => onSelect(user)}
			onMouseOver={() => setIsHovered(true)}
			onMouseOut={() => setIsHovered(false)}
		>
			<p className="text-sm">
				{user.display_first_name} {user.display_last_name}
			</p>
		</button>
	);
};
