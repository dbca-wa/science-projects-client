// A template for a RTE simple button - props fill out its icon, text and functionality

import { Button } from "@/shared/components/ui/button";
import { ReactNode } from "react";
import "./staffprofileeditor.css";

interface IBaseToolbarButtonProps {
  ariaLabel: string;
  variant?: string;

  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export const ToolbarButton = ({
  children,
  ariaLabel,
  isDisabled,
  variant,
  isActive,
  onClick,
}: IBaseToolbarButtonProps) => {
  return (
    <div className="tooltip-container">
      <Button
        size="sm"
        aria-label={ariaLabel}
        variant={variant ? variant : "ghost"}
        disabled={isDisabled}
        className={`${isActive ? "bg-gray-700" : ""} hover:bg-gray-600 text-white border-0 flex`}
        onClick={onClick}
        tabIndex={-1}
      >
        {children}
      </Button>
      {ariaLabel && <p className="tooltip-text">{ariaLabel}</p>}
    </div>
  );
};
