import { Check, X } from "lucide-react";

interface SectionCardProps {
	title: string;
	children: React.ReactNode;
	isComplete: boolean;
	/** Whether this section has validation errors (was complete but now invalid) */
	isInvalid?: boolean;
	/** Accessible label for the completion indicator */
	completionLabel?: string;
}

/**
 * SectionCard — Groups related form fields with a card container
 * and an animated completion/invalid indicator.
 *
 * States:
 * - Complete: subtle green background + green tick
 * - Invalid: subtle orange background + red cross
 * - Default: no background tint
 */
export const SectionCard = ({
	title,
	children,
	isComplete,
	isInvalid = false,
	completionLabel,
}: SectionCardProps) => {
	return (
		<div
			className={`rounded-lg border shadow-sm p-6 transition-colors ${
				isInvalid
					? "bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-700"
					: isComplete
						? "bg-emerald-50/50 dark:bg-emerald-950/20"
						: ""
			}`}
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-base font-semibold">{title}</h3>
				{isInvalid && (
					<div
						className="animate-in zoom-in-50 fade-in duration-300 flex items-center justify-center h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/40"
						aria-label={`${title} section has errors`}
					>
						<X className="h-4 w-4 text-red-600 dark:text-red-400" />
					</div>
				)}
				{isComplete && !isInvalid && (
					<div
						className="animate-in zoom-in-50 fade-in duration-300 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40"
						aria-label={completionLabel ?? `${title} section complete`}
					>
						<Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
					</div>
				)}
			</div>
			{children}
		</div>
	);
};
