// A button to control whether the editor is shown or the actual text of the editor, once saved.

import { AiFillEdit, AiFillEyeInvisible } from "react-icons/ai";
import { BaseToggleOptionsButton } from "./BaseToggleOptionsButton";

interface Props {
  setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editorIsOpen: boolean;
}

export const HideEditorButton = ({ editorIsOpen, setIsEditorOpen }: Props) => {
  return (
    <div>
      <BaseToggleOptionsButton
        iconOne={AiFillEdit}
        colorSchemeOne="green"
        iconTwo={AiFillEyeInvisible}
        colorSchemeTwo="blue"
        currentState={editorIsOpen}
        setCurrentState={setIsEditorOpen}
        toolTipText={!editorIsOpen ? "Show Editor" : "Hide Editor"}
        editorIsOpen={editorIsOpen}
      />
    </div>
  );
};
