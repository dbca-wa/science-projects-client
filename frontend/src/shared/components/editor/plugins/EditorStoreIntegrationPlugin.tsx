/**
 * EditorStoreIntegrationPlugin
 *
 * Connects the Lexical editor instance to the EditorStore for toolbar state management.
 * This plugin initializes the store with the editor instance and handles cleanup.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { observer } from "mobx-react";
import { useEditorStore } from "@/app/stores/store-context";

export const EditorStoreIntegrationPlugin = observer(() => {
	const [editor] = useLexicalComposerContext();
	const editorStore = useEditorStore();

	useEffect(() => {
		if (editor) {
			editorStore.initLexicalEditor(editor);
		}

		return () => {
			// Cleanup is handled by the store's dispose method
			// We don't call it here because the store is shared across all editors
		};
	}, [editor, editorStore]);

	return null;
});
