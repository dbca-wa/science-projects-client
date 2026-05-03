/**
 * UserTypeBadge — Displays a user's type/role as a coloured badge.
 *
 * Hierarchy: Admin > Key Stakeholder > Approver > BA Lead > Staff > External
 *
 * Reusable across the users list, project wizard team section, and anywhere
 * else a user's type needs to be displayed.
 */

import { cn } from "@/shared/lib/utils";
import type { UserTypeVariant } from "./user-type.utils";

interface UserTypeBadgeProps {
	variant: UserTypeVariant;
	className?: string;
}

const VARIANT_CONFIG: Record<
	UserTypeVariant,
	{ label: string; classes: string }
> = {
	admin: {
		label: "Admin",
		classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
	},
	key_stakeholder: {
		label: "Key Stakeholder",
		classes:
			"bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
	},
	approver: {
		label: "Approver",
		classes:
			"bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
	},
	ba_lead: {
		label: "BA Lead",
		classes:
			"bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
	},
	staff: {
		label: "Staff",
		classes:
			"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
	},
	external: {
		label: "External",
		classes: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
	},
};

export const UserTypeBadge = ({ variant, className }: UserTypeBadgeProps) => {
	const config = VARIANT_CONFIG[variant];
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
				config.classes,
				className
			)}
		>
			{config.label}
		</span>
	);
};
