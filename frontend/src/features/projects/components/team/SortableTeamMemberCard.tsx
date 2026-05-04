/**
 * SortableTeamMemberCard Component
 *
 * Wrapper component that adds drag-and-drop functionality to TeamMemberCard.
 * Uses @dnd-kit/sortable for sortable behaviour with keyboard accessibility.
 * The entire card is draggable except for the name button.
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { TeamMemberCard } from "./TeamMemberCard";
import type { IProjectMember } from "@/shared/types/project.types";
import { cn } from "@/shared/lib/utils";

interface SortableTeamMemberCardProps {
	member: IProjectMember;
	projectId: number;
	canManageTeam: boolean;
	projectKind?: string;
	allMembers?: IProjectMember[];
}

export function SortableTeamMemberCard({
	member,
	projectId,
	canManageTeam,
	projectKind,
	allMembers,
}: SortableTeamMemberCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		setActivatorNodeRef,
	} = useSortable({
		id: member.id.toString(),
		disabled: !canManageTeam,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const displayName =
		member.user.display_first_name && member.user.display_last_name
			? `${member.user.display_first_name} ${member.user.display_last_name}`
			: member.user.username || "Unknown User";

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className={cn(isDragging && "relative z-50")}
		>
			<div className="relative">
				{/* Drag handle - entire card except name button */}
				{canManageTeam && (
					<div
						ref={setActivatorNodeRef}
						{...listeners}
						className="absolute inset-0 cursor-grab active:cursor-grabbing z-[5]"
						aria-label={`Drag to reorder ${displayName}`}
						role="button"
						tabIndex={0}
					/>
				)}

				{/* Grip icon - visual indicator only, centered vertically */}
				{canManageTeam && (
					<div
						className="absolute top-1/2 -translate-y-1/2 right-2 z-10 pointer-events-none"
						aria-hidden="true"
					>
						<GripVertical
							className={cn(
								"h-5 w-5",
								isDragging ? "text-white" : "text-muted-foreground"
							)}
						/>
					</div>
				)}

				<TeamMemberCard
					member={member}
					projectId={projectId}
					canManageTeam={canManageTeam}
					isDragging={isDragging}
					projectKind={projectKind}
					allMembers={allMembers}
				/>
			</div>
		</div>
	);
}
