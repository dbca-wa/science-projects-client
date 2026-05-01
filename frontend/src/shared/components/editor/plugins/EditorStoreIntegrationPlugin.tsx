/**
 * EditorStoreIntegrationPlugin
 *
 * Connects a Lexical editor instance to the shared EditorStore for toolbar state.
 *
 * Each editor gets a unique key. On focus, it re-registers as the active editor
 * so the toolbar always operates on — and highlights for — the focused editor only.
 */

import { useEffect, useId } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FOCUS_COMMAND, COMMAND_PRIORITY_LOW } from "lexical";
import { observer } from "mobx-react";
import { useEditorStore } from "@/app/stores/store-context";

interface EditorStoreIntegrationPluginProps {
	/** Optional explicit key — if not provided, a unique ID is generated */
	editorKey?: string;
}

export const EditorStoreIntegrationPlugin = observer(
	({ editorKey }: EditorStoreIntegrationPluginProps) => {
		const [editor] = useLexicalComposerContext();
		const editorStore = useEditorStore();
		const autoKey = useId();
		const key = editorKey ?? autoKey;

		useEffect(() => {
			if (!editor) return;

			// Register this editor on mount
			editorStore.initLexicalEditor(editor, key);

			// Re-register on focus so the toolbar targets the focused editor
			const removeFocusListener = editor.registerCommand(
				FOCUS_COMMAND,
				() => {
					editorStore.initLexicalEditor(editor, key);
					return false;
				},
				COMMAND_PRIORITY_LOW
			);

			return () => {
				removeFocusListener();
			};
		}, [editor, editorStore, key]);

		return null;
	}
);
