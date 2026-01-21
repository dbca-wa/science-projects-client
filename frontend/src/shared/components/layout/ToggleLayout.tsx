import { observer } from "mobx-react-lite";
import { useUIStore } from "@/app/stores/store-context";
import { Button } from "@/shared/components/ui/button";
import { LayoutGrid, LayoutList } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface ToggleLayoutProps {
  showText?: boolean;
  asMenuItem?: boolean;
  onAfterToggle?: () => void;
}

/**
 * ToggleLayout component
 * Button to switch between modern and traditional layouts
 * 
 * Features:
 * - Toggle between modern and traditional layouts
 * - Can be rendered as button or menu item
 * - Shows appropriate icon (LayoutGrid/LayoutList)
 * - Updates UI store on click
 * - Animated icon transitions with Framer Motion
 */
export const ToggleLayout = observer(
  ({ showText, asMenuItem, onAfterToggle }: ToggleLayoutProps) => {
    const uiStore = useUIStore();

    const handleClick = () => {
      uiStore.toggleLayout();
      onAfterToggle?.();
    };

    const isModern = uiStore.layout === "modern";
    const Icon = isModern ? LayoutList : LayoutGrid;
    const label = isModern ? "Traditional" : "Modern";
    const layoutKey = isModern ? "modern" : "traditional";

    if (asMenuItem) {
      return (
        <button
          onClick={handleClick}
          className={cn(
            "w-full flex items-center gap-2 px-4 py-2 text-sm",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "cursor-pointer text-left"
          )}
        >
          <Icon className="h-4 w-4" />
          <span>Toggle Layout</span>
        </button>
      );
    }

    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={layoutKey}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "inline-block" }}
        >
          {showText ? (
            <Button
              variant="ghost"
              onClick={handleClick}
              className="text-gray-400 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/50 hover:text-white transition-all duration-200"
            >
              <span className="pl-3">{label}</span>
              <Icon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClick}
              className="text-gray-400 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/50 hover:text-white transition-all duration-200"
              aria-label="Toggle Layout"
            >
              <Icon className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

ToggleLayout.displayName = "ToggleLayout";
