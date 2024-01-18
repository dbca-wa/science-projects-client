// A template for a RTE simple button - props fill out its icon, text and functionality

import { Button, useColorMode } from "@chakra-ui/react";
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
      variant={"ghost"}
      isDisabled={disabled}
      bg={
        isActive ? (colorMode === "light" ? "gray.200" : "gray.700") : undefined
      }
      onClick={onClick}
      tabIndex={-1}
    >
      {children}
    </Button>
  );
};
