/**
 * PendingInviteChip Component
 *
 * Displays a single pending team member invite as a styled chip.
 * Background colour varies by user type: blue (admin), green (staff), grey (external).
 */

import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { IPendingInvite } from "../../types/team.types";

interface PendingInviteChipProps {
	invite: IPendingInvite;
	onRemove: (inviteId: string) => void;
}

/**
 * Returns Tailwind classes for chip background based on user type.
 */
const getChipColourClasses = (invite: IPendingInvite): string => {
	if (invite.user.is_superuser) {
		return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300";
	}
	if (invite.user.is_staff) {
		return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300";
	}
	return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300";
};

const getUserDisplayName = (invite: IPendingInvite): string => {
	return `${invite.user.display_first_name} ${invite.user.display_last_name}`;
};

export const PendingInviteChip = ({
	invite,
	onRemove,
}: PendingInviteChipProps) => {
	const displayName = getUserDisplayName(invite);

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
				getChipColourClasses(invite)
			)}
			data-testid={`pending-invite-chip-${invite.id}`}
		>
			<span className="font-medium">{displayName}</span>
			<span className="opacity-70">·</span>
			<span className="opacity-80">{invite.roleLabel}</span>
			<Button
				variant="ghost"
				size="sm"
				className="ml-0.5 h-5 w-5 p-0 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
				onClick={() => onRemove(invite.id)}
				aria-label={`Remove ${displayName} from pending invites`}
			>
				<X className="h-3 w-3" />
			</Button>
		</div>
	);
};
