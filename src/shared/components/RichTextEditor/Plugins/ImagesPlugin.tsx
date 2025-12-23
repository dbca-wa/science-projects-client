// ImagesPlugin.tsx - Corrected implementation
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from "lexical";
import { useEffect } from "react";
import { $createImageNode, ImageNode, type ImagePayload } from "../Nodes/ImageNode";

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

export function ImagePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Don't try to modify editor._nodes directly
    // Instead, register the node before creating the editor
    // If the node is not registered, show an error
    if (!editor.hasNodes([ImageNode])) {
      console.error(
        "ImagePlugin: ImageNode not registered. Make sure to include ImageNode in your editor's initialConfig nodes array.",
      );
    }

    // Register the command to insert images
    return editor.registerCommand<InsertImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        try {
          // Create the image node
          const imageNode = $createImageNode(payload);

          // Insert the node
          $insertNodes([imageNode]);

          // Wrap in paragraph if needed
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }

          return true;
        } catch (error) {
          console.error("Error inserting image:", error);
          return false;
        }
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
