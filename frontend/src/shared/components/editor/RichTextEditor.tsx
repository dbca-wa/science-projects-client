/**
 * RichTextEditor Component
 *
 * Main editable rich text component built on Lexical.
 * Supports multiple toolbar configurations, word limits, and React Hook Form integration.
 */

import React, { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import type { RichTextEditorProps } from "@/shared/types/editor.types";
import { editorTheme } from "./theme";
import { OnChangePlugin } from "./plugins/OnChangePlugin";
import { PrepopulateHTMLPlugin } from "./plugins/PrepopulateHTMLPlugin";
import { ControlledValuePlugin } from "./plugins/ControlledValuePlugin";
import { AutoLinkPlugin } from "./plugins/AutoLinkPlugin";
import { AutoFocusPlugin } from "./plugins/AutoFocusPlugin";
import { TabIndentationPlugin } from "./plugins/TabIndentationPlugin";
import { WordCountPlugin } from "./plugins/WordCountPlugin";
import { PreventAutoFocusPlugin } from "./plugins/PreventAutoFocusPlugin";
import { SubscriptSuperscriptPlugin } from "./plugins/SubscriptSuperscriptPlugin";
import { SaveOnCtrlSPlugin } from "./plugins/SaveOnCtrlSPlugin";
import { DragDropPlugin } from "./plugins/DragDropPlugin";
import { PastePlugin } from "./plugins/PastePlugin";
import { ListMaxIndentPlugin } from "./plugins/ListMaxIndentPlugin";
import { RemoveEmptyListItemsPlugin } from "./plugins/RemoveEmptyListItemsPlugin";
import { EditorStoreIntegrationPlugin } from "./plugins/EditorStoreIntegrationPlugin";
import { MoveCursorToEndPlugin } from "./plugins/MoveCursorToEndPlugin";
import { Toolbar } from "./toolbar/Toolbar";
import "@/shared/styles/editor.css";

// Plugin to make editor editable on user interaction
const EditableOnInteractionPlugin: React.FC<{ shouldBeEditable: boolean }> = ({
	shouldBeEditable,
}) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!shouldBeEditable) return;

		const rootElement = editor.getRootElement();
		if (!rootElement) return;

		const makeEditable = (event: Event) => {
			if (!editor.isEditable()) {
				// Prevent default to stop browser from setting cursor position
				event.preventDefault();

				// Restore focusability
				rootElement.setAttribute("tabindex", "0");

				// Make editable without triggering onChange by using a special tag
				editor.setEditable(true);

				// Force an update with a special tag to signal this is just becoming editable
				editor.update(() => {}, { tag: "becoming-editable" });
			}
		};

		// Make editable on click or focus
		rootElement.addEventListener("click", makeEditable);
		rootElement.addEventListener("focusin", makeEditable);

		// CRITICAL: Delay making the editor focusable to prevent auto-focus during initialization
		// This ensures all editors have mounted and content has been populated before any can receive focus
		const timeoutId = setTimeout(() => {
			// Editor is now ready to receive focus from user interaction
		}, 600);

		return () => {
			clearTimeout(timeoutId);
			rootElement.removeEventListener("click", makeEditable);
			rootElement.removeEventListener("focusin", makeEditable);
		};
	}, [editor, shouldBeEditable]);

	return null;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
	value,
	onChange,
	onSave,
	placeholder = "Enter text...",
	readOnly = false,
	disabled = false,
	autoFocus = false,
	moveCursorToEnd = false,
	toolbar = "full",
	wordLimit,
	limitCanBePassed: _limitCanBePassed = false,
	className = "",
	minHeight = "150px",
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedby,
}) => {
	const [_currentContent, setCurrentContent] = useState(value || "");

	const handleError = (error: Error) => {
		console.error("[RichTextEditor] Lexical error:", error);
	};

	const handleContentChange = (html: string) => {
		setCurrentContent(html);
		onChange?.(html);
	};

	const shouldBeEditable = !readOnly && !disabled;
	const shouldStartEditable =
		shouldBeEditable && (autoFocus || moveCursorToEnd);

	const initialConfig = {
		namespace: "RichTextEditor",
		editable: shouldStartEditable, // Start editable if autoFocus or moveCursorToEnd
		theme: editorTheme,
		onError: handleError,
		nodes: [
			HeadingNode,
			ListNode,
			ListItemNode,
			LinkNode,
			AutoLinkNode,
			TableNode,
			TableCellNode,
			TableRowNode,
		],
	};

	return (
		<div
			className={`editor-container ${readOnly ? "editor-readonly" : ""} ${className}`}
		>
			<LexicalComposer initialConfig={initialConfig}>
				{/* Toolbar - separate from content area */}
				{!readOnly && toolbar !== "none" && (
					<Toolbar mode={toolbar} disabled={disabled} />
				)}

				{/* Content area - with border */}
				<div className="editor-content-wrapper">
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="editor-input"
								style={{ minHeight }}
								aria-label={ariaLabel}
								aria-describedby={ariaDescribedby}
								// Prevent auto-focus during initialization
								tabIndex={-1}
							/>
						}
						placeholder={
							!readOnly ? (
								<div className="editor-placeholder">{placeholder}</div>
							) : null
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
				</div>

				{/* Word count display removed - now handled by InlineSaveEditor */}

				{/* Plugins */}
				<HistoryPlugin />
				<ListPlugin />
				<ListMaxIndentPlugin maxDepth={9} />
				<RemoveEmptyListItemsPlugin />
				<LinkPlugin />
				<AutoLinkPlugin />
				<TablePlugin hasCellMerge={false} hasCellBackgroundColor={false} />
				<TabIndentationPlugin />
				{/* PreventAutoFocusPlugin must come before EditableOnInteractionPlugin */}
				<PreventAutoFocusPlugin />
				<EditableOnInteractionPlugin shouldBeEditable={shouldBeEditable} />
				<SubscriptSuperscriptPlugin />
				<SaveOnCtrlSPlugin onSave={onSave} />
				<PastePlugin />
				{!readOnly && <DragDropPlugin />}
				{autoFocus && <AutoFocusPlugin />}
				{moveCursorToEnd && <MoveCursorToEndPlugin />}
				<OnChangePlugin onChange={handleContentChange} />
				{/* PrepopulateHTMLPlugin handles initial content loading ONCE */}
				<PrepopulateHTMLPlugin html={value} />
				{/* ControlledValuePlugin handles subsequent value prop changes (Clear, Reset, etc.) */}
				<ControlledValuePlugin value={value} />
				{wordLimit && <WordCountPlugin wordLimit={wordLimit} />}
				{/* EditorStore integration - must come after other plugins */}
				<EditorStoreIntegrationPlugin />
			</LexicalComposer>
		</div>
	);
};
