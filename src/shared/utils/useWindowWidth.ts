import { useEffect, useState, useCallback } from "react";
import { debounce } from "./debounce";

export const useWindowWidth = (debounceMs = 150) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const debouncedResize = useCallback(
    debounce(() => {
      setWindowWidth(window.innerWidth);
    }, debounceMs),
    [debounceMs],
  );

  useEffect(() => {
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, [debouncedResize]);

  return windowWidth;
};
