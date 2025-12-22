// For handling the sidebar on smaller screens on traditional version

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useState, type ReactNode } from "react";
import { GoTriangleDown } from "react-icons/go";

interface ISidebarNavMenuProps {
  menuName?: string;
  cScheme?: string;
  hoverColor?: string;
  fColor?: string;
  leftIcon?: ReactNode;
  children?: ReactNode;
  noChevron?: boolean;
  textAlign?: string;
}

export const SidebarNavMenu = ({
  menuName,
  cScheme,
  leftIcon,
  fColor,
  hoverColor,
  children,
  noChevron,
  textAlign,
}: ISidebarNavMenuProps) => {
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

  // Convert color scheme to Tailwind classes
  const getColorClasses = () => {
    const baseClasses = "w-full px-2 py-5 text-lg";
    
    if (isHovered || isOpen) {
      return `${baseClasses} ${hoverColor ? 'bg-white text-black' : 'bg-white text-black'}`;
    }
    
    const bgClass = cScheme ? `bg-${cScheme}-500` : 'bg-transparent';
    const textClass = fColor ? `text-[${fColor}]` : 'text-white/70';
    
    return `${baseClasses} ${bgClass} ${textClass} hover:bg-white hover:text-black active:bg-white active:text-black`;
  };

  return (
    <div className={`${isOpen ? 'z-[2]' : 'z-[1]'}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`${getColorClasses()} ${isOpen ? 'z-[2]' : 'z-[1]'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex justify-between w-full">
              {leftIcon ? (
                <div className="flex justify-between w-full items-center">
                  <div className={`flex items-center ${menuName ? 'mr-1.5' : ''}`}>
                    <div className="flex justify-end w-5 h-5">
                      {leftIcon}
                    </div>
                  </div>

                  <div className={`flex items-center ${menuName ? 'mr-1.5' : ''}`}>
                    <span>{menuName}</span>
                  </div>
                  <div className="flex items-center"></div>
                </div>
              ) : (
                <span>{menuName}</span>
              )}

              {!noChevron && (
                <div className="flex items-center ml-1.5">
                  <GoTriangleDown size={12} />
                </div>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={`w-full -mt-[7.5px] ${isOpen ? 'z-[2]' : 'z-[19]'}`}
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
