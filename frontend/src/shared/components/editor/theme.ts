/**
 * Lexical Editor Theme Configuration
 * 
 * Defines CSS classes for different node types in the Lexical editor.
 * These classes are applied to editor content and styled with Tailwind CSS.
 */

import type { EditorThemeClasses } from 'lexical';

export const editorTheme: EditorThemeClasses = {
  // Paragraph styles
  paragraph: 'editor-paragraph mb-2',
  
  // Heading styles
  heading: {
    h1: 'editor-h1 text-3xl font-bold mb-4 mt-6',
    h2: 'editor-h2 text-2xl font-bold mb-3 mt-5',
    h3: 'editor-h3 text-xl font-bold mb-2 mt-4',
  },
  
  // List styles
  list: {
    ul: 'editor-ul',
    ol: 'editor-ol',
    listitem: 'editor-li',
    nested: {
      listitem: 'editor-nested-li',
    },
    ulDepth: ['editor-ul1', 'editor-ul2', 'editor-ul3'],
    olDepth: ['editor-ol1', 'editor-ol2', 'editor-ol3'],
  },
  
  // Text formatting styles
  text: {
    bold: 'editor-bold font-bold',
    italic: 'editor-italic italic',
    underline: 'editor-underline underline',
    strikethrough: 'editor-strikethrough line-through',
    subscript: 'editor-subscript',
    superscript: 'editor-superscript',
    code: 'editor-code font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm',
  },
  
  // Link styles
  link: 'editor-link text-blue-600 dark:text-blue-400 hover:underline cursor-pointer',
  
  // Code block styles
  code: 'editor-code-block bg-gray-100 dark:bg-gray-800 p-4 rounded-md font-mono text-sm mb-2 overflow-x-auto',
  
  // Quote styles
  quote: 'editor-quote border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic mb-2',
};
