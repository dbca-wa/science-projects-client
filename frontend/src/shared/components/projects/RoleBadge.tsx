import type { ProjectRoles } from "@/shared/types/project.types";
import { PROJECT_ROLE_CONFIG } from "@/shared/constants/project.constants";

/**
 * RoleBadge — Displays a project role as a subtle coloured badge.
 * Used in ProjectsDataTable and UserDetailSheet.
 */
export const RoleBadge = ({ role }: { role: ProjectRoles }) => {
	const config = PROJECT_ROLE_CONFIG[role];

	return (
		<span
			className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap shadow-sm"
			style={{
				color: config.color,
				backgroundColor: `${config.color}20`,
				border: `1.5px solid ${config.color}50`,
			}}
		>
			{config.label}
		</span>
	);
};
