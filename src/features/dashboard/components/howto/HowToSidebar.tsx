// Used on the how to page to update the how to view with content based on what is clicked or searched via this component

import { useTheme } from "next-themes";

export const HowToSidebar = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`border-l overflow-y-auto flex-shrink-0 max-h-screen min-w-[250px] max-w-[250px] flex flex-col py-1 px-2 ${
        isDark ? "border-white/40" : "border-gray-300"
      }`}
    >
      Sidebar
    </div>
  );
};
