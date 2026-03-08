import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/shared/components/ui/badge";

interface TeamRoleBadgeProps {
	role: string;
	isLeader?: boolean;
	className?: string;
}

// Role display names mapping
const ROLE_LABELS: Record<string, string> = {
	research: "Science Support",
	supervising: "Project Leader",
	academicsuper: "Academic Supervisor",
	student: "Supervised Student",
	technical: "Technical Support",
	consulted: "Consulted Peer",
	externalcol: "External Collaborator",
	externalpeer: "External Peer",
	group: "Involved Group",
};

/**
 * TeamRoleBadge component displays team member role with colour coding
 * - Uses shadcn Badge component with team role variants
 * - Colour-coded based on role type (matches original SPMS colours)
 * - Handles all team role types
 * - Shows "Project Leader" badge when isLeader is true, regardless of role
 */
export function TeamRoleBadge({
	role,
	isLeader = false,
	className,
}: TeamRoleBadgeProps) {
	// If user is leader, always show "Project Leader" with supervising variant
	const displayText = isLeader ? "Project Leader" : ROLE_LABELS[role] || role;
	const badgeRole = isLeader ? "supervising" : role;
	const variant = `role_${badgeRole}` as VariantProps<
		typeof badgeVariants
	>["variant"];

	return (
		<Badge className={cn("justify-center", className)} variant={variant}>
			{displayText}
		</Badge>
	);
}
