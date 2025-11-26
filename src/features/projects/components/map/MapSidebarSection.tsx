import { cn } from "@/shared/utils";
import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Separator } from "@/shared/components/ui/separator";

interface MapSidebarSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

const MapSidebarSection = ({
  title,
  children,
  className,
  defaultOpen = true,
}: MapSidebarSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isVisible, setIsVisible] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    defaultOpen ? 1000 : 0,
  );

  // Handle open/close state changes
  useEffect(() => {
    if (isOpen) {
      // First make content visible before animating height
      setIsVisible(true);
      // Use a small delay to ensure visibility change takes effect
      setTimeout(() => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      }, 10);
    } else {
      // First collapse height
      setContentHeight(0);
      // Then hide content after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match this with the transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Update height when children change
  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, isOpen]);

  return (
    <div className={cn("overflow-hidden p-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground text-sm font-semibold">{title}</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 focus:outline-hidden"
          aria-expanded={isOpen}
          aria-controls={`content-${title.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {isOpen ? (
            <Minus className="text-muted-foreground h-4 w-4" />
          ) : (
            <Plus className="text-muted-foreground h-4 w-4" />
          )}
        </button>
      </div>

      {/* Custom animation container with staged transitions */}
      <div
        id={`content-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: `${contentHeight}px`,
          opacity: isOpen ? 1 : 0,
          // Only apply these style changes when fully closed
          visibility: isVisible ? "visible" : "hidden",
          position: isVisible ? "relative" : "absolute",
          pointerEvents: isVisible ? "auto" : "none",
        }}
      >
        <div ref={contentRef} className="mt-2">
          {children}
        </div>
      </div>

      <Separator className="mt-4 bg-blue-200" />
    </div>
  );
};

export default MapSidebarSection;
