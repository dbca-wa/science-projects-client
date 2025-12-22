// WIP Button to download the html, markdown or json of the content in the editor.

import { TbBinaryTree } from "react-icons/tb";

import { BaseToggleOptionsButton } from "./BaseToggleOptionsButton";

interface TreeButtonProps {
  shouldShowTree: boolean;
  setShouldShowTree: React.Dispatch<React.SetStateAction<boolean>>;
  editorText: string;
  rawHTML: string;
}

export const TreeButton = ({
  shouldShowTree,
  setShouldShowTree,
}: TreeButtonProps) => {
  return (
    <div>
      <BaseToggleOptionsButton
        iconOne={TbBinaryTree}
        iconTwo={TbBinaryTree}
        colorSchemeOne={"yellow"}
        colorSchemeTwo={"orange"}
        currentState={shouldShowTree}
        setCurrentState={setShouldShowTree}
        toolTipText={!shouldShowTree ? "Show Tree" : "Hide Tree"}
      />
    </div>
  );
};
