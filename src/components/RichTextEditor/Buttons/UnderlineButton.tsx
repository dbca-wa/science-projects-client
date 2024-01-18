// A button for underlining text

import { FaUnderline } from "react-icons/fa";
import { BaseToolbarButton } from "./BaseToolbarButton";
import { useState } from "react";
import { IToolbarButton } from "../../../types";

export const UnderlineButton = ({ onClick }: IToolbarButton) => {
  const [isActive, setIsActive] = useState(false);

  const underlineStateVisuals = () => {
    setIsActive(!isActive);
  };
  const eventType = "formatUnderline";

  return (
    <BaseToolbarButton
      isActive={isActive}
      onClick={() => {
        onClick(eventType);
        underlineStateVisuals();
      }}
    >
      <FaUnderline />
    </BaseToolbarButton>
  );
};
