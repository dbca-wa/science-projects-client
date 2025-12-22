// A template for a RTE menu button - props fill out its icon, text and functionality

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { IconType } from "react-icons";
import { FaCaretDown } from "react-icons/fa";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface IMenuItem {
  leftIcon?: IconType;
  text?: string;
  component?: ReactNode;
  onClick?: () => void;
}

export interface IBaseToolbarMenuButtonProps {
  tooltipText?: string;
  title?: string;
  menuIcon?: IconType;
  menuItems: IMenuItem[];
  onClick?: () => void;
  disableHoverBackground?: boolean;
}

export const BaseToolbarMenuButton = ({
  tooltipText,
  title,
  menuIcon: MenuIcon,
  menuItems,
  onClick,
  disableHoverBackground,
}: IBaseToolbarMenuButtonProps) => {
  const [buttonWidth, setButtonWidth] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateButtonWidth = () => {
      if (buttonRef.current) {
        const width = buttonRef.current.offsetWidth;
        setButtonWidth(width);
      }
    };

    updateButtonWidth(); // Get initial width

    window.addEventListener("resize", updateButtonWidth); // Update width on window resize

    return () => {
      window.removeEventListener("resize", updateButtonWidth); // Clean up for optimization
    };
  }, [buttonRef]);

  return (
    <DropdownMenu>
      <div className="tooltip-container grow">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="mx-1 flex-1 w-full"
            ref={buttonRef}
            tabIndex={-1}
            onClick={() => onClick?.()}
            size="sm"
          >
            {MenuIcon && <MenuIcon className="mr-2 h-4 w-4" />}
            {title}
            <FaCaretDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-fit z-[9999999999999] absolute"
          style={{ minWidth: "200px" }}
        >
          {menuItems.map((item, index) => {
            return (
              <DropdownMenuItem
                key={index}
                onClick={item.onClick}
                className="w-full inline-flex items-center z-2"
                onSelect={(e) => {
                  if (item.component) {
                    e.preventDefault();
                  }
                }}
              >
                {item.leftIcon && <item.leftIcon className="mr-4 h-4 w-4" />}
                {item?.text && <span>{item.text}</span>}
                {item?.component && item?.component}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
        {tooltipText && <span className="tooltip-text">{tooltipText}</span>}
      </div>
    </DropdownMenu>
  );
};
