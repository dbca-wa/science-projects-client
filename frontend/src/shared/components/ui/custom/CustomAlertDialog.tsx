import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";

/**
 * CustomAlertDialog - A simplified alert dialog component without animations
 * Returns null when closed to prevent flicker with MobX
 * 
 * Key differences from Radix UI AlertDialog:
 * - No animations (prevents flickering with MobX)
 * - Returns null when closed (no DOM elements)
 * - Centered positioning
 * - Escape key support
 * - Backdrop click to close (optional)
 */

type AlertDialogProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type AlertDialogContentProps = {
  children: React.ReactNode;
  className?: string;
};

const AlertDialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

export function AlertDialog({ children, open, onOpenChange }: AlertDialogProps) {
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
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error("AlertDialogTrigger must be used within an AlertDialog");

  const { onOpenChange } = context;

  const handleClick = () => {
    onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleClick,
    });
  }

  return <button onClick={handleClick}>{children}</button>;
}

export function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error("AlertDialogContent must be used within an AlertDialog");

  const { open, onOpenChange } = context;
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Handle backdrop click to close
  React.useEffect(() => {
    if (!open) return;

    const handleBackdropClick = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleBackdropClick);
    return () => document.removeEventListener("mousedown", handleBackdropClick);
  }, [open, onOpenChange]);

  // Return null when closed - prevents animation flicker
  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/50" />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          ref={contentRef}
          className={cn(
            "relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800",
            className
          )}
          role="alertdialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}

export function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>{children}</div>;
}

export function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
      {children}
    </div>
  );
}

export function AlertDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

export function AlertDialogDescription({ children, className, asChild }: { children: React.ReactNode; className?: string; asChild?: boolean }) {
  if (asChild) {
    return <>{children}</>;
  }
  return <div className={cn("text-sm text-muted-foreground", className)}>{children}</div>;
}

export function AlertDialogAction({ children, onClick, disabled, className }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "text-white!",
        className
      )}
    >
      {children}
    </button>
  );
}

export function AlertDialogCancel({ children, disabled, className }: { children: React.ReactNode; disabled?: boolean; className?: string }) {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error("AlertDialogCancel must be used within an AlertDialog");

  const { onOpenChange } = context;

  return (
    <button
      onClick={() => onOpenChange(false)}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-semibold transition-colors",
        "bg-background hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "mt-2 sm:mt-0",
        className
      )}
    >
      {children}
    </button>
  );
}
