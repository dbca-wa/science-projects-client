/**
 * TabIndentationPlugin
 * 
 * Handles Tab and Shift+Tab for indentation/outdentation, and Escape to blur.
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND, KEY_TAB_COMMAND, KEY_ESCAPE_COMMAND } from 'lexical';

export const TabIndentationPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Handle Tab and Shift+Tab
    const unregisterTab = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event: KeyboardEvent) => {
        event.preventDefault();
        
        if (event.shiftKey) {
          return editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        } else {
          return editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }
      },
      1
    );

    // Handle Escape to blur editor
    const unregisterEscape = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        const rootElement = editor.getRootElement();
        if (rootElement) {
          rootElement.blur();
        }
        return true;
      },
      1
    );

    return () => {
      unregisterTab();
      unregisterEscape();
    };
  }, [editor]);

  return null;
};
