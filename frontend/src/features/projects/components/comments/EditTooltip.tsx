import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { formatDetailedDateTime } from "@/shared/utils/date.utils";

interface EditTooltipProps {
	editedAt: string;
}

/**
 * EditTooltip Component
 *
 * Enhanced edit indicator with tooltip showing exact edit time.
 * Displays "(edited)" text with a tooltip on hover showing the full edit timestamp.
 * Uses Australian English date formatting and is keyboard accessible.
 */
export const EditTooltip = ({ editedAt }: EditTooltipProps) => {
	const formattedTime = formatDetailedDateTime(editedAt);

	return (
		<Tooltip delayDuration={200}>
			<TooltipTrigger asChild>
				<span
					className="text-xs text-muted-foreground italic cursor-help"
					tabIndex={0}
					role="button"
					aria-label={`Edited on ${formattedTime}`}
				>
					(edited)
				</span>
			</TooltipTrigger>
			<TooltipContent side="top">
				<p className="text-xs">Edited on {formattedTime}</p>
			</TooltipContent>
		</Tooltip>
	);
};
