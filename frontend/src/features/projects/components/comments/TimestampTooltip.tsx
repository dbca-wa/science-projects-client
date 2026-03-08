import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { formatDetailedDateTime } from "@/shared/utils/date.utils";

interface TimestampTooltipProps {
	timestamp: string;
	children: React.ReactNode;
}

/**
 * TimestampTooltip Component
 *
 * Wraps a timestamp display with a tooltip showing the exact date and time.
 * Used for "2 minutes ago" style timestamps to show the full datetime on hover.
 * Uses Australian English date formatting and is keyboard accessible.
 */
export const TimestampTooltip = ({
	timestamp,
	children,
}: TimestampTooltipProps) => {
	const formattedTime = formatDetailedDateTime(timestamp);

	return (
		<Tooltip delayDuration={200}>
			<TooltipTrigger asChild>
				<span
					className="text-xs text-muted-foreground cursor-help"
					tabIndex={0}
					role="button"
					aria-label={`Posted on ${formattedTime}`}
				>
					{children}
				</span>
			</TooltipTrigger>
			<TooltipContent side="top">
				<p className="text-xs">Posted on {formattedTime}</p>
			</TooltipContent>
		</Tooltip>
	);
};
