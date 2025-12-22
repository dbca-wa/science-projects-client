import { useColorMode } from "@/shared/utils/theme.utils";
import { useEffect, useState } from "react";

interface ISidebarMenuButtonProps {
  selectedString: string;
  pageName: string;
  onClick: () => void;
}

export const GuideSidebarButton = ({
  selectedString,
  pageName,
  onClick,
}: ISidebarMenuButtonProps) => {
  const { colorMode } = useColorMode();
  const [selected, setSelected] = useState<boolean>(false);

  // Improved string normalization function
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .replace(/\s+/g, "_") // Replace all whitespace with single underscore
      .replace(/[^a-z0-9_]/g, ""); // Remove any non-alphanumeric characters except underscore
  };

  useEffect(() => {
    const cleanedSelectedString = normalizeString(selectedString);
    const cleanedPageName = normalizeString(pageName);

    console.log({
      cleanedPageName,
      cleanedSelectedString,
      isSelected: cleanedSelectedString === cleanedPageName,
    });

    setSelected(cleanedSelectedString === cleanedPageName);
  }, [selectedString, pageName]);

  return (
    <div
      className={`p-2 w-full relative flex rounded-lg cursor-pointer transition-all ${
        selected
          ? colorMode === "light"
            ? "bg-blue-400 text-white"
            : "bg-blue-500 text-white"
          : "bg-transparent"
      } ${
        colorMode === "light"
          ? selected
            ? "hover:bg-blue-400 hover:text-white"
            : "hover:bg-blue-100 hover:text-black"
          : selected
            ? "hover:bg-blue-400 hover:text-white"
            : "hover:bg-gray-300 hover:text-black"
      }`}
      onClick={onClick}
    >
      <div className="flex-1 w-full">
        <div className="w-full focus:outline-none">
          <div className="text-center w-full">
            <p className="text-center w-full">
              {pageName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
