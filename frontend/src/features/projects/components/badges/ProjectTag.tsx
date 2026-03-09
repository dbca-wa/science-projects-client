import { Badge } from "@/shared/components/ui/badge";
import { formatProjectTag } from "@/shared/utils/project-tag.utils";
import type { IProjectData } from "@/shared/types/project.types";
import { cn } from "@/shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/shared/components/ui/badge";

interface ProjectTagProps {
	project: IProjectData;
	className?: string;
}

/**
 * ProjectTag component
 *
 * Displays a formatted project tag badge with colour coding based on project kind.
 * Uses shadcn Badge component with project kind variants.
 *
 * Colour scheme:
 * - Science (SP): Blue (#2A6096)
 * - Core Function (CF): Teal/Cyan (#01A7B2)
 * - Student (STP): Yellow/Gold (#FFC530)
 * - External (EXT): Dark Green (#1E5456)
 */
export function ProjectTag({ project, className }: ProjectTagProps) {
	const tag = formatProjectTag(project);
	const variant = `kind_${project.kind}` as VariantProps<
		typeof badgeVariants
	>["variant"];

	return (
		<Badge
			variant={variant}
			className={cn("font-semibold", "text-[16px]", className)}
		>
			{tag}
		</Badge>
	);
}
