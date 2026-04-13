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
import { ToolbarDarkModeContext } from "./ToolbarContext";

export const Toolbar: React.FC<ToolbarProps> = observer(
	({ mode, disabled = false }) => {
		const editorStore = useEditorStore();
		const toolbarRef = useRef<HTMLDivElement>(null);

		if (mode === "none") {
			return null;
		}

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

		const showHeadingSelect = mode === "full" || mode === "projectTitle";
		const disableHeadings = mode === "projectTitle";
		const showLists =
			mode === "full" || mode === "simple" || isProfileMode || isProgressReport;
		const showLinks = mode === "full" || isProfileMode;
		const showBold =
			mode === "full" ||
			mode === "simple" ||
			mode === "minimal" ||
			isProfileMode ||
			isProgressReport;
		const showUnderline = mode === "full" || isProfileMode || isProgressReport;
		const showSubscriptSuperscript =
			mode === "full" ||
			isProfileMode ||
			mode === "projectTitle" ||
			isProgressReport;
		const showClearFormatting =
			mode === "full" ||
			isProfileMode ||
			mode === "projectTitle" ||
			isProgressReport;
		const showIndentOutdent = mode === "full";
		const showAlignment = mode === "full";
		const showStrikethrough = false; // Disabled for now
		// const showStrikethrough = mode === "full";
		const showTable = mode === "full";

		// Cycle through alignment options
		const cycleAlignment = () => {
			const alignments: Array<"left" | "center" | "right" | "justify"> = [
				"left",
				"center",
				"right",
				"justify",
			];
			const currentIndex = alignments.indexOf(editorStore.state.textAlignment);
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
							canUndo={editorStore.state.canUndo}
							canRedo={editorStore.state.canRedo}
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
								isActive={editorStore.state.isBold}
								onToggle={() => editorStore.toggleFormat("bold")}
								disabled={disabled}
							/>
						)}
						<FormatButton
							format="italic"
							isActive={editorStore.state.isItalic}
							onToggle={() => editorStore.toggleFormat("italic")}
							disabled={disabled}
						/>
						{showUnderline && (
							<FormatButton
								format="underline"
								isActive={editorStore.state.isUnderline}
								onToggle={() => editorStore.toggleFormat("underline")}
								disabled={disabled}
							/>
						)}
						{showStrikethrough && (
							<StrikethroughButton
								isActive={editorStore.state.isStrikethrough}
								onToggle={() => editorStore.toggleFormat("strikethrough")}
								disabled={disabled}
							/>
						)}

						{/* Subscript/Superscript buttons */}
						{showSubscriptSuperscript && (
							<>
								<SubscriptButton
									isActive={editorStore.state.isSubscript}
									onToggle={() => editorStore.toggleFormat("subscript")}
									disabled={disabled}
								/>
								<SuperscriptButton
									isActive={editorStore.state.isSuperscript}
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
								isList={editorStore.state.isList}
								listType={editorStore.state.listType}
								onCycleList={editorStore.toggleList}
								disabled={disabled}
							/>
						)}
						{isProfileMode && showLinks && (
							<LinkButton
								isActive={editorStore.state.isLink}
								disabled={disabled}
							/>
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
							blockType={editorStore.state.blockType}
							onSetBlockType={editorStore.setBlockType}
							disabled={disabled}
							disableHeadings={disableHeadings}
						/>
					)}

					{/* List button - unified cycling button */}
					{showLists && !isProfileMode && (
						<UnifiedListButton
							isList={editorStore.state.isList}
							listType={editorStore.state.listType}
							onCycleList={editorStore.toggleList}
							disabled={disabled}
						/>
					)}

					{/* Indent/Outdent buttons */}
					{showIndentOutdent && (
						<>
							<OutdentButton
								onOutdent={editorStore.decreaseIndent}
								canOutdent={editorStore.state.indentLevel > 0}
								disabled={disabled}
							/>
							<IndentButton
								onIndent={editorStore.increaseIndent}
								canIndent={
									editorStore.state.indentLevel < editorStore.state.maxIndent
								}
								disabled={disabled}
							/>
						</>
					)}

					{/* Alignment button */}
					{showAlignment && (
						<AlignmentButton
							alignment={editorStore.state.textAlignment}
							onCycleAlignment={cycleAlignment}
							disabled={disabled}
						/>
					)}

					{/* Link and Table buttons */}
					{((showLinks && !isProfileMode) || showTable) && (
						<div className="editor-toolbar-separator" />
					)}

					{showLinks && !isProfileMode && (
						<LinkButton
							isActive={editorStore.state.isLink}
							disabled={disabled}
						/>
					)}

					{showTable && (
						<TableButton
							onInsertTable={editorStore.insertTable}
							disabled={disabled}
						/>
					)}
				</div>
			</ToolbarDarkModeContext.Provider>
		);
	}
);
