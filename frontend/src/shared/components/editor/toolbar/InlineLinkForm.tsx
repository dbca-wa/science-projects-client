import { useRef, useEffect, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	$createTextNode,
	$setSelection,
	$getNodeByKey,
	$isTextNode,
} from "lexical";
import {
	TOGGLE_LINK_COMMAND,
	$createLinkNode,
	$isLinkNode,
	$isAutoLinkNode,
} from "@lexical/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";
import { sanitizeUrl } from "@/shared/utils";
import { useLinkEditor } from "./link-editor.utils";
import { isInsertDisabled } from "./link-editor.utils";

/**
 * Full-panel inline link editor that slides in from the right,
 * replacing the editor content area via the ContentSlider.
 * Supports insert, edit, and remove operations.
 */
export function InlineLinkForm() {
	const ctx = useLinkEditor();
	const [editor] = useLexicalComposerContext();
	const urlInputRef = useRef<HTMLInputElement>(null);
	const textInputRef = useRef<HTMLInputElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	const closeLinkEditor = ctx?.closeLinkEditor;
	const state = ctx?.state;

	// Auto-focus the correct input when the panel opens
	useEffect(() => {
		if (!state?.isOpen) return;

		// Small delay to allow the slide animation to start
		const timer = setTimeout(() => {
			if (!state.hasSelection && textInputRef.current) {
				textInputRef.current.focus();
			} else if (urlInputRef.current) {
				urlInputRef.current.focus();
			}
		}, 50);

		return () => clearTimeout(timer);
	}, [state?.isOpen, state?.hasSelection]);

	// Escape key handler: close panel and restore focus to editor
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				closeLinkEditor?.();
				// Restore focus to the editor
				editor.getRootElement()?.focus();
			}
		},
		[closeLinkEditor, editor]
	);

	if (!ctx) return null;

	const { setLinkUrl, setLinkText } = ctx;

	// Always render (for slide animation), but show empty state when closed
	if (!state?.isOpen) {
		return <div className="w-full h-full" aria-hidden="true" />;
	}

	const disabled = isInsertDisabled(
		state.linkUrl,
		state.linkText,
		state.hasSelection
	);
	const urlValid =
		state.linkUrl.trim() !== "" && sanitizeUrl(state.linkUrl) !== "";
	const showUrlError = state.linkUrl.trim() !== "" && !urlValid;
	const insertDisabled = disabled || (state.linkUrl.trim() !== "" && !urlValid);

	const restoreSelection = () => {
		if (state.savedSelection) {
			editor.update(() => {
				$setSelection(state.savedSelection);
			});
		}
	};

	const handleInsert = () => {
		const sanitisedUrl = sanitizeUrl(state.linkUrl);
		if (!sanitisedUrl) {
			toast.error("Invalid URL. Please enter a valid URL.");
			return;
		}

		editor.update(() => {
			// Restore the saved selection before performing the operation
			if (state.savedSelection) {
				$setSelection(state.savedSelection);
			}

			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				if (state.isEditing) {
					// Update existing link
					editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitisedUrl);
				} else if (selection.isCollapsed() && state.linkText.trim()) {
					// Insert new link with provided text
					const linkNode = $createLinkNode(sanitisedUrl);
					const textNode = $createTextNode(state.linkText);
					linkNode.append(textNode);
					selection.insertNodes([linkNode]);
				} else if (!selection.isCollapsed()) {
					// Wrap selected text in a link
					editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitisedUrl);
				} else {
					toast.error("Please enter link text or select text in the editor.");
					return;
				}
			}
		});

		closeLinkEditor?.();
	};

	const handleRemove = () => {
		editor.update(() => {
			// Try to find the link node by its stored key first
			let linkNode = state.linkNodeKey
				? $getNodeByKey(state.linkNodeKey)
				: null;

			// Fallback: find via selection
			if (!linkNode) {
				if (state.savedSelection) {
					$setSelection(state.savedSelection);
				}
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					const node = selection.anchor.getNode();
					const parent = node.getParent();
					if ($isLinkNode(node) || $isAutoLinkNode(node)) {
						linkNode = node;
					} else if (
						parent &&
						($isLinkNode(parent) || $isAutoLinkNode(parent))
					) {
						linkNode = parent;
					}
				}
			}

			if (linkNode && ($isLinkNode(linkNode) || $isAutoLinkNode(linkNode))) {
				const isAutoLink = $isAutoLinkNode(linkNode);
				// Extract children and replace the link node with them
				const children = linkNode.getChildren();
				for (const child of children) {
					linkNode.insertBefore(child);
				}
				linkNode.remove();

				// For auto-links, append a zero-width non-joiner to prevent
				// the AutoLinkPlugin from immediately re-wrapping the URL text
				if (isAutoLink && children.length > 0) {
					const lastChild = children[children.length - 1];
					if ($isTextNode(lastChild)) {
						const textContent = lastChild.getTextContent();
						lastChild.setTextContent(textContent + "\u200C");
					}
				}
			}
		});
		closeLinkEditor?.();
	};

	const handleCancel = () => {
		restoreSelection();
		closeLinkEditor?.();
	};

	return (
		<div
			ref={panelRef}
			className="w-full h-full bg-slate-50 dark:bg-gray-800 p-4 flex flex-col"
			onKeyDown={handleKeyDown}
			role="form"
			aria-label={state.isEditing ? "Edit link" : "Insert link"}
		>
			{/* Header */}
			<div className="flex items-center gap-2 mb-4">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={handleCancel}
					className="gap-1 px-2 h-7 text-slate-500"
					aria-label="Back to editor"
				>
					<ChevronLeft className="size-3.5" />
					Back
				</Button>
				<span className="text-sm font-medium text-slate-700 dark:text-slate-300">
					{state.isEditing ? "Edit Link" : "Insert Link"}
				</span>
			</div>

			{/* Form fields */}
			<div className="space-y-3 flex-1">
				{!state.hasSelection && (
					<div className="space-y-1">
						<Label htmlFor="inline-link-text" className="text-xs">
							Link Text
						</Label>
						<Input
							ref={textInputRef}
							id="inline-link-text"
							type="text"
							placeholder="Click here"
							value={state.linkText}
							onChange={(e) => setLinkText(e.target.value)}
							className="h-8 text-sm"
							tabIndex={0}
						/>
					</div>
				)}

				<div className="space-y-1">
					<Label htmlFor="inline-link-url" className="text-xs">
						URL
					</Label>
					<Input
						ref={urlInputRef}
						id="inline-link-url"
						type="url"
						placeholder="https://example.com"
						value={state.linkUrl}
						onChange={(e) => setLinkUrl(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleInsert();
							}
						}}
						className={`h-8 text-sm ${showUrlError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
						tabIndex={0}
					/>
					{showUrlError ? (
						<p className="text-[10px] text-red-500">
							Please enter a valid URL with a domain (e.g. example.com)
						</p>
					) : (
						<p className="text-[10px] text-muted-foreground">
							https:// will be added if no protocol is specified
						</p>
					)}
				</div>
			</div>

			{/* Button row: Cancel, Remove (if editing), Insert/Update */}
			<div className="flex justify-end gap-2 pt-3">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleCancel}
					className="h-7 text-xs"
					tabIndex={0}
				>
					Cancel
				</Button>
				{state.isEditing && (
					<Button
						type="button"
						variant="destructive"
						size="sm"
						onClick={handleRemove}
						className="h-7 text-xs"
						tabIndex={0}
					>
						Remove
					</Button>
				)}
				<Button
					type="button"
					size="sm"
					onClick={handleInsert}
					disabled={insertDisabled}
					className="h-7 text-xs"
					tabIndex={0}
				>
					{state.isEditing ? "Update" : "Insert"}
				</Button>
			</div>
		</div>
	);
}
