/**
 * SubscriptSuperscriptPlugin
 * 
 * Ensures mutual exclusivity between subscript and superscript formatting.
 * When one is applied, the other is automatically removed.
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, COMMAND_PRIORITY_HIGH } from 'lexical';

export const SubscriptSuperscriptPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      FORMAT_TEXT_COMMAND,
      (format) => {
        if (format === 'subscript' || format === 'superscript') {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // If applying subscript, remove superscript
            if (format === 'subscript' && selection.hasFormat('superscript')) {
              selection.formatText('superscript');
            }
            // If applying superscript, remove subscript
            else if (format === 'superscript' && selection.hasFormat('subscript')) {
              selection.formatText('subscript');
            }
          }
        }
        return false; // Allow the command to continue
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
};
