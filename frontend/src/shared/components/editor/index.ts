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

// Theme
export { editorTheme } from "./theme";
