/**
 * LinkClickPlugin
 *
 * Intercepts clicks on link nodes in the editor and opens the
 * inline link editing panel directly, skipping the need to click
 * the toolbar link button separately.
 */

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $isLinkNode, $isAutoLinkNode } from "@lexical/link";
import { useLinkEditor } from "../toolbar/link-editor.utils";

export function LinkClickPlugin() {
	const [editor] = useLexicalComposerContext();
	const linkEditor = useLinkEditor();

	useEffect(() => {
		if (!linkEditor) return;

		const rootElement = editor.getRootElement();
		if (!rootElement) return;

		const handleClick = (e: MouseEvent) => {
			// Only handle if editor is editable
			if (!editor.isEditable()) return;

			// Check if the click target is a link or inside a link
			const target = e.target as HTMLElement;
			const anchor = target.closest("a");
			if (!anchor || !rootElement.contains(anchor)) return;

			// Prevent the default link navigation
			e.preventDefault();

			// Read the editor state to get the link node and selection
			editor.getEditorState().read(() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return;

				const node = selection.anchor.getNode();
				const parent = node.getParent();

				let linkNode = null;
				if ($isLinkNode(node) || $isAutoLinkNode(node)) {
					linkNode = node;
				} else if (parent && ($isLinkNode(parent) || $isAutoLinkNode(parent))) {
					linkNode = parent;
				}

				if (linkNode) {
					const clonedSelection = selection.clone();
					linkEditor.openLinkEditor({
						url: linkNode.getURL(),
						hasSelection: true,
						isEditing: true,
						selection: clonedSelection,
						linkNodeKey: linkNode.getKey(),
					});
				}
			});
		};

		rootElement.addEventListener("click", handleClick);
		return () => rootElement.removeEventListener("click", handleClick);
	}, [editor, linkEditor]);

	return null;
}
