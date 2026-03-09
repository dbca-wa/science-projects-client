import { useState } from "react";
import { Smile } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import type { ReactionType } from "@/shared/types/comment.types";

interface ReactionPickerProps {
	onReactionSelect: (reactionType: ReactionType) => void;
	currentUserReaction?: ReactionType | null;
	className?: string;
	forceButtonMode?: boolean;
}

/**
 * Emoji mapping for reaction types (5 reactions)
 * Maps backend reaction types to emoji representations
 */
const REACTION_EMOJIS: Record<ReactionType, string> = {
	thumbup: "👍",
	heart: "❤️",
	funny: "😄",
	confused: "😕",
	surprised: "😮",
};

/**
 * Accessible labels for reaction types
 * Used for screen readers and tooltips
 */
const REACTION_LABELS: Record<ReactionType, string> = {
	thumbup: "Thumbs up",
	heart: "Love this",
	funny: "Funny",
	confused: "Confused",
	surprised: "Surprised",
};

/**
 * ReactionPicker Component
 *
 * Displays 5 reaction types with simple hover scale effect.
 * On desktop (md+): Shows inline with CSS hover scale
 * On mobile: Click-to-open popover with smaller emojis
 */
export const ReactionPicker = ({
	onReactionSelect,
	currentUserReaction = null,
	className = "",
	forceButtonMode = false,
}: ReactionPickerProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const { width } = useWindowSize();
	const isMobile = width < BREAKPOINTS.md;

	// Use button mode if mobile screen OR forced by container
	const useButtonMode = isMobile || forceButtonMode;

	const reactions = Object.keys(REACTION_EMOJIS) as ReactionType[];

	// Handle reaction selection
	const handleReactionClick = (reactionType: ReactionType) => {
		onReactionSelect(reactionType);
		if (useButtonMode) {
			setIsOpen(false);
		}
	};

	// Handle keyboard navigation
	const handleKeyDown = (
		event: React.KeyboardEvent,
		reactionType: ReactionType
	) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleReactionClick(reactionType);
		}
	};

	// Render reaction buttons
	const renderReactions = () => (
		<div
			className={`flex gap-1 items-center ${className}`}
			role="group"
			aria-label="Select a reaction"
		>
			{reactions.map((reactionType) => {
				// Disable if user already has a reaction
				const isDisabled = currentUserReaction !== null;

				return (
					<Tooltip key={reactionType} delayDuration={100}>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={() => handleReactionClick(reactionType)}
								onKeyDown={(e) => handleKeyDown(e, reactionType)}
								disabled={isDisabled}
								className={`flex items-center justify-center rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
									useButtonMode ? "w-7 h-7 text-sm" : "w-8 h-8 text-base"
								} ${
									isDisabled
										? "opacity-40 cursor-not-allowed"
										: "hover:bg-muted/50 hover:scale-110 cursor-pointer"
								}`}
								aria-label={REACTION_LABELS[reactionType]}
							>
								{REACTION_EMOJIS[reactionType]}
							</button>
						</TooltipTrigger>
						<TooltipContent side="top" sideOffset={8}>
							<p className="text-xs">
								{isDisabled
									? "Remove your reaction first"
									: REACTION_LABELS[reactionType]}
							</p>
						</TooltipContent>
					</Tooltip>
				);
			})}
		</div>
	);

	// Mobile or narrow container: Popover with button trigger
	if (useButtonMode) {
		return (
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<Tooltip>
					<TooltipTrigger asChild tabIndex={-1}>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
								aria-label="React"
							>
								<Smile className="h-3 w-3" />
							</Button>
						</PopoverTrigger>
					</TooltipTrigger>
					<TooltipContent>
						<p>React</p>
					</TooltipContent>
				</Tooltip>
				<PopoverContent className="w-fit min-w-0 p-2" side="top" align="center">
					{renderReactions()}
				</PopoverContent>
			</Popover>
		);
	}

	// Desktop wide: Inline reactions
	return renderReactions();
};
