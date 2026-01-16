import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";

/**
 * CustomDropdownMenu - A simplified dropdown menu component without animations
 * Based on the same pattern as CustomPopover - returns null when closed to prevent flicker
 * 
 * Key differences from Radix UI DropdownMenu:
 * - No animations (prevents flickering)
 * - Returns null when closed (no DOM elements)
 * - Manual positioning
 * - Click outside to close
 * - Escape key support
 */

type DropdownMenuProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type DropdownMenuTriggerProps = {
  children: React.ReactNode;
  asChild?: boolean;
};

type DropdownMenuContentProps = {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

type DropdownMenuItemProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

const DropdownMenuContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setTriggerElement: (element: HTMLElement | null) => void;
  triggerElement: HTMLElement | null;
} | null>(null);

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [triggerElement, setTriggerElement] = React.useState<HTMLElement | null>(null);

  // Use controlled or uncontrolled state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  // Handle escape key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        handleOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleOpenChange]);

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: handleOpenChange, setTriggerElement, triggerElement }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuTrigger must be used within a DropdownMenu");

  const { open, onOpenChange, setTriggerElement } = context;

  const handleClick = () => {
    onOpenChange(!open);
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

export function DropdownMenuContent({
  children,
  className,
  align = "start",
  sideOffset = 4,
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuContent must be used within a DropdownMenu");

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
        "fixed z-50 min-w-[8rem] rounded-md border p-1 shadow-md",
        "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
        "border-gray-200 dark:border-gray-700",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuItem({ children, className, onClick }: DropdownMenuItemProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuItem must be used within a DropdownMenu");

  const { onOpenChange } = context;

  const handleClick = () => {
    onClick?.();
    onOpenChange(false);
  };

  return (
    <div
      className={cn(
        "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-gray-100 dark:hover:bg-gray-700",
        "focus:bg-gray-100 dark:focus:bg-gray-700",
        "transition-colors",
        className
      )}
      role="menuitem"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "my-1 h-px bg-gray-200 dark:bg-gray-700",
        className
      )}
      role="separator"
    />
  );
}

export function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        className
      )}
      role="presentation"
    >
      {children}
    </div>
  );
}
