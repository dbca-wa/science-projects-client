import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { $getRoot } from "lexical";

interface Props {
  isOpen: boolean;
  editorText: string;
  setEditorText: React.Dispatch<React.SetStateAction<string>>;
}

export const EditorTextInitialStatePlugin = ({ setEditorText }: Props) => {
  const [editor] = useLexicalComposerContext();
  const [isFirstPass, setIsFirstPass] = useState(true);
  useEffect(() => {
    if (isFirstPass) {
      editor._editorState.read(() => {
        const root = $getRoot();
        const text = root.__cachedText;
        if (text === null || text === undefined || text === "") {
          setIsFirstPass(false);
        }
      });
    } else {
      editor._editorState.read(() => {
        const root = $getRoot();
        const text = root.__cachedText;
        if (text !== null && text !== undefined && text !== "") {
          setEditorText(root.__cachedText);
        }
      });
    }
  }, [isFirstPass, editor, setEditorText]);
  return null;
};
