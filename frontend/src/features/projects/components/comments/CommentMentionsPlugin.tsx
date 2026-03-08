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

	// Fetch mentionable users based on search query
	const { data: mentionableUsers = [] } = useProjectMentionableUsers(
		projectId,
		queryString || ""
	);

	// Limit to 3 results
	const filteredUsers = mentionableUsers.slice(0, 3);
	const showDropdown =
		queryString !== null && queryString.length > 0 && filteredUsers.length > 0;

	// Log dropdown state changes
	useEffect(() => {
		console.log("🎯 Dropdown state:", {
			showDropdown,
			queryString,
			filteredUsersCount: filteredUsers.length,
			selectedIndex,
		});
	}, [showDropdown, queryString, filteredUsers.length, selectedIndex]);

	// Reset selected index when query changes (not results)
	useEffect(() => {
		if (queryString !== null) {
			// Use queueMicrotask to avoid synchronous setState in effect
			queueMicrotask(() => setSelectedIndex(0));
		}
	}, [queryString]);

	// Check for @ mention pattern
	const checkForMentionMatch = useCallback(
		(text: string): MentionMatch | null => {
			const mentionMatch = /(?:^|\s)@(\w*)$/.exec(text);

			if (mentionMatch !== null) {
				const matchingString = mentionMatch[1];
				const replaceableString = mentionMatch[0];
				const leadOffset = mentionMatch.index;

				return {
					leadOffset,
					matchingString,
					replaceableString,
				};
			}

			return null;
		},
		[]
	);

	// Insert mention node
	const insertMention = useCallback(
		(member: IUserData, shouldCloseDropdown = true) => {
			console.log(
				"🔵 insertMention called for:",
				member.display_first_name,
				member.display_last_name
			);
			console.log("🔵 shouldCloseDropdown:", shouldCloseDropdown);
			console.log("🔵 isInserting flag:", isInserting);

			// Prevent duplicate insertions
			if (isInserting) {
				console.log("⚠️ Blocked duplicate insertion!");
				return;
			}
			setIsInserting(true);
			console.log("✅ Setting isInserting = true");

			// Use editor.update with discrete: true to make it synchronous
			editor.update(
				() => {
					console.log("📝 Starting editor.update() [SYNCHRONOUS]");
					const selection = $getSelection();

					if (!$isRangeSelection(selection)) {
						console.log("❌ Not a range selection");
						return;
					}

					const anchor = selection.anchor;
					const anchorNode = anchor.getNode();

					if (!$isTextNode(anchorNode)) {
						console.log("❌ Anchor node is not a text node");
						return;
					}

					const textContent = anchorNode.getTextContent();
					console.log("📄 Text content:", textContent);
					console.log("📍 Cursor offset:", anchor.offset);

					const match = checkForMentionMatch(
						textContent.slice(0, anchor.offset)
					);

					if (!match) {
						console.log("❌ No mention match found");
						return;
					}

					console.log("✅ Match found:", match);

					// Calculate position to replace
					const startOffset = match.leadOffset;
					const endOffset = anchor.offset;

					console.log("📍 Replacing from", startOffset, "to", endOffset);

					// Create mention node
					const mentionNode = $createMentionNode(
						member.id,
						`${member.display_first_name} ${member.display_last_name}`,
						member.email
					);

					console.log("✅ Created mention node");

					// Split text node and insert mention
					if (startOffset === 0) {
						console.log("🔄 Replacing entire node");
						anchorNode.replace(mentionNode);
					} else {
						console.log("🔄 Splitting text node");
						const [, targetNode] = anchorNode.splitText(startOffset, endOffset);
						targetNode.replace(mentionNode);
					}

					// Add space after mention and move cursor after the space
					const spaceNode = new TextNode(" ");
					mentionNode.insertAfter(spaceNode);

					// Select the end of the space node to position cursor after it
					const spaceEnd = spaceNode.getTextContentSize();
					spaceNode.select(spaceEnd, spaceEnd);

					console.log("✅ Added space and positioned cursor at end of space");
					console.log("📝 Editor.update() complete [SYNCHRONOUS]");
				},
				{ discrete: true }
			); // Make update synchronous

			// Only close dropdown if requested (mouse clicks close immediately, keyboard waits)
			if (shouldCloseDropdown) {
				console.log("🔒 Closing dropdown immediately (mouse click)");
				setQueryString(null);
			} else {
				console.log(
					"⏸️ NOT closing dropdown yet (keyboard - will close after handlers run)"
				);
			}

			setIsInserting(false);
			console.log("✅ Reset isInserting = false");
		},
		[editor, checkForMentionMatch, isInserting]
	);

	// Handle keyboard navigation
	useEffect(() => {
		if (!showDropdown) return;

		const handleArrowDown = (event: KeyboardEvent | null) => {
			console.log("⬇️ Arrow Down pressed");

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
			console.log("⬆️ Arrow Up pressed");

			// Prevent default to stop cursor movement in editor
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
			return true;
		};

		const handleEnter = (event: KeyboardEvent | null) => {
			console.log("⏎ Enter key pressed in Lexical handler");
			console.log("⏎ Selected index:", selectedIndex);
			console.log("⏎ Selected user:", filteredUsers[selectedIndex]);

			if (filteredUsers[selectedIndex]) {
				console.log(
					"⏎ Calling insertMention from Enter handler (shouldCloseDropdown=false)"
				);

				// CRITICAL: Prevent default Enter behavior to stop paragraph creation
				if (event) {
					console.log("⏎ Preventing default Enter behavior");
					event.preventDefault();
					event.stopPropagation();
				}

				// Insert the mention
				insertMention(filteredUsers[selectedIndex], false);

				// Close dropdown after a microtask to ensure handlers have run
				queueMicrotask(() => {
					console.log("⏎ Microtask: Now closing dropdown");
					setQueryString(null);
				});

				console.log("⏎ Returning true to stop propagation");
				// Returning true stops Lexical from processing Enter further
				return true;
			}
			console.log("⏎ No user selected, returning false");
			return false;
		};

		// Also intercept INSERT_PARAGRAPH_COMMAND to prevent paragraph creation
		const handleInsertParagraph = () => {
			console.log("📄 INSERT_PARAGRAPH_COMMAND intercepted - blocking it");
			// Return true to prevent paragraph insertion when dropdown is open
			return true;
		};

		const handleTab = (event: KeyboardEvent | null) => {
			console.log("⇥ Tab key pressed");

			// Prevent default Tab behavior (focus change)
			if (event) {
				console.log("⇥ Preventing default Tab behavior");
				event.preventDefault();
				event.stopPropagation();
			}

			// Tab navigates dropdown: Shift+Tab goes up, Tab goes down
			if (event?.shiftKey) {
				console.log("⇥ Shift+Tab: Moving selection up");
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
			} else {
				console.log("⇥ Tab: Moving selection down");
				setSelectedIndex((prev) =>
					prev < filteredUsers.length - 1 ? prev + 1 : prev
				);
			}

			return true;
		};

		const handleEscape = () => {
			console.log("⎋ Escape pressed - closing dropdown");
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
					return;
				}

				const anchor = selection.anchor;
				const anchorNode = anchor.getNode();

				if (!$isTextNode(anchorNode)) {
					setQueryString(null);
					return;
				}

				const textContent = anchorNode.getTextContent();
				const textBeforeCursor = textContent.slice(0, anchor.offset);
				const match = checkForMentionMatch(textBeforeCursor);

				if (match) {
					setQueryString(match.matchingString);

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
				}
			});
		});
	}, [editor, checkForMentionMatch]);

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
								console.log(
									"🖱️ Button onClick fired for:",
									member.display_first_name
								);
								onSelect(member);
							}}
							onMouseEnter={() => onHover(index)}
							onKeyDown={(e) => {
								console.log("⌨️ Button onKeyDown:", e.key);
								// Prevent button's default Enter/Space behavior
								// since we handle it in the Lexical command handler
								if (e.key === "Enter" || e.key === " ") {
									console.log("⌨️ Preventing default for", e.key);
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
