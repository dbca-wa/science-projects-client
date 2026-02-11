/**
 * RichTextEditor Component
 *
 * Main editable rich text component built on Lexical.
 * Supports multiple toolbar configurations, word limits, and React Hook Form integration.
 */

import React, { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import type { RichTextEditorProps } from "@/shared/types/editor.types";
import { editorTheme } from "./theme";
import { OnChangePlugin } from "./plugins/OnChangePlugin";
import { PrepopulateHTMLPlugin } from "./plugins/PrepopulateHTMLPlugin";
import { AutoLinkPlugin } from "./plugins/AutoLinkPlugin";
import { TabIndentationPlugin } from "./plugins/TabIndentationPlugin";
import { WordCountPlugin } from "./plugins/WordCountPlugin";
import { PreventAutoFocusPlugin } from "./plugins/PreventAutoFocusPlugin";
import { SubscriptSuperscriptPlugin } from "./plugins/SubscriptSuperscriptPlugin";
import { SaveOnCtrlSPlugin } from "./plugins/SaveOnCtrlSPlugin";
import { DragDropPlugin } from "./plugins/DragDropPlugin";
import { PastePlugin } from "./plugins/PastePlugin";
import { ListMaxIndentPlugin } from "./plugins/ListMaxIndentPlugin";
import { RemoveEmptyListItemsPlugin } from "./plugins/RemoveEmptyListItemsPlugin";
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

		const makeEditable = () => {
			if (!editor.isEditable()) {
				// Make editable without triggering onChange by using a special tag
				editor.setEditable(true);

				// Force an update with a special tag to signal this is just becoming editable
				editor.update(() => {}, { tag: "becoming-editable" });
			}
		};

		// Make editable on click or focus
		rootElement.addEventListener("click", makeEditable);
		rootElement.addEventListener("focusin", makeEditable);

		return () => {
			rootElement.removeEventListener("click", makeEditable);
			rootElement.removeEventListener("focusin", makeEditable);
		};
	}, [editor, shouldBeEditable]);

	return null;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
	value,
	onChange,
	placeholder = "Enter text...",
	readOnly = false,
	disabled = false,
	toolbar = "full",
	wordLimit,
	className = "",
	minHeight = "150px",
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedby,
}) => {
	const handleError = (error: Error) => {
		console.error("[RichTextEditor] Lexical error:", error);
	};

	const shouldBeEditable = !readOnly && !disabled;

	const initialConfig = {
		namespace: "RichTextEditor",
		editable: false, // Start as non-editable, becomes editable on user interaction
		theme: editorTheme,
		onError: handleError,
		nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
	};

	return (
		<div className={`editor-container ${className}`}>
			<LexicalComposer initialConfig={initialConfig}>
				<div className="relative border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-950 overflow-hidden">
					{!readOnly && toolbar !== "none" && (
						<Toolbar mode={toolbar} disabled={disabled} />
					)}

					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="editor-input"
								style={{ minHeight }}
								aria-label={ariaLabel}
								aria-describedby={ariaDescribedby}
								autoFocus={false}
							/>
						}
						placeholder={
							!readOnly ? (
								<div className="editor-placeholder">{placeholder}</div>
							) : null
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>

					<HistoryPlugin />
					<ListPlugin />
					<ListMaxIndentPlugin maxDepth={9} />
					<RemoveEmptyListItemsPlugin />
					<LinkPlugin />
					<AutoLinkPlugin />
					<TabIndentationPlugin />
					<PreventAutoFocusPlugin />
					<EditableOnInteractionPlugin shouldBeEditable={shouldBeEditable} />
					<SubscriptSuperscriptPlugin />
					<SaveOnCtrlSPlugin />
					<PastePlugin />
					{!readOnly && <DragDropPlugin />}
					<OnChangePlugin onChange={onChange} />
					<PrepopulateHTMLPlugin html={value} />
					{wordLimit && <WordCountPlugin wordLimit={wordLimit} />}
				</div>
			</LexicalComposer>
		</div>
	);
};
