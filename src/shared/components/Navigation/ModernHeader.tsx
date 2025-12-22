// Modern Header

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import theme from "@/theme";
import { ModernBreadcrumb } from "./ModernBreadcrumb";
import { Navitar } from "./Navitar";

export const ModernHeader = () => {
  const location = useLocation();
  const [shouldRenderUserSearch, setShouldRenderUserSearch] = useState(false);
  const [shouldRenderProjectSearch, setShouldRenderProjectSearch] =
    useState(false);

  useEffect(() => {
    if (location.pathname === "/users") {
      if (shouldRenderUserSearch === false) setShouldRenderUserSearch(true);
    } else {
      if (shouldRenderUserSearch === true) setShouldRenderUserSearch(false);
    }

    if (location.pathname === "/projects") {
      if (shouldRenderProjectSearch === false)
        setShouldRenderProjectSearch(true);
    } else {
      if (shouldRenderProjectSearch === true)
        setShouldRenderProjectSearch(false);
    }
  }, [location.pathname]);

  const [windowSizeValue, setWindowSizeValue] = useState<number>(480);

  const handleResize = () => {
    setWindowSizeValue(window.innerWidth);
  };

  useEffect(() => {
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [theme.breakpoints.lg]);

  return (
    <div
      className="flex p-1 sticky top-0 z-10 w-full md:flex-row"
    >
      {/* Breadcrumb */}
      <div className="flex justify-start p-1">
        <ModernBreadcrumb />
      </div>

      {/* Search and Avatar */}
      <div
        className="flex flex-1 justify-end items-center w-full px-6 p-1"
      >
        <div className="flex pl-6 pr-3">
          <Navitar shouldShowName windowSize={windowSizeValue} isModern />
        </div>
      </div>
    </div>
  );
};
