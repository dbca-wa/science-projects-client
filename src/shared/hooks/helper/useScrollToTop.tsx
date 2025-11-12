// Simple hook for scrolling to the top of the page

import { useEffect } from "react";
import {
  // useLocation,
  useLocation,
} from "react-router-dom";

export const useScrollToTop = () => {
  // const location = useLocation();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};
