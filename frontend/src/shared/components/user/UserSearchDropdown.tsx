import { forwardRef } from "react";
import { Button } from "@/shared/components/ui/button";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { IUserData } from "@/shared/types/user.types";
import { getUserDisplayName } from "@/shared/utils/user.utils";
import { getImageUrl } from "@/shared/utils/image.utils";
import {
	BaseUserSearch,
	type BaseUserSearchRef,
} from "@/shared/components/user";

interface IUserSearchDropdown {
	onlyInternal?: boolean;
	autoFocus?: boolean;
	isRequired: boolean;
	setUserFunction: (setUserPk: number | null) => void;
	setUserEmailFunction?: (setUserEmail: string) => void;
	setUserNameFunction?: (setUserName: string) => void;
	label: string;
	placeholder: string;
	helperText: string;
	preselectedUserPk?: number;
	isEditable?: boolean;
	className?: string;
	wrapperClassName?: string;
	hideCannotFind?: boolean;
	placeholderColor?: string;
	showIcon?: boolean;
}

export const UserSearchDropdown = forwardRef<
	BaseUserSearchRef,
	IUserSearchDropdown
>(
	(
		{
			onlyInternal = true,
			autoFocus,
			isRequired,
			setUserFunction,
			setUserEmailFunction,
			setUserNameFunction,
			label,
			placeholder,
			helperText,
			preselectedUserPk,
			isEditable,
			className,
			wrapperClassName,
			hideCannotFind,
			placeholderColor,
			showIcon = false,
		},
		ref
	) => {
		const handleSelect = (user: IUserData | null) => {
			if (user) {
				setUserFunction(user.id);
				if (setUserEmailFunction) {
					setUserEmailFunction(user.email);
				}
				if (setUserNameFunction) {
					setUserNameFunction(getUserDisplayName(user));
				}
			} else {
				setUserFunction(null);
				if (setUserEmailFunction) {
					setUserEmailFunction("");
				}
				if (setUserNameFunction) {
					setUserNameFunction("");
				}
			}
		};

		return (
			<BaseUserSearch
				ref={ref}
				onSelect={handleSelect}
				onlyInternal={onlyInternal}
				preselectedUserPk={preselectedUserPk}
				label={label}
				placeholder={placeholder}
				helperText={helperText}
				autoFocus={autoFocus}
				isRequired={isRequired}
				isEditable={isEditable}
				className={className}
				wrapperClassName={wrapperClassName}
				hideCannotFind={hideCannotFind}
				placeholderColor={placeholderColor}
				showIcon={showIcon}
				renderSelected={(user, onClear) => (
					<SelectedUserInput user={user} onClear={onClear} />
				)}
				renderMenuItem={(user, onSelect, isHighlighted) => (
					<CustomMenuItem
						user={user}
						onClick={() => onSelect(user)}
						isHighlighted={isHighlighted}
					/>
				)}
			/>
		);
	}
);

UserSearchDropdown.displayName = "UserSearchDropdown";

// =========================================== CUSTOM RENDERING COMPONENTS ====================================================

interface CustomMenuItemProps {
	onClick: () => void;
	user: IUserData;
	isHighlighted: boolean;
}

const CustomMenuItem = ({
	onClick,
	user,
	isHighlighted,
}: CustomMenuItemProps) => {
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
				onClick();
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

interface SelectedUserInputProps {
	user: IUserData;
	onClear: () => void;
}

const SelectedUserInput = ({ user, onClear }: SelectedUserInputProps) => {
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
