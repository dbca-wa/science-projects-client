/**
 * ProjectTeamSection Component
 *
 * Main component for displaying and managing project team members.
 */

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useProjectTeam } from "../../hooks/useProjectTeam";
import { useInviteTeamMember } from "../../hooks/useInviteTeamMember";
import { TeamMemberGrid } from "./TeamMemberGrid";
import { InviteTeamMemberModal } from "./InviteTeamMemberModal";
import type { IProjectMember } from "@/shared/types/project.types";

interface ProjectTeamSectionProps {
	projectId: number;
	canManageTeam: boolean;
}

export function ProjectTeamSection({
	projectId,
	canManageTeam,
}: ProjectTeamSectionProps) {
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
	const { data: teamMembers, isLoading, error } = useProjectTeam(projectId);
	const inviteMutation = useInviteTeamMember(projectId);

	// Get existing member IDs for exclusion in invite modal
	// Only exclude direct members, not caretakers (users can be both member and caretaker)
	const excludeUserIds = teamMembers?.map((member) => member.user.id) ?? [];

	const handleInvite = async (data: {
		userId: number;
		role: string;
		timeAllocation: number;
		shortCode: string;
	}) => {
		try {
			await inviteMutation.mutateAsync({
				user_id: data.userId,
				role: data.role,
				time_allocation: data.timeAllocation,
			});
			toast.success("Team member added successfully");
			setIsInviteModalOpen(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add team member"
			);
		}
	};

	if (isLoading) {
		return (
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold">Project Team</h2>
					{canManageTeam && <Skeleton className="h-10 w-32" />}
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<TeamMemberCardSkeleton />
					<TeamMemberCardSkeleton />
					<TeamMemberCardSkeleton />
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="space-y-4">
				<h2 className="text-2xl font-semibold">Project Team</h2>
				<div className="text-center py-12 text-muted-foreground">
					Failed to load team members. Please try again.
				</div>
			</section>
		);
	}

	const hasMembers = teamMembers && teamMembers.length > 0;

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">Project Team</h2>
				{canManageTeam && (
					<Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
						<UserPlus className="h-4 w-4" />
						Invite Member
					</Button>
				)}
			</div>

			{/* Helper text */}
			<p className="text-[14px] text-muted-foreground">
				To reassign the project leader, click a user's name and promote them.
				This will set other users with leader role to Science Support or
				External Collaborator, depending on their staff status. Click a member's
				name to adjust their details and role for this project. Project and
				Business Area leads can click and drag a user to re-arrange order.
			</p>

			{!hasMembers ? (
				<EmptyState
					canManageTeam={canManageTeam}
					onInvite={() => setIsInviteModalOpen(true)}
				/>
			) : (
				<TeamMemberGrid
					members={teamMembers as unknown as IProjectMember[]}
					projectId={projectId}
					canManageTeam={canManageTeam}
				/>
			)}

			{canManageTeam && (
				<InviteTeamMemberModal
					projectId={projectId}
					isOpen={isInviteModalOpen}
					onClose={() => setIsInviteModalOpen(false)}
					excludeUserIds={excludeUserIds}
					onInvite={handleInvite}
				/>
			)}
		</section>
	);
}

/**
 * TeamMemberCardSkeleton Component
 *
 * Loading skeleton for team member cards.
 */
function TeamMemberCardSkeleton() {
	return (
		<div className="border rounded-lg p-4 space-y-3">
			<div className="flex items-start gap-3">
				<Skeleton className="h-12 w-12 rounded-full" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-24" />
				</div>
			</div>
			<div className="space-y-2">
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-20" />
			</div>
		</div>
	);
}

/**
 * EmptyState Component
 *
 * Displayed when there are no team members.
 */
interface EmptyStateProps {
	canManageTeam: boolean;
	onInvite: () => void;
}

function EmptyState({ canManageTeam, onInvite }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
			<h3 className="text-lg font-medium mb-2">No team members yet</h3>
			<p className="text-sm text-muted-foreground mb-4">
				{canManageTeam
					? "Get started by inviting your first team member"
					: "This project doesn't have any team members yet"}
			</p>
			{canManageTeam && (
				<Button onClick={onInvite} className="gap-2">
					<UserPlus className="h-4 w-4" />
					Invite Member
				</Button>
			)}
		</div>
	);
}
