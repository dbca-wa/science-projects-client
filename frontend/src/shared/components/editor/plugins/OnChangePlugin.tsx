/**
 * OnChangePlugin
 * 
 * Lexical plugin that tracks content changes and converts editor state to HTML.
 */

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import type { EditorState } from 'lexical';

interface OnChangePluginProps {
  onChange?: (html: string) => void;
}

export const OnChangePlugin: React.FC<OnChangePluginProps> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();
  const initialContent = useRef<string>('');
  const hasStoredInitial = useRef(false);
  const becameEditableOnce = useRef(false);

  useEffect(() => {
    if (!onChange) return;

    return editor.registerUpdateListener(({ editorState, tags }: { editorState: EditorState; tags: Set<string> }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor);
        
        // Store initial content on first update (while non-editable)
        if (!hasStoredInitial.current) {
          initialContent.current = html;
          hasStoredInitial.current = true;
          return;
        }
        
        // If editor is not editable yet, keep updating initial content
        if (!editor.isEditable()) {
          initialContent.current = html;
          return;
        }
        
        // If this is the first time becoming editable, update initial content and skip onChange
        if (tags.has('becoming-editable') || !becameEditableOnce.current) {
          initialContent.current = html;
          becameEditableOnce.current = true;
          return;
        }
        
        // Only call onChange if content actually changed from initial
        if (html !== initialContent.current) {
          onChange(html);
        }
      });
    });
  }, [editor, onChange]);

  return null;
};
