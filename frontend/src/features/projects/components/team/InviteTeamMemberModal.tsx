/**
 * InviteTeamMemberModal Component
 *
 * Modal for inviting new team members to a project.
 * Matches original implementation from old_spms_frontend.
 * - User search with exclusion of existing members
 * - Role selection based on user's staff status (appears after user selected)
 * - Time allocation slider (FTE 0-1)
 * - Optional short code input
 */

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFullUser } from "@/features/users/services/user.service";

interface InviteTeamMemberModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
	excludeUserIds: number[];
	onInvite?: (data: {
		userId: number;
		role: string;
		timeAllocation: number;
		shortCode: string;
	}) => void;
}

export const InviteTeamMemberModal = ({
	isOpen,
	onClose,
	excludeUserIds,
	onInvite,
}: InviteTeamMemberModalProps) => {
	const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
	const [role, setRole] = useState("");
	const [timeAllocation, setTimeAllocation] = useState(0);
	const [shortCode, setShortCode] = useState("");

	// Fetch full user data when userId changes to get is_staff status
	const { data: selectedUser } = useQuery({
		queryKey: ["users", "detail", selectedUserId],
		queryFn: () => getFullUser(selectedUserId!),
		enabled: !!selectedUserId,
		staleTime: 5 * 60_000, // 5 minutes
	});

	// Reset form when modal closes (using onOpenChange instead of useEffect)
	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// Clear all form state when closing
			setSelectedUserId(null);
			setRole("");
			setTimeAllocation(0);
			setShortCode("");
			onClose();
		}
	};

	// Set default role when user is selected (derived state, no useEffect needed)
	const defaultRole = selectedUser
		? selectedUser.is_staff
			? "technical"
			: "consulted"
		: "";

	// Update role when user changes (only if role is empty or matches previous default)
	const handleUserChange = (userId: number | null) => {
		setSelectedUserId(userId);
		// Reset role when user changes so it gets set to new default
		setRole("");
	};

	const handleInvite = () => {
		if (!selectedUserId || !(role || defaultRole)) return;

		if (onInvite) {
			onInvite({
				userId: selectedUserId,
				role: role || defaultRole,
				timeAllocation,
				shortCode,
			});
		}

		// Clear form and close modal
		setSelectedUserId(null);
		setRole("");
		setTimeAllocation(0);
		setShortCode("");
		onClose();
	};

	// Get available roles based on user's staff status
	const getAvailableRoles = () => {
		if (!selectedUser) return [];

		if (selectedUser.is_staff) {
			return [
				{ value: "technical", label: "Technical Support" },
				{ value: "research", label: "Science Support" },
			];
		} else {
			return [
				{ value: "academicsuper", label: "Academic Supervisor" },
				{ value: "consulted", label: "Consulted Peer" },
				{ value: "externalcol", label: "External Collaborator" },
				{ value: "group", label: "Involved Group" },
				{ value: "student", label: "Supervised Student" },
			];
		}
	};

	// Get human-readable role name
	const getRoleLabel = (roleValue: string) => {
		const roleOption = getAvailableRoles().find((r) => r.value === roleValue);
		return roleOption?.label || "None";
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-3xl min-h-[600px]">
				<DialogHeader>
					<DialogTitle>Add To Project</DialogTitle>
					<DialogDescription>
						Search for a user and assign them a role on this project.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
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
						/>
						<p className="text-sm text-muted-foreground">
							The user you would like to add.
						</p>
					</div>

					{/* Role Selection - Only show after user is selected */}
					{selectedUser && (
						<>
							<div className="space-y-2">
								<Label>
									Project Role{" "}
									{(role || defaultRole) && (
										<span className="text-muted-foreground">
											({getRoleLabel(role || defaultRole)})
										</span>
									)}
								</Label>
								<Select value={role || defaultRole} onValueChange={setRole}>
									<SelectTrigger>
										<SelectValue placeholder="Select a Role for the User" />
									</SelectTrigger>
									<SelectContent>
										{getAvailableRoles().map((roleOption) => (
											<SelectItem
												key={roleOption.value}
												value={roleOption.value}
											>
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
								/>
							</div>
						</>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleInvite}
						disabled={!selectedUser || !(role || defaultRole)}
					>
						Add User
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
