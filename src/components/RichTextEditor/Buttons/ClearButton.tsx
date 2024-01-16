// A button to clear the rich text editor of all information

import { FaTrashAlt } from "react-icons/fa";
import { BaseOptionsButton } from "./BaseOptionsButton";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_EDITOR_COMMAND } from "lexical";

interface Props {
  canClear: boolean;
}

export const ClearButton = ({ canClear }: Props) => {
  const [editor] = useLexicalComposerContext();

  const clearEditor = () => {
    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    editor.focus();
  };
  return (
    <BaseOptionsButton
      canRunFunction={canClear}
      icon={FaTrashAlt}
      colorScheme={"red"}
      onClick={clearEditor}
      toolTipText="Clear"
    />
  );
};
