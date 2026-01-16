import * as React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * CustomSheet - A simplified sheet component without animations
 * returns null when closed to prevent flicker
 * 
 * Key differences from Radix UI Sheet:
 * - No animations (prevents flickering with MobX)
 * - Returns null when closed (no DOM elements)
 * - Simple overlay with click-to-close
 * - Escape key support
 */

type SheetProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modal?: boolean;
};

type SheetContentProps = {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

type SheetHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

type SheetTitleProps = {
  children: React.ReactNode;
  className?: string;
};

type SheetDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

// Main Sheet component
export function Sheet({ children, open, onOpenChange, modal: _modal = true }: SheetProps) {
  // Handle escape key to close the sheet
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Return null when closed - prevents animation flicker
  if (!open) return null;

  return (
    <SheetContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50">{children}</div>
    </SheetContext.Provider>
  );
}

// Trigger component (just passes through children)
export function SheetTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <div onClick={onClick}>{children}</div>;
}

// Content component
export function SheetContent({ children, side = "right", className }: SheetContentProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={contentRef}
        className={cn(
          "fixed flex flex-col gap-4 bg-white dark:bg-gray-900 transition-none z-50",
          // Positioning based on side with specific shadow styling
          side === "left" &&
            "left-0 inset-y-0 h-full border-r-[1px] border-gray-300 dark:border-gray-700 shadow-[5px_0_15px_rgba(0,0,0,0.1)]",
          side === "right" &&
            "right-0 inset-y-0 h-full border-l-[1px] border-gray-300 dark:border-gray-700 shadow-[-5px_0_15px_rgba(0,0,0,0.1)]",
          side === "top" &&
            "top-0 inset-x-0 w-full border-b-[1px] border-gray-300 dark:border-gray-700 shadow-[0_5px_15px_rgba(0,0,0,0.1)]",
          side === "bottom" &&
            "bottom-0 inset-x-0 w-full border-t-[1px] border-gray-300 dark:border-gray-700 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]",
          className
        )}
        aria-modal="true"
        role="dialog"
      >
        {children}
      </div>

      {/* Overlay - click to close */}
      <CustomOverlay side={side} />
    </>
  );
}

function CustomOverlay({ side: _side }: { side: string }) {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error("CustomOverlay must be used within a Sheet");

  const { onOpenChange } = context;

  // Full-screen overlay that covers everything except the sheet content
  // The sheet content has higher z-index (z-50) so it appears on top
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 49, // Lower than sheet content (z-50)
  };

  return <div style={overlayStyle} onClick={() => onOpenChange(false)} aria-hidden="true" />;
}

// Helper components
export function SheetHeader({ children, className }: SheetHeaderProps) {
  return <div className={cn("flex flex-col gap-1.5 p-4", className)}>{children}</div>;
}

export function SheetTitle({ children, className }: SheetTitleProps) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

export function SheetDescription({ children, className }: SheetDescriptionProps) {
  return <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>{children}</p>;
}

export function SheetFooter({ children, className }: SheetHeaderProps) {
  return <div className={cn("mt-auto flex flex-col gap-2 p-4", className)}>{children}</div>;
}

// Create context for passing the onOpenChange function
const SheetContext = React.createContext<{
  onOpenChange: (open: boolean) => void;
} | null>(null);

export function SheetClose(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error("SheetClose must be used within a Sheet");

  const { onOpenChange } = context;

  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        onOpenChange(false);
      }}
    />
  );
}
