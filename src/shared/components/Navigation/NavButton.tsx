// Component for handling hover opening of menus on Header/Nav

import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { type IconType } from "react-icons";

interface INavButtonProps {
  buttonName?: string;
  cScheme?: string;
  hoverColor?: string;
  fColor?: string;
  leftIcon?: IconType;
  onClick: (e) => void;
  textAlign?: string;
}

export const NavButton = ({
  buttonName,
  cScheme,
  leftIcon: LeftIcon,
  fColor,
  hoverColor,
  textAlign,
  onClick,
}: INavButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleItemClick = (e) => {
    onClick(e);
  };

  // Convert color scheme to Tailwind classes
  const getColorClasses = () => {
    const baseClasses = "px-2 py-5 min-w-[60px] text-sm outline-none focus:shadow-none";
    
    if (isHovered) {
      return `${baseClasses} ${hoverColor ? 'bg-white text-black' : 'bg-white text-black'}`;
    }
    
    const bgClass = cScheme ? `bg-${cScheme}-500` : 'bg-transparent';
    const textClass = fColor ? `text-[${fColor}]` : 'text-white/70';
    
    return `${baseClasses} ${bgClass} ${textClass} hover:bg-white hover:text-black active:bg-white active:text-black`;
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Button
        variant="ghost"
        className={getColorClasses()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleItemClick(e)}
      >
        <div className="flex items-center">
          {LeftIcon ? (
            <div className="flex items-center">
              <div className={`flex items-center ${buttonName ? 'mr-1.5' : ''}`}>
                <LeftIcon className="w-4 h-4" />
              </div>
              {buttonName && (
                <div className="flex items-center mr-1.5">
                  <span>{buttonName}</span>
                </div>
              )}
            </div>
          ) : (
            <span>{buttonName}</span>
          )}
        </div>
      </Button>
    </div>
  );
};
