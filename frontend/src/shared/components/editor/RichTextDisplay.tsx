/**
 * RichTextDisplay Component
 *
 * Read-only component for displaying formatted rich text content.
 * Renders HTML content with proper formatting without editing capabilities.
 *
 * Content from the backend is trusted (sanitised on save). We skip DOMPurify
 * on read to avoid blocking the main thread with large content (e.g. 14K+ word
 * publications lists). This matches the approach used by the original app.
 */

import React from "react";
import type { RichTextDisplayProps } from "@/shared/types/editor.types";
import "@/shared/styles/editor.css";

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
	content,
	className = "",
	emptyMessage = "No content",
}) => {
	if (!content || content.trim() === "") {
		return (
			<div className={`${className} italic text-gray-500 dark:text-gray-400`}>
				{emptyMessage}
			</div>
		);
	}

	const isClickable = className.includes("cursor-inherit");

	return (
		<div
			className={`editor-container editor-readonly ${isClickable ? "editor-clickable" : ""} ${className}`}
		>
			<div
				className="editor-input-display"
				dangerouslySetInnerHTML={{ __html: content }}
				role="article"
				aria-label="Content display"
			/>
		</div>
	);
};
