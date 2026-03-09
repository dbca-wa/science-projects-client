import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { useMemo, useCallback, useRef, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createCommentEditorConfig } from "@/shared/config/lexical/comment-editor.config";
import { CommentToolbar } from "./CommentToolbar";
import { CommentMentionsPlugin } from "./CommentMentionsPlugin";
import { PrepopulateHTMLPlugin } from "./PrepopulateHTMLPlugin";
import {
	generateCommentHTML,
	extractMentionedUsers,
} from "@/features/projects/utils/comments/comment-html.utils";
import { ensureRichText } from "@/shared/utils/rich-text.utils";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import { getImageUrl } from "@/shared/utils/image.utils";
import { getUserDisplayName } from "@/shared/utils/user.utils";
import type { IUserMe } from "@/shared/types/user.types";

interface CommentRichTextEditorProps {
	value: string;
	onChange: (html: string) => void;
	onMentionedUsersChange?: (userIds: number[]) => void;
	projectId: number;
	placeholder?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	minHeight?: string;
	currentUser?: IUserMe | null;
	initialHtml?: string;
}

/**
 * CommentRichTextEditor Component
 *
 * Rich text editor for creating and editing comments with mention support.
 * Uses Lexical editor with comment-specific configuration.
 *
 * Features:
 * - Rich text formatting (bold, italic, underline)
 * - Ordered and unordered lists
 * - @mention autocomplete with project team search
 * - HTML generation for API submission
 * - Mention extraction for notifications
 * - Keyboard shortcuts (Ctrl+Enter to submit)
 * - Automatically converts plain text to rich text format
 */
export const CommentRichTextEditor = ({
	value: _value,
	onChange,
	onMentionedUsersChange,
	projectId,
	placeholder = "Write a comment...",
	disabled = false,
	autoFocus = true,
	minHeight = "80px",
	currentUser,
	initialHtml,
}: CommentRichTextEditorProps) => {
	// Convert plain text to rich text if needed
	const richTextInitialHtml = useMemo(
		() => (initialHtml ? ensureRichText(initialHtml) : undefined),
		[initialHtml]
	);

	// Create editor configuration
	const initialConfig = useMemo(
		() => ({
			...createCommentEditorConfig("CommentEditor"),
			editable: !disabled,
		}),
		[disabled]
	);

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<EditorContent
				onChange={onChange}
				onMentionedUsersChange={onMentionedUsersChange}
				projectId={projectId}
				placeholder={placeholder}
				minHeight={minHeight}
				autoFocus={autoFocus}
				currentUser={currentUser}
				initialHtml={richTextInitialHtml}
			/>
		</LexicalComposer>
	);
};

// =========================================== INTERNAL COMPONENTS ====================================================

interface EditorContentProps {
	onChange: (html: string) => void;
	onMentionedUsersChange?: (userIds: number[]) => void;
	projectId: number;
	placeholder: string;
	minHeight: string;
	autoFocus: boolean;
	currentUser?: IUserMe | null;
	initialHtml?: string;
}

/**
 * EditorContent - Internal component with access to Lexical context
 */
const EditorContent = ({
	onChange,
	onMentionedUsersChange,
	projectId,
	placeholder,
	minHeight,
	autoFocus,
	currentUser,
	initialHtml,
}: EditorContentProps) => {
	const [editor] = useLexicalComposerContext();
	const contentEditableRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Get user initials for avatar fallback
	const getInitials = (user: IUserMe | null | undefined) => {
		if (!user) return "?";
		const firstInitial = user.display_first_name?.[0] || "";
		const lastInitial = user.display_last_name?.[0] || "";
		return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
	};

	// Auto-focus on mount
	useEffect(() => {
		if (autoFocus) {
			editor.focus();
		}
	}, [autoFocus, editor]);

	// Debug: Log container width changes
	useEffect(() => {
		if (!containerRef.current) return;

		console.log("[CommentRichTextEditor] Setting up ResizeObserver");

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				console.log("[CommentRichTextEditor] Container width changed:", width);
			}
		});

		resizeObserver.observe(containerRef.current);

		return () => {
			console.log("[CommentRichTextEditor] Cleaning up ResizeObserver");
			resizeObserver.disconnect();
		};
	}, []);

	// Handle editor state changes
	const handleChange = useCallback(() => {
		// Generate HTML from editor state
		const html = generateCommentHTML(editor);
		onChange(html);

		// Extract mentioned users
		if (onMentionedUsersChange) {
			const userIds = extractMentionedUsers(editor);
			onMentionedUsersChange(userIds);
		}
	}, [editor, onChange, onMentionedUsersChange]);

	return (
		<div className="relative border border-gray-300 dark:border-gray-600 rounded-3xl">
			{/* Toolbar */}
			<CommentToolbar />

			{/* Avatar + Editor Content Container */}
			<div ref={containerRef} className="@container flex gap-4 items-start p-3">
				{/* User Avatar - Responsive: 64px on narrow, 96px on wide */}
				{currentUser && (
					<Avatar className="size-16 @[380px]:size-24 flex-shrink-0">
						<AvatarImage
							src={getImageUrl(currentUser.image)}
							alt={getUserDisplayName(currentUser)}
						/>
						<AvatarFallback>{getInitials(currentUser)}</AvatarFallback>
					</Avatar>
				)}

				{/* Editor */}
				<div className="flex-1 min-w-0 relative">
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								ref={contentEditableRef}
								className="outline-none"
								style={{ minHeight, maxHeight: "200px", overflowY: "auto" }}
								aria-label="Comment editor"
							/>
						}
						placeholder={
							<div
								className="absolute top-0 left-0 text-gray-400 pointer-events-none"
								aria-hidden="true"
							>
								{placeholder}
							</div>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
				</div>
			</div>

			{/* List plugin for ordered/unordered lists */}
			<ListPlugin />

			{/* History plugin for undo/redo */}
			<HistoryPlugin />

			{/* OnChange plugin to extract HTML and mentions */}
			<OnChangePlugin onChange={handleChange} />

			{/* Mentions plugin for @mention autocomplete */}
			<CommentMentionsPlugin projectId={projectId} />

			{/* Prepopulate plugin for editing existing comments */}
			{initialHtml && <PrepopulateHTMLPlugin html={initialHtml} />}
		</div>
	);
};
