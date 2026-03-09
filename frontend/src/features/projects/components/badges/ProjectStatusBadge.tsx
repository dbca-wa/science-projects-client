import { cn } from "@/shared/lib/utils";
import type { ProjectStatus } from "@/shared/types/project.types";
import { getProjectStatusDisplay } from "../../utils/project.utils";
import { Badge } from "@/shared/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/shared/components/ui/badge";

interface ProjectStatusBadgeProps {
	status: ProjectStatus | string;
	className?: string;
}

/**
 * ProjectStatusBadge component displays project status with colour coding
 * - Uses shadcn Badge component with project status variants
 * - Colour-coded based on status type (matches original SPMS colours)
 * - Handles all project status types
 */
export function ProjectStatusBadge({
	status,
	className,
}: ProjectStatusBadgeProps) {
	const displayText = getProjectStatusDisplay(status);
	const variant = `project_${status}` as VariantProps<
		typeof badgeVariants
	>["variant"];

	return (
		<Badge className={cn(className)} variant={variant}>
			{displayText}
		</Badge>
	);
}
