/**
 * EditorStoreIntegrationPlugin
 *
 * Connects a Lexical editor instance to the shared EditorStore for toolbar state.
 *
 * Each editor gets a unique key. On focus, it registers as the active editor
 * so the toolbar always operates on — and highlights for — the focused editor only.
 *
 * Editors do NOT register on mount to avoid race conditions when multiple editors
 * are on the same page. Only the focused editor is active.
 *
 * Uses both Lexical FOCUS_COMMAND and DOM focusin to handle editors that start
 * non-editable (EditableOnInteractionPlugin pattern).
 */

import { useEffect, useId } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FOCUS_COMMAND, BLUR_COMMAND, COMMAND_PRIORITY_LOW } from "lexical";
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

			// Only register on mount if no editor is currently active
			// (first editor on the page gets to be active by default)
			if (!editorStore.activeEditorKey) {
				editorStore.initLexicalEditor(editor, key);
			}

			// Register on Lexical FOCUS_COMMAND — fires when editor is already editable
			const removeFocusListener = editor.registerCommand(
				FOCUS_COMMAND,
				() => {
					editorStore.initLexicalEditor(editor, key);
					return false;
				},
				COMMAND_PRIORITY_LOW
			);

			// Also listen on DOM focusin — catches focus when editor starts non-editable
			// (EditableOnInteractionPlugin makes it editable on click/focus, but Lexical's
			// FOCUS_COMMAND may not fire if the editor wasn't editable at the time)
			const rootElement = editor.getRootElement();
			const handleDomFocusIn = () => {
				editorStore.initLexicalEditor(editor, key);
			};
			rootElement?.addEventListener("focusin", handleDomFocusIn);

			// On blur, clear formatting state so the toolbar doesn't show
			// stale state from a previously focused editor
			const removeBlurListener = editor.registerCommand(
				BLUR_COMMAND,
				() => {
					// Only clear if this editor is still the active one
					// (prevents clearing when focus moves to the toolbar buttons)
					setTimeout(() => {
						if (editorStore.activeEditorKey === key) {
							// Check if focus moved to a toolbar button (which has onMouseDown preventDefault)
							const activeEl = document.activeElement;
							const isToolbarButton = activeEl?.closest('[role="toolbar"]');
							if (!isToolbarButton) {
								editorStore.clearFormattingState();
							}
						}
					}, 50);
					return false;
				},
				COMMAND_PRIORITY_LOW
			);

			return () => {
				removeFocusListener();
				removeBlurListener();
				rootElement?.removeEventListener("focusin", handleDomFocusIn);
			};
		}, [editor, editorStore, key]);

		return null;
	}
);
