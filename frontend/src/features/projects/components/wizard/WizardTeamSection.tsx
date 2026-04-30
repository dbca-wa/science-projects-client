/**
 * WizardTeamSection — Team management for the project creation wizard.
 *
 * Allows users to search for and add team members, assign roles,
 * and reorder members via drag-and-drop. The project leader is
 * always pinned at position 0 and cannot be removed.
 *
 * Operates entirely on wizard store state — no API calls are made
 * until the wizard is submitted.
 */

import { useCallback, useRef } from "react";
import { observer } from "mobx-react-lite";
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
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Crown } from "lucide-react";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { UserCombobox } from "@/shared/components/user";
import type { UserComboboxRef } from "@/shared/components/user";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { getUserDisplayName } from "@/shared/utils/user.utils";
import { getImageUrl } from "@/shared/utils/image.utils";
import type { IWizardTeamMember } from "@/app/stores/derived/project-wizard.store";
import { useQuery } from "@tanstack/react-query";
import { getFullUser } from "@/features/users/services/user.service";

/** All role options matching InviteTeamMemberModal */
const ALL_ROLE_OPTIONS = [
	{ value: "supervising", label: "Supervising Scientist" },
	{ value: "research", label: "Research Scientist" },
	{ value: "technical", label: "Technical Officer" },
	{ value: "externalcol", label: "External Collaborator" },
	{ value: "academicsuper", label: "Academic Supervisor" },
	{ value: "consulted", label: "Consulted Peer" },
	{ value: "group", label: "Involved Group" },
] as const;

/** Roles available to internal staff (non-leader): Research Scientist and Technical Officer only */
const INTERNAL_ROLE_VALUES = new Set(["research", "technical"]);

/** Roles available to external users */
const EXTERNAL_ROLE_VALUES = new Set([
	"externalcol",
	"academicsuper",
	"consulted",
	"group",
]);

/**
 * Returns the role options available for a given team member based on
 * their leader status and staff classification.
 */
const getRoleOptionsForMember = (member: IWizardTeamMember) => {
	// Leader is locked to Supervising Scientist
	if (member.isLeader) {
		return ALL_ROLE_OPTIONS.filter((o) => o.value === "supervising");
	}

	const allowedValues = member.isStaff
		? INTERNAL_ROLE_VALUES
		: EXTERNAL_ROLE_VALUES;

	return ALL_ROLE_OPTIONS.filter((o) => allowedValues.has(o.value));
};

// ─── Sortable Team Member Card ───────────────────────────────────────────────

interface SortableWizardMemberCardProps {
	member: IWizardTeamMember;
	onRoleChange: (userId: number, role: string) => void;
	onRemove: (userId: number) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
const SortableWizardMemberCard = ({
	member,
	onRoleChange,
	onRemove,
}: SortableWizardMemberCardProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: member.userId.toString(),
		disabled: member.isLeader,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className={cn(
				"flex items-center gap-3 rounded-md border p-3 bg-background",
				isDragging && "relative z-50 shadow-lg opacity-90",
				member.isLeader &&
					"border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20"
			)}
			role="listitem"
		>
			{/* Drag handle */}
			{!member.isLeader ? (
				<div
					ref={setActivatorNodeRef}
					{...listeners}
					className="cursor-grab active:cursor-grabbing flex-shrink-0"
					aria-label={`Drag to reorder ${member.displayName}`}
					role="button"
					tabIndex={0}
				>
					<GripVertical className="h-4 w-4 text-muted-foreground" />
				</div>
			) : (
				<div className="flex-shrink-0 w-4" aria-hidden="true" />
			)}

			{/* Name + leader badge */}
			<div className="flex items-center gap-2 min-w-0 flex-1">
				<ResolvedDisplayName member={member} />
				{member.isLeader && (
					<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 flex-shrink-0">
						<Crown className="h-3 w-3" />
						Leader
					</span>
				)}
			</div>

			{/* Role dropdown — locked for leader, filtered by staff status */}
			{(() => {
				const roleOptions = getRoleOptionsForMember(member);
				return (
					<Select
						value={member.role}
						onValueChange={(value) => onRoleChange(member.userId, value)}
						disabled={member.isLeader}
					>
						<SelectTrigger className="w-[180px] flex-shrink-0 text-sm">
							<SelectValue placeholder="Select role" />
						</SelectTrigger>
						<SelectContent>
							{roleOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			})()}

			{/* Remove button (not shown for leader) */}
			{!member.isLeader ? (
				<Button
					variant="ghost"
					size="sm"
					className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
					onClick={() => onRemove(member.userId)}
					aria-label={`Remove ${member.displayName} from team`}
				>
					<X className="h-4 w-4" />
				</Button>
			) : (
				<div className="w-8 flex-shrink-0" aria-hidden="true" />
			)}
		</div>
	);
};

// ─── Resolved Display Name ───────────────────────────────────────────────────

/**
 * Resolves and displays the actual user name and avatar for a wizard team member.
 * Falls back to the cached displayName and initials while loading.
 */
// eslint-disable-next-line react-refresh/only-export-components
const ResolvedDisplayName = ({ member }: { member: IWizardTeamMember }) => {
	const { data: user } = useQuery({
		queryKey: ["users", "detail", member.userId],
		queryFn: () => getFullUser(member.userId),
		enabled: !!member.userId,
		staleTime: 5 * 60_000,
	});

	const name = user ? getUserDisplayName(user) : member.displayName;
	const avatarUrl = user?.image ? getImageUrl(user.image) : null;
	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="flex items-center gap-2 min-w-0">
			{avatarUrl ? (
				<img
					src={avatarUrl}
					alt={name}
					width={28}
					height={28}
					className="size-7 rounded-full object-cover flex-shrink-0"
				/>
			) : (
				<div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
					{initials}
				</div>
			)}
			<span className="text-sm font-medium truncate">{name}</span>
		</div>
	);
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const WizardTeamSection = observer(function WizardTeamSection() {
	const wizardStore = useProjectWizardStore();
	const teamMembers = wizardStore.state.teamMembers;
	const comboboxRef = useRef<UserComboboxRef>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// User IDs already in the team — exclude from search
	const excludeUserIds = teamMembers.map((tm) => tm.userId);

	/**
	 * When a user is selected from the combobox, fetch their full data
	 * and add them to the team with a default role.
	 */
	const handleUserSelected = useCallback(
		async (userId: number | null) => {
			if (!userId) return;

			try {
				const user = await getFullUser(userId);
				const displayName = getUserDisplayName(user);
				const isStaff = !!user.is_staff;
				const defaultRole = isStaff ? "technical" : "consulted";

				wizardStore.addTeamMember({
					userId: user.id,
					role: defaultRole,
					isLeader: false,
					displayName,
					position: teamMembers.length,
					isStaff,
					timeAllocation: isStaff ? 1.0 : 0.0,
				});
			} catch {
				// If user fetch fails, add with minimal info (assume external)
				wizardStore.addTeamMember({
					userId,
					role: "consulted",
					isLeader: false,
					displayName: `User ${userId}`,
					position: teamMembers.length,
					isStaff: false,
					timeAllocation: 0.0,
				});
			}

			// Clear the combobox selection after adding
			comboboxRef.current?.clearSelection();
		},
		[wizardStore, teamMembers.length]
	);

	const handleRoleChange = useCallback(
		(userId: number, role: string) => {
			wizardStore.updateTeamMemberRole(userId, role);
		},
		[wizardStore]
	);

	const handleRemove = useCallback(
		(userId: number) => {
			wizardStore.removeTeamMember(userId);
		},
		[wizardStore]
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;

			const oldIndex = teamMembers.findIndex(
				(tm) => tm.userId.toString() === active.id
			);
			const newIndex = teamMembers.findIndex(
				(tm) => tm.userId.toString() === over.id
			);

			if (oldIndex === -1 || newIndex === -1) return;

			wizardStore.reorderTeamMembers(oldIndex, newIndex);
		},
		[wizardStore, teamMembers]
	);

	return (
		<div className="space-y-4">
			{/* User search and add */}
			<UserCombobox
				ref={comboboxRef}
				value={null}
				onValueChange={handleUserSelected}
				placeholder="Search for a team member to add..."
				ariaLabel="Search for a team member"
				excludeUserIds={excludeUserIds}
				onlyInternal={false}
				maxResults={5}
			/>

			{/* Team member list with drag-and-drop */}
			{teamMembers.length > 0 && (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={teamMembers.map((tm) => tm.userId.toString())}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-2" role="list" aria-label="Team members">
							{teamMembers.map((member) => (
								<SortableWizardMemberCard
									key={member.userId}
									member={member}
									onRoleChange={handleRoleChange}
									onRemove={handleRemove}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>
			)}

			{teamMembers.length === 0 && (
				<p className="text-sm text-muted-foreground italic">
					No team members added yet. Use the search above to add members.
				</p>
			)}
		</div>
	);
});
