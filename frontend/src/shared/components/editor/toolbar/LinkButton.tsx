/**
 * LinkButton Component
 *
 * Button for inserting and editing links with security validation.
 * Shows a popover when clicking on existing links for quick editing.
 * Receives isActive state from parent Toolbar component.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	SELECTION_CHANGE_COMMAND,
	$createTextNode,
} from "lexical";
import {
	$isLinkNode,
	TOGGLE_LINK_COMMAND,
	$createLinkNode,
} from "@lexical/link";
import { Link as LinkIcon, ExternalLink, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { toast } from "sonner";
import { sanitizeUrl } from "@/shared/utils";
import type { LinkButtonProps } from "@/shared/types/editor.types";

export const LinkButton: React.FC<LinkButtonProps> = ({
	isActive,
	disabled = false,
}) => {
	const [editor] = useLexicalComposerContext();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");
	const [linkText, setLinkText] = useState("");
	const [hasSelection, setHasSelection] = useState(false);
	const [currentLinkUrl, setCurrentLinkUrl] = useState("");
	const buttonRef = useRef<HTMLButtonElement>(null);

	const updateCurrentLinkUrl = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const node = selection.anchor.getNode();
			const parent = node.getParent();

			// Check if node or parent is a link
			let linkNode = null;
			if ($isLinkNode(node)) {
				linkNode = node;
			} else if (parent && $isLinkNode(parent)) {
				linkNode = parent;
			}

			if (linkNode) {
				const url = linkNode.getURL();
				setCurrentLinkUrl(url);
			} else {
				setCurrentLinkUrl("");
				setIsPopoverOpen(false);
			}

			// Check if there's a selection
			setHasSelection(!selection.isCollapsed());
		}
	}, []);

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				updateCurrentLinkUrl();
				return false;
			},
			1
		);
	}, [editor, updateCurrentLinkUrl]);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateCurrentLinkUrl();
			});
		});
	}, [editor, updateCurrentLinkUrl]);

	const handleClick = () => {
		if (isActive) {
			// If already a link, show popover for quick actions
			setIsPopoverOpen(true);
		} else {
			// Check if there's a selection
			editor.getEditorState().read(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection) && !selection.isCollapsed()) {
					// Has selection - just ask for URL
					setLinkText("");
					setLinkUrl("");
					setIsDialogOpen(true);
				} else {
					// No selection - ask for both text and URL
					setLinkText("");
					setLinkUrl("");
					setIsDialogOpen(true);
				}
			});
		}
	};

	const handleEditClick = () => {
		setLinkUrl(currentLinkUrl);
		setLinkText("");
		setIsPopoverOpen(false);
		setIsDialogOpen(true);
	};

	const handleVisitClick = () => {
		if (currentLinkUrl) {
			window.open(currentLinkUrl, "_blank", "noopener,noreferrer");
		}
	};

	const handleInsertLink = () => {
		const sanitisedUrl = sanitizeUrl(linkUrl);

		if (!sanitisedUrl) {
			toast.error("Invalid URL. Please enter a valid URL.");
			return;
		}

		editor.update(() => {
			const selection = $getSelection();

			if ($isRangeSelection(selection)) {
				if (selection.isCollapsed() && linkText.trim()) {
					// No selection but user provided text - insert new link with text
					const linkNode = $createLinkNode(sanitisedUrl);
					const textNode = $createTextNode(linkText);
					linkNode.append(textNode);
					selection.insertNodes([linkNode]);
				} else if (!selection.isCollapsed()) {
					// Has selection - apply link to selected text
					editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitisedUrl);
				} else {
					// No selection and no text provided
					toast.error("Please enter link text or select text in the editor.");
					return;
				}
			}
		});

		setIsDialogOpen(false);
		setLinkUrl("");
		setLinkText("");
	};

	const handleRemoveLink = () => {
		editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		setIsDialogOpen(false);
		setIsPopoverOpen(false);
		setLinkUrl("");
		setLinkText("");
	};

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
						<PopoverTrigger asChild>
							<Button
								ref={buttonRef}
								type="button"
								variant="ghost"
								size="sm"
								className={`h-8 ${isActive ? "w-auto px-2 bg-accent" : "w-8 p-0"}`}
								onClick={handleClick}
								disabled={disabled}
								aria-label={isActive ? "Edit Link" : "Insert Link"}
								aria-pressed={isActive}
							>
								<LinkIcon className="h-4 w-4" />
								{isActive && <span className="ml-1.5 text-xs">Edit</span>}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80" align="start">
							<div className="space-y-3">
								<div className="space-y-1">
									<p className="text-sm font-medium">Link</p>
									<a
										href={currentLinkUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
									>
										{currentLinkUrl}
									</a>
								</div>
								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleVisitClick}
										className="flex-1"
									>
										<ExternalLink className="h-4 w-4 mr-2" />
										Visit
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleEditClick}
										className="flex-1"
									>
										<Edit2 className="h-4 w-4 mr-2" />
										Edit
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleRemoveLink}
										className="flex-1"
									>
										<Trash2 className="h-4 w-4 mr-2" />
										Remove
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>{isActive ? "Edit Link" : "Insert Link"}</p>
				</TooltipContent>
			</Tooltip>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{isActive ? "Edit Link" : "Insert Link"}</DialogTitle>
						<DialogDescription>
							{hasSelection
								? "Enter the URL for the selected text."
								: "Enter the link text and URL."}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						{!hasSelection && (
							<div className="grid gap-2">
								<Label htmlFor="link-text">Link Text</Label>
								<Input
									id="link-text"
									type="text"
									placeholder="Click here"
									value={linkText}
									onChange={(e) => setLinkText(e.target.value)}
									autoFocus={!hasSelection}
								/>
								<p className="text-xs text-muted-foreground">
									The text that will be displayed as the link
								</p>
							</div>
						)}

						<div className="grid gap-2">
							<Label htmlFor="link-url">URL</Label>
							<Input
								id="link-url"
								type="url"
								placeholder="https://example.com"
								value={linkUrl}
								onChange={(e) => setLinkUrl(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleInsertLink();
									}
								}}
								autoFocus={hasSelection}
							/>
							<p className="text-xs text-muted-foreground">
								If no protocol is specified, https:// will be added
								automatically
							</p>
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setIsDialogOpen(false);
								setLinkUrl("");
								setLinkText("");
							}}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleInsertLink}
							disabled={!linkUrl.trim() || (!hasSelection && !linkText.trim())}
						>
							{isActive ? "Update" : "Insert"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
