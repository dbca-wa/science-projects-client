// A template for a RTE options bar - props fill out its icon and functionality

import { Button, Icon, useColorMode } from "@chakra-ui/react";
import { IconType } from "react-icons";

import "@/styles/texteditor.css";
import { useEditorContext } from "@/shared/hooks/helper/EditorBlockerContext";

interface BaseOptionsButtonProps {
  colorScheme?: string;
  icon: IconType;
  onClick: () => void;
  toolTipText: string;
  canRunFunction: boolean;
  isLoading?: boolean; // New optional prop for loading state
}

export const BaseOptionsButton = ({
  colorScheme = "blue", // Provide default value
  icon: buttonIcon,
  onClick,
  toolTipText,
  canRunFunction,
  isLoading = false, // Default to false for backward compatibility
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
        data-tip="Click to Save"
        isDisabled={!canRunFunction || isLoading} // Disable when loading
        isLoading={isLoading} // Add loading state
        p={0}
        m={0}
        maxW={{ base: "35px", lg: "35px" }}
        maxH={{ base: "40px", lg: "40px" }}
      >
        {/* Only show icon when not loading */}
        {!isLoading && (
          <Icon
            as={buttonIcon}
            boxSize={{
              base: 5,
              lg: 6,
            }}
            w={{ base: "20px", lg: "20px" }}
            h={{ base: "20px", lg: "20px" }}
          />
        )}
      </Button>
      <span className="tooltip-text">{toolTipText}</span>
    </div>
  );
};
