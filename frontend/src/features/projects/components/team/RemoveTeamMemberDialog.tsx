/**
 * RemoveTeamMemberDialog Component
 *
 * Confirmation dialog for removing team members.
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
import { useRemoveTeamMember } from "../../hooks/useRemoveTeamMember";
import type { IProjectMember } from "@/shared/types/project.types";

interface RemoveTeamMemberDialogProps {
	member: IProjectMember;
	projectId: number;
	isOpen: boolean;
	onClose: () => void;
}

export function RemoveTeamMemberDialog({
	member,
	projectId,
	isOpen,
	onClose,
}: RemoveTeamMemberDialogProps) {
	const { mutate: removeMember, isPending } = useRemoveTeamMember(projectId);

	const handleRemove = () => {
		removeMember(member.id, {
			onSuccess: () => {
				toast.success(
					`${member.user.display_first_name} ${member.user.display_last_name} removed from team`
				);
				onClose();
			},
			onError: (error: Error) => {
				toast.error(error.message || "Failed to remove team member");
			},
		});
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove Team Member</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to remove {member.user.display_first_name}{" "}
						{member.user.display_last_name} from this project? This action
						cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleRemove}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending ? "Removing..." : "Remove"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
