import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
// import { $generateNodesFromDOM, $getRoot, $getList, ListItemNode, ListNode } from "@lexical/html";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $getRoot,
  $getSelection,
  LexicalNode,
  RangeSelection,
  createCommand,
} from "lexical";
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical";
import { useColorMode } from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  editorText: string;
  setEditorText: React.Dispatch<React.SetStateAction<string>>;
}

export const EditorTextInitialStatePlugin = ({
  isOpen,
  editorText,
  setEditorText,
}: Props) => {
  const [editor, editorState] = useLexicalComposerContext();
  const [isFirstPass, setIsFirstPass] = useState(true);
  useEffect(() => {
    if (isFirstPass) {
      editor._editorState.read(() => {
        const root = $getRoot();
        const text = root.__cachedText;
        if (text === null || text === undefined || text === "") {
          // console.log(text)
          // console.log('first pass, is empty, reading again')
          setIsFirstPass(false);
        }
      });
    } else {
      editor._editorState.read(() => {
        const root = $getRoot();
        const text = root.__cachedText;
        if (text === null || text === undefined || text === "") {
          // console.log(text)
          // console.log('second pass and is empty')
        } else {
          setEditorText(root.__cachedText);
          // console.log(root.__cachedText)
        }
      });
    }
  }, [isFirstPass, editor, setEditorText]);
  return null;
};
