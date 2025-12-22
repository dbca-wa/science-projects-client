// Handles creation of sidebar buttons on account page
import { useColorMode } from "@/shared/utils/theme.utils";
import { useEffect, useState } from "react";

interface ISidebarMenuButtonProps {
  selectedString: string;
  pageName: string;
  onClick: () => void;
}

export const SideMenuButton = ({
  selectedString,
  pageName,
  onClick,
}: ISidebarMenuButtonProps) => {
  const { colorMode } = useColorMode();
  const handleOnClick = () => {
    onClick();
  };
  const [selected, setSelected] = useState<boolean>(false);

  useEffect(() => {
    const cleanedSelectedString = selectedString
      .toLowerCase()
      .replace(/\s/g, "");
    const cleanedPageName = pageName.toLowerCase().replace(/\s/g, "");
    setSelected(cleanedSelectedString === cleanedPageName);
  }, [selectedString, pageName]);

  // Replace useBreakpointValue with a simple media query hook or inline logic
  const [isOver750, setIsOver750] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsOver750(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`w-full p-2 mb-4 ${
        selected
          ? colorMode === "light"
            ? "bg-blue-400"
            : "bg-blue-500"
          : "transparent"
      }
          : "bg-transparent"
      } ${selected ? "text-white" : ""} ${
        colorMode === "light"
          ? selected
            ? "hover:bg-blue-400 hover:text-white"
            : "hover:bg-blue-100 hover:text-black"
          : selected
            ? "hover:bg-blue-400 hover:text-white"
            : "hover:bg-gray-300 hover:text-black"
      } relative flex rounded-lg cursor-pointer transition-all`}
      onClick={handleOnClick}
      style={{ marginLeft: isOver750 ? '1rem' : undefined }}
    >
      <div className="flex-1">
        <div className="focus:outline-none">
          <div className="text-center">
            <p className="text-center">{pageName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
