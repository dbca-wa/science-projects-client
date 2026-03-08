/**
 * RichTextDisplay Component
 *
 * Read-only component for displaying formatted rich text content.
 * Renders HTML content with proper formatting without editing capabilities.
 */

import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";

import type { RichTextDisplayProps } from "@/shared/types/editor.types";
import { editorTheme } from "./theme";
import { PrepopulateHTMLPlugin } from "./plugins/PrepopulateHTMLPlugin";
import { sanitiseHtml } from "@/shared/utils/html-sanitise.utils";
import "@/shared/styles/editor.css";

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
	content,
	className = "",
	emptyMessage = "No content",
}) => {
	const handleError = (error: Error) => {
		console.error("[RichTextDisplay] Lexical error:", error);
	};

	const initialConfig = {
		namespace: "RichTextDisplay",
		editable: false,
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

	// Sanitise HTML content to prevent XSS
	const sanitisedContent = content ? sanitiseHtml(content) : "";

	// If no content, show empty message
	if (!sanitisedContent) {
		return (
			<div className={`${className} italic text-gray-500 dark:text-gray-400`}>
				{emptyMessage}
			</div>
		);
	}

	// Check if parent has cursor-pointer class (clickable context)
	const isClickable = className.includes("cursor-inherit");

	return (
		<div
			className={`editor-container editor-readonly ${isClickable ? "editor-clickable" : ""} ${className}`}
		>
			<LexicalComposer initialConfig={initialConfig}>
				<div className="editor-content-wrapper-display">
					<RichTextPlugin
						contentEditable={
							<ContentEditable className="editor-input-display" />
						}
						placeholder={null}
						ErrorBoundary={LexicalErrorBoundary}
					/>
				</div>
				<PrepopulateHTMLPlugin html={sanitisedContent} />
			</LexicalComposer>
		</div>
	);
};
