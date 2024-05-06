// Simple hook to get the base title of a route.
// NOTE: Can potentially remove/replace entirely with React Helmet.

import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const baseTitle = "SPMS";

export const useDocumentTitle = () => {
  const location = useRouterState().location;

  useEffect(() => {
    const path = location.pathname.split("/");
    const pageTitle = path[1]
      ? `${baseTitle} | ${path[1].charAt(0).toUpperCase() + path[1].slice(1)}`
      : baseTitle;
    document.title = pageTitle;
  }, [location]);

  return null;
};
