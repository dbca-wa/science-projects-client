// A template for a RTE simple button - props fill out its icon, text and functionality

import { ReactNode } from "react";
import "@/styles/texteditor.css";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";

interface IBaseToolbarButtonProps {
  ariaLabel: string;
  variant?: string;

  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  buttonSize?: "sm" | "md" | "lg";
  children: ReactNode;
}

export const RevisedBaseToolbarButton = ({
  buttonSize,
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
        size={buttonSize || "sm"}
        aria-label={ariaLabel}
        variant={variant === "ghost" ? "ghost" : "default"}
        disabled={isDisabled}
        className={cn(
          "min-w-auto flex border-0",
          isActive && "bg-muted dark:bg-muted"
        )}
        onClick={onClick}
        tabIndex={-1}
      >
        {children}
      </Button>
      {ariaLabel && <span className="tooltip-text">{ariaLabel}</span>}
    </div>
  );
};
