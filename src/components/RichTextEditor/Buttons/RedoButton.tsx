// A button to redo changes made to the editor state

import { FaRedo } from "react-icons/fa";
import { BaseToolbarButton } from "./BaseToolbarButton";

interface Props {
  disabled?: boolean;
  onClick: (event: string) => void;
}

export const RedoButton = ({ disabled, onClick }: Props) => {
  const eventType = "formatRedo";

  return (
    <BaseToolbarButton
      disabled={disabled}
      onClick={() => {
        onClick(eventType);
      }}
    >
      <FaRedo />
    </BaseToolbarButton>
  );
};
