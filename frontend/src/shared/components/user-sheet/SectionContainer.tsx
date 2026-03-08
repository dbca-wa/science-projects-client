/**
 * SectionContainer Component
 *
 * Reusable container for sections in user detail sheets.
 * Provides consistent border, rounded corners, and padding.
 */

import { cn } from "@/shared/lib/utils";

interface SectionContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function SectionContainer({
	children,
	className,
}: SectionContainerProps) {
	return (
		<div
			className={cn(
				"border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2",
				className
			)}
		>
			{children}
		</div>
	);
}
