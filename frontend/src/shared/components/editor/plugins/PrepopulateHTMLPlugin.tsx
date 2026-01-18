/**
 * PrepopulateHTMLPlugin
 * 
 * Lexical plugin that loads initial HTML content into the editor.
 * Sanitizes HTML to prevent XSS attacks.
 */

import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

interface PrepopulateHTMLPluginProps {
  html?: string;
}

// Simple HTML sanitizer - removes script tags and dangerous attributes
const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
};

export const PrepopulateHTMLPlugin: React.FC<PrepopulateHTMLPluginProps> = ({ html }) => {
  const [editor] = useLexicalComposerContext();
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    if (!html || isInitialized) return;

    try {
      const sanitizedHTML = sanitizeHTML(html);
      
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
          const dom = parser.parseFromString(sanitizedHTML, 'text/html');
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
