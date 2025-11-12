// A button to bold or unbold text nodes

import { useState } from "react";
import { FaBold } from "react-icons/fa";
import type { IToolbarButton } from "@/shared/types/index.d";
import { BaseToolbarButton } from "./BaseToolbarButton";

export const BoldButton = ({ onClick, buttonIsOn }: IToolbarButton) => {
  const [isActive, setIsActive] = useState(buttonIsOn);
  const boldStateVisuals = () => {
    setIsActive(!isActive);
  };
  const eventType = "formatBold";

  return (
    <BaseToolbarButton
      isActive={isActive}
      onClick={() => {
        boldStateVisuals();
        onClick(eventType);
      }}
    >
      <FaBold />
    </BaseToolbarButton>
  );
};
