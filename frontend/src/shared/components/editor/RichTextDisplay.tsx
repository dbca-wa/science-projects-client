/**
 * RichTextDisplay Component
 * 
 * Read-only component for displaying formatted rich text content.
 * Renders HTML content with proper formatting without editing capabilities.
 */

import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';

import type { RichTextDisplayProps } from '@/shared/types/editor.types';
import { editorTheme } from './theme';
import { PrepopulateHTMLPlugin } from './plugins/PrepopulateHTMLPlugin';
import '@/shared/styles/editor.css';

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '' 
}) => {
  const handleError = (error: Error) => {
    console.error('[RichTextDisplay] Lexical error:', error);
  };

  const initialConfig = {
    namespace: 'RichTextDisplay',
    editable: false,
    theme: editorTheme,
    onError: handleError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
    ],
  };

  // If no content, return null
  if (!content) {
    return null;
  }

  return (
    <div className={`editor-readonly ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="editor-input p-0 min-h-0" />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <PrepopulateHTMLPlugin html={content} />
      </LexicalComposer>
    </div>
  );
};
