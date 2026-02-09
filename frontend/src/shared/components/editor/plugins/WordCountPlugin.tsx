/**
 * WordCountPlugin
 * 
 * Tracks word count and displays indicator with warnings when approaching limit.
 */

import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import type { WordCountPluginProps } from '@/shared/types/editor.types';

const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

export const WordCountPlugin: React.FC<WordCountPluginProps> = ({ 
  wordLimit, 
  onWordCountChange 
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
  }, [editor, wordLimit]);

  if (!wordLimit) return null;

  const percentage = (wordCount / wordLimit) * 100;
  const isWarning = percentage >= 80 && percentage < 100;
  const isError = percentage >= 100;

  return (
    <div 
      className={`editor-word-count ${isWarning ? 'warning' : ''} ${isError ? 'error' : ''}`}
    >
      {wordCount} / {wordLimit} words
      {isError && ' (limit exceeded)'}
    </div>
  );
};
