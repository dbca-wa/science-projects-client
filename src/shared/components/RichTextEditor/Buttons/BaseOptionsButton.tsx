// A template for a RTE options bar - props fill out its icon and functionality

import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";
import type { IconType } from "react-icons";
import { Loader2 } from "lucide-react";

import "@/styles/texteditor.css";
import { useEditorContext } from "@/shared/hooks/useEditor";

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

  const getColorSchemeClasses = () => {
    const colorMap = {
      blue: colorMode === "light" ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500",
      green: colorMode === "light" ? "bg-green-500 hover:bg-green-600" : "bg-green-600 hover:bg-green-500",
      red: colorMode === "light" ? "bg-red-500 hover:bg-red-600" : "bg-red-600 hover:bg-red-500",
    };
    return colorMap[colorScheme] || colorMap.blue;
  };

  const ButtonIcon = buttonIcon;

  return (
    <div className="tooltip-container">
      <Button
        className={`${getColorSchemeClasses()} ${
          colorMode === "light" ? "text-white/90" : "text-white/80"
        } rounded-full p-0 m-0 max-w-[35px] max-h-[40px] w-[20px] h-[20px]`}
        onClick={handleClick}
        disabled={!canRunFunction || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ButtonIcon className="h-5 w-5" />
        )}
      </Button>
      <span className="tooltip-text">{toolTipText}</span>
    </div>
  );
};
