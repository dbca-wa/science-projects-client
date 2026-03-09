/**
 * HeadingSelect Component
 *
 * Dropdown for selecting heading levels (H1, H2, H3, Normal).
 * Receives state and actions from parent Toolbar component.
 */

import React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { HeadingSelectProps } from "@/shared/types/editor.types";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const blockTypeLabels: Record<BlockType, string> = {
	paragraph: "Normal",
	h1: "Heading 1",
	h2: "Heading 2",
	h3: "Heading 3",
	h4: "Heading 4",
	h5: "Heading 5",
	h6: "Heading 6",
};

export const HeadingSelect: React.FC<HeadingSelectProps> = ({
	blockType,
	onSetBlockType,
	disabled = false,
	disableHeadings = false,
}) => {
	const handleValueChange = (value: string) => {
		// If headings are disabled and user tries to select a heading, do nothing
		if (disableHeadings && value !== "paragraph") {
			return;
		}
		onSetBlockType(value as BlockType);
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Select
					value={blockType}
					onValueChange={handleValueChange}
					disabled={disabled}
				>
					<SelectTrigger className="h-8 w-[130px]" aria-label="Text style">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="paragraph">
							{blockTypeLabels.paragraph}
						</SelectItem>
						<SelectItem value="h1" disabled={disableHeadings}>
							{blockTypeLabels.h1}
						</SelectItem>
						<SelectItem value="h2" disabled={disableHeadings}>
							{blockTypeLabels.h2}
						</SelectItem>
						<SelectItem value="h3" disabled={disableHeadings}>
							{blockTypeLabels.h3}
						</SelectItem>
					</SelectContent>
				</Select>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p>Text style</p>
			</TooltipContent>
		</Tooltip>
	);
};
