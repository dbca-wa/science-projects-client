// A template for a RTE simple button - props fill out its icon, text and functionality

import { Box, Button, Text, useColorMode } from "@chakra-ui/react";
import { ReactNode } from "react";
import "./staffprofileeditor.css";

interface IBaseToolbarButtonProps {
  ariaLabel: string;
  variant?: string;

  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export const ToolbarButton = ({
  children,
  ariaLabel,
  isDisabled,
  variant,
  isActive,
  onClick,
}: IBaseToolbarButtonProps) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      // pos={"relative"}
      // display={"inline-block"}
      className="tooltip-container"
    >
      <Button
        size={"sm"}
        aria-label={ariaLabel}
        variant={variant ? variant : "ghost"}
        isDisabled={isDisabled}
        bg={
          isActive
            ? colorMode === "light"
              ? "gray.200"
              : "gray.700"
            : undefined
        }
        onClick={onClick}
        tabIndex={-1}
        border={0}
        display={"flex"}
      >
        {children}
      </Button>
      {ariaLabel && <Text className="tooltip-text">{ariaLabel}</Text>}
    </Box>
  );
};