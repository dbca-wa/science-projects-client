/**
 * Rich Text Editor Component Exports
 * 
 * Barrel file for exporting all editor-related components and types.
 */

// Main components
export { RichTextEditor } from './RichTextEditor';
export { RichTextDisplay } from './RichTextDisplay';

// Types
export type {
  RichTextEditorProps,
  RichTextDisplayProps,
  ToolbarMode,
  ToolbarProps,
  FormatButtonProps,
  HeadingSelectProps,
  LinkButtonProps,
  WordCountPluginProps,
  AutoLinkPluginProps,
  TabIndentationPluginProps,
} from '@/shared/types/editor.types';

// Toolbar components (will be implemented in subsequent tasks)
// export { Toolbar } from './toolbar/Toolbar';
// export { FormatButton } from './toolbar/FormatButton';
// export { HeadingSelect } from './toolbar/HeadingSelect';
// export { LinkButton } from './toolbar/LinkButton';

// Plugins (will be implemented in subsequent tasks)
// export { AutoLinkPlugin } from './plugins/AutoLinkPlugin';
// export { TabIndentationPlugin } from './plugins/TabIndentationPlugin';
// export { WordCountPlugin } from './plugins/WordCountPlugin';

// Theme
export { editorTheme } from './theme';
