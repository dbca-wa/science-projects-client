/**
 * PrepopulateHTMLPlugin
 * 
 * Lexical plugin that loads initial HTML content into the editor.
 * 
 * Security: All HTML content is sanitised using DOMPurify before rendering
 * to prevent XSS attacks from stored content. This addresses CodeQL/Seer
 * vulnerabilities related to incomplete regex-based sanitisation.
 */

import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';
import { sanitizeRichText } from '@/shared/utils/sanitise.utils';

interface PrepopulateHTMLPluginProps {
  html?: string;
}

export const PrepopulateHTMLPlugin: React.FC<PrepopulateHTMLPluginProps> = ({ html }) => {
  const [editor] = useLexicalComposerContext();
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    if (!html || isInitialized) return;

    try {
      // SECURITY: Sanitise HTML using DOMPurify to prevent XSS attacks
      // This replaces the previous incomplete regex-based sanitisation
      // and addresses all CodeQL/Seer vulnerabilities in this file:
      // - Script tag variations
      // - Event handler attribute variations  
      // - Dangerous URL protocols (javascript:, data:, vbscript:)
      const sanitisedHTML = sanitizeRichText(html);
      
      // Store current scroll position
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      // Get the root element and prevent it from being scrolled into view
      const rootElement = editor.getRootElement();
      if (rootElement) {
        // Temporarily override scrollIntoView to prevent auto-scroll
        const originalScrollIntoView = rootElement.scrollIntoView;
        rootElement.scrollIntoView = () => {};
        
        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(sanitisedHTML, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          
          const root = $getRoot();
          root.clear();
          $insertNodes(nodes);
        }, { 
          discrete: true,
          tag: 'history-merge'
        });
        
        // Restore scroll position immediately after content insertion
        window.scrollTo(scrollX, scrollY);
        
        // Restore scrollIntoView after a delay
        setTimeout(() => {
          rootElement.scrollIntoView = originalScrollIntoView;
        }, 100);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('[PrepopulateHTMLPlugin] Error loading HTML:', error);
    }
  }, [editor, html, isInitialized]);

  return null;
};
