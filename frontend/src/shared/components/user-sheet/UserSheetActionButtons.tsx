/**
 * UserSheetActionButtons Component
 *
 * Reusable action buttons for user detail sheets (Email, Add to Project, etc.)
 */

import { Button } from "@/shared/components/ui/button";
import { Mail, UserPlus } from "lucide-react";
import { hasValidEmail } from "@/shared/utils/user.utils";
import type { IUserData } from "@/shared/types/user.types";

interface UserSheetActionButtonsProps {
	user: IUserData;
	onEmail?: () => void;
	onAddToProject?: () => void;
	isCurrentUser?: boolean;
	customButtons?: React.ReactNode;
}

export function UserSheetActionButtons({
	user,
	onEmail,
	onAddToProject,
	isCurrentUser = false,
	customButtons,
}: UserSheetActionButtonsProps) {
	const handleEmail = () => {
		if (onEmail) {
			onEmail();
		} else if (hasValidEmail(user)) {
			window.open(`mailto:${user.email}`);
		}
	};

	return (
		<div className="grid grid-cols-2 gap-4 mb-4 pt-2 pb-4">
			{customButtons ? (
				customButtons
			) : (
				<>
					<Button
						onClick={handleEmail}
						disabled={!hasValidEmail(user)}
						className="bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Mail className="size-4 mr-2" />
						Email
					</Button>
					<Button
						onClick={onAddToProject}
						disabled={isCurrentUser}
						className="bg-green-500 hover:bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<UserPlus className="size-4 mr-2" />
						Add to Project
					</Button>
				</>
			)}
		</div>
	);
}
