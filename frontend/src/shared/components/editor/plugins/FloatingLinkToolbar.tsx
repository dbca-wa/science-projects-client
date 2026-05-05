/**
 * FloatingLinkToolbar Plugin
 *
 * A small absolute-positioned toolbar that appears near the user's text selection,
 * containing a link button. Positioned relative to the .editor-container to avoid
 * z-index conflicts with Dialog/Drawer wrappers.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	$isTextNode,
	SELECTION_CHANGE_COMMAND,
	FORMAT_TEXT_COMMAND,
} from "lexical";
import { $isLinkNode } from "@lexical/link";
import {
	Link as LinkIcon,
	Bold,
	Italic,
	Underline,
	Subscript,
	Superscript,
	RemoveFormatting,
} from "lucide-react";
import { useLinkEditor } from "../toolbar/link-editor.utils";
import { TOOLBAR_CONFIGS } from "../toolbar/toolbar-configs";
import type { ToolbarMode } from "@/shared/types/editor.types";

interface FloatingLinkToolbarProps {
	showLinks: boolean;
	toolbar?: ToolbarMode;
}

const TOOLBAR_HEIGHT = 36;
const TOOLBAR_GAP = 10;

export const FloatingLinkToolbar = ({
	showLinks,
	toolbar = "full",
}: FloatingLinkToolbarProps) => {
	const [editor] = useLexicalComposerContext();
	const linkEditor = useLinkEditor();
	const [position, setPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const [isOnLink, setIsOnLink] = useState(false);
	const [visible, setVisible] = useState(false);
	const toolbarRef = useRef<HTMLDivElement>(null);
	const mouseIsDown = useRef(false);

	// Local formatting state — tracked from this editor's selection, not the shared store
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isSubscript, setIsSubscript] = useState(false);
	const [isSuperscript, setIsSuperscript] = useState(false);

	// Derive button visibility from TOOLBAR_CONFIGS — mirrors the main Toolbar component
	const config = TOOLBAR_CONFIGS[toolbar];

	const showBold = config.formatting.bold;
	const showItalic = toolbar !== "none";
	const showUnderline = config.formatting.underline;
	const showSubscriptSuperscript = config.formatting.subscript;
	const showClearFormatting = config.features.clearFormatting;

	// Count visible buttons to decide whether to render at all
	const visibleButtonCount =
		(showBold ? 1 : 0) +
		(showItalic ? 1 : 0) +
		(showUnderline ? 1 : 0) +
		(showSubscriptSuperscript ? 2 : 0) +
		(showClearFormatting ? 1 : 0) +
		(showLinks ? 1 : 0);

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();

		if (
			!$isRangeSelection(selection) ||
			selection.isCollapsed() ||
			!editor.isEditable()
		) {
			setPosition(null);
			setVisible(false);
			return;
		}

		// Don't show while mouse is held down (user is still dragging)
		if (mouseIsDown.current) return;

		// Check if selection is within a LinkNode
		const node = selection.anchor.getNode();
		const parent = node.getParent();
		const onLink = $isLinkNode(node) || (parent != null && $isLinkNode(parent));
		setIsOnLink(onLink);

		// Read formatting state from this editor's selection
		setIsBold(selection.hasFormat("bold"));
		setIsItalic(selection.hasFormat("italic"));
		setIsUnderline(selection.hasFormat("underline"));
		setIsSubscript(selection.hasFormat("subscript"));
		setIsSuperscript(selection.hasFormat("superscript"));
	}, [editor]);

	const updatePosition = useCallback(() => {
		if (linkEditor?.state.isOpen || mouseIsDown.current) {
			setPosition(null);
			setVisible(false);
			return;
		}

		const nativeSelection = window.getSelection();
		if (
			!nativeSelection ||
			nativeSelection.rangeCount === 0 ||
			nativeSelection.isCollapsed
		) {
			setPosition(null);
			setVisible(false);
			return;
		}

		const container = editor
			.getRootElement()
			?.closest(".editor-container") as HTMLElement | null;
		if (!container) {
			setPosition(null);
			setVisible(false);
			return;
		}

		const range = nativeSelection.getRangeAt(0);
		const rangeRect = range.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		// Calculate position relative to the container
		let top = rangeRect.top - containerRect.top - TOOLBAR_HEIGHT - TOOLBAR_GAP;
		const toolbarWidth = toolbarRef.current?.offsetWidth || 200;
		let left =
			rangeRect.left -
			containerRect.left +
			rangeRect.width / 2 -
			toolbarWidth / 2;

		// Flip below if it would overflow the top of the container
		if (top < 0) {
			top = rangeRect.bottom - containerRect.top + TOOLBAR_GAP;
		}

		// Shift horizontally to stay within container bounds
		if (left < 0) {
			left = 0;
		} else if (left + toolbarWidth > container.clientWidth) {
			left = container.clientWidth - toolbarWidth;
		}

		setPosition({ top, left });
		setVisible(true);
	}, [editor, linkEditor?.state.isOpen]);

	// Track mouse state to only show toolbar on release, not during drag
	useEffect(() => {
		const rootElement = editor.getRootElement();
		if (!rootElement) return;

		const handleMouseDown = () => {
			mouseIsDown.current = true;
			setVisible(false);
			setPosition(null);
		};
		const handleMouseUp = () => {
			mouseIsDown.current = false;
			requestAnimationFrame(() => {
				editor.getEditorState().read(() => {
					updateToolbar();
				});
				updatePosition();
			});
		};

		rootElement.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			rootElement.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [editor, updateToolbar, updatePosition]);

	// Listen for selection changes
	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				editor.getEditorState().read(() => {
					updateToolbar();
				});
				updatePosition();
				return false;
			},
			1
		);
	}, [editor, updateToolbar, updatePosition]);

	// Listen for editor updates
	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateToolbar();
			});
			updatePosition();
		});
	}, [editor, updateToolbar, updatePosition]);

	const handleClick = useCallback(() => {
		if (!linkEditor) return;

		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection)) return;

			const clonedSelection = selection.clone();
			const node = selection.anchor.getNode();
			const parent = node.getParent();

			let linkNode = null;
			if ($isLinkNode(node)) {
				linkNode = node;
			} else if (parent && $isLinkNode(parent)) {
				linkNode = parent;
			}

			if (linkNode) {
				linkEditor.openLinkEditor({
					url: linkNode.getURL(),
					hasSelection: true,
					isEditing: true,
					selection: clonedSelection,
					linkNodeKey: linkNode.getKey(),
				});
			} else {
				linkEditor.openLinkEditor({
					hasSelection: !selection.isCollapsed(),
					isEditing: false,
					selection: clonedSelection,
				});
			}
		});
	}, [editor, linkEditor]);

	const handleClearFormatting = useCallback(() => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				selection.getNodes().forEach((node) => {
					if ($isTextNode(node)) {
						node.setFormat(0);
					}
				});
			}
		});
	}, [editor]);

	if (
		!position ||
		!visible ||
		linkEditor?.state.isOpen ||
		visibleButtonCount <= 1
	) {
		return null;
	}

	const btnClass = (active: boolean) =>
		`flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm transition-colors ${
			active
				? "bg-accent text-accent-foreground"
				: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
		}`;

	// Track whether we need a separator before the next group
	const hasFormatButtons = showBold || showItalic || showUnderline;
	const hasSubSuperClear = showSubscriptSuperscript || showClearFormatting;

	return (
		<div
			ref={toolbarRef}
			className="absolute z-10 flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-1 shadow-lg transition-opacity duration-150 dark:border-gray-700 dark:bg-gray-800"
			style={{
				top: position.top,
				left: position.left,
				opacity: visible ? 1 : 0,
			}}
			role="toolbar"
			aria-label="Floating formatting toolbar"
			onMouseDown={(e) => e.preventDefault()}
		>
			{showBold && (
				<button
					type="button"
					className={btnClass(isBold)}
					onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
					aria-label="Bold"
					aria-pressed={isBold}
				>
					<Bold className="h-3.5 w-3.5" />
				</button>
			)}
			{showItalic && (
				<button
					type="button"
					className={btnClass(isItalic)}
					onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
					aria-label="Italic"
					aria-pressed={isItalic}
				>
					<Italic className="h-3.5 w-3.5" />
				</button>
			)}
			{showUnderline && (
				<button
					type="button"
					className={btnClass(isUnderline)}
					onClick={() =>
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
					}
					aria-label="Underline"
					aria-pressed={isUnderline}
				>
					<Underline className="h-3.5 w-3.5" />
				</button>
			)}

			{/* Separator between format buttons and sub/super/clear */}
			{hasFormatButtons && hasSubSuperClear && (
				<div className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-gray-600" />
			)}

			{showSubscriptSuperscript && (
				<>
					<button
						type="button"
						className={btnClass(isSubscript)}
						onClick={() =>
							editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")
						}
						aria-label="Subscript"
						aria-pressed={isSubscript}
					>
						<Subscript className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						className={btnClass(isSuperscript)}
						onClick={() =>
							editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")
						}
						aria-label="Superscript"
						aria-pressed={isSuperscript}
					>
						<Superscript className="h-3.5 w-3.5" />
					</button>
				</>
			)}
			{showClearFormatting && (
				<button
					type="button"
					className={btnClass(false)}
					onClick={handleClearFormatting}
					aria-label="Clear formatting"
				>
					<RemoveFormatting className="h-3.5 w-3.5" />
				</button>
			)}

			{showLinks && (
				<>
					<div className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-gray-600" />
					<button
						type="button"
						className={btnClass(isOnLink)}
						onClick={handleClick}
						aria-label={isOnLink ? "Edit Link" : "Add Link"}
						aria-pressed={isOnLink}
					>
						<LinkIcon className="h-3.5 w-3.5" />
					</button>
				</>
			)}
		</div>
	);
};
