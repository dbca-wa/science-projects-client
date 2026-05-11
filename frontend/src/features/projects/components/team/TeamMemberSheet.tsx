/**
 * TeamMemberSheet Component
 *
 * Sheet component for viewing and editing team member details.
 * Matches UserDetailSheet design with project-specific role section.
 */

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { Slider } from "@/shared/components/ui/slider";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { toast } from "sonner";
import type { IProjectMember } from "@/shared/types/project.types";
import type { IUserData } from "@/shared/types/user.types";
import { useUpdateTeamMember } from "../../hooks/useUpdateTeamMember";
import { useRemoveTeamMember } from "../../hooks/useRemoveTeamMember";
import { useSetTeamLeader } from "../../hooks/useSetTeamLeader";
import {
	UserSheetHeader,
	UserSheetActionButtons,
	UserSheetOrganisationSection,
	UserSheetAboutSection,
	UserSheetDetailsSection,
	SectionContainer,
} from "@/shared/components/user-sheet";

interface TeamMemberSheetProps {
	member: IProjectMember;
	projectId: number;
	isOpen: boolean;
	onClose: () => void;
	canManageTeam: boolean;
	/** Project kind — needed to enforce last-student/last-external removal protection */
	projectKind?: string;
	/** All team members — needed to count students/externals for removal protection */
	allMembers?: IProjectMember[];
}

// Role options based on staff status
const STAFF_ROLES = [
	{ value: "supervising", label: "Supervising Scientist", leaderOnly: true },
	{ value: "technical", label: "Technical Support", leaderOnly: false },
	{ value: "research", label: "Science Support", leaderOnly: false },
];

const EXTERNAL_ROLES = [
	{ value: "supervising", label: "Supervising Scientist", leaderOnly: true },
	{ value: "academicsuper", label: "Academic Supervisor", leaderOnly: false },
	{ value: "consulted", label: "Consulted Peer", leaderOnly: false },
	{ value: "externalcol", label: "External Collaborator", leaderOnly: false },
	{ value: "group", label: "Involved Group", leaderOnly: false },
	{ value: "student", label: "Supervised Student", leaderOnly: false },
];

export const TeamMemberSheet = ({
	member,
	projectId,
	isOpen,
	onClose,
	canManageTeam,
	projectKind,
	allMembers,
}: TeamMemberSheetProps) => {
	const { mutate: updateMember, isPending: isUpdating } =
		useUpdateTeamMember(projectId);
	const { mutate: removeMember, isPending: isRemoving } =
		useRemoveTeamMember(projectId);
	const { mutate: setLeader, isPending: isSettingLeader } =
		useSetTeamLeader(projectId);

	// Form state - initialise from member prop
	// Use member values as key to reset state when member data changes externally
	const memberKey = `${member.role}-${member.time_allocation}-${member.short_code}-${member.is_leader}`;
	const [role, setRole] = useState(member.role);
	const [timeAllocation, setTimeAllocation] = useState(member.time_allocation);
	const [shortCode, setShortCode] = useState(
		member.short_code?.toString() || ""
	);
	const [lastMemberKey, setLastMemberKey] = useState(memberKey);

	// Sync local state when member prop updates (e.g. after promote invalidates the query)
	if (memberKey !== lastMemberKey) {
		setRole(member.role);
		setTimeAllocation(member.time_allocation);
		setShortCode(member.short_code?.toString() || "");
		setLastMemberKey(memberKey);
	}

	const isStaff = member.user.is_staff;
	const isLeader = member.is_leader;
	const roleOptions = isStaff ? STAFF_ROLES : EXTERNAL_ROLES;

	// Determine if this member is the last student/external and cannot be removed
	const isLastRequiredMember = (() => {
		if (!projectKind || !allMembers) return false;

		if (projectKind === "student") {
			// Count members with student role
			const studentMembers = allMembers.filter((m) => m.role === "student");
			return member.role === "student" && studentMembers.length <= 1;
		}

		if (projectKind === "external") {
			// Count external (non-staff) members
			const externalMembers = allMembers.filter((m) => !m.user.is_staff);
			return !member.user.is_staff && externalMembers.length <= 1;
		}

		return false;
	})();

	const canRemove = !isLeader && !isLastRequiredMember;
	const removeTooltip = isLeader
		? "Cannot remove project leader"
		: isLastRequiredMember && projectKind === "student"
			? "Cannot remove the last student from a student project"
			: isLastRequiredMember && projectKind === "external"
				? "Cannot remove the last external member from an external project"
				: undefined;

	// Lock role changes for the supervising scientist (managed via promote/demote)
	// and for the last required member in student/external projects
	const isRoleLocked =
		member.role === "supervising" || isLeader || isLastRequiredMember;
	const roleLockedReason =
		member.role === "supervising" || isLeader
			? "Project leader role is managed via promote/demote"
			: isLastRequiredMember && projectKind === "student"
				? "Cannot change role — this is the only student in a student project"
				: isLastRequiredMember && projectKind === "external"
					? "Cannot change role — this is the only external member in an external project"
					: undefined;

	const handleSave = () => {
		// For leaders or last-required members, don't include role in the update
		const data: Record<string, unknown> = {
			time_allocation: timeAllocation,
		};
		if (!isRoleLocked) {
			data.role = role;
		}

		updateMember(
			{
				userId: member.user.id,
				data: data as { role?: string; time_allocation: number },
			},
			{
				onSuccess: () => {
					toast.success("Team member updated successfully");
					onClose();
				},
				onError: (error: Error) => {
					toast.error(error.message || "Failed to update team member");
				},
			}
		);
	};

	const handleRemove = () => {
		removeMember(member.user.id, {
			onSuccess: () => {
				toast.success("Team member removed from project");
				onClose();
			},
			onError: (error: Error) => {
				toast.error(error.message || "Failed to remove team member");
			},
		});
	};

	const handlePromoteToLeader = () => {
		setLeader(member.user.id, {
			onSuccess: () => {
				toast.success("Team member promoted to leader");
				onClose();
			},
			onError: (error: Error) => {
				toast.error(error.message || "Failed to promote to leader");
			},
		});
	};

	const handleEmail = () => {
		if (member.user.email && !member.user.email.startsWith("unset")) {
			window.open(`mailto:${member.user.email}`);
		}
	};

	return (
		<Sheet key={member.id} open={isOpen} onOpenChange={onClose}>
			<SheetContent className="w-full sm:max-w-md overflow-y-auto p-6">
				{/* Header Section */}
				<UserSheetHeader user={member.user as unknown as IUserData} />

				{/* Action Buttons */}
				{canManageTeam && (
					<UserSheetActionButtons
						user={member.user as unknown as IUserData}
						onEmail={handleEmail}
						customButtons={
							<>
								<Button
									variant="outline"
									onClick={handleEmail}
									disabled={
										!member.user.email || member.user.email.startsWith("unset")
									}
								>
									Email
								</Button>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="w-full">
											<Button
												variant="destructive"
												onClick={handleRemove}
												disabled={isRemoving || !canRemove}
												className="w-full"
											>
												Remove from Project
											</Button>
										</div>
									</TooltipTrigger>
									{removeTooltip && (
										<TooltipContent>{removeTooltip}</TooltipContent>
									)}
								</Tooltip>
							</>
						}
					/>
				)}

				{/* Project Role Section */}
				{canManageTeam && (
					<SectionContainer>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="role">Project Role</Label>
								<Select
									value={role || undefined}
									onValueChange={setRole}
									disabled={isRoleLocked}
								>
									<SelectTrigger id="role" className="w-full">
										<SelectValue placeholder="Select a Role" />
									</SelectTrigger>
									<SelectContent className="z-[70]">
										{roleOptions
											.filter((option) => isLeader || !option.leaderOnly)
											.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
								<p className="text-sm text-muted-foreground">
									{roleLockedReason ||
										"The role this team member fills within this project"}
								</p>
							</div>

							<div className="space-y-2">
								<Label>Time Allocation ({timeAllocation} FTE)</Label>
								<Slider
									value={[timeAllocation]}
									onValueChange={(values) => setTimeAllocation(values[0])}
									min={0}
									max={1}
									step={0.1}
									className="py-4"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="shortCode">Short Code</Label>
								<Input
									id="shortCode"
									type="number"
									value={shortCode}
									onChange={(e) => setShortCode(e.target.value)}
									autoComplete="off"
								/>
							</div>

							{!member.is_leader && (
								<Button
									variant="default"
									className="w-full bg-green-600 hover:bg-green-500"
									onClick={handlePromoteToLeader}
									disabled={!isStaff || isSettingLeader}
								>
									Promote to Leader
								</Button>
							)}

							<Button
								variant="default"
								className="w-full"
								onClick={handleSave}
								disabled={isUpdating || (!isRoleLocked && !role)}
							>
								{!isRoleLocked && !role
									? "Please Select a Role"
									: "Save Changes"}
							</Button>
						</div>
					</SectionContainer>
				)}

				{/* Organisation Section */}
				<UserSheetOrganisationSection
					user={member.user as unknown as IUserData}
				/>

				{/* About Section */}
				<UserSheetAboutSection user={member.user as unknown as IUserData} />

				{/* Details Section */}
				<UserSheetDetailsSection
					user={member.user as unknown as IUserData}
					showJoinedDate={true}
				/>
			</SheetContent>
		</Sheet>
	);
};
