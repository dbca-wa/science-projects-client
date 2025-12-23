// Simple wrapper to ensure content is padded and 100% of the height of the other wrappers

import { FC, ReactNode } from "react";
import { useTheme } from "next-themes";
import { useLayoutSwitcher } from "@/shared/hooks/useLayout";

interface IPageWrapperProps {
  children: ReactNode;
}

export const ContentWrapper: FC<IPageWrapperProps> = ({ children }) => {
  const { layout } = useLayoutSwitcher();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <div
      className={`p-4 flex-1 ${
        layout === "traditional" ? "px-0" : "px-9"
      } ${isDark ? "text-gray-400" : ""}`}
      style={{
        minHeight: "70vh",
        height: "100%",
      }}
    >
      <div className="pb-4 h-full">
        {children}
      </div>
    </div>
  );
};
