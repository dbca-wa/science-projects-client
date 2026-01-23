import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";
import { UserDisplay } from "@/shared/components/UserDisplay";
import type { CaretakerUserSearchProps } from "../../types/caretaker.types";
import type { IUserData } from "@/shared/types/user.types";
import { BaseUserSearch } from "../BaseUserSearch";

/**
 * CaretakerUserSearch component
 * User search dropdown with exclusion logic for caretaker selection
 * 
 * Features:
 * - Debounced search input (300ms)
 * - Only shows internal users (is_staff = true)
 * - Excludes users in excludeUserIds array
 * - Limits to 10 results
 * - Shows user avatar, name, email in results
 * - Selection locks input and shows selected user with clear button
 * 
 * @param onSelect - Callback when user is selected
 * @param excludeUserIds - Array of user IDs to exclude from search
 */
export const CaretakerUserSearch = ({ onSelect, excludeUserIds }: CaretakerUserSearchProps) => {
	const handleSelect = (user: IUserData | null) => {
		onSelect(user ? user.id : 0);
	};

	return (
		<BaseUserSearch
			onSelect={handleSelect}
			onlyInternal={true}
			excludeUserIds={excludeUserIds}
			placeholder="Search for a caretaker..."
			renderSelected={(user, onClear) => (
				<div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
					<UserDisplay user={user} showEmail={true} size="sm" />
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="ml-auto h-8 w-8 p-0"
						onClick={onClear}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			)}
			renderMenuItem={(user, onSelectUser) => (
				<button
					type="button"
					className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none bg-white dark:bg-gray-800"
					onClick={() => onSelectUser(user)}
				>
					<UserDisplay user={user} showEmail={true} size="sm" />
				</button>
			)}
		/>
	);
};