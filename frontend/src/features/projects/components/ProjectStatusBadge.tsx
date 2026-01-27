import { cn } from "@/shared/lib/utils";
import type { ProjectStatus } from "@/shared/types/project.types";
import { getProjectStatusDisplay } from "../utils/project.utils";
import { PROJECT_STATUS_COLORS } from "@/shared/constants/project-colors";

interface ProjectStatusBadgeProps {
	status: ProjectStatus | string;
	className?: string;
}

/**
 * ProjectStatusBadge component displays project status with color coding
 * - Uses shadcn Badge component
 * - Color-coded based on status type (matches original SPMS colors)
 * - Handles all project status types
 */
export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
	const displayText = getProjectStatusDisplay(status);
	const color = PROJECT_STATUS_COLORS[status as ProjectStatus] || PROJECT_STATUS_COLORS.new;

	return (
		<span
			className={cn(
				"inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium text-white",
				className
			)}
			style={{ backgroundColor: color }}
		>
			{displayText}
		</span>
	);
}
