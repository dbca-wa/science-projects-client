import {
	useState,
	useRef,
	useEffect,
	type KeyboardEvent,
	type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { useProjectTeam } from "@/features/projects/hooks/useProjectTeam";
import type { ITeamMember } from "@/features/projects/types/team.types";

interface MentionInputProps {
	value: string;
	onChange: (value: string) => void;
	onMentionedUsersChange?: (userIds: number[]) => void;
	projectId: number;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	maxLength?: number;
	autoFocus?: boolean;
}

interface MentionMatch {
	startIndex: number;
	searchTerm: string;
}

/**
 * MentionInput Component
 *
 * Textarea with @mention autocomplete functionality.
 * Shows dropdown with up to 3 project team members when user types @ followed by at least one character.
 * Highlights @mentions in the textarea.
 *
 * Mention Format: @FirstName LastName (as per Requirements 8.11)
 * Dropdown Limit: Maximum 3 results (matches user search pattern)
 * Trigger: @ followed by at least 1 character
 *
 * Note: The backend currently expects @username format in mention_utils.py.
 * This needs to be updated to match the @FirstName LastName format specified
 * in the requirements. The backend should extract mentions using the pattern
 * @([A-Za-z]+\s[A-Za-z]+) instead of @([\w.-]+).
 */
export const MentionInput = ({
	value,
	onChange,
	onMentionedUsersChange,
	projectId,
	placeholder = "Write a comment...",
	disabled = false,
	className,
	maxLength = 1500,
	autoFocus = true,
}: MentionInputProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [cursorPosition, setCursorPosition] = useState(0);
	const [mentionMatch, setMentionMatch] = useState<MentionMatch | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

	// Fetch project team members
	const { data: teamMembers = [] } = useProjectTeam(projectId);

	// Filter team members based on search term (max 3 results)
	const filteredMembers = mentionMatch
		? teamMembers
				.filter((member) => {
					const fullName =
						`${member.user.display_first_name} ${member.user.display_last_name}`.toLowerCase();
					const searchTerm = mentionMatch.searchTerm.toLowerCase();
					return fullName.includes(searchTerm);
				})
				.slice(0, 3) // Limit to 3 results like user search
		: [];

	// Show dropdown if we have a mention match with at least 1 character and filtered results
	const showDropdown =
		mentionMatch !== null &&
		mentionMatch.searchTerm.length > 0 &&
		filteredMembers.length > 0;

	// Auto-focus on mount
	useEffect(() => {
		if (autoFocus && textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [autoFocus]);

	// Detect @mention pattern when value or cursor position changes
	const detectMentionPattern = () => {
		const textBeforeCursor = value.substring(0, cursorPosition);
		const lastAtIndex = textBeforeCursor.lastIndexOf("@");

		// Check if we have an @ symbol before cursor
		if (lastAtIndex !== -1) {
			const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

			// Only show dropdown if:
			// 1. There's no space after @
			// 2. The text after @ is not too long (reasonable name length)
			if (!textAfterAt.includes(" ") && textAfterAt.length <= 50) {
				return {
					startIndex: lastAtIndex,
					searchTerm: textAfterAt,
				};
			}
		}

		return null;
	};

	// Update mention match when value or cursor changes
	useEffect(() => {
		const newMatch = detectMentionPattern();
		// eslint-disable-next-line react-hooks/set-state-in-effect -- sync from derived state
		setMentionMatch(newMatch);
		if (newMatch) {
			setSelectedIndex(0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, cursorPosition]);

	// Update dropdown position when mention match changes
	useEffect(() => {
		if (!showDropdown || !textareaRef.current) return;

		const textarea = textareaRef.current;
		const rect = textarea.getBoundingClientRect();

		// Position dropdown below textarea
		setDropdownPosition({
			top: rect.bottom + window.scrollY + 4,
			left: rect.left + window.scrollX,
		});
	}, [showDropdown]);

	// Extract mentioned user IDs from text
	useEffect(() => {
		if (!onMentionedUsersChange) return;

		// Match @mentions in format: @FirstName LastName
		const mentionRegex = /@([A-Za-z]+\s[A-Za-z]+)/g;
		const matches = value.matchAll(mentionRegex);
		const mentionedUserIds: number[] = [];

		for (const match of matches) {
			const fullName = match[1];
			const [firstName, lastName] = fullName.split(" ");

			// Find matching team member
			const member = teamMembers.find(
				(m) =>
					m.user.display_first_name.toLowerCase() === firstName.toLowerCase() &&
					m.user.display_last_name.toLowerCase() === lastName.toLowerCase()
			);

			if (member && !mentionedUserIds.includes(member.user.id)) {
				mentionedUserIds.push(member.user.id);
			}
		}

		onMentionedUsersChange(mentionedUserIds);
	}, [value, teamMembers, onMentionedUsersChange]);

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		const newCursorPosition = e.target.selectionStart;

		setCursorPosition(newCursorPosition);
		onChange(newValue);
	};

	const handleSelect = (e: React.MouseEvent<HTMLTextAreaElement>) => {
		setCursorPosition(e.currentTarget.selectionStart);
	};

	const insertMention = (member: ITeamMember) => {
		if (!mentionMatch) return;

		const mentionText = `@${member.user.display_first_name} ${member.user.display_last_name}`;
		const beforeMention = value.substring(0, mentionMatch.startIndex);
		const afterMention = value.substring(cursorPosition);

		const newValue = beforeMention + mentionText + " " + afterMention;
		const newCursorPosition = beforeMention.length + mentionText.length + 1;

		onChange(newValue);
		setMentionMatch(null);

		// Set cursor position after mention
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(
					newCursorPosition,
					newCursorPosition
				);
				setCursorPosition(newCursorPosition);
			}
		}, 0);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (!showDropdown) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) =>
					prev < filteredMembers.length - 1 ? prev + 1 : prev
				);
				break;

			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
				break;

			case "Enter":
				if (filteredMembers[selectedIndex]) {
					e.preventDefault();
					insertMention(filteredMembers[selectedIndex]);
				}
				break;

			case "Escape":
				e.preventDefault();
				setMentionMatch(null);
				break;

			case "Tab":
				if (filteredMembers[selectedIndex]) {
					e.preventDefault();
					insertMention(filteredMembers[selectedIndex]);
				}
				break;
		}
	};

	return (
		<div className="relative">
			<Textarea
				ref={textareaRef}
				value={value}
				onChange={handleChange}
				onSelect={handleSelect}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				className={cn("min-h-[100px] resize-y", className)}
				maxLength={maxLength}
				aria-label="Comment text with mention support"
				aria-describedby="mention-help"
			/>

			{/* Mention Dropdown */}
			{showDropdown &&
				createPortal(
					<MentionDropdown
						members={filteredMembers}
						selectedIndex={selectedIndex}
						onSelect={insertMention}
						onHover={setSelectedIndex}
						position={dropdownPosition}
					/>,
					document.body
				)}
		</div>
	);
};

// =========================================== INTERNAL COMPONENTS ====================================================

interface MentionDropdownProps {
	members: ITeamMember[];
	selectedIndex: number;
	onSelect: (member: ITeamMember) => void;
	onHover: (index: number) => void;
	position: { top: number; left: number };
}

/**
 * MentionDropdown Component
 *
 * Dropdown showing filtered team members for @mention autocomplete.
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
						No team members found
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
							onClick={() => onSelect(member)}
							onMouseEnter={() => onHover(index)}
						>
							<div className="flex items-center gap-3">
								{/* Avatar */}
								{member.user.avatar ? (
									<img
										src={member.user.avatar}
										alt=""
										className="size-8 rounded-full object-cover"
									/>
								) : (
									<div className="size-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
										<span className="text-xs font-medium text-gray-600 dark:text-gray-300">
											{member.user.display_first_name[0]}
											{member.user.display_last_name[0]}
										</span>
									</div>
								)}

								{/* User Info */}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
										{member.user.display_first_name}{" "}
										{member.user.display_last_name}
									</p>
									<p className="text-xs text-muted-foreground truncate">
										{member.user.position_title}
									</p>
								</div>

								{/* Leader Badge */}
								{member.is_leader && (
									<span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
										Leader
									</span>
								)}
							</div>
						</button>
					))
				)}
			</div>
		</div>
	);
};
