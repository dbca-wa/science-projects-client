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
}

// Role options based on staff status
const STAFF_ROLES = [
	{ value: "technical", label: "Technical Support" },
	{ value: "research", label: "Science Support" },
];

const EXTERNAL_ROLES = [
	{ value: "academicsuper", label: "Academic Supervisor" },
	{ value: "consulted", label: "Consulted Peer" },
	{ value: "externalcol", label: "External Collaborator" },
	{ value: "group", label: "Involved Group" },
	{ value: "student", label: "Supervised Student" },
];

export function TeamMemberSheet({
	member,
	projectId,
	isOpen,
	onClose,
	canManageTeam,
}: TeamMemberSheetProps) {
	const { mutate: updateMember, isPending: isUpdating } =
		useUpdateTeamMember(projectId);
	const { mutate: removeMember, isPending: isRemoving } =
		useRemoveTeamMember(projectId);
	const { mutate: setLeader, isPending: isSettingLeader } =
		useSetTeamLeader(projectId);

	// Form state - initialise from member prop
	const [role, setRole] = useState(member.role);
	const [timeAllocation, setTimeAllocation] = useState(member.time_allocation);
	const [shortCode, setShortCode] = useState(
		member.short_code?.toString() || ""
	);

	const isStaff = member.user.is_staff;
	const roleOptions = isStaff ? STAFF_ROLES : EXTERNAL_ROLES;

	const handleSave = () => {
		updateMember(
			{
				userId: member.user.id,
				data: {
					role,
					time_allocation: timeAllocation,
				},
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
												disabled={isRemoving || member.is_leader}
												className="w-full"
											>
												Remove from Project
											</Button>
										</div>
									</TooltipTrigger>
									{member.is_leader && (
										<TooltipContent>
											Cannot remove project leader
										</TooltipContent>
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
								<Select value={role || undefined} onValueChange={setRole}>
									<SelectTrigger id="role" className="w-full">
										<SelectValue placeholder="Select a Role" />
									</SelectTrigger>
									<SelectContent>
										{roleOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-sm text-muted-foreground">
									The role this team member fills within this project
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
								disabled={isUpdating || !role}
							>
								{!role ? "Please Select a Role" : "Save Changes"}
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
}
