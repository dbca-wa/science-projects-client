// A template for a RTE toggalable button - props fill out its icons, colorSchemes, states and functionality

import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";
import { IconType } from "react-icons";
import "@/styles/texteditor.css";
import { useEditorContext } from "@/shared/hooks/EditorBlockerContext";
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
        className={`
          rounded-full w-[35px] h-[40px] text-white
          ${
            colorMode === "light"
              ? colorSchemeOne && colorSchemeTwo
                ? currentState === false
                  ? `bg-${colorSchemeOne}-500 hover:bg-${colorSchemeOne}-600`
                  : `bg-${colorSchemeTwo}-500 hover:bg-${colorSchemeTwo}-600`
                : `bg-${colorSchemeOne}-500 hover:bg-gray-500`
              : colorSchemeOne && colorSchemeTwo
                ? currentState === false
                  ? `bg-${colorSchemeOne}-600 hover:bg-${colorSchemeOne}-500`
                  : `bg-${colorSchemeTwo}-600 hover:bg-${colorSchemeTwo}-500`
                : "bg-gray-500 hover:bg-gray-500"
          }
        `}
        onClick={handleClick}
      >
        {currentState === false ? (
          <IconOne className="w-5 h-5" />
        ) : (
          <IconTwo className="w-5 h-5" />
        )}
      </Button>
      {toolTipText && <span className="tooltip-text">{toolTipText}</span>}
    </div>
  );
};
