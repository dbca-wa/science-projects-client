/**
 * SetLeaderDialog Component
 *
 * Confirmation dialog for designating or removing project leaders.
 */

import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useUpdateTeamMember } from "../../hooks/useUpdateTeamMember";
import type { IProjectMember } from "@/shared/types/project.types";

interface SetLeaderDialogProps {
	member: IProjectMember;
	projectId: number;
	isOpen: boolean;
	onClose: () => void;
}

export function SetLeaderDialog({
	member,
	projectId,
	isOpen,
	onClose,
}: SetLeaderDialogProps) {
	const { mutate: updateMember, isPending } = useUpdateTeamMember(projectId);

	const isCurrentlyLeader = member.is_leader;

	const handleToggleLeader = () => {
		updateMember(
			{
				userId: member.user.id,
				data: { is_leader: !isCurrentlyLeader },
			},
			{
				onSuccess: () => {
					const action = isCurrentlyLeader ? "removed as" : "set as";
					toast.success(
						`${member.user.display_first_name} ${member.user.display_last_name} ${action} project leader`
					);
					onClose();
				},
				onError: (error: Error) => {
					toast.error(error.message || "Failed to update leader status");
				},
			}
		);
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isCurrentlyLeader
							? "Remove Project Leader"
							: "Set as Project Leader"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isCurrentlyLeader ? (
							<>
								Remove {member.user.display_first_name}{" "}
								{member.user.display_last_name} as project leader? They will
								lose team management permissions.
							</>
						) : (
							<>
								Set {member.user.display_first_name}{" "}
								{member.user.display_last_name} as project leader? This will
								grant them team management permissions.
							</>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleToggleLeader} disabled={isPending}>
						{isPending ? "Updating..." : "Confirm"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
