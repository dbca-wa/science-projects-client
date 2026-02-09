import type {
	DocumentTasksResponse,
	EndorsementTasksResponse,
} from "../types/dashboard.types";
import type { IAdminTask } from "../types/admin-tasks.types";

export const formatDocumentKind = (kind: string): string => {
	const kindMap: Record<string, string> = {
		concept: "Concept Plan",
		projectplan: "Project Plan",
		progressreport: "Progress Report",
		studentreport: "Student Report",
		projectclosure: "Project Closure",
	};
	return kindMap[kind] || kind;
};

export const formatRoleKind = (
	kind: "team" | "project_lead" | "ba_lead" | "directorate"
): string => {
	const roleMap: Record<string, string> = {
		team: "Team Member",
		project_lead: "Project Lead",
		ba_lead: "Business Area Lead",
		directorate: "Directorate",
	};
	return roleMap[kind] || kind;
};

export const getRoleColor = (
	kind: "team" | "project_lead" | "ba_lead" | "directorate"
): string => {
	const colorMap: Record<string, string> = {
		team: "blue",
		project_lead: "green",
		ba_lead: "orange",
		directorate: "red",
	};
	return colorMap[kind];
};

export const getEndorsementColor = (kind: "aec" | "bm" | "hc"): string => {
	const colorMap: Record<string, string> = {
		aec: "blue",
		bm: "red",
		hc: "green",
	};
	return colorMap[kind];
};

export const calculateDashBadgeCountWithProjects = (
	documentTasks: DocumentTasksResponse | undefined,
	endorsementTasks: EndorsementTasksResponse | undefined
): number => {
	const docCount = documentTasks?.all?.length || 0;
	const aecCount = endorsementTasks?.aec?.length || 0;
	return docCount + aecCount;
};

export const formatActionType = (action: string): string => {
	const actionMap: Record<string, string> = {
		deleteproject: "Delete Project",
		mergeuser: "Merge User",
		setcaretaker: "Set Caretaker",
	};
	return actionMap[action] || action;
};

export const getActionColor = (action: string): string => {
	const colorMap: Record<string, string> = {
		deleteproject: "red",
		mergeuser: "blue",
		setcaretaker: "green",
	};
	return colorMap[action] || "gray";
};

export const filterCaretakerTasks = (tasks: IAdminTask[]): IAdminTask[] => {
	return tasks.filter((task) => task.action === "setcaretaker");
};

export const filterAdminTasks = (tasks: IAdminTask[]): IAdminTask[] => {
	return tasks.filter((task) => task.action !== "setcaretaker");
};

export const calculateDashBadgeCount = (
	adminTasks: IAdminTask[] | undefined
): number => {
	return adminTasks?.length || 0;
};

/**
 * Extract plain text from HTML string
 * Used for project titles that may contain HTML formatting
 */
export const extractTextFromHTML = (htmlString: string | undefined): string => {
	if (!htmlString) return "";
	
	const wrapper = document.createElement("div");
	wrapper.innerHTML = htmlString;
	const tag = wrapper.querySelector("p, span, h1, h2, h3, h4");
	
	if (tag) {
		return tag.textContent || "";
	}
	
	return wrapper.textContent || wrapper.innerHTML || "";
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

/**
 * Format caretaker reason from backend to display text
 * Capitalizes first letter if it's a custom reason
 */
export const formatCaretakerReason = (reason: string | undefined): string => {
	if (!reason) return "";
	
	// Capitalize first letter
	return reason.charAt(0).toUpperCase() + reason.slice(1);
};

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
	
	if (action === "mergeuser" && secondary_users?.[0]) {
		const targetUser = secondary_users[0];
		const baseText = `Merge ${targetUser.display_first_name} ${targetUser.display_last_name} (ID: ${targetUser.id}) into requester's account`;
		
		if (reason) {
			const formattedReason = reason.charAt(0).toUpperCase() + reason.slice(1);
			return `${formattedReason}: ${baseText}`;
		}
		
		return baseText;
	}
	
	if (action === "deleteproject") {
		if (reason) {
			return formatDeletionReason(reason);
		}
		return "Delete project request";
	}
	
	return reason || "No reason provided";
};
