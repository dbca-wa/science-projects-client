import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

interface DataDisplayProps {
  setDisplayData: React.Dispatch<React.SetStateAction<string>>;
}

export const DataDisplayPlugin = ({ setDisplayData }: DataDisplayProps) => {
  const [editor, editorState] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const newHtml = $generateHtmlFromNodes(editor, null);

      console.log("DATA DISPLAY PLUGIN:", newHtml);
      setDisplayData(newHtml);
    });
  }, [editorState]);
  return null;
};
