import { cn } from "@/shared/lib/utils";
import type { ProjectKind } from "@/shared/types/project.types";
import { getProjectKindDisplay } from "../utils/project.utils";
import { PROJECT_KIND_COLORS } from "@/shared/constants/project-colors";

interface ProjectKindBadgeProps {
	kind: ProjectKind | string;
	className?: string;
}

/**
 * ProjectKindBadge component displays project kind with color coding
 * - Uses shadcn Badge component
 * - Color-coded based on kind type (matches original SPMS colors)
 * - Handles all project kind types
 */
export function ProjectKindBadge({ kind, className }: ProjectKindBadgeProps) {
	const displayText = getProjectKindDisplay(kind);
	const color = PROJECT_KIND_COLORS[kind as ProjectKind] || PROJECT_KIND_COLORS.science;

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
