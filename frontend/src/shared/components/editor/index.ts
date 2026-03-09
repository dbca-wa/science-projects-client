/**
 * Rich Text Editor Component Exports
 *
 * Barrel file for exporting all editor-related components and types.
 */

// Main components
export { RichTextEditor } from "./RichTextEditor";
export { RichTextDisplay } from "./RichTextDisplay";
export { FormRichTextEditor } from "./FormRichTextEditor";
export { InlineSaveEditor } from "./InlineSaveEditor";
export { WordCounter } from "./WordCounter";
export { FormUnsavedChangesDialog } from "./FormUnsavedChangesDialog";

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
} from "@/shared/types/editor.types";

export type { FormRichTextEditorProps } from "./FormRichTextEditor";
export type { InlineSaveEditorProps } from "./InlineSaveEditor";
export type { WordCounterProps } from "./WordCounter";

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
export { editorTheme } from "./theme";
