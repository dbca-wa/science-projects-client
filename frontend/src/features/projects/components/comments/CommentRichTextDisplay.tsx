import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useMemo } from "react";
import { createCommentEditorConfig } from "@/shared/config/lexical/comment-editor.config";
import { PrepopulateHTMLPlugin } from "./PrepopulateHTMLPlugin";
import { ensureRichText } from "@/shared/utils/rich-text.utils";

interface CommentRichTextDisplayProps {
	html: string;
	className?: string;
}

/**
 * CommentRichTextDisplay Component
 *
 * Read-only display component for rendering comment HTML with rich text formatting.
 * Uses Lexical editor in read-only mode to display formatted comments.
 *
 * Features:
 * - Displays rich text formatting (bold, italic, lists)
 * - Renders @mentions as clickable links
 * - Read-only mode (no editing)
 * - Consistent styling with comment editor
 * - Automatically converts plain text to rich text format
 */
export const CommentRichTextDisplay = ({
	html,
	className = "",
}: CommentRichTextDisplayProps) => {
	// Convert plain text to rich text if needed
	const richTextHtml = useMemo(() => ensureRichText(html), [html]);

	// Create read-only editor configuration
	const initialConfig = useMemo(
		() => ({
			...createCommentEditorConfig("CommentDisplay"),
			editable: false, // Read-only mode
		}),
		[]
	);

	return (
		<div className={`comment-display ${className}`}>
			<LexicalComposer initialConfig={initialConfig}>
				<RichTextPlugin
					contentEditable={
						<ContentEditable
							className="outline-none prose prose-sm max-w-none"
							aria-label="Comment content"
						/>
					}
					placeholder={null}
					ErrorBoundary={LexicalErrorBoundary}
				/>

				{/* List plugin for rendering lists */}
				<ListPlugin />

				{/* Prepopulate plugin to load HTML content */}
				<PrepopulateHTMLPlugin html={richTextHtml} />
			</LexicalComposer>
		</div>
	);
};
