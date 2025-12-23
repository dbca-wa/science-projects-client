// Component for changing the layout between modern and traditional

import { useUIStore } from "@/app/providers/store.provider";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "framer-motion";
import { RiLayout3Fill, RiLayoutTopFill } from "react-icons/ri";
import { useEditorContext } from "@/shared/hooks/useEditor";
import { cn } from "@/shared/utils";

interface IOptionalToggleLayoutProps {
  showText?: boolean;
  asMenuItem?: boolean;
}

export const ToggleLayout = observer(({
  showText,
  asMenuItem,
}: IOptionalToggleLayoutProps) => {
  const { manuallyCheckAndToggleDialog } = useEditorContext();
  const uiStore = useUIStore();
  const isDark = uiStore.resolvedTheme === "dark";

  const { layout, switchLayout } = uiStore;
  const iconColor = isDark ? "text-gray-300" : "text-gray-400";
  
  const layouts = {
    traditional: {
      key: "traditional",
      icon: <RiLayout3Fill />,
      onclick: switchLayout,
    },
    modern: {
      key: "modern",
      icon: <RiLayoutTopFill />,
      onclick: switchLayout,
    },
  };
  const currentLayout = layouts[layout];

  const handleClick = () => {
    manuallyCheckAndToggleDialog(() => switchLayout());
  };

  return asMenuItem ? (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm z-10",
        isDark ? "text-gray-400" : "text-gray-900"
      )}
    >
      {layouts[layout].icon}
      <span className="ml-2">Toggle Layout</span>
    </div>
  ) : (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        className={cn("inline-block", iconColor)}
        key={currentLayout.key}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 10, opacity: 0 }}
        style={{ transitionDuration: "2.01s" }}
      >
        {showText ? (
          <button
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "hover:bg-white/40 hover:text-white",
              iconColor
            )}
            onClick={handleClick}
            aria-label="Toggle Layout"
          >
            <span className="pl-3">{layout === "modern" ? "Traditional" : "Modern"}</span>
            <span className="ml-2">{currentLayout.icon}</span>
          </button>
        ) : (
          <button
            className={cn(
              "p-2 rounded-md transition-colors hover:bg-white/20",
              iconColor
            )}
            onClick={handleClick}
            aria-label="Toggle Layout"
          >
            {currentLayout.icon}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
});
