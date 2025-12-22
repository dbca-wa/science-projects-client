// Component for handling hover opening of menus on Header/Nav

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useState, type ReactNode } from "react";
import { type IconType } from "react-icons";
import { GoTriangleDown } from "react-icons/go";

interface INavMenuProps {
  menuName?: string;
  cScheme?: string;
  hoverColor?: string;
  fColor?: string;
  leftIcon?: IconType;
  children?: ReactNode;
  noChevron?: boolean;
  textAlign?: "left" | "center" | "right";
}

export const NavMenu = ({
  menuName,
  cScheme,
  leftIcon: LeftIcon,
  fColor,
  hoverColor,
  children,
  noChevron,
  textAlign,
}: INavMenuProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsOpen(false);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 py-5 min-w-[60px] outline-none focus:shadow-none ${
              isHovered
                ? hoverColor
                  ? `bg-[${hoverColor}]`
                  : "bg-white text-black"
                : cScheme
                  ? `bg-${cScheme}-500`
                  : "bg-transparent"
            } ${
              isHovered
                ? fColor
                  ? `text-[${fColor}]`
                  : "text-white"
                : fColor
                  ? `text-[${fColor}]`
                  : "text-white/70"
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center">
              {LeftIcon ? (
                <div className="flex items-center">
                  <div className={`flex items-center justify-center ${menuName ? "mr-1.5" : ""}`}>
                    <LeftIcon />
                  </div>
                  <div className={`flex items-center justify-center ${menuName ? "mr-1.5" : ""}`}>
                    <span>{menuName}</span>
                  </div>
                </div>
              ) : (
                <span className={textAlign ? `text-${textAlign}` : ""}>{menuName}</span>
              )}

              {!noChevron && (
                <div className="flex items-center justify-center ml-1.5">
                  <GoTriangleDown size="12px" />
                </div>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="mt-[-7.5px]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleItemClick}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
