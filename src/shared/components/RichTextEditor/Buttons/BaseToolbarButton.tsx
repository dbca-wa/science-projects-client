// A template for a RTE simple button - props fill out its icon, text and functionality

import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";
import { ReactNode } from "react";

interface IBaseToolbarButtonProps {
  children: ReactNode;
  disabled?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const BaseToolbarButton = ({
  children,
  disabled,
  isActive,
  onClick,
}: IBaseToolbarButtonProps) => {
  const { colorMode } = useColorMode();
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      className={
        isActive ? (colorMode === "light" ? "bg-gray-200" : "bg-gray-700") : ""
      }
      onClick={onClick}
      tabIndex={-1}
    >
      {children}
    </Button>
  );
};
