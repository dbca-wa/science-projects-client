/**
 * RichTextDisplay Component
 *
 * Read-only component for displaying formatted rich text content.
 * Renders HTML content with proper formatting without editing capabilities.
 */

import React from "react";
import type { RichTextDisplayProps } from "@/shared/types/editor.types";
import { sanitiseHtml } from "@/shared/utils/html-sanitise.utils";
import "@/shared/styles/editor.css";

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
	content,
	className = "",
	emptyMessage = "No content",
}) => {
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

	// For display-only, render HTML directly without Lexical to avoid accessibility issues
	return (
		<div
			className={`editor-container editor-readonly ${isClickable ? "editor-clickable" : ""} ${className}`}
		>
			<div
				className="editor-input-display"
				dangerouslySetInnerHTML={{ __html: sanitisedContent }}
				role="article"
				aria-label="Content display"
			/>
		</div>
	);
};
