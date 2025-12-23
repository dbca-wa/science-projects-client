// A component for toggling the dark mode

import { useEditorContext } from "@/shared/hooks/useEditor";
import { useUIStore } from "@/app/providers/store.provider";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";
import { cn } from "@/shared/utils";

interface IOptionalToggleDarkProps {
  showText?: boolean;
  asMenuItem?: boolean;
}

export const ToggleDarkMode = observer(({
  showText,
  asMenuItem,
}: IOptionalToggleDarkProps) => {
  const uiStore = useUIStore();
  const isDark = uiStore.resolvedTheme === "dark";
  const toggleColorMode = () => uiStore.toggleTheme();
  
  const colorToggleIcon = isDark ? <FaSun /> : <FaMoon />;
  const keyColorMode = isDark ? "dark" : "light";

  const { manuallyCheckAndToggleDialog } = useEditorContext();

  const handleClick = () => {
    manuallyCheckAndToggleDialog(() => {
      toggleColorMode();
    });
  };

  return asMenuItem ? (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm z-10",
        isDark ? "text-gray-400" : "text-gray-900"
      )}
    >
      {colorToggleIcon}
      <span className="ml-2">Toggle Dark Mode</span>
    </div>
  ) : (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        className="inline-block"
        key={keyColorMode}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 10, opacity: 0 }}
        style={{ transitionDuration: "2.01s" }}
      >
        {showText ? (
          <button
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "hover:bg-white/40 dark:hover:bg-white/20",
              isDark ? "text-orange-400 hover:text-orange-300" : "text-blue-400 hover:text-blue-300"
            )}
            onClick={handleClick}
            aria-label="Toggle Dark Mode"
          >
            <span>{keyColorMode === "dark" ? "Light" : "Dark"}</span>
            <span className="ml-2">{colorToggleIcon}</span>
          </button>
        ) : (
          <button
            className={cn(
              "p-2 rounded-md transition-colors",
              isDark ? "text-orange-400 hover:bg-white/20" : "text-blue-400 hover:bg-white/40"
            )}
            onClick={handleClick}
            aria-label="Toggle Dark Mode"
          >
            {colorToggleIcon}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
});
