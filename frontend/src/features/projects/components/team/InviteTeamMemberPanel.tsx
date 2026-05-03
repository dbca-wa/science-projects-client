/**
 * InviteTeamMemberPanel Component
 *
 * Inline panel for inviting multiple team members to a project.
 * Replaces the former InviteTeamMemberModal with an expandable panel
 * that allows queuing multiple invites before batch submission.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { InviteMemberForm } from "./InviteMemberForm";
import { PendingInviteList } from "./PendingInviteList";
import { useInviteTeamMembers } from "../../hooks/useInviteTeamMembers";
import type { IPendingInvite } from "../../types/team.types";

interface InviteTeamMemberPanelProps {
	projectId: number;
	excludeUserIds: number[];
	onClose: () => void;
}

export const InviteTeamMemberPanel = ({
	projectId,
	excludeUserIds,
	onClose,
}: InviteTeamMemberPanelProps) => {
	const [pendingInvites, setPendingInvites] = useState<IPendingInvite[]>([]);
	const batchMutation = useInviteTeamMembers(projectId);

	// Combine existing member IDs with pending invite user IDs for exclusion
	const pendingUserIds = pendingInvites.map((invite) => invite.user.id);
	const allExcludedIds = [...excludeUserIds, ...pendingUserIds];

	const handleAddToPending = (invite: IPendingInvite) => {
		setPendingInvites((prev) => [...prev, invite]);
	};

	const handleRemoveFromPending = (inviteId: string) => {
		setPendingInvites((prev) =>
			prev.filter((invite) => invite.id !== inviteId)
		);
	};

	const handleSubmitAll = () => {
		if (pendingInvites.length === 0) return;

		batchMutation.mutate(pendingInvites, {
			onSuccess: (result) => {
				const { succeeded, failed } = result;

				if (failed.length === 0) {
					// All succeeded
					const count = succeeded.length;
					toast.success(
						count === 1
							? "1 member added successfully"
							: `${count} members added successfully`
					);
					setPendingInvites([]);
					onClose();
				} else {
					// Partial failure — keep failed invites in the list
					const failedIds = new Set(failed.map((f) => f.invite.id));
					setPendingInvites((prev) =>
						prev.filter((invite) => failedIds.has(invite.id))
					);

					if (succeeded.length > 0) {
						toast.success(
							`${succeeded.length} member(s) added. ${failed.length} failed — please try again.`
						);
					} else {
						toast.error(
							`Failed to add ${failed.length} member(s). Please try again.`
						);
					}
				}
			},
		});
	};

	const isSubmitting = batchMutation.isPending;
	const canSubmit = pendingInvites.length > 0 && !isSubmitting;

	return (
		<div className="rounded-lg border bg-card p-6 space-y-6">
			<div>
				<h3 className="text-lg font-semibold">Add Team Members</h3>
				<p className="text-sm text-muted-foreground mt-1">
					Search for users and add them to the list below. Submit all at once
					when ready.
				</p>
			</div>

			{/* Form for selecting and configuring a user */}
			<InviteMemberForm
				excludeUserIds={allExcludedIds}
				onAdd={handleAddToPending}
				disabled={isSubmitting}
			/>

			{/* Pending invites list */}
			<PendingInviteList
				invites={pendingInvites}
				onRemove={handleRemoveFromPending}
			/>

			{/* Submit / Cancel actions */}
			<div className="flex items-center justify-end gap-3 pt-2 border-t">
				<Button variant="outline" onClick={onClose} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button
					onClick={handleSubmitAll}
					disabled={!canSubmit}
					className="gap-2"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Submitting...
						</>
					) : (
						<>
							<Send className="h-4 w-4" />
							Add All Members
							{pendingInvites.length > 0 && ` (${pendingInvites.length})`}
						</>
					)}
				</Button>
			</div>
		</div>
	);
};
