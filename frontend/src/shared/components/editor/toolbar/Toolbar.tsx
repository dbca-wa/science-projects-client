/**
 * Toolbar Component
 *
 * Formatting controls for the rich text editor.
 * Supports multiple modes: full, simple, minimal, none.
 * Uses EditorStore for state management.
 */

import React, { useRef } from "react";
import { observer } from "mobx-react";
import { useEditorStore } from "@/app/stores/store-context";
import type { ToolbarProps } from "@/shared/types/editor.types";
import { FormatButton } from "./FormatButton";
import { HeadingSelect } from "./HeadingSelect";
import { UnifiedListButton } from "./UnifiedListButton";
import { LinkButton } from "./LinkButton";
import { SubscriptButton } from "./SubscriptButton";
import { SuperscriptButton } from "./SuperscriptButton";
import { ClearFormattingButton } from "./ClearFormattingButton";
import { UndoRedoButtons } from "./UndoRedoButtons";
import { IndentButton } from "./IndentButton";
import { OutdentButton } from "./OutdentButton";
import { AlignmentButton } from "./AlignmentButton";
import { StrikethroughButton } from "./StrikethroughButton";
import { TableButton } from "./TableButton";
import { ImageButton } from "./ImageButton";
import { ToolbarDarkModeContext } from "./ToolbarContext";

export const Toolbar: React.FC<ToolbarProps> = observer(
	({ mode, disabled = false, editorKey }) => {
		const editorStore = useEditorStore();
		const toolbarRef = useRef<HTMLDivElement>(null);

		if (mode === "none") {
			return null;
		}

		// Only show active formatting states when this toolbar's editor is the active one
		const isActiveEditor =
			!editorKey || editorStore.activeEditorKey === editorKey;

		// Scoped state — only reflects formatting when this editor is active
		const s = isActiveEditor
			? editorStore.state
			: {
					isBold: false,
					isItalic: false,
					isUnderline: false,
					isStrikethrough: false,
					isSubscript: false,
					isSuperscript: false,
					canUndo: false,
					canRedo: false,
					blockType: "paragraph" as const,
					isList: false,
					listType: null as null,
					isLink: false,
					indentLevel: 0,
					maxIndent: 7,
					textAlignment: "left" as const,
				};

		// Arrow key navigation handler
		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
				return;
			}

			e.preventDefault();

			const buttons = toolbarRef.current?.querySelectorAll<HTMLButtonElement>(
				"button:not([disabled])"
			);

			if (!buttons || buttons.length === 0) return;

			const currentIndex = Array.from(buttons).indexOf(
				document.activeElement as HTMLButtonElement
			);

			let nextIndex: number;

			switch (e.key) {
				case "ArrowLeft":
					nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
					break;
				case "ArrowRight":
					nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
					break;
				case "Home":
					nextIndex = 0;
					break;
				case "End":
					nextIndex = buttons.length - 1;
					break;
				default:
					return;
			}

			buttons[nextIndex]?.focus();
		};

		// Define what features are available in each mode
		const isProfileMode = mode === "profile" || mode === "staffProfile";
		const isStaffProfileMode = mode === "staffProfile";
		const isProgressReport = mode === "progressReport";
		const isNewCycle = mode === "newCycle";

		const isBusinessArea = mode === "businessArea";

		const isFullOrGuide = mode === "full" || mode === "guide";

		const showHeadingSelect = isFullOrGuide || mode === "projectTitle";
		const disableHeadings = mode === "projectTitle";
		const showLists =
			isFullOrGuide ||
			mode === "simple" ||
			isProfileMode ||
			isProgressReport ||
			isNewCycle;
		const showLinks = isFullOrGuide || isProfileMode;
		const showBold =
			isFullOrGuide ||
			mode === "simple" ||
			mode === "minimal" ||
			isBusinessArea ||
			isProfileMode ||
			isProgressReport ||
			isNewCycle;
		const showUnderline =
			isFullOrGuide ||
			isProfileMode ||
			isProgressReport ||
			isBusinessArea ||
			isNewCycle;
		const showSubscriptSuperscript =
			isFullOrGuide ||
			isProfileMode ||
			mode === "projectTitle" ||
			isProgressReport ||
			isBusinessArea;
		const showClearFormatting =
			isFullOrGuide ||
			isProfileMode ||
			mode === "projectTitle" ||
			isProgressReport ||
			isBusinessArea;
		const showIndentOutdent = isFullOrGuide;
		const showAlignment = isFullOrGuide;
		const showStrikethrough = false; // Disabled for now
		// const showStrikethrough = isFullOrGuide;
		const showTable = isFullOrGuide;
		const showImage = mode === "guide";

		// Cycle through alignment options
		const cycleAlignment = () => {
			const alignments: Array<"left" | "center" | "right" | "justify"> = [
				"left",
				"center",
				"right",
				"justify",
			];
			const currentIndex = alignments.indexOf(s.textAlignment);
			const nextIndex = (currentIndex + 1) % alignments.length;
			editorStore.setTextAlignment(alignments[nextIndex]);
		};

		return (
			<ToolbarDarkModeContext.Provider value={isStaffProfileMode}>
				<div
					ref={toolbarRef}
					className={`editor-toolbar ${isStaffProfileMode ? "profile-toolbar-dark bg-gray-900 text-white rounded-t-md py-1 px-1 shadow-md" : ""}`}
					role="toolbar"
					aria-label="Text formatting"
					aria-orientation="horizontal"
					onKeyDown={handleKeyDown}
				>
					{/* Undo/Redo buttons - shown in all modes */}
					<div
						className="editor-toolbar-group"
						role="group"
						aria-label="History"
					>
						<UndoRedoButtons
							canUndo={s.canUndo}
							canRedo={s.canRedo}
							onUndo={editorStore.undo}
							onRedo={editorStore.redo}
							disabled={disabled}
						/>
					</div>

					<div className="editor-toolbar-separator" />

					{/* Format buttons */}
					<div
						className="editor-toolbar-group"
						role="group"
						aria-label="Text formatting"
					>
						{showBold && (
							<FormatButton
								format="bold"
								isActive={s.isBold}
								onToggle={() => editorStore.toggleFormat("bold")}
								disabled={disabled}
							/>
						)}
						<FormatButton
							format="italic"
							isActive={s.isItalic}
							onToggle={() => editorStore.toggleFormat("italic")}
							disabled={disabled}
						/>
						{showUnderline && (
							<FormatButton
								format="underline"
								isActive={s.isUnderline}
								onToggle={() => editorStore.toggleFormat("underline")}
								disabled={disabled}
							/>
						)}
						{showStrikethrough && (
							<StrikethroughButton
								isActive={s.isStrikethrough}
								onToggle={() => editorStore.toggleFormat("strikethrough")}
								disabled={disabled}
							/>
						)}

						{/* Subscript/Superscript buttons */}
						{showSubscriptSuperscript && (
							<>
								<SubscriptButton
									isActive={s.isSubscript}
									onToggle={() => editorStore.toggleFormat("subscript")}
									disabled={disabled}
								/>
								<SuperscriptButton
									isActive={s.isSuperscript}
									onToggle={() => editorStore.toggleFormat("superscript")}
									disabled={disabled}
								/>
							</>
						)}

						{/* Clear formatting button */}
						{showClearFormatting && (
							<ClearFormattingButton disabled={disabled} />
						)}

						{/* In profile mode, list + link are in the same group */}
						{isProfileMode && showLists && (
							<UnifiedListButton
								isList={s.isList}
								listType={s.listType}
								onCycleList={editorStore.toggleList}
								disabled={disabled}
							/>
						)}
						{isProfileMode && showLinks && (
							<LinkButton isActive={s.isLink} disabled={disabled} />
						)}
					</div>

					{/* Separator — only for non-profile modes */}
					{!isProfileMode &&
						(showHeadingSelect ||
							showLists ||
							showLinks ||
							showIndentOutdent ||
							showAlignment) && <div className="editor-toolbar-separator" />}

					{/* Heading dropdown - in profile mode, H1/H2/H3 are disabled */}
					{showHeadingSelect && (
						<HeadingSelect
							blockType={s.blockType}
							onSetBlockType={editorStore.setBlockType}
							disabled={disabled}
							disableHeadings={disableHeadings}
						/>
					)}

					{/* List button - unified cycling button */}
					{showLists && !isProfileMode && (
						<UnifiedListButton
							isList={s.isList}
							listType={s.listType}
							onCycleList={editorStore.toggleList}
							disabled={disabled}
						/>
					)}

					{/* Indent/Outdent buttons */}
					{showIndentOutdent && (
						<>
							<OutdentButton
								onOutdent={editorStore.decreaseIndent}
								canOutdent={s.indentLevel > 0}
								disabled={disabled}
							/>
							<IndentButton
								onIndent={editorStore.increaseIndent}
								canIndent={s.indentLevel < s.maxIndent}
								disabled={disabled}
							/>
						</>
					)}

					{/* Alignment button */}
					{showAlignment && (
						<AlignmentButton
							alignment={s.textAlignment}
							onCycleAlignment={cycleAlignment}
							disabled={disabled}
						/>
					)}

					{/* Link and Table buttons */}
					{((showLinks && !isProfileMode) || showTable) && (
						<div className="editor-toolbar-separator" />
					)}

					{showLinks && !isProfileMode && (
						<LinkButton isActive={s.isLink} disabled={disabled} />
					)}

					{showTable && (
						<TableButton
							onInsertTable={editorStore.insertTable}
							disabled={disabled}
						/>
					)}

					{showImage && <ImageButton disabled={disabled} />}
				</div>
			</ToolbarDarkModeContext.Provider>
		);
	}
);
