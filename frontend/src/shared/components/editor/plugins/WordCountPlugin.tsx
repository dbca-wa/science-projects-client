/**
 * WordCountPlugin
 *
 * Tracks word count internally for validation purposes.
 * Does NOT render UI - use WordCounter component for display.
 */

import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import type { WordCountPluginProps } from "@/shared/types/editor.types";

const countWords = (text: string): number => {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
};

export const WordCountPlugin: React.FC<WordCountPluginProps> = ({
	wordLimit,
	onWordCountChange,
}) => {
	const [editor] = useLexicalComposerContext();
	const [wordCount, setWordCount] = useState(0);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const root = $getRoot();
				const text = root.getTextContent();
				const count = countWords(text);
				setWordCount(count);
				onWordCountChange?.(count);
			});
		});
	}, [editor, onWordCountChange]);

	// Prevent input when limit exceeded
	useEffect(() => {
		if (!wordLimit) return;

		// TODO: Implement input prevention when word limit is exceeded
		// This requires more complex handling with Lexical's node transforms
	}, [editor, wordLimit, wordCount]);

	// No UI rendering - WordCounter component handles display
	return null;
};
