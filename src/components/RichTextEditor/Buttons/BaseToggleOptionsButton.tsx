// A template for a RTE toggalable button - props fill out its icons, colorSchemes, states and functionality

import { Button, Icon, useColorMode } from "@chakra-ui/react";
import { IconType } from "react-icons";
import "../../../styles/texteditor.css";
import { useEditorContext } from "@/lib/hooks/helper/EditorBlockerContext";
import { useEffect } from "react";

interface BaseToggleOptionsButtonProps {
  colorSchemeOne?: string;
  colorSchemeTwo?: string;
  iconOne: IconType;
  iconTwo: IconType;
  currentState: boolean;
  setCurrentState: (state: boolean) => void;
  toolTipText?: string;
  editorIsOpen?: boolean;
}

export const BaseToggleOptionsButton = ({
  colorSchemeOne,
  colorSchemeTwo,
  iconOne: IconOne,
  iconTwo: IconTwo,
  currentState,
  setCurrentState,
  toolTipText,
}: BaseToggleOptionsButtonProps) => {
  const { openEditor, closeEditor } = useEditorContext();

  // useEffect(() => {
  //   // Return a cleanup function that will call closeEditor when the component unmounts
  //   return () => {
  //     if (toolTipText === "Hide Editor") {
  //       closeEditor();
  //     }
  //   };
  // }, [toolTipText, closeEditor]);

  const handleClick = () => {
    if (toolTipText === "Hide Editor" || toolTipText === "Show Editor") {
      if (currentState) {
        // hide editor
        console.log("1");
        closeEditor();
      } else {
        // show editor
        console.log("2");

        openEditor();
      }
    }

    setCurrentState(!currentState);
  };

  const { colorMode } = useColorMode();

  return (
    <div className="tooltip-container">
      <Button
        bg={
          colorMode === "light"
            ? colorSchemeOne && colorSchemeTwo
              ? currentState === false
                ? `${colorSchemeOne}.500`
                : `${colorSchemeTwo}.500`
              : `${colorSchemeOne}.500` // For if colorSchemeTwo not provided
            : colorSchemeOne && colorSchemeTwo // For dark mode
              ? currentState === false
                ? `${colorSchemeOne}.600`
                : `${colorSchemeTwo}.600`
              : "gray.500" //default for if colorSchemeTwo not provided in dark mode
        }
        color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.800"}
        _hover={
          colorMode === "light"
            ? {
                color: "white",
                bg:
                  colorSchemeOne && colorSchemeTwo
                    ? currentState === false
                      ? `${colorSchemeOne}.600`
                      : `${colorSchemeTwo}.600`
                    : "gray.500", //default for if colorSchemeTwo not provided in dark mode
              }
            : {
                // For dark mode
                color: "white",
                bg:
                  colorSchemeOne && colorSchemeTwo
                    ? currentState === false
                      ? `${colorSchemeOne}.500`
                      : `${colorSchemeTwo}.500`
                    : "gray.500", //default for if colorSchemeTwo not provided in dark mode
              }
        }
        onClick={handleClick}
        rounded={"full"}
        w={"35px"}
        h={"40px"}
      >
        {currentState === false ? (
          <Icon
            as={IconOne}
            boxSize={{
              base: 5,
              lg: 6,
            }}
            w={{ base: "20px", lg: "20px" }}
            h={{ base: "20px", lg: "20px" }}
          />
        ) : (
          <Icon
            as={IconTwo}
            boxSize={{
              base: 5,
              lg: 6,
            }}
            w={{ base: "20px", lg: "20px" }}
            h={{ base: "20px", lg: "20px" }}
          />
        )}
      </Button>
      {toolTipText && <span className="tooltip-text">{toolTipText}</span>}
    </div>
  );
};
