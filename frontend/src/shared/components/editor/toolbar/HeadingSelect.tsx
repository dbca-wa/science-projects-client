/**
 * HeadingSelect Component
 *
 * Dropdown for selecting heading levels (H1, H2, H3, Normal).
 */

import React, { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
	$createHeadingNode,
	$isHeadingNode,
	type HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode, $isParagraphNode } from "lexical";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import type { HeadingSelectProps } from "@/shared/types/editor.types";

type BlockType = "paragraph" | "h1" | "h2" | "h3";

const blockTypeLabels: Record<BlockType, string> = {
	paragraph: "Normal",
	h1: "Heading 1",
	h2: "Heading 2",
	h3: "Heading 3",
};

export const HeadingSelect: React.FC<HeadingSelectProps> = ({
	disabled = false,
	disableHeadings = false,
}) => {
	const [editor] = useLexicalComposerContext();
	const [blockType, setBlockType] = useState<BlockType>("paragraph");

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const anchorNode = selection.anchor.getNode();
			const element =
				anchorNode.getKey() === "root"
					? anchorNode
					: anchorNode.getTopLevelElementOrThrow();

			if ($isHeadingNode(element)) {
				const tag = element.getTag();
				setBlockType(tag as BlockType);
			} else if ($isParagraphNode(element)) {
				setBlockType("paragraph");
			}
		}
	}, []);

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				updateToolbar();
				return false;
			},
			1
		);
	}, [editor, updateToolbar]);

	const formatHeading = (headingType: BlockType) => {
		if (blockType === headingType) return;

		// If headings are disabled and user tries to select a heading, do nothing
		if (disableHeadings && headingType !== "paragraph") {
			return;
		}

		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				if (headingType === "paragraph") {
					$setBlocksType(selection, () => $createParagraphNode());
				} else {
					$setBlocksType(selection, () =>
						$createHeadingNode(headingType as HeadingTagType)
					);
				}
			}
		});
	};

	return (
		<Select
			value={blockType}
			onValueChange={(value) => formatHeading(value as BlockType)}
			disabled={disabled}
		>
			<SelectTrigger className="h-8 w-[130px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="paragraph">{blockTypeLabels.paragraph}</SelectItem>
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
	);
};
