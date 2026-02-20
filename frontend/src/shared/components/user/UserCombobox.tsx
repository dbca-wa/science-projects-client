import { forwardRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, X } from "lucide-react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { BaseCombobox } from "@/shared/components/combobox";
import {
	getUsersBasedOnSearchTerm,
	getFullUser,
} from "@/features/users/services/user.service";
import type { IUserData } from "@/shared/types/user.types";
import { getUserDisplayName } from "@/shared/utils/user.utils";
import { getImageUrl } from "@/shared/utils/image.utils";

/**
 * UserCombobox - User search and selection component
 *
 * Wraps BaseCombobox with user-specific logic and rendering.
 * Preserves exact functionality and appearance of UserSearchDropdown.
 *
 * Features:
 * - Debounced user search (300ms)
 * - Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
 * - Mouse selection with hover tracking
 * - Avatar display with role badges
 * - Color coding: Blue (Admin), Green (Staff), Gray (External)
 * - Exclude users from search results
 * - Internal/external user filtering
 *
 * @example
 * ```tsx
 * <UserCombobox
 *   value={userId}
 *   onValueChange={setUserId}
 *   onlyInternal={true}
 *   excludeUserIds={[1, 2, 3]}
 *   label="Select User"
 *   placeholder="Search for a user..."
 * />
 * ```
 */

export interface UserComboboxProps {
	// Core
	value?: number | null;
	onValueChange: (userId: number | null) => void;

	// Search filters
	onlyInternal?: boolean;
	excludeUserIds?: number[];

	// UI
	label?: string;
	placeholder?: string;
	helperText?: string;
	showIcon?: boolean;
	autoFocus?: boolean;
	isRequired?: boolean;
	isEditable?: boolean;
	disabled?: boolean;
	className?: string;
	wrapperClassName?: string;

	// Accessibility
	ariaLabel?: string; // Accessible name when label is not provided
}

export interface UserComboboxRef {
	focusInput: () => void;
	clearSelection: () => void;
}

export const UserCombobox = forwardRef<UserComboboxRef, UserComboboxProps>(
	(
		{
			value,
			onValueChange,
			onlyInternal = true,
			excludeUserIds = [],
			placeholder = "Search for a user...",
			showIcon = false,
			ariaLabel = "Search for a user", // Default accessible name
			...props
		},
		ref
	) => {
		// Load selected user if value provided
		const { data: selectedUser } = useQuery({
			queryKey: ["users", "detail", value],
			queryFn: () => getFullUser(value!),
			enabled: !!value,
			staleTime: 5 * 60_000, // 5 minutes
		});

		// Search function wrapper
		const searchUsers = async (searchTerm: string): Promise<IUserData[]> => {
			const result = await getUsersBasedOnSearchTerm(searchTerm, 1, {
				onlyStaff: onlyInternal,
				onlyExternal: false,
				onlySuperuser: false,
				ignoreArray: excludeUserIds,
			});
			return result.users.slice(0, 10);
		};

		// Handle clear selection (exposed via ref)
		// const handleClearSelection = () => {
		// 	onValueChange(null);
		// };

		return (
			<BaseCombobox<IUserData>
				searchFn={searchUsers}
				value={selectedUser ?? null}
				onChange={(user: IUserData | null) => onValueChange(user?.id ?? null)}
				getItemKey={(user: IUserData) => user.id}
				renderSelected={(user: IUserData, onClear: () => void) => (
					<SelectedUserDisplay user={user} onClear={onClear} />
				)}
				renderMenuItem={(
					user: IUserData,
					onSelect: (user: IUserData) => void,
					isHighlighted: boolean
				) => (
					<UserMenuItem
						user={user}
						onSelect={onSelect}
						isHighlighted={isHighlighted}
					/>
				)}
				icon={
					showIcon ? (
						<User className="size-4 text-gray-500 dark:text-gray-400" />
					) : undefined
				}
				showIcon={showIcon}
				placeholder={placeholder}
				ariaLabel={ariaLabel}
				{...props}
				ref={ref}
			/>
		);
	}
);

UserCombobox.displayName = "UserCombobox";

// =========================================== CUSTOM RENDERING COMPONENTS ====================================================

interface SelectedUserDisplayProps {
	user: IUserData;
	onClear: () => void;
}

const SelectedUserDisplay = ({ user, onClear }: SelectedUserDisplayProps) => {
	const avatarUrl = getImageUrl(user.image);

	return (
		<div
			className={cn(
				"flex items-center relative px-2 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 h-11"
			)}
		>
			<Avatar className="w-7 h-7 flex-shrink-0">
				<AvatarImage src={avatarUrl} alt={getUserDisplayName(user)} />
				<AvatarFallback className="text-xs">
					{user.display_first_name?.[0]}
					{user.display_last_name?.[0]}
				</AvatarFallback>
			</Avatar>
			<span
				className={cn(
					"ml-2 text-sm truncate flex-1",
					user.is_staff
						? user.is_superuser
							? "text-blue-500 dark:text-blue-400"
							: "text-green-500 dark:text-green-400"
						: "text-gray-500 dark:text-gray-200"
				)}
			>
				{getUserDisplayName(user)}{" "}
				{user.is_staff
					? user.is_superuser
						? "(Admin)"
						: "(Staff)"
					: "(External)"}
			</span>

			<Button
				variant="ghost"
				size="sm"
				className="flex-shrink-0 ml-1 h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
				onClick={onClear}
				tabIndex={-1}
				aria-label="Clear selected user"
			>
				<X className="h-3.5 w-3.5" />
			</Button>
		</div>
	);
};

interface UserMenuItemProps {
	user: IUserData;
	onSelect: (user: IUserData) => void;
	isHighlighted: boolean;
}

const UserMenuItem = ({ user, onSelect, isHighlighted }: UserMenuItemProps) => {
	const avatarUrl = getImageUrl(user.image);

	return (
		<button
			type="button"
			className={cn(
				"w-full text-left p-2 flex items-center transition-colors cursor-pointer",
				isHighlighted && "bg-gray-200 dark:bg-gray-600"
			)}
			onMouseDown={(e) => {
				e.stopPropagation();
			}}
			onClick={(e) => {
				e.stopPropagation();
				onSelect(user);
			}}
		>
			<Avatar className="w-10 h-10">
				<AvatarImage src={avatarUrl} alt={getUserDisplayName(user)} />
				<AvatarFallback>
					{user?.display_first_name?.[0]}
					{user?.display_last_name?.[0]}
				</AvatarFallback>
			</Avatar>
			<div className="flex items-center justify-start ml-3 h-full">
				<span
					className={cn(
						"ml-2",
						user.is_staff
							? user.is_superuser
								? "text-blue-500 dark:text-blue-300"
								: "text-green-500 dark:text-green-300"
							: "text-gray-500 dark:text-gray-400"
					)}
				>
					{getUserDisplayName(user)}{" "}
					{user.is_staff
						? user.is_superuser
							? "(Admin)"
							: "(Staff)"
						: "(External)"}
				</span>
			</div>
		</button>
	);
};
