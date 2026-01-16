import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";

/**
 * CustomPopover - A simplified popover component without animations
 * returns null when closed to prevent flicker
 * 
 * Key differences from Radix UI Popover:
 * - No animations (prevents flickering with MobX)
 * - Returns null when closed (no DOM elements)
 * - Manual positioning
 * - Click outside to close
 * - Escape key support
 */

type PopoverProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PopoverTriggerProps = {
  children: React.ReactNode;
  onClick?: () => void;
  asChild?: boolean;
};

type PopoverContentProps = {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

const PopoverContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setTriggerElement: (element: HTMLElement | null) => void;
  triggerElement: HTMLElement | null;
} | null>(null);

export function Popover({ children, open, onOpenChange }: PopoverProps) {
  const [triggerElement, setTriggerElement] = React.useState<HTMLElement | null>(null);

  // Handle escape key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  return (
    <PopoverContext.Provider value={{ open, onOpenChange, setTriggerElement, triggerElement }}>
      {children}
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children, onClick, asChild }: PopoverTriggerProps) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverTrigger must be used within a Popover");

  const { open, onOpenChange, setTriggerElement } = context;

  const handleClick = () => {
    onClick?.();
    onOpenChange(!open); // Toggle instead of always opening
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ ref?: React.Ref<HTMLElement>; onClick?: () => void }>, {
      ref: (node: HTMLElement | null) => setTriggerElement(node),
      onClick: handleClick,
    });
  }

  return (
    <button ref={(node) => setTriggerElement(node)} onClick={handleClick}>
      {children}
    </button>
  );
}

export function PopoverContent({
  children,
  className,
  align = "end",
  sideOffset = 4,
}: PopoverContentProps) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverContent must be used within a Popover");

  const { open, onOpenChange, triggerElement } = context;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  // Calculate position based on trigger
  React.useEffect(() => {
    if (!open || !triggerElement) return;

    const updatePosition = () => {
      const triggerRect = triggerElement.getBoundingClientRect();
      if (!triggerRect) return;

      const contentWidth = contentRef.current?.offsetWidth || 0;
      let left = triggerRect.left;
      const top = triggerRect.bottom + sideOffset;

      // Adjust horizontal alignment
      if (align === "end") {
        left = triggerRect.right - contentWidth;
      } else if (align === "center") {
        left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [open, align, sideOffset, triggerElement]);

  // Handle click outside to close
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerElement &&
        !triggerElement.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange, triggerElement]);

  // Return null when closed - prevents animation flicker
  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        "fixed z-[99999] min-w-72 rounded-lg p-4 shadow-md",
        "bg-white dark:bg-gray-800",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>,
    document.body
  );
}

export function PopoverAnchor({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
