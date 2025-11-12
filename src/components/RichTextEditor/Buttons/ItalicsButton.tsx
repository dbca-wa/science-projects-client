// Button for switching between italicised text

import { useState } from "react";
import { FaItalic } from "react-icons/fa";
import { IToolbarButton } from "@/types";
import { BaseToolbarButton } from "./BaseToolbarButton";

export const ItalicsButton = ({ onClick }: IToolbarButton) => {
  const [isActive, setIsActive] = useState(false);

  const italicsStateVisuals = () => {
    setIsActive(!isActive);
  };
  const eventType = "formatItalic";

  return (
    <BaseToolbarButton
      isActive={isActive}
      onClick={() => {
        italicsStateVisuals();
        onClick(eventType);
      }}
    >
      <FaItalic />
    </BaseToolbarButton>
  );
};
