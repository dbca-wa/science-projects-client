// A wrapper to check whether a component for rendering components only in the modern layout

import { useEffect, useState } from "react";
import { useLayoutSwitcher } from "@/shared/hooks/helper/LayoutSwitcherContext";

interface IProtectedPageProps {
  children: ReactNode;
}

export const LayoutCheckWrapper = ({ children }: IProtectedPageProps) => {
  const [showContent, setShowContent] = useState(false);
  const { layout } = useLayoutSwitcher();

  useEffect(() => {
    if (layout === "modern") {
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [layout]);

  return <>{showContent ? children : null}</>;
};
