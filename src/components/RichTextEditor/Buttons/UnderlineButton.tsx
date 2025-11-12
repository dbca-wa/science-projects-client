// A button for underlining text

import { useState } from "react";
import { FaUnderline } from "react-icons/fa";
import { IToolbarButton } from "@/types";
import { BaseToolbarButton } from "./BaseToolbarButton";

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
