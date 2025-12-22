// For handling the sidebar on smaller screens on traditional version

import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { type IconType } from "react-icons";

interface ISidebarNavButtonProps {
  buttonName?: string;
  cScheme?: string;
  hoverColor?: string;
  fColor?: string;
  leftIcon?: IconType;
  onClick: () => void;
}

export const SidebarNavButton = ({
  buttonName,
  cScheme,
  leftIcon: LeftIcon,
  fColor,
  hoverColor,
  onClick,
}: ISidebarNavButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Convert color scheme to Tailwind classes
  const getColorClasses = () => {
    const baseClasses = "z-[1] w-full px-2 py-5 text-lg";
    
    if (isHovered) {
      return `${baseClasses} ${hoverColor ? 'bg-white text-black' : 'bg-white text-black'}`;
    }
    
    const bgClass = cScheme ? `bg-${cScheme}-500` : 'bg-transparent';
    const textClass = fColor ? `text-[${fColor}]` : 'text-white/70';
    
    return `${baseClasses} ${bgClass} ${textClass} hover:bg-white hover:text-black active:bg-white active:text-black`;
  };

  return (
    <div className="z-[1]">
      <Button
        variant="ghost"
        className={getColorClasses()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        <div className="flex w-full">
          {LeftIcon ? (
            <div className="flex justify-between w-full items-center">
              <div className={`flex items-center ${buttonName ? 'mr-1.5' : ''}`}>
                <div className="flex justify-end w-5 h-5">
                  <LeftIcon className="w-5 h-5" />
                </div>
              </div>

              <div className={`flex items-center ${buttonName ? 'mr-1.5' : ''}`}>
                <span>{buttonName}</span>
              </div>
              
              <div className="flex items-center invisible">
                <LeftIcon className="w-5 h-5 opacity-0" />
              </div>
            </div>
          ) : (
            <span>{buttonName}</span>
          )}
        </div>
      </Button>
    </div>
  );
};
