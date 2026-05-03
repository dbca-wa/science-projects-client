/**
 * PendingInviteList Component
 *
 * Renders a flex-wrap container of PendingInviteChip components
 * with a count label and aria-live region for screen reader announcements.
 */

import { PendingInviteChip } from "./PendingInviteChip";
import type { IPendingInvite } from "../../types/team.types";

interface PendingInviteListProps {
	invites: IPendingInvite[];
	onRemove: (inviteId: string) => void;
}

export const PendingInviteList = ({
	invites,
	onRemove,
}: PendingInviteListProps) => {
	if (invites.length === 0) {
		return null;
	}

	const countLabel =
		invites.length === 1
			? "1 member pending"
			: `${invites.length} members pending`;

	return (
		<div className="space-y-2">
			<p className="text-sm font-medium text-muted-foreground">{countLabel}</p>
			<div
				className="flex flex-wrap gap-2"
				role="list"
				aria-label="Pending team member invites"
			>
				{invites.map((invite) => (
					<div key={invite.id} role="listitem">
						<PendingInviteChip invite={invite} onRemove={onRemove} />
					</div>
				))}
			</div>
			{/* Screen reader announcements for list changes */}
			<div aria-live="polite" className="sr-only">
				{countLabel}
			</div>
		</div>
	);
};
