import { cn } from "@/shared/lib/utils";

interface ProjectSectionProps {
	children: React.ReactNode;
	className?: string;
	title?: string;
	id?: string;
}

/**
 * ProjectSection component
 *
 * Reusable container with subtle curved background for project detail sections.
 * Provides consistent styling across Overview tab and other document tabs.
 *
 * Styling:
 * - Light mode: #EBF0F6 background
 * - Dark mode: gray.800 background
 * - Rounded corners (lg)
 * - Minimum height for visual consistency
 * - Optional title prop for sections that need a heading
 */
export function ProjectSection({
	children,
	className,
	title,
	id,
}: ProjectSectionProps) {
	return (
		<div
			id={id}
			className={cn(
				"min-h-[100px] rounded-lg bg-[#EBF0F6] dark:bg-gray-800",
				className
			)}
		>
			<div className="p-6 space-y-4">
				{title && <h3 className="text-lg font-semibold">{title}</h3>}
				{children}
			</div>
		</div>
	);
}
