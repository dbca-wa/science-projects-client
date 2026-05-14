import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
	$getSelection,
	$isRangeSelection,
	$isTextNode,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_HIGH,
	INSERT_PARAGRAPH_COMMAND,
	KEY_ARROW_DOWN_COMMAND,
	KEY_ARROW_UP_COMMAND,
	KEY_ENTER_COMMAND,
	KEY_ESCAPE_COMMAND,
	KEY_TAB_COMMAND,
	TextNode,
} from "lexical";
import { $createMentionNode } from "@/shared/nodes/MentionNode.tsx";
import { useProjectMentionableUsers } from "@/features/projects/hooks/useProjectTeamSearch";
import { cn } from "@/shared/lib/utils";
import { getImageUrl } from "@/shared/utils/image.utils";
import type { IUserData } from "@/shared/types/user.types";

interface CommentMentionsPluginProps {
	projectId: number;
}

interface MentionMatch {
	leadOffset: number;
	matchingString: string;
	replaceableString: string;
}

/**
 * CommentMentionsPlugin
 *
 * Lexical plugin for @mention autocomplete in comments.
 * Triggers on '@' character and shows dropdown with mentionable users.
 *
 * Features:
 * - Triggers on @ followed by at least 1 character
 * - Shows up to 3 matching mentionable users (all users who can comment)
 * - Keyboard navigation (Arrow Up/Down, Enter, Tab, Escape)
 * - Mouse interaction (hover, click)
 * - Inserts MentionNode on selection
 */
export const CommentMentionsPlugin = ({
	projectId,
}: CommentMentionsPluginProps) => {
	const [editor] = useLexicalComposerContext();
	const [queryString, setQueryString] = useState<string | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
	const [isInserting, setIsInserting] = useState(false);
	// Track mention mode: once @ is typed, we stay in mention mode until
	// the user exits (double-space, Escape, Enter selection, or click away)
	const [mentionAnchorOffset, setMentionAnchorOffset] = useState<number | null>(
		null
	);

	// Fetch mentionable users based on search query
	const { data: mentionableUsers = [] } = useProjectMentionableUsers(
		projectId,
		queryString || ""
	);

	// Show dropdown whenever we're in mention mode (queryString is set and non-empty)
	// Even with 0 results, keep it open so the user knows they're still searching
	const showDropdown = queryString !== null && queryString.length > 0;

	// Limit displayed results to 5
	const filteredUsers = mentionableUsers.slice(0, 5);

	// Reset selected index when query changes (not results)
	useEffect(() => {
		if (queryString !== null) {
			// Use queueMicrotask to avoid synchronous setState in effect
			queueMicrotask(() => setSelectedIndex(0));
		}
	}, [queryString]);

	// Check for @ mention pattern — allows spaces so users can type full names.
	// Double-space exits the mention search.
	const checkForMentionMatch = useCallback(
		(text: string): MentionMatch | null => {
			// Find the last @ in the text that isn't preceded by a non-space character
			const atIndex = text.lastIndexOf("@");
			if (atIndex === -1) return null;

			// The character before @ must be start-of-string or a space/newline
			if (atIndex > 0) {
				const charBefore = text[atIndex - 1];
				if (charBefore !== " " && charBefore !== "\n") return null;
			}

			const afterAt = text.slice(atIndex + 1);

			// Exit if there are two consecutive spaces after @
			if (afterAt.includes("  ")) return null;

			// Must have at least one non-space character after @
			const trimmed = afterAt.trim();
			if (trimmed.length === 0) return null;

			return {
				leadOffset: atIndex > 0 ? atIndex - 1 : 0,
				matchingString: afterAt.trimEnd(),
				replaceableString:
					atIndex > 0 ? text.slice(atIndex - 1) : text.slice(atIndex),
			};
		},
		[]
	);

	// Insert mention node
	const insertMention = useCallback(
		(member: IUserData, shouldCloseDropdown = true) => {
			// Prevent duplicate insertions
			if (isInserting) {
				return;
			}
			setIsInserting(true);

			// Use editor.update with discrete: true to make it synchronous
			editor.update(
				() => {
					const selection = $getSelection();

					if (!$isRangeSelection(selection)) {
						return;
					}

					const anchor = selection.anchor;
					const anchorNode = anchor.getNode();

					if (!$isTextNode(anchorNode)) {
						return;
					}

					// Build text before cursor from all text children of the paragraph
					// (same approach as the update listener to handle split text nodes)
					const parentNode = anchorNode.getParent();
					if (!parentNode) return;

					let textBeforeCursor = "";
					const children = parentNode.getChildren();
					for (const child of children) {
						if (child === anchorNode) {
							textBeforeCursor += anchorNode
								.getTextContent()
								.slice(0, anchor.offset);
							break;
						} else if ($isTextNode(child)) {
							textBeforeCursor += child.getTextContent();
						} else {
							// Non-text node — reset
							textBeforeCursor = "";
						}
					}

					const match = checkForMentionMatch(textBeforeCursor);

					if (!match) {
						return;
					}

					// Find the @ position — we need to delete from @ to cursor
					const atIndex = textBeforeCursor.lastIndexOf("@");
					const deleteFrom = atIndex;
					const deleteCount = textBeforeCursor.length - deleteFrom;

					// Use Lexical's selection API to select and delete the mention text
					// Move anchor back by deleteCount characters, then delete selection
					const focusOffset = anchor.offset;
					const anchorText = anchorNode.getTextContent();

					// If the entire mention text is within the anchor node
					if (deleteCount <= focusOffset) {
						const startOffset = focusOffset - deleteCount;

						// Create mention node
						const mentionNode = $createMentionNode(
							member.id,
							`${member.display_first_name} ${member.display_last_name}`,
							member.email
						);

						// Split and replace
						if (startOffset === 0 && focusOffset === anchorText.length) {
							// Replace entire node
							anchorNode.replace(mentionNode);
						} else if (startOffset === 0) {
							// Replace from start
							const [targetNode] = anchorNode.splitText(focusOffset);
							targetNode.replace(mentionNode);
						} else {
							const parts = anchorNode.splitText(startOffset, focusOffset);
							const targetNode = parts[1];
							targetNode.replace(mentionNode);
						}

						// Add space after mention and position cursor
						const spaceNode = new TextNode(" ");
						mentionNode.insertAfter(spaceNode);
						spaceNode.select(1, 1);
					} else {
						// Mention text spans multiple nodes — use a simpler approach:
						// Delete backward from cursor by deleteCount chars, then insert mention
						// We'll reconstruct by removing nodes and inserting fresh

						// Collect nodes to remove (from the @ onwards)
						let charsToRemove = deleteCount;
						const nodesToProcess: Array<{
							node: TextNode;
							removeChars: number;
							fromEnd: boolean;
						}> = [];

						// Walk backwards through textNodesBefore
						const textNodes: TextNode[] = [];
						for (const child of children) {
							if (child === anchorNode) {
								textNodes.push(anchorNode);
								break;
							} else if ($isTextNode(child)) {
								textNodes.push(child as TextNode);
							} else {
								textNodes.length = 0;
							}
						}

						// Process from the anchor node backwards
						for (
							let i = textNodes.length - 1;
							i >= 0 && charsToRemove > 0;
							i--
						) {
							const node = textNodes[i];
							const nodeLen =
								node === anchorNode
									? focusOffset
									: node.getTextContent().length;
							const removeFromThis = Math.min(charsToRemove, nodeLen);
							nodesToProcess.unshift({
								node,
								removeChars: removeFromThis,
								fromEnd: true,
							});
							charsToRemove -= removeFromThis;
						}

						// Create mention node
						const mentionNode = $createMentionNode(
							member.id,
							`${member.display_first_name} ${member.display_last_name}`,
							member.email
						);

						// Process: trim or remove each affected node
						let mentionInserted = false;
						for (const { node, removeChars } of nodesToProcess) {
							const fullText = node.getTextContent();
							const nodeLen =
								node === anchorNode ? focusOffset : fullText.length;

							if (removeChars >= nodeLen) {
								// Remove entire node (or the part before cursor)
								if (node === anchorNode && focusOffset < fullText.length) {
									// Keep text after cursor
									const afterText = fullText.slice(focusOffset);
									node.setTextContent(afterText);
									if (!mentionInserted) {
										node.insertBefore(mentionNode);
										mentionInserted = true;
									}
								} else {
									if (!mentionInserted) {
										node.replace(mentionNode);
										mentionInserted = true;
									} else {
										node.remove();
									}
								}
							} else {
								// Partial removal — keep the beginning
								const keepLen = nodeLen - removeChars;
								node.setTextContent(fullText.slice(0, keepLen));
								if (!mentionInserted) {
									node.insertAfter(mentionNode);
									mentionInserted = true;
								}
							}
						}

						// Add space after mention and position cursor
						const spaceNode = new TextNode(" ");
						mentionNode.insertAfter(spaceNode);
						spaceNode.select(1, 1);
					}
				},
				{ discrete: true }
			); // Make update synchronous

			// Only close dropdown if requested (mouse clicks close immediately, keyboard waits)
			if (shouldCloseDropdown) {
				setQueryString(null);
			}

			setIsInserting(false);
		},
		[editor, checkForMentionMatch, isInserting]
	);

	// Handle keyboard navigation
	useEffect(() => {
		if (!showDropdown) return;

		const handleArrowDown = (event: KeyboardEvent | null) => {
			// Prevent default to stop cursor movement in editor
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			setSelectedIndex((prev) =>
				prev < filteredUsers.length - 1 ? prev + 1 : prev
			);
			return true;
		};

		const handleArrowUp = (event: KeyboardEvent | null) => {
			// Prevent default to stop cursor movement in editor
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
			return true;
		};

		const handleEnter = (event: KeyboardEvent | null) => {
			if (filteredUsers[selectedIndex]) {
				// CRITICAL: Prevent default Enter behaviour to stop paragraph creation
				if (event) {
					event.preventDefault();
					event.stopPropagation();
				}

				// Insert the mention
				insertMention(filteredUsers[selectedIndex], false);

				// Close dropdown after a microtask to ensure handlers have run
				queueMicrotask(() => {
					setQueryString(null);
				});

				// Returning true stops Lexical from processing Enter further
				return true;
			}
			return false;
		};

		// Also intercept INSERT_PARAGRAPH_COMMAND to prevent paragraph creation
		const handleInsertParagraph = () => {
			// Return true to prevent paragraph insertion when dropdown is open
			return true;
		};

		const handleTab = (event: KeyboardEvent | null) => {
			// Prevent default Tab behaviour (focus change)
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			// Tab navigates dropdown: Shift+Tab goes up, Tab goes down
			if (event?.shiftKey) {
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
			} else {
				setSelectedIndex((prev) =>
					prev < filteredUsers.length - 1 ? prev + 1 : prev
				);
			}

			return true;
		};

		const handleEscape = () => {
			setQueryString(null);
			return true;
		};

		const unregisterArrowDown = editor.registerCommand(
			KEY_ARROW_DOWN_COMMAND,
			handleArrowDown,
			COMMAND_PRIORITY_HIGH
		);

		const unregisterArrowUp = editor.registerCommand(
			KEY_ARROW_UP_COMMAND,
			handleArrowUp,
			COMMAND_PRIORITY_HIGH
		);

		const unregisterEnter = editor.registerCommand(
			KEY_ENTER_COMMAND,
			handleEnter,
			COMMAND_PRIORITY_HIGH
		);

		const unregisterInsertParagraph = editor.registerCommand(
			INSERT_PARAGRAPH_COMMAND,
			handleInsertParagraph,
			COMMAND_PRIORITY_EDITOR
		);

		const unregisterTab = editor.registerCommand(
			KEY_TAB_COMMAND,
			handleTab,
			COMMAND_PRIORITY_HIGH
		);

		const unregisterEscape = editor.registerCommand(
			KEY_ESCAPE_COMMAND,
			handleEscape,
			COMMAND_PRIORITY_HIGH
		);

		return () => {
			unregisterArrowDown();
			unregisterArrowUp();
			unregisterEnter();
			unregisterInsertParagraph();
			unregisterTab();
			unregisterEscape();
		};
	}, [editor, filteredUsers, selectedIndex, insertMention, showDropdown]);

	// Monitor text changes for @ mentions
	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const selection = $getSelection();

				if (!$isRangeSelection(selection)) {
					setQueryString(null);
					setMentionAnchorOffset(null);
					return;
				}

				const anchor = selection.anchor;
				const anchorNode = anchor.getNode();

				if (!$isTextNode(anchorNode)) {
					setQueryString(null);
					setMentionAnchorOffset(null);
					return;
				}

				// Get the full text content of the paragraph (parent) node
				// This avoids issues with Lexical splitting text nodes at spaces
				const parentNode = anchorNode.getParent();
				if (!parentNode) {
					setQueryString(null);
					setMentionAnchorOffset(null);
					return;
				}

				// Build text before cursor from all text children of the paragraph
				let textBeforeCursor = "";
				const children = parentNode.getChildren();
				for (const child of children) {
					if (child === anchorNode) {
						// Add text up to cursor position in the anchor node
						textBeforeCursor += anchorNode
							.getTextContent()
							.slice(0, anchor.offset);
						break;
					} else if ($isTextNode(child)) {
						textBeforeCursor += child.getTextContent();
					} else {
						// Non-text node (e.g. existing mention) — reset, start fresh after it
						textBeforeCursor = "";
					}
				}

				const match = checkForMentionMatch(textBeforeCursor);

				if (match) {
					setQueryString(match.matchingString);
					if (mentionAnchorOffset === null) {
						setMentionAnchorOffset(match.leadOffset);
					}

					// Calculate dropdown position
					const domSelection = window.getSelection();
					if (domSelection && domSelection.rangeCount > 0) {
						const range = domSelection.getRangeAt(0);
						const rect = range.getBoundingClientRect();

						setDropdownPosition({
							top: rect.bottom + window.scrollY + 4,
							left: rect.left + window.scrollX,
						});
					}
				} else {
					setQueryString(null);
					setMentionAnchorOffset(null);
				}
			});
		});
	}, [editor, checkForMentionMatch, mentionAnchorOffset]);

	return showDropdown
		? createPortal(
				<MentionDropdown
					members={filteredUsers}
					selectedIndex={selectedIndex}
					onSelect={insertMention}
					onHover={setSelectedIndex}
					position={dropdownPosition}
				/>,
				document.body
			)
		: null;
};

// =========================================== INTERNAL COMPONENTS ====================================================

interface MentionDropdownProps {
	members: IUserData[];
	selectedIndex: number;
	onSelect: (member: IUserData) => void;
	onHover: (index: number) => void;
	position: { top: number; left: number };
}

/**
 * MentionDropdown Component
 *
 * Dropdown showing filtered mentionable users for @mention autocomplete.
 * Supports keyboard navigation and mouse interaction.
 */
const MentionDropdown = ({
	members,
	selectedIndex,
	onSelect,
	onHover,
	position,
}: MentionDropdownProps) => {
	return (
		<div
			className="fixed z-[9999] min-w-[280px] max-w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden"
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
			}}
		>
			<div className="max-h-[300px] overflow-y-auto">
				{members.length === 0 ? (
					<div className="p-3 text-sm text-muted-foreground text-center">
						No mentionable users found
					</div>
				) : (
					members.map((member, index) => (
						<button
							key={member.id}
							type="button"
							className={cn(
								"w-full text-left p-3 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0",
								"hover:bg-gray-100 dark:hover:bg-gray-700",
								index === selectedIndex &&
									"bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
							)}
							onClick={() => {
								onSelect(member);
							}}
							onMouseEnter={() => onHover(index)}
							onKeyDown={(e) => {
								// Prevent button's default Enter/Space behaviour
								// since we handle it in the Lexical command handler
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
								}
							}}
						>
							<div className="flex items-center gap-3">
								{/* Avatar */}
								{member.image ? (
									<img
										src={getImageUrl(member.image)}
										alt=""
										className="size-8 rounded-full object-cover"
									/>
								) : (
									<div className="size-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
										<span className="text-xs font-medium text-gray-600 dark:text-gray-300">
											{member.display_first_name?.[0] || ""}
											{member.display_last_name?.[0] || ""}
										</span>
									</div>
								)}

								{/* User Info */}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
										{member.display_first_name} {member.display_last_name}
									</p>
									{member.title && (
										<p className="text-xs text-muted-foreground truncate">
											{member.title}
										</p>
									)}
								</div>
							</div>
						</button>
					))
				)}
			</div>
		</div>
	);
};
