// A template for a RTE options bar - props fill out its icon and functionality

import { Button, Icon, useColorMode } from "@chakra-ui/react";
import { IconType } from "react-icons";

import "../../../styles/texteditor.css";
import { useEditorContext } from "@/lib/hooks/helper/EditorBlockerContext";

interface BaseOptionsButtonProps {
  colorScheme?: string;
  icon: IconType;
  onClick: () => void;
  toolTipText: string;
  canRunFunction: boolean;
}

export const BaseOptionsButton = ({
  colorScheme,
  icon: buttonIcon,
  onClick,
  toolTipText,
  canRunFunction,
}: BaseOptionsButtonProps) => {
  const { colorMode } = useColorMode();
  const { closeEditor } = useEditorContext();

  const handleClick = () => {
    if (toolTipText === "Save changes") {
      closeEditor();
      onClick();
    } else {
      onClick();
    }
  };

  return (
    <div className="tooltip-container">
      <Button
        bg={colorMode === "light" ? `${colorScheme}.500` : `${colorScheme}.600`}
        color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.800"}
        _hover={
          colorMode === "light"
            ? {
                bg: `${colorScheme}.600`,
                color: `white`,
              }
            : {
                bg: `${colorScheme}.500`,
                color: `white`,
              }
        }
        onClick={handleClick}
        rounded={"full"}
        w={"35px"}
        h={"40px"}
        data-tip="Click to Save"
        isDisabled={!canRunFunction}
      >
        <Icon as={buttonIcon} boxSize={6} />
      </Button>
      <span className="tooltip-text">{toolTipText}</span>
    </div>
  );
};
