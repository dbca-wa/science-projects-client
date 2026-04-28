import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CommentRichTextEditor } from "./CommentRichTextEditor";
import { toast } from "sonner";
import type { IUserMe } from "@/shared/types/user.types";
import { extractTextFromHTML } from "@/shared/utils/html-display.utils";

interface CommentFormProps {
	onSubmit: (html: string, mentionedUserIds?: number[]) => Promise<void>;
	onCancel?: () => void;
	initialValue?: string;
	placeholder?: string;
	submitLabel?: string;
	showCancel?: boolean;
	autoFocus?: boolean;
	projectId: number;
	currentUser?: IUserMe | null;
}

/**
 * CommentForm Component
 *
 * Form for creating or editing comments with rich text formatting and @mention support.
 * Supports auto-focus, loading states, and validation.
 *
 * Keyboard Shortcuts:
 * - Ctrl/Cmd + Enter: Submit comment
 * - Escape: Cancel editing (when showCancel is true)
 */
export const CommentForm = ({
	onSubmit,
	onCancel,
	initialValue = "",
	placeholder = "Say something...",
	submitLabel = "Post Comment",
	showCancel = false,
	autoFocus = true,
	projectId,
	currentUser,
}: CommentFormProps) => {
	const [html, setHtml] = useState(initialValue);
	const [mentionedUserIds, setMentionedUserIds] = useState<number[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editorKey, setEditorKey] = useState(0); // Key to force editor remount
	const formRef = useRef<HTMLFormElement>(null); // Ref to form element

	const maxLength = 1500;
	// Strip HTML tags for accurate character count
	const characterCount = extractTextFromHTML(html).length;
	const isOverLimit = characterCount > maxLength;
	const isEmpty = extractTextFromHTML(html).trim().length === 0;

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isEmpty) {
			toast.error("Comment cannot be empty");
			return;
		}

		if (isOverLimit) {
			toast.error(`Comment exceeds maximum length of ${maxLength} characters`);
			return;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(html, mentionedUserIds);
			setHtml(""); // Clear form on success
			setMentionedUserIds([]); // Clear mentioned users
			setEditorKey((prev) => prev + 1); // Force editor remount to clear content
		} catch (error) {
			// Error handling is done by the parent component
			console.error("Comment submission error:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = useCallback(() => {
		setHtml(initialValue);
		setMentionedUserIds([]);
		onCancel?.();
	}, [initialValue, onCancel]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle if the event target is within our form
			if (!formRef.current?.contains(e.target as Node)) {
				return;
			}

			// Ctrl/Cmd + Enter to submit
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				// Just submit the form - let the form's handleSubmit do validation
				formRef.current?.requestSubmit();
			}

			// Escape to cancel
			if (e.key === "Escape" && showCancel && !isSubmitting) {
				e.preventDefault();
				handleCancel();
			}
		};

		document.addEventListener("keydown", handleKeyDown, true); // Use capture phase
		return () => document.removeEventListener("keydown", handleKeyDown, true);
	}, [isSubmitting, showCancel, handleCancel]);

	return (
		<form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
			<div className="relative">
				<CommentRichTextEditor
					key={editorKey} // Force remount when key changes
					value={html}
					onChange={setHtml}
					onMentionedUsersChange={setMentionedUserIds}
					projectId={projectId}
					placeholder={placeholder}
					disabled={isSubmitting}
					autoFocus={autoFocus}
					minHeight="80px"
					currentUser={currentUser}
				/>

				{/* Character Counter */}
				<div
					id="character-count"
					className={`absolute bottom-2 right-2 text-xs ${
						isOverLimit
							? "text-destructive font-semibold"
							: "text-muted-foreground"
					}`}
				>
					{characterCount} / {maxLength}
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-2 justify-between items-center">
				{/* Helper Text */}
				<div className="text-xs text-muted-foreground">
					Type @ to mention ·{" "}
					<kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">
						{navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+Enter
					</kbd>{" "}
					to submit
					{showCancel && (
						<>
							{" · "}
							<kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">
								Esc
							</kbd>{" "}
							to cancel
						</>
					)}
				</div>

				<div className="flex gap-2">
					{showCancel && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleCancel}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
					)}
					<Button
						type="submit"
						size="sm"
						disabled={isEmpty || isOverLimit || isSubmitting}
					>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{submitLabel}
					</Button>
				</div>
			</div>
		</form>
	);
};
