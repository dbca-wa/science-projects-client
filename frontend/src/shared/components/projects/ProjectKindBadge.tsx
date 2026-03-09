import { cn } from "@/shared/lib/utils";
import type { ProjectKind } from "@/shared/types/project.types";
import { getProjectKindDisplay } from "@/shared/utils/project.utils";
import { Badge } from "@/shared/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/shared/components/ui/badge";

interface ProjectKindBadgeProps {
	kind: ProjectKind | string;
	className?: string;
}

/**
 * ProjectKindBadge component displays project kind with colour coding
 * - Uses shadcn Badge component with project kind variants
 * - Colour-coded based on kind type (matches original SPMS colours)
 * - Handles all project kind types
 */
export function ProjectKindBadge({ kind, className }: ProjectKindBadgeProps) {
	const displayText = getProjectKindDisplay(kind);
	const variant = `kind_${kind}` as VariantProps<
		typeof badgeVariants
	>["variant"];

	return (
		<Badge className={cn(className)} variant={variant}>
			{displayText}
		</Badge>
	);
}
