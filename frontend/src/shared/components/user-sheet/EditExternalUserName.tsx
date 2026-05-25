/**
 * EditExternalUserName Component
 *
 * Inline form for staff to edit external user names directly from sheets.
 * Shows when the user is external (is_staff=false) and the current user is staff.
 */

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import type { IUserData } from "@/shared/types/user.types";
import { getUserDisplayName, isValidName } from "@/shared/utils/user.utils";
import { SectionContainer } from "./SectionContainer";

interface EditExternalUserNameProps {
	user: IUserData;
	/** Whether the current user has permission to edit (must be staff) */
	canEdit: boolean;
}

/**
 * Allows staff to set first/last name for external users with missing name data.
 * Setting first_name and last_name also updates display_first_name and display_last_name.
 */
export const EditExternalUserName = ({
	user,
	canEdit,
}: EditExternalUserNameProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [firstName, setFirstName] = useState(
		user.display_first_name || user.first_name || ""
	);
	const [lastName, setLastName] = useState(
		user.display_last_name || user.last_name || ""
	);

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (data: {
			first_name: string;
			last_name: string;
			display_first_name: string;
			display_last_name: string;
		}) => {
			return apiClient.put(`users/${user.id}/name`, data);
		},
		onSuccess: () => {
			toast.success("User name updated");
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });
			setIsEditing(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update name");
		},
	});

	const handleSave = () => {
		const trimmedFirst = firstName.trim();
		const trimmedLast = lastName.trim();

		if (!trimmedFirst && !trimmedLast) {
			toast.error("Please provide at least a first or last name");
			return;
		}

		mutation.mutate({
			first_name: trimmedFirst,
			last_name: trimmedLast,
			display_first_name: trimmedFirst,
			display_last_name: trimmedLast,
		});
	};

	// Only show for external users when staff can edit
	if (!canEdit || user.is_staff) return null;

	// Check if name needs attention (no valid names at all — showing username)
	const currentDisplay = getUserDisplayName(user);
	const nameNeedsAttention =
		currentDisplay === user.username || currentDisplay === "";

	// Check if name is partially set (one name but not both) — still show edit button
	const hasPartialName =
		!nameNeedsAttention &&
		!(
			isValidName(user.display_first_name) &&
			isValidName(user.display_last_name)
		);

	if (!nameNeedsAttention && !hasPartialName && !isEditing) return null;

	return (
		<SectionContainer>
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label className="text-sm font-semibold text-amber-700 dark:text-amber-400">
						{nameNeedsAttention ? "⚠ Name not set" : "Edit Name"}
					</Label>
					{!isEditing && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditing(true)}
							className="h-7 gap-1.5"
						>
							<Pencil className="size-3" />
							Edit
						</Button>
					)}
				</div>

				{nameNeedsAttention && !isEditing && (
					<p className="text-xs text-amber-600 dark:text-amber-400">
						This external user has no name set. Click Edit to add their name.
					</p>
				)}

				{hasPartialName && !isEditing && (
					<p className="text-xs text-muted-foreground">
						Only one name is set. Click Edit to add the other name if needed.
					</p>
				)}

				{isEditing && (
					<div className="space-y-3">
						<div className="space-y-1">
							<Label htmlFor="edit-first-name" className="text-xs">
								First Name
							</Label>
							<Input
								id="edit-first-name"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="First name"
								className="h-8 text-sm"
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="edit-last-name" className="text-xs">
								Last Name
							</Label>
							<Input
								id="edit-last-name"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder="Last name"
								className="h-8 text-sm"
							/>
						</div>
						<p className="text-xs text-muted-foreground">
							For organisations, you can set only a first name or only a last
							name.
						</p>
						<div className="flex gap-2">
							<Button
								size="sm"
								onClick={handleSave}
								disabled={
									mutation.isPending || (!firstName.trim() && !lastName.trim())
								}
								className="gap-1.5"
							>
								<Save className="size-3" />
								Save
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => {
									setIsEditing(false);
									setFirstName(
										user.display_first_name || user.first_name || ""
									);
									setLastName(user.display_last_name || user.last_name || "");
								}}
							>
								<X className="size-3" />
								Cancel
							</Button>
						</div>
					</div>
				)}
			</div>
		</SectionContainer>
	);
};
