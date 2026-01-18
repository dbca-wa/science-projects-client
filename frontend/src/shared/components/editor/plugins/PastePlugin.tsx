/**
 * PastePlugin
 * 
 * Handles paste events from Microsoft Word documents.
 * Converts Word HTML to Lexical nodes while stripping unsupported formatting.
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { PASTE_COMMAND, COMMAND_PRIORITY_HIGH } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { $insertNodes, $getSelection, $isRangeSelection } from 'lexical';

export const PastePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData('text/html');
        if (!html) return false;

        // Check if it's from Word (contains Word-specific metadata)
        const isFromWord = html.includes('urn:schemas-microsoft-com:office:word') || 
                          html.includes('mso-') ||
                          html.includes('MsoNormal');

        if (!isFromWord) return false;

        event.preventDefault();

        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          // Clean Word HTML
          const cleanedHTML = cleanWordHTML(html);

          // Parse cleaned HTML
          const parser = new DOMParser();
          const dom = parser.parseFromString(cleanedHTML, 'text/html');

          // Generate Lexical nodes from DOM
          const nodes = $generateNodesFromDOM(editor, dom);

          // Insert nodes at selection
          $insertNodes(nodes);
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
};

/**
 * Clean Word HTML by removing unsupported formatting
 */
function cleanWordHTML(html: string): string {
  // Remove Word-specific XML namespaces and metadata
  html = html.replace(/<\?xml[^>]*>/g, '');
  html = html.replace(/<\/?o:[^>]*>/g, '');
  html = html.replace(/<\/?w:[^>]*>/g, '');
  html = html.replace(/<\/?m:[^>]*>/g, '');
  html = html.replace(/<\/?v:[^>]*>/g, '');

  // Parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove unsupported elements
  const elementsToRemove = doc.querySelectorAll('style, script, meta, link');
  elementsToRemove.forEach(el => el.remove());

  // Clean all elements
  const allElements = doc.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove Word-specific classes
    const className = el.getAttribute('class') || '';
    if (className.includes('Mso') || className.includes('mso')) {
      el.removeAttribute('class');
    }

    // Remove Word-specific styles
    const style = el.getAttribute('style') || '';
    if (style) {
      // Remove mso-* styles, font-family, font-size, color
      const cleanedStyle = style
        .split(';')
        .filter(s => {
          const prop = s.trim().split(':')[0];
          return prop && 
                 !prop.startsWith('mso-') && 
                 prop !== 'font-family' && 
                 prop !== 'font-size' && 
                 prop !== 'color' &&
                 prop !== 'background' &&
                 prop !== 'background-color';
        })
        .join(';');
      
      if (cleanedStyle) {
        el.setAttribute('style', cleanedStyle);
      } else {
        el.removeAttribute('style');
      }
    }

    // Remove other Word-specific attributes
    const attributesToRemove = ['lang', 'xml:lang'];
    attributesToRemove.forEach(attr => {
      if (el.hasAttribute(attr)) {
        el.removeAttribute(attr);
      }
    });
  });

  return doc.body.innerHTML;
}
