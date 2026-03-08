import { useState, useRef, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "@/shared/components/ui/button";
import { RichTextEditor } from "./RichTextEditor";
import { RichTextDisplay } from "./RichTextDisplay";
import { WordCounter } from "./WordCounter";
import { ClickToEditBadge } from "@/shared/components/ClickToEditBadge";
import { inlineEditStore } from "@/app/stores/InlineEditStore";
import { useUpdateContent } from "@/shared/hooks/queries/useUpdateContent";
import { CONTENT_TYPE_CONFIGS } from "@/shared/config/content-types.config";
import { countWords } from "@/shared/utils/word-count.utils";
import type { ContentType } from "@/shared/types/inline-edit.types";

export interface InlineSaveEditorProps {
	// Content configuration
	contentType: ContentType;
	entityId: number;
	initialContent: string;

	// Permissions
	canEdit?: boolean;

	// Display configuration
	label?: React.ReactNode;
	placeholder?: string;
	emptyMessage?: string;
	wordLimit?: number;
	limitCanBePassed?: boolean; // If true, shows "Aim for max of X words", if false shows "Limit: X words"
	showWordLimitInLabel?: boolean; // Show word limit in label header

	// Lifecycle callbacks
	onEditStart?: () => void;
	onEditEnd?: () => void;
	onSaveSuccess?: () => void;
	onSaveError?: (error: Error) => void;
	onCancel?: () => void;

	// Styling
	className?: string;
}

/**
 * InlineSaveEditor component
 *
 * Unified inline editing component with save functionality.
 * Supports view mode and edit mode with automatic state management.
 */
export const InlineSaveEditor = observer(
	({
		contentType,
		entityId,
		initialContent,
		canEdit = false,
		label,
		placeholder,
		emptyMessage,
		wordLimit,
		limitCanBePassed = false,
		showWordLimitInLabel = false,
		onEditStart,
		onEditEnd,
		onSaveSuccess,
		onSaveError,
		onCancel,
		className = "",
	}: InlineSaveEditorProps) => {
		const config = CONTENT_TYPE_CONFIGS[contentType];

		// Safety check: Ensure config exists for this contentType
		if (!config) {
			console.error(`No config found for contentType: ${contentType}`);
			return (
				<div className="rounded-md border border-destructive bg-destructive/10 p-4">
					<p className="text-sm text-destructive">
						Error: Invalid content type "{contentType}". Please contact support.
					</p>
				</div>
			);
		}

		const isEditing = inlineEditStore.isEditing(contentType, entityId);

		// Local state for edited content
		const [editedContent, setEditedContent] = useState(initialContent);
		const [hasChanges, setHasChanges] = useState(false);
		const [isFocused, setIsFocused] = useState(false);
		const [isHovered, setIsHovered] = useState(false);

		// Refs for focus management and navigation blocking
		const editButtonRef = useRef<HTMLButtonElement>(null);
		const editorContainerRef = useRef<HTMLDivElement>(null);
		const containerRef = useRef<HTMLDivElement>(null);

		// Local state for saved content (optimistic update)
		const [savedContent, setSavedContent] = useState(initialContent);

		// Update mutation
		const updateMutation = useUpdateContent({
			contentType,
			entityId,
			onSuccess: () => {
				// Optimistically update the saved content immediately
				setSavedContent(editedContent);

				inlineEditStore.endEdit(contentType, entityId);

				// Unregister editor from enhanced store
				inlineEditStore.unregisterEditor(contentType, entityId);

				setHasChanges(false);
				onSaveSuccess?.();
				onEditEnd?.();

				// Return focus to edit button
				setTimeout(() => {
					editButtonRef.current?.focus();
				}, 0);
			},
			onError: (error) => {
				onSaveError?.(error);
				// Keep editor in edit mode on error
			},
		});

		// Handle entering edit mode
		const handleEditClick = () => {
			inlineEditStore.startEdit(contentType, entityId);

			// Note: Editor registration is handled by useEffect
			// This ensures it works both on initial click and after tab switches

			setEditedContent(savedContent);
			setHasChanges(false);
			setIsFocused(true); // Set focused when entering edit mode
			onEditStart?.();
		};

		// Handle save
		const handleSave = () => {
			if (!hasChanges || updateMutation.isPending) return;
			updateMutation.mutate(editedContent);
		};

		// Handle cancel
		const handleCancel = () => {
			inlineEditStore.endEdit(contentType, entityId);

			// Unregister editor from enhanced store
			inlineEditStore.unregisterEditor(contentType, entityId);

			setEditedContent(savedContent);
			setHasChanges(false);
			setIsFocused(false); // Clear focus when canceling
			onCancel?.();
			onEditEnd?.();

			// Return focus to edit button
			setTimeout(() => {
				editButtonRef.current?.focus();
			}, 0);
		};

		// Handle content change
		const handleContentChange = (newContent: string) => {
			setEditedContent(newContent);
			setHasChanges(newContent !== savedContent);

			// Update current content in store (updates immediately for change detection)
			inlineEditStore.updateCurrentContent(contentType, entityId, newContent);
		};

		// Update saved content when initialContent changes (from query refetch)
		useEffect(() => {
			setSavedContent(initialContent);
		}, [initialContent]);

		// Update edited content when entering edit mode
		useEffect(() => {
			if (!isEditing) {
				setEditedContent(savedContent);
				setHasChanges(false);
				setIsFocused(false); // Clear focus when exiting edit mode
			}
		}, [isEditing, savedContent]);

		// Register/unregister editor based on isEditing state
		// This handles both initial registration and re-registration after tab switches
		useEffect(() => {
			if (isEditing) {
				// Register editor when in edit mode
				// IMPORTANT: Only register with savedContent (server state), not editedContent
				// This ensures originalContent stays stable even when user makes changes
				inlineEditStore.registerEditor({
					contentType,
					entityId,
					originalContent: savedContent,
					elementRef: containerRef.current,
				});
			}

			// Cleanup: unregister on unmount or when exiting edit mode
			return () => {
				if (isEditing) {
					inlineEditStore.unregisterEditor(contentType, entityId);
				}
			};
		}, [isEditing, contentType, entityId, savedContent]);

		// Separate effect to update current content when editedContent changes
		// This runs independently of registration to avoid re-registering on every keystroke
		useEffect(() => {
			if (isEditing) {
				inlineEditStore.updateCurrentContent(
					contentType,
					entityId,
					editedContent
				);
			}
		}, [editedContent, isEditing, contentType, entityId]);

		// Track focus/blur events on the editor container
		useEffect(() => {
			const container = editorContainerRef.current;
			if (!container || !isEditing) return;

			const handleFocusIn = () => setIsFocused(true);
			const handleFocusOut = (e: FocusEvent) => {
				// Only blur if focus is leaving the container entirely
				if (!container.contains(e.relatedTarget as Node)) {
					setIsFocused(false);
				}
			};

			container.addEventListener("focusin", handleFocusIn);
			container.addEventListener("focusout", handleFocusOut);

			return () => {
				container.removeEventListener("focusin", handleFocusIn);
				container.removeEventListener("focusout", handleFocusOut);
			};
		}, [isEditing]);

		// Determine placeholder and empty message
		const effectivePlaceholder = placeholder || config.defaultPlaceholder;
		const effectiveEmptyMessage = emptyMessage || config.defaultEmptyMessage;

		// Check if over word limit
		const wordCount = useMemo(() => {
			if (!wordLimit) return 0;
			return countWords(editedContent);
		}, [editedContent, wordLimit]);

		const isOverLimit = wordLimit !== undefined && wordCount > wordLimit;

		// Render label with optional word limit
		const renderLabel = () => {
			if (!label) return null;

			// If label is a ReactNode (with icons), render as-is
			if (typeof label !== "string") {
				return label;
			}

			// For string labels, apply default styling
			return (
				<div className="flex items-center gap-2">
					<span className="text-xl font-semibold">{label}</span>
					{showWordLimitInLabel && wordLimit && (
						<span className="text-xs text-muted-foreground">
							(max {wordLimit} words)
						</span>
					)}
				</div>
			);
		};

		return (
			<div className={`space-y-6 ${className}`}>
				{!isEditing ? (
					// View mode - Clickable container with hover effect
					<div
						className={`bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden ${
							canEdit
								? "cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-600"
								: ""
						}`}
						onClick={canEdit ? handleEditClick : undefined}
						onMouseEnter={() => canEdit && setIsHovered(true)}
						onMouseLeave={() => canEdit && setIsHovered(false)}
						onKeyDown={(e) => {
							if (canEdit && (e.key === "Enter" || e.key === " ")) {
								e.preventDefault();
								handleEditClick();
							}
						}}
						tabIndex={canEdit ? 0 : undefined}
						role={canEdit ? "button" : undefined}
						aria-label={
							canEdit
								? `Click to edit ${typeof label === "string" ? label : "content"}`
								: undefined
						}
					>
						{/* Header section with label and click-to-edit badge */}
						{label && (
							<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
								<div>{renderLabel()}</div>
								{canEdit && <ClickToEditBadge isVisible={isHovered} />}
							</div>
						)}

						{/* Content section with more padding */}
						<div className={`px-6 py-5 ${canEdit ? "cursor-pointer" : ""}`}>
							<RichTextDisplay
								content={savedContent}
								emptyMessage={effectiveEmptyMessage}
								className="min-h-[60px] cursor-inherit"
							/>
						</div>

						{/* Click-to-edit badge at bottom if no label */}
						{!label && canEdit && (
							<div className="px-6 pb-4 flex justify-end">
								<ClickToEditBadge isVisible={isHovered} />
							</div>
						)}
					</div>
				) : (
					// Edit mode - Keep header visible with Cancel button
					<div
						ref={containerRef}
						className={`relative rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
							isFocused
								? "border-2 border-blue-500 dark:border-blue-400"
								: hasChanges
									? "border-2 border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/30"
									: "border-2 border-gray-300 dark:border-gray-600"
						}`}
					>
						{/* Header section with label */}
						{label && (
							<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
								<div>{renderLabel()}</div>
							</div>
						)}

						{/* Editor content with focus styling */}
						<div
							ref={editorContainerRef}
							className={`transition-colors bg-white dark:bg-gray-900 ${
								isFocused ? "bg-blue-50 dark:bg-blue-950/20" : ""
							}`}
						>
							<RichTextEditor
								value={editedContent}
								onChange={handleContentChange}
								onSave={handleSave}
								placeholder={effectivePlaceholder}
								toolbar="full"
								wordLimit={wordLimit}
								limitCanBePassed={limitCanBePassed}
								className="bg-white"
								autoFocus={true}
								moveCursorToEnd={true}
								aria-label={`Edit ${typeof label === "string" ? label : "content"}`}
							/>

							<div className="flex items-center justify-between p-4">
								<div className="flex items-center gap-2">
									<WordCounter
										content={editedContent}
										limit={wordLimit}
										showLimit={!!wordLimit}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											setEditedContent("");
											setHasChanges(true);
										}}
										aria-label="Clear editor content"
									>
										Clear
									</Button>
								</div>

								<div className="flex items-center gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleCancel}
										aria-label="Cancel editing"
									>
										Cancel
									</Button>
									<Button
										type="button"
										onClick={handleSave}
										disabled={
											!hasChanges || isOverLimit || updateMutation.isPending
										}
										size="sm"
									>
										{updateMutation.isPending ? "Saving..." : "Save"}
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
);
