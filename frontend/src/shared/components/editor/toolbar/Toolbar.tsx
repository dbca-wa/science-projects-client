/**
 * Toolbar Component
 *
 * Formatting controls for the rich text editor.
 * Supports multiple modes: full, simple, minimal, none.
 */

import React from "react";
import type { ToolbarProps } from "@/shared/types/editor.types";
import { FormatButton } from "./FormatButton";
import { HeadingSelect } from "./HeadingSelect";
import { ListButton } from "./ListButton";
import { LinkButton } from "./LinkButton";
import { SubscriptButton } from "./SubscriptButton";
import { SuperscriptButton } from "./SuperscriptButton";
import { ClearFormattingButton } from "./ClearFormattingButton";
import { UndoRedoButtons } from "./UndoRedoButtons";

export const Toolbar: React.FC<ToolbarProps> = ({ mode, disabled = false }) => {
	if (mode === "none") {
		return null;
	}

	// Define what features are available in each mode
	const showHeadingSelect = mode === "full" || mode === "profile";
	const disableHeadings = mode === "profile"; // Profile mode: heading dropdown visible but H1/H2/H3 disabled
	const showLists = mode === "full" || mode === "simple" || mode === "profile";
	const showLinks = mode === "full" || mode === "profile";
	const showUnderline = mode === "full" || mode === "profile";
	const showSubscriptSuperscript = mode === "full" || mode === "profile";
	const showClearFormatting = mode === "full" || mode === "profile";

	return (
		<div className="editor-toolbar">
			{/* Undo/Redo buttons - shown in all modes */}
			<UndoRedoButtons disabled={disabled} />

			<div className="editor-toolbar-separator" />

			{/* Format buttons */}
			<FormatButton format="bold" disabled={disabled} />
			<FormatButton format="italic" disabled={disabled} />
			{showUnderline && <FormatButton format="underline" disabled={disabled} />}

			{/* Subscript/Superscript buttons */}
			{showSubscriptSuperscript && (
				<>
					<SubscriptButton disabled={disabled} />
					<SuperscriptButton disabled={disabled} />
				</>
			)}

			{/* Clear formatting button */}
			{showClearFormatting && <ClearFormattingButton disabled={disabled} />}

			{/* Separator */}
			{(showHeadingSelect || showLists || showLinks) && (
				<div className="editor-toolbar-separator" />
			)}

			{/* Heading dropdown - in profile mode, H1/H2/H3 are disabled */}
			{showHeadingSelect && (
				<HeadingSelect disabled={disabled} disableHeadings={disableHeadings} />
			)}

			{/* List buttons */}
			{showLists && (
				<>
					<ListButton listType="bullet" disabled={disabled} />
					<ListButton listType="number" disabled={disabled} />
				</>
			)}

			{/* Link button */}
			{showLinks && (
				<>
					<div className="editor-toolbar-separator" />
					<LinkButton disabled={disabled} />
				</>
			)}
		</div>
	);
};
