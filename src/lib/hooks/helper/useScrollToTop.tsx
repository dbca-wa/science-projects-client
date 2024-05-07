// Simple hook for scrolling to the top of the page

import { useEffect } from "react";
import {
  // useLocation,
  useRouterState,
} from "@tanstack/react-router";

export const useScrollToTop = () => {
  // const location = useLocation();
  const location = useRouterState().location;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};
