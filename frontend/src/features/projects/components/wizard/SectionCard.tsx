import { Check } from "lucide-react";

interface SectionCardProps {
	title: string;
	children: React.ReactNode;
	isComplete: boolean;
	/** Accessible label for the completion indicator, e.g. "Image section complete" */
	completionLabel?: string;
}

/**
 * SectionCard — Groups related form fields with a card container
 * and an animated completion indicator.
 *
 * When all required fields within the section are valid, the card
 * shows a subtle green background tint and an animated tick icon.
 */
export const SectionCard = ({
	title,
	children,
	isComplete,
	completionLabel,
}: SectionCardProps) => {
	return (
		<div
			className={`rounded-lg border shadow-sm p-6 transition-colors ${
				isComplete ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
			}`}
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-base font-semibold">{title}</h3>
				{isComplete && (
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
