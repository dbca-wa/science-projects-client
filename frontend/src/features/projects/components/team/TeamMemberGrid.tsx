/**
 * TeamMemberGrid Component
 *
 * Responsive grid layout for displaying team members.
 * Supports two modes: static grid (no permissions) and draggable grid (with permissions).
 *
 * CRITICAL: Leader must ALWAYS be at position 0 (top of list).
 * No other member can be dragged above the leader.
 */

import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TeamMemberCard } from "./TeamMemberCard";
import { SortableTeamMemberCard } from "./SortableTeamMemberCard";
import { useUpdateTeamPositions } from "../../hooks/useUpdateTeamPositions";
import type { IProjectMember } from "@/shared/types/project.types";

interface TeamMemberGridProps {
	members: IProjectMember[];
	projectId: number;
	canManageTeam: boolean;
}

export function TeamMemberGrid({
	members,
	projectId,
	canManageTeam,
}: TeamMemberGridProps) {
	const { mutate: updatePositions } = useUpdateTeamPositions(projectId);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Sort members: leader first, then by position
	const sortedMembers = [...members].sort((a, b) => {
		// Leader always at position 0
		if (a.is_leader) return -1;
		if (b.is_leader) return 1;
		// Otherwise sort by position
		return a.position - b.position;
	});

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const oldIndex = sortedMembers.findIndex(
			(m) => m.id.toString() === active.id
		);
		const newIndex = sortedMembers.findIndex(
			(m) => m.id.toString() === over.id
		);

		if (oldIndex === -1 || newIndex === -1) {
			return;
		}

		const draggedMember = sortedMembers[oldIndex];

		// CRITICAL: Prevent dragging above the leader
		// If trying to drag to position 0 and dragged member is not the leader, block it
		if (newIndex === 0 && !draggedMember.is_leader) {
			return; // Block the drag operation
		}

		// CRITICAL: Prevent dragging the leader away from position 0
		// Leader must always stay at position 0
		if (draggedMember.is_leader && newIndex !== 0) {
			return; // Block the drag operation
		}

		// Create new array with reordered items
		const reorderedMembers = [...sortedMembers];
		const [movedMember] = reorderedMembers.splice(oldIndex, 1);
		reorderedMembers.splice(newIndex, 0, movedMember);

		// Calculate new positions (1-indexed)
		// Leader always gets position 1, others get sequential positions
		const updatedPositions = reorderedMembers.map((member, index) => ({
			id: member.id,
			position: member.is_leader ? 1 : index + 1,
		}));

		// Update positions with optimistic update
		updatePositions({ members: updatedPositions });
	};

	// Static grid without drag-and-drop
	if (!canManageTeam) {
		return (
			<div className="space-y-2">
				{sortedMembers.map((member) => (
					<TeamMemberCard
						key={member.id}
						member={member}
						projectId={projectId}
						canManageTeam={false}
					/>
				))}
			</div>
		);
	}

	// Grid with drag-and-drop (vertical list)
	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={sortedMembers.map((tm) => tm.id.toString())}
				strategy={verticalListSortingStrategy}
			>
				<div className="space-y-2">
					{sortedMembers.map((member) => (
						<SortableTeamMemberCard
							key={member.id}
							member={member}
							projectId={projectId}
							canManageTeam={true}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
