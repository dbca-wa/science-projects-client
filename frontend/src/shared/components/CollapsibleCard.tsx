import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/shared/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface CollapsibleCardProps {
	title: string;
	count: number;
	children: React.ReactNode;
	defaultOpen?: boolean;
	actions?: React.ReactNode;
}

/**
 * Collapsible card component matching the pattern used in ProblematicProjectsTab.
 * Uses shadcn Card with chevron toggle, tooltip, and count badge.
 */
export const CollapsibleCard = ({
	title,
	count,
	children,
	defaultOpen = false,
	actions,
}: CollapsibleCardProps) => {
	const [isExpanded, setIsExpanded] = useState(defaultOpen);

	return (
		<Card>
			<CardHeader className="pb-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									onClick={() => setIsExpanded((prev) => !prev)}
									className="flex items-center gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity"
									aria-expanded={isExpanded}
									aria-label={
										isExpanded ? `Collapse ${title}` : `Expand ${title}`
									}
								>
									<span
										className="transition-transform duration-200"
										style={{
											display: "inline-flex",
											transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
										}}
									>
										<ChevronDown className="size-4 text-muted-foreground" />
									</span>
									<CardTitle className="text-base">{title}</CardTitle>
								</button>
							</TooltipTrigger>
							<TooltipContent side="top">
								{isExpanded ? "Collapse section" : "Expand section"}
							</TooltipContent>
						</Tooltip>
						<Badge variant="secondary">{count}</Badge>
					</div>
					{actions && <div className="flex items-center gap-2">{actions}</div>}
				</div>
			</CardHeader>
			{isExpanded && <CardContent className="pt-4">{children}</CardContent>}
		</Card>
	);
};
