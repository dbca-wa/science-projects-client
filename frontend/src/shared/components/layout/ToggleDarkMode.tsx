import { useUIStore } from "@/app/stores/store-context";
import { observer } from "mobx-react-lite";
import { Button } from "@/shared/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface ToggleDarkModeProps {
  showText?: boolean;
  asMenuItem?: boolean;
  onAfterToggle?: () => void;
}

/**
 * ToggleDarkMode component
 * Button to toggle between light and dark themes
 * 
 * Features:
 * - Toggle between light and dark themes
 * - Can be rendered as button or menu item
 * - Shows appropriate icon (Sun/Moon)
 * - Updates UI store on click
 * - Animated icon transitions with Framer Motion
 * - Color scheme: blue for light mode, orange for dark mode
 */
export const ToggleDarkMode = observer(
  ({ showText, asMenuItem, onAfterToggle }: ToggleDarkModeProps) => {
    const { theme, setTheme } = useUIStore();

    const isDark = theme === "dark";
    const Icon = isDark ? Sun : Moon;
    const label = isDark ? "Light" : "Dark";
    const keyColorMode = isDark ? "dark" : "light";

    const handleClick = () => {
      setTheme(isDark ? "light" : "dark");
      onAfterToggle?.();
    };

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
          <span>Toggle Dark Mode</span>
        </button>
      );
    }

    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={keyColorMode}
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
              className={cn(
                "transition-all duration-200",
                isDark
                  ? "text-orange-400 hover:bg-white/40 dark:hover:bg-white/50 hover:text-orange-300"
                  : "text-blue-400 hover:bg-white/40 hover:text-blue-300"
              )}
            >
              <span>{label}</span>
              <Icon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClick}
              className={cn(
                "transition-all duration-200",
                isDark
                  ? "text-orange-400 hover:bg-white/40 dark:hover:bg-white/50 hover:text-orange-300"
                  : "text-blue-400 hover:bg-white/40 hover:text-blue-300"
              )}
              aria-label="Toggle Dark Mode"
            >
              <Icon className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

ToggleDarkMode.displayName = "ToggleDarkMode";
