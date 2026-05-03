/**
 * InviteMemberForm Component
 *
 * Form for selecting a user and configuring their role, time allocation,
 * and short code before adding them to the pending invite list.
 * Replicates the field logic from the former InviteTeamMemberModal.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { UserCombobox } from "@/shared/components/user";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Slider } from "@/shared/components/ui/slider";
import { getFullUser } from "@/features/users/services/user.service";
import type { IPendingInvite } from "../../types/team.types";

interface InviteMemberFormProps {
	excludeUserIds: number[];
	onAdd: (invite: IPendingInvite) => void;
	disabled?: boolean;
}

/** Role options for staff users */
const STAFF_ROLES = [
	{ value: "technical", label: "Technical Support" },
	{ value: "research", label: "Science Support" },
] as const;

/** Role options for external (non-staff) users */
const EXTERNAL_ROLES = [
	{ value: "academicsuper", label: "Academic Supervisor" },
	{ value: "consulted", label: "Consulted Peer" },
	{ value: "externalcol", label: "External Collaborator" },
	{ value: "group", label: "Involved Group" },
	{ value: "student", label: "Supervised Student" },
] as const;

type RoleOption = { value: string; label: string };

const getAvailableRoles = (isStaff: boolean): readonly RoleOption[] => {
	return isStaff ? STAFF_ROLES : EXTERNAL_ROLES;
};

const getDefaultRole = (isStaff: boolean): string => {
	return isStaff ? "technical" : "consulted";
};

const getRoleLabel = (roleValue: string, isStaff: boolean): string => {
	const roles = getAvailableRoles(isStaff);
	return roles.find((r) => r.value === roleValue)?.label ?? "None";
};

export const InviteMemberForm = ({
	excludeUserIds,
	onAdd,
	disabled = false,
}: InviteMemberFormProps) => {
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
	const [role, setRole] = useState("");
	const [timeAllocation, setTimeAllocation] = useState(0);
	const [shortCode, setShortCode] = useState("");

	// Fetch full user data to determine is_staff for role options
	const { data: selectedUser } = useQuery({
		queryKey: ["users", "detail", selectedUserId],
		queryFn: () => getFullUser(selectedUserId!),
		enabled: !!selectedUserId,
		staleTime: 5 * 60_000,
	});

	const defaultRole = selectedUser ? getDefaultRole(selectedUser.is_staff) : "";

	const effectiveRole = role || defaultRole;

	const handleUserChange = (userId: number | null) => {
		setSelectedUserId(userId);
		setRole("");
	};

	const handleAdd = () => {
		if (!selectedUser || !effectiveRole) return;

		const invite: IPendingInvite = {
			id: crypto.randomUUID(),
			user: {
				id: selectedUser.id,
				display_first_name: selectedUser.display_first_name ?? "",
				display_last_name: selectedUser.display_last_name ?? "",
				is_staff: selectedUser.is_staff,
				is_superuser: selectedUser.is_superuser,
				image: selectedUser.image,
			},
			role: effectiveRole,
			roleLabel: getRoleLabel(effectiveRole, selectedUser.is_staff),
			timeAllocation,
			shortCode,
		};

		onAdd(invite);

		// Reset form for next user
		setSelectedUserId(null);
		setRole("");
		setTimeAllocation(0);
		setShortCode("");
	};

	const canAdd = !!selectedUser && !!effectiveRole && !disabled;

	return (
		<div className="space-y-4">
			{/* User Search */}
			<div className="space-y-2">
				<Label>User</Label>
				<UserCombobox
					value={selectedUserId}
					onValueChange={handleUserChange}
					placeholder="Search for a user..."
					ariaLabel="Select user to add to project"
					excludeUserIds={excludeUserIds}
					onlyInternal={false}
					maxResults={5}
					disabled={disabled}
				/>
				<p className="text-sm text-muted-foreground">
					The user you would like to add.
				</p>
			</div>

			{/* Role Selection — only shown after user is selected */}
			{selectedUser && (
				<>
					<div className="space-y-2">
						<Label>
							Project Role{" "}
							{effectiveRole && (
								<span className="text-muted-foreground">
									({getRoleLabel(effectiveRole, selectedUser.is_staff)})
								</span>
							)}
						</Label>
						<Select
							value={effectiveRole}
							onValueChange={setRole}
							disabled={disabled}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a Role for the User" />
							</SelectTrigger>
							<SelectContent>
								{getAvailableRoles(selectedUser.is_staff).map((roleOption) => (
									<SelectItem key={roleOption.value} value={roleOption.value}>
										{roleOption.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-sm text-muted-foreground">
							The role this team member fills within this project.
						</p>
					</div>

					{/* Time Allocation */}
					<div className="space-y-2">
						<Label>Time Allocation ({timeAllocation} FTE)</Label>
						<Slider
							value={[timeAllocation]}
							onValueChange={(values) => setTimeAllocation(values[0])}
							min={0}
							max={1}
							step={0.1}
							className="py-4"
							disabled={disabled}
						/>
					</div>

					{/* Short Code */}
					<div className="space-y-2">
						<Label>Short Code</Label>
						<Input
							type="number"
							value={shortCode}
							onChange={(e) => setShortCode(e.target.value)}
							placeholder="Optional"
							disabled={disabled}
						/>
					</div>
				</>
			)}

			{/* Add Button */}
			<Button
				onClick={handleAdd}
				disabled={!canAdd}
				variant="secondary"
				className="gap-2"
			>
				<UserPlus className="h-4 w-4" />
				Add to List
			</Button>
		</div>
	);
};
