import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import {
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { mergeRegister } from "@lexical/utils";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

/**
 * CommentToolbar Component
 *
 * Minimal toolbar for comment formatting.
 * Provides buttons for bold, italic, and list formatting.
 *
 * Keyboard Shortcuts:
 * - Bold: Ctrl+B / Cmd+B
 * - Italic: Ctrl+I / Cmd+I
 * - Lists: Click buttons
 */
export const CommentToolbar = () => {
	const [editor] = useLexicalComposerContext();
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);

	// Update toolbar state based on selection
	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			setIsBold(selection.hasFormat("bold"));
			setIsItalic(selection.hasFormat("italic"));
		}
	}, []);

	// Subscribe to editor updates
	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateToolbar();
				});
			})
		);
	}, [editor, updateToolbar]);

	// Format commands
	const formatBold = () => {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
	};

	const formatItalic = () => {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
	};

	const insertBulletList = () => {
		editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
	};

	const insertNumberedList = () => {
		editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
	};

	return (
		<div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
			{/* Bold Button */}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={formatBold}
				className={cn("size-8 p-0", isBold && "bg-gray-100 dark:bg-gray-700")}
				aria-label="Bold (Ctrl+B)"
				title="Bold (Ctrl+B)"
			>
				<Bold className="size-4" />
			</Button>

			{/* Italic Button */}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={formatItalic}
				className={cn("size-8 p-0", isItalic && "bg-gray-100 dark:bg-gray-700")}
				aria-label="Italic (Ctrl+I)"
				title="Italic (Ctrl+I)"
			>
				<Italic className="size-4" />
			</Button>

			{/* Divider */}
			<div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

			{/* Bullet List Button */}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={insertBulletList}
				className="size-8 p-0"
				aria-label="Bullet list"
				title="Bullet list"
			>
				<List className="size-4" />
			</Button>

			{/* Numbered List Button */}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={insertNumberedList}
				className="size-8 p-0"
				aria-label="Numbered list"
				title="Numbered list"
			>
				<ListOrdered className="size-4" />
			</Button>
		</div>
	);
};
