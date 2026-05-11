/**
 * TeamMemberCard Component
 *
 * Displays individual team member with avatar, name, and role tag.
 * Matches original SPMS design with proper styling and crown for leader.
 */

import { useState } from "react";
import { Crown } from "lucide-react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { getAvatarUrl } from "@/shared/utils/image.utils";
import { cn } from "@/shared/lib/utils";
import type { IProjectMember } from "@/shared/types/project.types";
import { TeamMemberSheet } from "./TeamMemberSheet";
import { TeamRoleBadge } from "./TeamRoleBadge";
import { LINK_COLOR } from "@/shared/constants";

interface TeamMemberCardProps {
	member: IProjectMember;
	projectId: number;
	canManageTeam: boolean;
	isDragging?: boolean;
	projectKind?: string;
	allMembers?: IProjectMember[];
}

export const TeamMemberCard = ({
	member,
	projectId,
	canManageTeam,
	isDragging = false,
	projectKind,
	allMembers,
}: TeamMemberCardProps) => {
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const initials = `${member.user.display_first_name?.[0] || ""}${member.user.display_last_name?.[0] || ""}`;
	const avatarUrl = getAvatarUrl(member.user.image);

	const displayName =
		member.user.display_first_name && member.user.display_last_name
			? `${member.user.display_first_name} ${member.user.display_last_name}`
			: member.user.username || "Unknown User";

	return (
		<>
			<div
				className={cn(
					"flex items-start gap-4 p-4 bg-card border border-border rounded-lg transition-all hover:shadow-md",
					isDragging && "bg-blue-500 scale-110 shadow-lg z-[999]"
				)}
				role="article"
				aria-label={`Team member: ${displayName}`}
			>
				{/* Avatar with crown for leader */}
				<div className="relative flex-shrink-0">
					<Avatar className="size-18">
						<AvatarImage src={avatarUrl} alt={displayName} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					{member.is_leader && (
						<div
							className="absolute -top-1 left-1/2 -translate-x-1/2"
							aria-label="Project leader"
						>
							<Crown className="h-4 w-4 text-yellow-300 fill-yellow-300" />
						</div>
					)}
				</div>

				{/* Name and role */}
				<div className="flex-1 min-w-0 space-y-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="link"
								className={cn(
									"h-auto p-0 text-lg font-semibold justify-start relative z-20",
									`text-[${LINK_COLOR}]`,
									isDragging && "text-white hover:text-white"
								)}
								onClick={() => setIsSheetOpen(true)}
								aria-label={`View details for ${displayName}`}
							>
								{displayName}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								Click to view member details
								{canManageTeam && " • Drag card to reorder"}
							</p>
						</TooltipContent>
					</Tooltip>

					{/* Caretaker indicator */}
					{member.user.caretakers && member.user.caretakers.length > 0 && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-2 cursor-pointer select-none">
									<Avatar className="size-6">
										<AvatarImage
											src={getAvatarUrl(member.user.caretakers[0].image)}
											alt={`${member.user.caretakers[0].display_first_name} ${member.user.caretakers[0].display_last_name}`}
										/>
										<AvatarFallback className="text-xs">
											{member.user.caretakers[0].display_first_name?.[0]}
											{member.user.caretakers[0].display_last_name?.[0]}
										</AvatarFallback>
									</Avatar>
									<span
										className={cn(
											"text-xs text-muted-foreground",
											isDragging && "text-white/80"
										)}
									>
										({member.user.caretakers[0].display_first_name}{" "}
										{member.user.caretakers[0].display_last_name} is caretaking)
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									This user is away and{" "}
									{member.user.caretakers[0].display_first_name}{" "}
									{member.user.caretakers[0].display_last_name} is caretaking
								</p>
							</TooltipContent>
						</Tooltip>
					)}

					<div>
						<TeamRoleBadge role={member.role} isLeader={member.is_leader} />
					</div>
				</div>
			</div>

			{/* Sheet for editing member details */}
			<TeamMemberSheet
				member={member}
				projectId={projectId}
				isOpen={isSheetOpen}
				onClose={() => setIsSheetOpen(false)}
				canManageTeam={canManageTeam}
				projectKind={projectKind}
				allMembers={allMembers}
			/>
		</>
	);
};
