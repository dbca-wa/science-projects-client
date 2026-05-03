import type { IAdminTask } from "../types/admin-tasks.types";

export const filterCaretakerTasks = (tasks: IAdminTask[]): IAdminTask[] => {
	return tasks.filter((task) => task.action === "setcaretaker");
};

/**
 * Format project deletion reason from backend choice value to display text
 */
export const formatDeletionReason = (reason: string | undefined): string => {
	if (!reason) return "";

	const reasonMap: Record<string, string> = {
		duplicate: "Duplicate project",
		mistake: "Made by mistake",
		other: "Other",
	};

	// If it's a known choice, return the formatted version
	if (reasonMap[reason.toLowerCase()]) {
		return reasonMap[reason.toLowerCase()];
	}

	// Otherwise, capitalize first letter and return
	return reason.charAt(0).toUpperCase() + reason.slice(1);
};

// Re-export from shared for backward compatibility
export { formatCaretakerReason } from "@/shared/utils/caretaker.utils";
import { formatCaretakerReason } from "@/shared/utils/caretaker.utils";

/**
 * Build detailed description for admin task based on action type
 */
export const buildAdminTaskDetails = (task: IAdminTask): string => {
	const { action, reason, primary_user, secondary_users } = task;

	if (action === "setcaretaker" && primary_user && secondary_users?.[0]) {
		const caretaker = secondary_users[0];
		const baseText = `Set ${caretaker.display_first_name} ${caretaker.display_last_name} as caretaker for ${primary_user.display_first_name} ${primary_user.display_last_name}`;

		if (reason) {
			const formattedReason = formatCaretakerReason(reason);
			return `${formattedReason}: ${baseText}`;
		}

		return baseText;
	}

	if (action === "mergeuser" && secondary_users?.[0] && primary_user) {
		const targetUser = secondary_users[0];
		return `Merge ${targetUser.display_first_name} ${targetUser.display_last_name} into ${primary_user.display_first_name} ${primary_user.display_last_name}`;
	}

	if (action === "mergeuser" && secondary_users?.[0]) {
		const targetUser = secondary_users[0];
		return `Merge ${targetUser.display_first_name} ${targetUser.display_last_name} (ID: ${targetUser.id}) into requester's account`;
	}

	if (action === "deleteproject") {
		if (reason) {
			return formatDeletionReason(reason);
		}
		return "Delete project request";
	}

	return reason || "No reason provided";
};
